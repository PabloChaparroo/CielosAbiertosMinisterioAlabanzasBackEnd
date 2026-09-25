import { SetMetadata } from "@nestjs/common";

export const ALLOW_GUESTS_KEY = "allowGuests";

/**
 * Un invitado solo puede usar endpoints con @Permissions (ahí decide el rol "Invitado") o los
 * marcados con este decorador. El resto de los endpoints "solo con sesión" (favoritos, mi
 * perfil, subir archivos…) necesitan un usuario real. Ver PermissionsGuard y guest.ts.
 */
export const AllowGuests = () => SetMetadata(ALLOW_GUESTS_KEY, true);
