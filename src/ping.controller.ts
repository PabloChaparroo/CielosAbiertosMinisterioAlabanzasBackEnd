import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

/**
 * Ping liviano para mantener despierto el backend en Render (cron-job.org cada 10 min).
 * No toca la base: un ping no debe despertar Neon. Para chequear la base está /api/health.
 */
@Controller("ping")
export class PingController {
  @Public()
  @Get()
  ping() {
    return { status: "ok" };
  }
}
