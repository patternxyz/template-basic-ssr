import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  type NestModule,
} from "@nestjs/common";
import { HttpCacheMiddleware } from "./http-cache.middleware";
import { StatusController } from "./status.controller";

@Module({
  controllers: [StatusController],
  providers: [HttpCacheMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(HttpCacheMiddleware)
      .forRoutes({ path: "{*path}", method: RequestMethod.ALL });
  }
}
