export const CRUD_ACTIONS = ["read", "write", "update", "delete"] as const;
export type CrudAction = (typeof CRUD_ACTIONS)[number];

export const CRUD_RESOURCES = [
  "cancion",
  "setlist",
  "equipo",
  "anotacion",
  "anotacion-propia", // el músico puede editar/borrar solo sus propias anotaciones
  "estadisticas",
  "rol", // administración de roles: crear/borrar roles, editar sus permisos, asignarlos a usuarios
  // eliminar una canción DEFINITIVAMENTE (con letra, pistas, links, archivos, y de los setlists).
  // Recurso aparte de "cancion" porque cancion:delete lo tiene también el Líder (borrar pistas y
  // links); solo cuenta la acción "delete" — el resto no se usa, como en "estadisticas".
  "cancion-definitiva",
] as const;
export type CrudResource = (typeof CRUD_RESOURCES)[number];

export type PermissionName = `${CrudResource}:${CrudAction}`;

export function crudPermission(resource: CrudResource, action: CrudAction): PermissionName {
  return `${resource}:${action}`;
}

export const PERMISSION_CATALOG: PermissionName[] = CRUD_RESOURCES.flatMap((resource) =>
  CRUD_ACTIONS.map((action) => crudPermission(resource, action)),
);
