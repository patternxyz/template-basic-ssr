import assert = require("node:assert/strict");
import test = require("node:test");
import type { Request, Response } from "express";
import {
  IMMUTABLE_ASSET_CACHE_CONTROL,
  PRIVATE_CACHE_CONTROL,
  PUBLIC_SSR_CACHE_CONTROL,
  createHttpCacheMiddleware,
} from "../src/http-cache.middleware";

type HeaderValue = number | string | readonly string[];

function runMiddleware(
  path: string,
  requestHeaders: Record<string, string> = {},
  routeHandler?: (res: Response) => void,
): Map<string, HeaderValue> {
  const headers = new Map<string, HeaderValue>();
  let didWriteHead = false;
  const req = {
    path,
    get(name: string) {
      return requestHeaders[name.toLowerCase()];
    },
  } as Request;

  const res = {
    hasHeader(name: string) {
      return headers.has(name.toLowerCase());
    },
    setHeader(name: string, value: HeaderValue) {
      headers.set(name.toLowerCase(), value);
      return this;
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    writeHead(
      _statusCode: number,
      statusMessageOrHeaders?: string | Record<string, HeaderValue>,
      optionalHeaders?: Record<string, HeaderValue>,
    ) {
      didWriteHead = true;
      const outgoingHeaders =
        typeof statusMessageOrHeaders === "string"
          ? optionalHeaders
          : statusMessageOrHeaders;
      for (const [name, value] of Object.entries(outgoingHeaders ?? {})) {
        headers.set(name.toLowerCase(), value);
      }
      return this;
    },
  } as unknown as Response;

  createHttpCacheMiddleware()(req, res, () => {
    routeHandler?.(res);
    if (!didWriteHead) {
      res.writeHead(200);
    }
  });

  return headers;
}

test("hashed assets receive an immutable one-year policy", () => {
  assert.equal(
    runMiddleware("/assets/example-hash.js").get("cache-control"),
    IMMUTABLE_ASSET_CACHE_CONTROL,
  );
});

test("the anonymous public SSR route receives the shared-cache policy", () => {
  assert.equal(
    runMiddleware("/").get("cache-control"),
    PUBLIC_SSR_CACHE_CONTROL,
  );
});

test("an authenticated public route is private", () => {
  assert.equal(
    runMiddleware("/", { cookie: "session=example" }).get("cache-control"),
    PRIVATE_CACHE_CONTROL,
  );
});

test("API and non-allowlisted routes are private", () => {
  assert.equal(
    runMiddleware("/api/status").get("cache-control"),
    PRIVATE_CACHE_CONTROL,
  );
  assert.equal(
    runMiddleware("/account").get("cache-control"),
    PRIVATE_CACHE_CONTROL,
  );
});

test("a response that sets a cookie is private", () => {
  const headers = runMiddleware("/", {}, (res) => {
    res.writeHead(200, {
      "Cache-Control": "public, max-age=60",
      "Set-Cookie": "session=example; Path=/; HttpOnly",
    });
  });
  assert.equal(headers.get("cache-control"), PRIVATE_CACHE_CONTROL);
});
