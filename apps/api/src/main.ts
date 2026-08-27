import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express = require("express");
import path = require("node:path");
import { pathToFileURL } from "node:url";
import { AppModule } from "./app.module";
import { HttpCacheMiddleware } from "./http-cache.middleware";

async function bootstrap(): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const server = express();
  const apiServer = isProduction ? express() : server;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(apiServer));

  if (isProduction) {
    server.use("/api", apiServer);
  } else {
    app.setGlobalPrefix("api");
  }

  await app.init();

  if (!isProduction) {
    await app.listen(Number(process.env.PORT ?? 3000));
    return;
  }

  const cacheMiddleware = app.get(HttpCacheMiddleware);
  const webBuildDirectory = path.resolve(__dirname, "../../web/build");
  const clientBuildDirectory = path.join(webBuildDirectory, "client");
  const serverBuildUrl = pathToFileURL(
    path.join(webBuildDirectory, "server/index.js"),
  ).href;
  const { createRequestHandler } = await import("@react-router/express");

  // In production one Express process hosts the API, static assets, and SSR.
  server.use(cacheMiddleware.use.bind(cacheMiddleware));
  server.use(
    "/assets",
    express.static(path.join(clientBuildDirectory, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  server.use(express.static(clientBuildDirectory));
  server.use(
    createRequestHandler({
      build: () => import(serverBuildUrl),
      mode: "production",
    }),
  );

  const httpServer = server.listen(Number(process.env.PORT ?? 3000));
  const shutdown = (): void => {
    httpServer.close(() => {
      void app.close().finally(() => process.exit(0));
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

void bootstrap();
