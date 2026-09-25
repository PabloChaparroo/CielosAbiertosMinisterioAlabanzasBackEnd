/**
 * Acceso de invitados: entrar sin usuario ni contraseña (POST /auth/invitado).
 *
 * - No hay fila en users: el token dice `guest: true` y su `sub` es GUEST_SUBJECT.
 * - Qué puede ver lo define el rol GUEST_ROLE_NAME desde "Roles y Permisos", pero de ese rol
 *   **solo valen los permisos de lectura** (`:read`): un invitado nunca crea/edita/borra.
 * - Si el rol no existe (se borró), el acceso de invitados queda deshabilitado.
 * - Ese rol no se puede asignar a integrantes ni renombrar (se busca por nombre).
 * Ver docs/estado-actual.md.
 */
export const GUEST_ROLE_NAME = "Invitado";
export const GUEST_SUBJECT = "invitado";
