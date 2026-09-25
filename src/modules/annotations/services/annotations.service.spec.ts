import "reflect-metadata";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Repository } from "typeorm";
import { describe, expect, it, vi } from "vitest";
import { PermissionName } from "../../../common/authorization/permission.catalog";
import { PERMISSIONS_KEY } from "../../../common/decorators/permissions.decorator";
import { AuthenticatedUser } from "../../auth/types/authenticated-user";
import { AnnotationsController } from "../controllers/annotations.controller";
import { Annotation } from "../entities/annotation.entity";
import { AnnotationsService } from "./annotations.service";

const AUTOR = "11111111-0000-4000-8000-000000000003";
const OTRO = "11111111-0000-4000-8000-000000000004";

const user = (id: string, permissions: PermissionName[]): AuthenticatedUser => ({
  id,
  email: `${id}@test.org`,
  permissions,
  isGuest: false,
});

/** Repositorio simulado con una anotación escrita por AUTOR (o ninguna, si found = false) */
function setup(found = true) {
  const annotation = { id: "a1", text: "entrar suave", author: { id: AUTOR } } as Annotation;
  const repo = {
    findOne: vi.fn().mockResolvedValue(found ? annotation : null),
    save: vi.fn().mockImplementation(async (a: Annotation) => a),
    softRemove: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockImplementation((a: Partial<Annotation>) => a),
  };
  const service = new AnnotationsService(repo as unknown as Repository<Annotation>);
  return { service, repo, annotation };
}

describe("AnnotationsService — anotaciones propias vs. de todos", () => {
  describe("editar", () => {
    it("el autor edita la suya aunque no sea moderador (anotacion-propia:update)", async () => {
      const { service, repo } = setup();
      const result = await service.update(
        "a1",
        { text: "cambiado" },
        user(AUTOR, ["anotacion-propia:update"]),
      );
      expect(result.text).toBe("cambiado");
      expect(repo.save).toHaveBeenCalled();
    });

    it("alguien que no es el autor y no es moderador no puede editarla (403)", async () => {
      const { service, repo } = setup();
      await expect(
        service.update("a1", { text: "x" }, user(OTRO, ["anotacion-propia:update"])),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it("un moderador (anotacion:update) edita la de otro integrante", async () => {
      const { service } = setup();
      const result = await service.update("a1", { text: "moderado" }, user(OTRO, ["anotacion:update"]));
      expect(result.text).toBe("moderado");
    });

    it("anotación inexistente → 404", async () => {
      const { service } = setup(false);
      await expect(
        service.update("nope", { text: "x" }, user(AUTOR, ["anotacion:update"])),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("borrar", () => {
    it("el autor borra la suya (baja lógica)", async () => {
      const { service, repo } = setup();
      await service.remove("a1", user(AUTOR, ["anotacion-propia:delete"]));
      expect(repo.softRemove).toHaveBeenCalled();
    });

    it("un moderador con anotacion:delete borra la de otro", async () => {
      const { service, repo } = setup();
      await service.remove("a1", user(OTRO, ["anotacion:delete"]));
      expect(repo.softRemove).toHaveBeenCalled();
    });

    it("borrar ajenas exige anotacion:delete: con solo anotacion:update no alcanza", async () => {
      const { service, repo } = setup();
      await expect(service.remove("a1", user(OTRO, ["anotacion:update"]))).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.softRemove).not.toHaveBeenCalled();
    });
  });

  describe("crear", () => {
    it("el autor es siempre el usuario de la sesión", async () => {
      const { service, repo } = setup();
      await service.create({ songId: "s1", text: "hola" }, user(OTRO, ["anotacion-propia:write"]));
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ author: { id: OTRO } }));
    });
  });
});

describe("AnnotationsController — qué permisos pide cada endpoint", () => {
  // Fija la regla "propia O de todos": si alguien cambia estos permisos por error, falla acá
  const reflector = new Reflector();
  const required = (handler: keyof AnnotationsController) =>
    reflector.get<PermissionName[]>(PERMISSIONS_KEY, AnnotationsController.prototype[handler]);

  it("leer: anotacion:read", () => {
    expect(required("findBySong")).toEqual(["anotacion:read"]);
  });

  it("crear: de todos O propia", () => {
    expect(required("create")).toEqual(["anotacion:write", "anotacion-propia:write"]);
  });

  it("editar: de todos O propia", () => {
    expect(required("update")).toEqual(["anotacion:update", "anotacion-propia:update"]);
  });

  it("borrar: de todos O propia", () => {
    expect(required("remove")).toEqual(["anotacion:delete", "anotacion-propia:delete"]);
  });
});
