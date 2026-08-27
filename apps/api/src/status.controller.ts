import type { ApiStatus } from "@app/shared" with { "resolution-mode": "require" };
import { Controller, Get } from "@nestjs/common";

@Controller("status")
export class StatusController {
  @Get()
  getStatus(): ApiStatus {
    return {
      status: "ok",
      service: "api",
    };
  }
}
