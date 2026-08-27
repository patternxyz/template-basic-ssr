import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { OutgoingHttpHeader, OutgoingHttpHeaders } from "node:http";

export const IMMUTABLE_ASSET_CACHE_CONTROL =
  "public, max-age=31536000, immutable";
export const PUBLIC_SSR_CACHE_CONTROL =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";
export const PRIVATE_CACHE_CONTROL = "private, no-store";

// Only routes that are safe to share between all anonymous visitors belong here.
export const PUBLIC_SSR_ROUTES = ["/"] as const;

// Update these names when adding an authentication provider.
export const AUTH_COOKIE_NAMES = [
  "session",
  "sessionid",
  "connect.sid",
  "__session",
  "auth",
  "auth_token",
  "access_token",
  "refresh_token",
] as const;

type CacheKind = "asset" | "public" | "private";
type WriteHeadHeaders = OutgoingHttpHeaders | OutgoingHttpHeader[];
type WriteHeadArgs = [
  statusCode: number,
  statusMessageOrHeaders?: string | WriteHeadHeaders,
  headers?: WriteHeadHeaders,
];

const authCookieNames = new Set<string>(AUTH_COOKIE_NAMES);

function hasAuthentication(req: Request): boolean {
  if (req.get("authorization")?.trim()) {
    return true;
  }

  const cookieHeader = req.get("cookie");
  if (!cookieHeader) {
    return false;
  }

  return cookieHeader.split(";").some((cookie) => {
    const separator = cookie.indexOf("=");
    const name = (separator === -1 ? cookie : cookie.slice(0, separator))
      .trim()
      .toLowerCase();
    return authCookieNames.has(name);
  });
}

function getWriteHeadHeaders(args: WriteHeadArgs): WriteHeadHeaders | undefined {
  const candidate = typeof args[1] === "string" ? args[2] : args[1];
  return candidate && typeof candidate === "object"
    ? (candidate as WriteHeadHeaders)
    : undefined;
}

function hasOutgoingHeader(
  headers: WriteHeadHeaders | undefined,
  name: string,
): boolean {
  if (!headers) {
    return false;
  }

  const lowerName = name.toLowerCase();
  if (Array.isArray(headers)) {
    for (let index = 0; index < headers.length; index += 2) {
      if (String(headers[index]).toLowerCase() === lowerName) {
        return true;
      }
    }
    return false;
  }

  return Object.keys(headers).some((key) => key.toLowerCase() === lowerName);
}

function withOutgoingHeader(
  headers: WriteHeadHeaders,
  name: string,
  value: string,
): WriteHeadHeaders {
  const lowerName = name.toLowerCase();
  if (Array.isArray(headers)) {
    const copy = [...headers];
    for (let index = 0; index < copy.length; index += 2) {
      if (String(copy[index]).toLowerCase() === lowerName) {
        copy[index + 1] = value;
        return copy;
      }
    }
    copy.push(name, value);
    return copy;
  }

  const copy = { ...headers };
  const existingName = Object.keys(copy).find(
    (key) => key.toLowerCase() === lowerName,
  );
  copy[existingName ?? name] = value;
  return copy;
}

function classifyRequest(req: Request): CacheKind {
  const requestPath = req.path;

  if (
    requestPath === "/api" ||
    requestPath.startsWith("/api/") ||
    hasAuthentication(req)
  ) {
    return "private";
  }

  if (requestPath === "/assets" || requestPath.startsWith("/assets/")) {
    return "asset";
  }

  if (PUBLIC_SSR_ROUTES.includes(requestPath as "/")) {
    return "public";
  }

  return "private";
}

function policyFor(kind: CacheKind): string {
  switch (kind) {
    case "asset":
      return IMMUTABLE_ASSET_CACHE_CONTROL;
    case "public":
      return PUBLIC_SSR_CACHE_CONTROL;
    case "private":
      return PRIVATE_CACHE_CONTROL;
  }
}

export function createHttpCacheMiddleware(): RequestHandler {
  return (req, res, next) => {
    const kind = classifyRequest(req);
    const defaultPolicy = policyFor(kind);

    if (!res.hasHeader("Cache-Control")) {
      res.setHeader("Cache-Control", defaultPolicy);
    }

    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = ((...args: WriteHeadArgs) => {
      const outgoingHeaders = getWriteHeadHeaders(args);
      const mustBePrivate =
        res.hasHeader("Set-Cookie") ||
        hasOutgoingHeader(outgoingHeaders, "Set-Cookie") ||
        kind === "private";

      if (mustBePrivate) {
        res.setHeader("Cache-Control", PRIVATE_CACHE_CONTROL);
        if (outgoingHeaders) {
          const safeHeaders = withOutgoingHeader(
            outgoingHeaders,
            "Cache-Control",
            PRIVATE_CACHE_CONTROL,
          );
          if (typeof args[1] === "string") {
            args[2] = safeHeaders;
          } else {
            args[1] = safeHeaders;
          }
        }
      } else if (
        !res.hasHeader("Cache-Control") &&
        !hasOutgoingHeader(outgoingHeaders, "Cache-Control")
      ) {
        res.setHeader("Cache-Control", defaultPolicy);
      }

      return typeof args[1] === "string"
        ? originalWriteHead(args[0], args[1], args[2])
        : originalWriteHead(args[0], args[1]);
    }) as Response["writeHead"];

    next();
  };
}

@Injectable()
export class HttpCacheMiddleware implements NestMiddleware {
  private readonly handler = createHttpCacheMiddleware();

  use(req: Request, res: Response, next: NextFunction): void {
    this.handler(req, res, next);
  }
}
