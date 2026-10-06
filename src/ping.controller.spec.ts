import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { IS_PUBLIC_KEY } from "./common/decorators/public.decorator";
import { PingController } from "./ping.controller";

describe("PingController", () => {
  it("responde ok sin dependencias", () => {
    expect(new PingController().ping()).toEqual({ status: "ok" });
  });

  it("es público (los guards globales lo dejan pasar)", () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, PingController.prototype.ping)).toBe(true);
  });
});
