import "reflect-metadata";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it } from "vitest";
import { AuthenticatedUser } from "../../modules/auth/types/authenticated-user";
import { PermissionName } from "../authorization/permission.catalog";
import { AllowGuests } from "../decorators/allow-guests.decorator";
import { Permissions } from "../decorators/permissions.decorator";
import { Public } from "../decorators/public.decorator";
import { PermissionsGuard } from "./permissions.guard";

// Controlador de mentira con un handler por cada combinación de metadata que usa la API
class FakeController {
  sinPermiso() {}

  @Public()
  publico() {}

  @Permissions("cancion:read")
  verCanciones() {}

  @Permissions("cancion:write")
  crearCancion() {}

  @Permissions("anotacion:update", "anotacion-propia:update")
  editarAnotacion() {}

  @AllowGuests()
  permitidoInvitados() {}
}

function contextFor(handler: keyof FakeController, user?: AuthenticatedUser): ExecutionContext {
  return {
    getHandler: () => FakeController.prototype[handler],
    getClass: () => FakeController,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

const usuario = (permissions: PermissionName[]): AuthenticatedUser => ({
  id: "11111111-0000-4000-8000-000000000001",
  email: "musico@test.org",
  permissions,
  isGuest: false,
});
const invitado = (permissions: PermissionName[]): AuthenticatedUser => ({
  id: "invitado",
  email: "",
  permissions,
  isGuest: true,
});

const guard = new PermissionsGuard(new Reflector());

describe("PermissionsGuard", () => {
  describe("usuario con cuenta", () => {
    it("deja pasar un endpoint sin @Permissions (solo necesita sesión)", () => {
      expect(guard.canActivate(contextFor("sinPermiso", usuario([])))).toBe(true);
    });

    it("deja pasar un endpoint @Public aunque no haya usuario", () => {
      expect(guard.canActivate(contextFor("publico"))).toBe(true);
    });

    it("deja pasar si tiene el permiso requerido", () => {
      expect(guard.canActivate(contextFor("verCanciones", usuario(["cancion:read"])))).toBe(true);
    });

    it("rechaza con 403 y dice qué permiso faltaba", () => {
      const run = () => guard.canActivate(contextFor("crearCancion", usuario(["cancion:read"])));
      expect(run).toThrow(ForbiddenException);
      expect(run).toThrow("requiere: cancion:write");
    });

    it("con varios permisos posibles alcanza con tener uno (OR): anotación propia", () => {
      const soloPropia = usuario(["anotacion-propia:update"]);
      expect(guard.canActivate(contextFor("editarAnotacion", soloPropia))).toBe(true);
    });

    it("con varios permisos posibles alcanza con tener uno (OR): moderador", () => {
      const moderador = usuario(["anotacion:update"]);
      expect(guard.canActivate(contextFor("editarAnotacion", moderador))).toBe(true);
    });

    it("con varios permisos posibles rechaza si no tiene ninguno", () => {
      const sinNinguno = usuario(["anotacion:read"]);
      expect(() => guard.canActivate(contextFor("editarAnotacion", sinNinguno))).toThrow(
        ForbiddenException,
      );
    });

    it("rechaza un endpoint con permiso si no hay usuario", () => {
      expect(() => guard.canActivate(contextFor("verCanciones"))).toThrow(ForbiddenException);
    });
  });

  describe("invitado (sin cuenta)", () => {
    it("rechaza endpoints 'solo con sesión' (favoritos, perfil, subir archivos…)", () => {
      const run = () => guard.canActivate(contextFor("sinPermiso", invitado(["cancion:read"])));
      expect(run).toThrow(ForbiddenException);
      expect(run).toThrow("los invitados no pueden usarla");
    });

    it("deja pasar los endpoints marcados con @AllowGuests", () => {
      expect(guard.canActivate(contextFor("permitidoInvitados", invitado([])))).toBe(true);
    });

    it("deja pasar un endpoint con un permiso de lectura que el rol Invitado tiene", () => {
      expect(guard.canActivate(contextFor("verCanciones", invitado(["cancion:read"])))).toBe(true);
    });

    it("rechaza escribir (sus permisos ya vienen filtrados a solo lectura)", () => {
      expect(() =>
        guard.canActivate(contextFor("crearCancion", invitado(["cancion:read"]))),
      ).toThrow(ForbiddenException);
    });
  });
});
