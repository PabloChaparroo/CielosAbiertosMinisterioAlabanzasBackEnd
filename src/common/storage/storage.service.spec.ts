import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";
import { AppConfig } from "../../config/configuration";
import { StorageService } from "./storage.service";

// La firma de URLs es un cálculo local (no se conecta a MinIO/R2), así que se usa el SDK real
const config = {
  get: () => ({
    endpoint: "http://storage.test",
    region: "auto",
    bucket: "bucket-test",
    accessKey: "clave-test",
    secretKey: "secreto-test",
    forcePathStyle: true,
  }),
} as unknown as ConfigService<AppConfig, true>;
const service = new StorageService(config);

describe("StorageService.getUploadUrl", () => {
  it("audio permitido: la key va en la carpeta y la URL firmada apunta al bucket", async () => {
    const { uploadUrl, key } = await service.getUploadUrl("audios", "audio/mpeg");
    expect(key).toMatch(/^audios\/[0-9a-f-]{36}$/);
    expect(uploadUrl).toContain(`/bucket-test/${key}`);
    expect(uploadUrl).toContain("X-Amz-Signature=");
  });

  it("rechaza un archivo que no es audio en la carpeta de audios", async () => {
    await expect(service.getUploadUrl("audios", "application/pdf")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("avatares: acepta jpg/png/webp y rechaza otros formatos (ej. HEIC)", async () => {
    await expect(service.getUploadUrl("avatares", "image/png")).resolves.toMatchObject({
      key: expect.stringMatching(/^avatares\//),
    });
    await expect(service.getUploadUrl("avatares", "image/heic")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("portadas: acepta jpg/png/webp y rechaza HEIC y archivos que no son imagen", async () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      await expect(service.getUploadUrl("portadas", type)).resolves.toMatchObject({
        key: expect.stringMatching(/^portadas\//),
      });
    }
    await expect(service.getUploadUrl("portadas", "image/heic")).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.getUploadUrl("portadas", "audio/mpeg")).rejects.toThrow(
      BadRequestException,
    );
  });

  it("cada subida recibe una key distinta (no pisa archivos existentes)", async () => {
    const a = await service.getUploadUrl("letras", "image/jpeg");
    const b = await service.getUploadUrl("letras", "image/jpeg");
    expect(a.key).not.toBe(b.key);
  });
});
