# Cielos Abiertos Alabanzas — Backend

API para el módulo de música del ministerio de alabanza: canciones (audio, letras, acordes con transposición), setlists y equipo. Reemplaza gradualmente los datos mockeados del [frontend](../CielosAbiertosAlabanzasFrontEnd).

## Stack

NestJS + TypeORM + Postgres (ver `../CielosAbiertosAlabanzasFrontEnd/claude/stack-y-patrones-base.md` para el detalle completo de convenciones).

## Arranque

```bash
npm install
npm run dev
```

`npm run dev` levanta Docker (Postgres + MinIO + Redis), espera a que Postgres esté listo, corre las migraciones y arranca la API en watch mode — todo con un solo comando. Requiere Docker Desktop abierto y corriendo.

La API queda en `http://localhost:3000/api`, documentación Swagger en `http://localhost:3000/api/docs`, consola de MinIO en `http://localhost:9001`.

## Seed de datos demo

```bash
npm run seed:run
```

Carga el equipo y el repertorio migrados desde `src/mocks/data.ts` del frontend. Todos los usuarios demo comparten la contraseña `cambiar123`.

## Estructura

```
src/
  common/           # cross-cutting: autorización, guards, decoradores, storage (S3/MinIO)
  config/           # configuración tipada, validación de env con joi, data-source de TypeORM
  database/
    migrations/     # una clase por archivo, timestamp-prefijo
    seeds/          # datos demo
  modules/
    auth/           # login JWT + /auth/me
    users/          # equipo (integrantes, roles, instrumentos)
    songs/          # canciones: letras, chordpro, estadísticas de reproducción
    setlists/       # armado de repertorio por evento, con tonalidad por canción
    annotations/    # anotaciones de ensayo por canción
    favorites/      # favoritos por usuario
    tags/           # catálogo fijo de etiquetas (Adoración, Júbilo, etc.)
```

## Autorización

Catálogo `recurso:acción` (`cancion`, `setlist`, `equipo`, `anotacion`, `anotacion-propia`, `estadisticas`) espejado del frontend. La tabla `role_permissions` es la fuente de verdad en runtime — el seed de la migración inicial la carga con las mismas reglas que ya regían en `useApp.can()` del frontend mockeado:

- **admin**: acceso total.
- **líder**: todo excepto administrar el equipo (solo lectura).
- **músico**: solo lectura, salvo sus propias anotaciones (crear/editar/borrar las suyas).

## Storage de archivos

Los audios de tracks y las fotos de letras se suben directo del navegador al bucket (MinIO en dev, S3 en producción) con URLs firmadas — el backend nunca recibe el binario. Pedir la URL de subida con `POST /api/storage/upload-url`.
