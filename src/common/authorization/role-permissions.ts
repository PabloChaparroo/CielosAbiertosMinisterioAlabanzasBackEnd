import { crudPermission, PermissionName } from "./permission.catalog";

/**
 * Mapeo default rol -> permisos, usado por el seed de arranque. La fuente de
 * verdad en runtime es la tabla role_permissions (editable sin deploy); esto
 * es solo el estado inicial que replica las reglas ya vigentes en el frontend
 * mockeado (ver useApp.can() del proyecto frontend).
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<"admin" | "lider" | "musico", PermissionName[]> = {
  admin: [
    crudPermission("cancion", "read"),
    crudPermission("cancion", "write"),
    crudPermission("cancion", "update"),
    crudPermission("cancion", "delete"),
    crudPermission("setlist", "read"),
    crudPermission("setlist", "write"),
    crudPermission("setlist", "update"),
    crudPermission("setlist", "delete"),
    crudPermission("equipo", "read"),
    crudPermission("equipo", "write"),
    crudPermission("equipo", "update"),
    crudPermission("equipo", "delete"),
    crudPermission("anotacion", "read"),
    crudPermission("anotacion", "write"),
    crudPermission("anotacion", "update"),
    crudPermission("anotacion", "delete"),
    crudPermission("anotacion-propia", "update"),
    crudPermission("anotacion-propia", "delete"),
    crudPermission("estadisticas", "read"),
  ],
  lider: [
    crudPermission("cancion", "read"),
    crudPermission("cancion", "write"),
    crudPermission("cancion", "update"),
    crudPermission("cancion", "delete"),
    crudPermission("setlist", "read"),
    crudPermission("setlist", "write"),
    crudPermission("setlist", "update"),
    crudPermission("setlist", "delete"),
    crudPermission("equipo", "read"),
    crudPermission("anotacion", "read"),
    crudPermission("anotacion", "write"),
    crudPermission("anotacion", "update"),
    crudPermission("anotacion", "delete"),
    crudPermission("anotacion-propia", "update"),
    crudPermission("anotacion-propia", "delete"),
    crudPermission("estadisticas", "read"),
  ],
  musico: [
    crudPermission("cancion", "read"),
    crudPermission("setlist", "read"),
    crudPermission("equipo", "read"),
    crudPermission("anotacion", "read"),
    crudPermission("anotacion-propia", "write"),
    crudPermission("anotacion-propia", "update"),
    crudPermission("anotacion-propia", "delete"),
    crudPermission("estadisticas", "read"),
  ],
};
