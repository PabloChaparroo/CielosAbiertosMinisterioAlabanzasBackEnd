# Estado actual — changelog vivo

Orden cronológico inverso. Cada entrada documenta motivo de negocio, alcance acotado, detalle técnico, bugs encontrados de paso y qué quedó verificado vs. sin verificar (ver sección 6 de `claude/stack-y-patrones-base.md` en el frontend). La primera entrada del archivo no reconstruyó retroactivamente el historial de sesiones previas (scaffold inicial, refactor a features, fix de vulnerabilidades, alta de `AudioTrack`).

---

## 2026-09-25 — Acordes: notas "(…)" en su posición + atajos `%`, `x3`, `x4`, Sube/Baja Tono (frontend)

**Motivo:** pedido directo de Pablo — las notas entre paréntesis se mostraban siempre al final de la línea (así se implementaron en la entrada "anotaciones con flecha"); tienen que quedar donde se escriben. Además pidió los atajos `[%]`, `[x3]`, `[x4]`, `[Sube Tono]` y `[Baja Tono]`.

**Notas en su posición** (reemplaza el comportamiento "al final de la línea"):
- `lib/chords.ts`: `ChordPair` gana `note?`; `parseChordPro` parte el texto de cada acorde en tramos de texto y notas (`splitNotes`) en vez de sacarlas de la línea. `ParsedLine` de tipo `line` ya no tiene `notes` (las secciones sí, para `[CORO] (suave)`). La unión "línea de solo acordes + línea de letra" ignora las notas al decidir.
- `ChordSheet`: en "Letra + acordes" la nota va **siempre en la fila de los acordes** (corrección pedida por Pablo: la primera versión la ponía en la fila de la letra cuando la línea tenía letra) — ocupa su lugar en esa fila, así que la letra de abajo deja un hueco del mismo ancho, que es el costo de que no tape el acorde siguiente; en "Solo acordes" el texto de compases se arma por segmentos (`chordChartSegments`) y la nota corta el texto donde se escribió (`| F - ↱ coro suave C | Am |:]`).
- PDF: mismo criterio — la nota va en la fila de los acordes; se reserva el lugar con espacios (courier es monoespaciada) y se dibuja encima en azul y más chica.

**Atajos nuevos** (botones en el editor, insertan entre corchetes): `[%]` es un compás más (`| D | % |`); `[x3]`/`[x4]` y las indicaciones con espacios (`Sube Tono`, `Baja Tono`) son **marcas** (`isChartMarker`): no abren compás nuevo (`|:] x3`, `| G Sube Tono | A …`) y **no se transponen** — sin esa guarda, `Baja Tono` empieza con "B" y el transpositor lo convertía en `C#aja Tono`. Acordes reales como `C7sus4`/`Gm7b5` se siguen transponiendo (verificado). Son marcas visuales: "Sube Tono" **no** cambia la tonalidad de los acordes siguientes. Una marca sola en su línea (`[Sube Tono]`) se muestra como título de sección.

**Fix de paso — el pendiente anotado dos entradas abajo:** en "Letra + acordes" las líneas de solo acordes salían pegadas (`BmDA`); con las marcas nuevas quedaba ilegible (`ASube TonoB`). Cada acorde ahora tiene 1ch de margen derecho, que solo se nota cuando el acorde es más ancho que la letra de abajo. Mismo criterio en el PDF.

**Verificado con navegador real** (Playwright, canción temporal borrada al terminar, tu línea real de "Desde mi interior"): nota en su posición en ambos modos, en secciones y en líneas de solo acordes; `%`, `x3`, Sube/Baja Tono como se describe; **PDF descargado y revisado** (antes había quedado sin verificar). `tsc`, lint y build limpios.

**Pendientes del PDF, pre-existentes, no tocados:** en líneas de solo acordes el `:]` sale en un renglón aparte debajo, y el guion `-` se imprime en la letra (en pantalla se oculta).

---

## 2026-09-25 — Acordes: vista previa en vivo al editar (frontend)

**Motivo:** pedido directo de Pablo — al editar, el texto ChordPro crudo no se parece a cómo queda la canción; quiere ver a la derecha, mientras escribe, cómo se va a ver.

**Implementación:** `AcordesPage.tsx` — mientras se edita, el editor y una tarjeta **"Vista previa"** quedan lado a lado (`xl:grid-cols-2`; en pantallas más angostas la vista previa va debajo del editor). La vista previa usa **el mismo** `parseChordPro` + `ChordSheet` que la vista normal, aplicados al borrador sin guardar, y respeta la tonalidad/transposición, el tamaño de letra y el modo (Letra + acordes / Solo acordes) elegidos. Es `sticky` con scroll propio para acompañar el editor en canciones largas.

**Verificado con navegador real** (Playwright, 1860px de ancho, canción temporal creada por la API y dada de baja al terminar): la vista previa muestra el contenido existente (incluidas las notas con flecha) y, al escribir una línea nueva en el editor, aparece al instante con sus acordes y su nota. `tsc`, lint y build limpios. Se ve también el hallazgo pre-existente ya anotado (líneas de solo acordes pegadas en "Letra + acordes", ej. `BmDA`) — no es de este cambio.

---

## 2026-09-25 — Alta de integrante con rol del sistema; "rol en el ministerio" eliminado (backend + frontend)

**Motivo:** pedido directo de Pablo — el desplegable de "Agregar miembro" mostraba el rol en el ministerio (Guitarrista, Vocalista…); tiene que mostrar los **roles creados** en Roles y Permisos, porque "no interesa qué clase de músico es". También pidió poder cambiar o quitar el rol desde Equipo.

**Decisiones confirmadas por Pablo:** eliminar `ministryRole` del todo (mismo criterio que `instruments`), y que el alta asigne **un solo rol** con un desplegable (si hace falta más de uno, se agrega desde Editar).

**Hallazgo al investigar:** cambiar o quitar roles desde Equipo **ya existía** — "Editar integrante" tiene la sección "Roles del sistema" con botones marcables (usa `POST/DELETE /equipo/:userId/roles/:roleId`). No se tocó; se verificó que funciona.

**Backend:**
- Migración `1759400000000-DropUserMinistryRole`: `DROP COLUMN ministry_role`. El `down()` recrea la columna con `''` — **los valores que había se pierden**.
- `User`, `CreateUserDto`/`UpdateUserDto`, `UpdateMyProfileDto`, `UsersService` y `/auth/me` sin el campo; seed demo actualizado.
- **A diferencia de `instruments`, esta migración es obligatoria antes de usar el código nuevo:** `ministry_role` era `NOT NULL` **sin default**, así que con el código nuevo y la columna todavía presente, **crear un integrante falla** (el INSERT no manda el campo). Si Render no corre `migration:run` en el deploy, hay que correrla a mano enseguida.

**Frontend:**
- `AddMemberModal`: desplegable con los roles de `GET /roles` (ordenados, opción "Sin rol", preselecciona "Músico" si existe). El integrante se crea y **después** se asigna el rol con el endpoint existente — a propósito no se agregó `roleId` al alta del backend: asignar roles se gobierna con `rol:write`, no con `equipo:write`, y meterlo en el alta habría sido una puerta trasera a ese permiso. Sin `rol:write`, el desplegable no se muestra. Si el alta sale bien pero la asignación falla, se muestra igual la contraseña generada (es la única vez que se ve) con un aviso para asignar el rol desde Editar.
- Se quitó "Rol en el ministerio" de Editar integrante y Mi perfil. Donde se mostraba: tarjetas de Equipo y Sidebar lo pierden (ya tenían al lado el badge del rol del sistema); detalle del integrante y equipo del setlist muestran los roles del sistema (`roleNames`, "Sin rol" si no tiene).
- Filtros de Equipo: ahora por **rol del sistema** (+ "Sin rol" solo si hay integrantes activos sin roles). Reemplaza al filtro por rol en el ministerio de la entrada siguiente.

**⚠️ Orden de deploy:** mismo problema que con `instruments` (`forbidNonWhitelisted`) — pushear los dos repos juntos y correr la migración.

**Verificado con navegador real** (Playwright) contra la API local: filtros `Todos | Admin | Líder | Músico | Sudo | Sin rol`; desplegable del alta con `Sin rol | Admin | Líder | Músico | Sudo` y "Músico" preseleccionado; **alta real** → API devuelve `["Músico"]`; en Editar, cambiar a Líder → `["Líder"]`; quitarlo → `[]`; sin errores de API. Integrante de prueba (`prueba.rol.…@cielosabiertos.org`) dado de baja al final. Migración corrida en la base local. `tsc`, lint y build limpios en los dos repos. **Sin verificar en navegador:** Mi perfil (solo se quitó el input) y el aviso de "no se pudo asignar el rol" (requiere forzar un fallo del endpoint).

---

## 2026-09-25 — "Instrumentos" eliminado como atributo del integrante (backend + frontend)

**Motivo:** pedido directo de Pablo — "Instrumento" no es relevante; el rol en el ministerio (`ministryRole`: Guitarrista, Bajista, Vocalista…) ya cubre esa información.

**Backend:**
- Migración `1759300000000-DropUserInstruments`: `ALTER TABLE users DROP COLUMN instruments`. El `down()` recrea la columna vacía — **los valores que había se pierden**, no son recuperables con el revert.
- `User` sin la columna; `CreateUserDto`/`UpdateUserDto` y `UpdateMyProfileDto` sin el campo; `UsersService.create/update/updateOwnProfile` y `/auth/me` ya no lo leen ni lo devuelven. Seed demo actualizado.

**Frontend:**
- Sin campo "Instrumento" en Agregar miembro, Editar integrante y Mi perfil; tipos (`User`, `AuthUser`, DTOs de Equipo/Perfil) sin `instruments`.
- **Decisión de implementación, no pedida explícitamente:** los filtros de la pantalla Equipo eran por instrumento; al desaparecer el dato, pasaron a filtrar por **rol en el ministerio** (mismo criterio: solo integrantes activos, ordenados alfabéticamente) en vez de eliminarse. Las tarjetas y el detalle ya no muestran la línea/chips de instrumentos.

**⚠️ Orden de deploy — pushear los dos repos juntos:** el backend usa `ValidationPipe` con `forbidNonWhitelisted: true`. Mientras un lado esté deployado y el otro no: backend nuevo + frontend viejo → "Agregar miembro", "Editar" y "Mi perfil" dan 400 (el front viejo manda `instruments`); frontend nuevo + backend viejo → "Agregar miembro" da 400 (el back viejo exige `instruments`). La ventana dura lo que tarde el deploy más lento; el resto de la app no se ve afectado. Además, si Render no corre `migration:run` en el deploy, hay que correrla a mano — aunque sin correrla el código nuevo igual funciona (la columna vieja tiene default y el código ya no la usa).

**Verificado:** migración corrida en la base local (la columna ya no existe); `/api/equipo` y `/api/auth/me` responden 200 sin `instruments`. Con navegador real (Playwright): filtros por rol en Equipo ("Guitarrista" → Joaquín Ruiz y Pablo Chaparro), modal de alta sin el campo, **alta real** de un integrante de prueba (se mostró la contraseña generada) sin errores de API, luego dado de baja (`prueba.sin.instrumento.…@cielosabiertos.org`, rol Vocalista para no ensuciar el desplegable de roles). `tsc`, lint y build limpios en los dos repos. **Sin verificar en navegador:** los modales Editar integrante y Mi perfil (el cambio ahí es solo quitar el input y el campo del payload).

---

## 2026-09-25 — Duración de la canción tomada automáticamente del audio (frontend)

**Motivo:** pedido directo de Pablo — en "Subir / Editar canción" la duración se cargaba a mano; que se complete sola mirando el audio.

**Implementación:** `features/canciones/lib/audio-duration.ts` (`readAudioDuration`, `readFileDuration`) lee solo los **metadatos** del audio con un `<audio preload="metadata">` — no descarga el archivo entero, ni pasa nada por el backend. `UploadModal.tsx`:
- **Al elegir un archivo** (alta o reemplazo): la duración se reemplaza con la del archivo.
- **Al abrir "Editar" en una canción que ya tiene audio:** se lee la duración real desde la URL firmada (`StorageClient.getDownloadUrl`) y se completa el campo, salvo que el usuario ya lo haya tocado a mano mientras cargaba.
- Los campos siguen siendo editables; el texto de ayuda indica "Tomada automáticamente del archivo de audio" y vuelve al texto normal si se corrige a mano. Si el navegador no puede leer la duración (formato no soportado, error de red, 15 s de timeout), queda el valor que había, sin error visible.
- Sin cambios de backend: `duration` sigue siendo un entero en segundos que manda el frontend; recién se persiste al **Guardar**.

**Hallazgo:** las duraciones cargadas a mano no coincidían con el audio real — "Desde mi interior" tiene `300` s (5:00) guardados y su audio dura 6:14. Al abrir "Editar" y guardar se corrige; no se hizo una corrección masiva de las canciones existentes.

**Verificado con navegador real** (Playwright), sin guardar nada: editar "Desde mi interior" → 6 min 14 seg con la ayuda automática; subir canción nueva con un WAV generado de exactamente 83 s → 1 min 23 seg; corregir a mano quita la ayuda automática. La base quedó igual (`duration = 300`). `tsc`, lint y build limpios.

---

## 2026-09-25 — Acordes: anotaciones con flecha `↱` y `|:]` sin espacio (frontend)

**Motivo:** pedido directo de Pablo, con captura de referencia de una hoja de acordes que marca al costado de una línea "↱ coro 2 | E |" en letra chica.

**Implementación:**
- **Sintaxis:** cualquier texto entre paréntesis en la canción, ej. `[D] (coro 2 | E |)`, se muestra al final de esa línea como `↱ coro 2 | E |`, ~55% del tamaño y en color `sky`. Funciona en "Letra + acordes", "Solo acordes", secciones (`[CORO] (suave)`) y líneas que solo tienen la nota (`(repetir intro)`).
- `lib/chords.ts`: `parseChordPro` separa las notas de cada línea antes de parsear acordes (así no rompen la unión "línea de solo acordes + línea de letra") y las expone como `notes: string[]` en `ParsedLine` (secciones y líneas).
- `ChordSheet.tsx`: componente `LineNotes` al final de cada línea/sección. `ChordProEditor.tsx`: los paréntesis se resaltan en azul itálica mientras se edita. `AcordesPage.tsx`: botón **↱ nota** en los atajos, inserta ` ()` con el cursor adentro.
- PDF de Acordes: las notas salen en azul y más chicas, como `-> texto` — las fuentes estándar de jsPDF no tienen el glifo `↱`.
- Fix chico aparte (commit propio): la línea de acordes mostraba `| :]` con un espacio; ahora `|:]`.

**Regla a tener en cuenta:** *cualquier* paréntesis pasa a ser nota, también en una línea de letra (ej. una segunda voz `Digno (digno)` se movería al costado como nota). Se verificó que ninguna de las 22 canciones locales usa paréntesis hoy; no se pudo verificar la base de producción.

**Verificado con navegador real** (Playwright, con capturas) sobre una canción temporal creada por la API y dada de baja al terminar: notas con flecha en ambos modos, en secciones y en línea sola; resaltado y botón en el editor; `|:]` sin espacio. `tsc`, lint y build limpios. **Sin verificar:** el PDF (no se abrió el archivo generado). Dos canciones de prueba quedaron dadas de baja lógica (`ZZ Prueba notas (borrar)`), una de un intento fallido del script.

**Hallazgo de paso, no arreglado — pre-existente:** en "Letra + acordes", una línea de solo acordes (`[Bm] [D] [A] :]`) se ve pegada (`BmDA`), porque cada acorde ocupa el ancho de su texto (un espacio). No lo introdujo este ticket.

---

## 2026-09-24 — CI de verificación (GitHub Actions) en frontend y backend + fix de errores de tipos/lint que ya estaban en `main` del frontend

**Motivo de negocio:** frenar un push roto (tipos, lint o build) antes de que llegue a la rama que dispara el deploy. Es CI de **verificación, no de deploy**: Vercel (frontend) y Render (backend) ya despliegan solos en cada push a `main`, y eso no se tocó.

**Investigación previa (comandos confirmados contra los `package.json` reales, no asumidos):**
- Rama principal: `main` en los dos repos.
- Frontend: lint = `npm run lint` → `eslint .` (con Prettier como regla `prettier/prettier` en nivel error); build = `npm run build` → `vite build`. No hay script de `tsc`, se corre `npx tsc --noEmit`.
- Backend: lint = `npm run lint` → `oxlint .`; build = `npm run build` → `swc src -d dist ...`; `npx tsc --noEmit` para tipos.
- El repo del frontend en GitHub se renombró a `PabloChaparroo/CielosAbiertosMusicFrontEnd`; el remote local todavía apunta al nombre viejo y funciona por redirección.

**Implementación:** `.github/workflows/ci.yml` en cada repo — dispara en `push` y `pull_request` a `main`; `npm ci` (reproducible contra el `package-lock.json`), `tsc --noEmit`, lint, build, en ese orden; el primer paso que falla corta el resto y pone el check en rojo. Node 24 (backend vía `.nvmrc`; el frontend no tiene versión fijada, se usó la misma). `concurrency` cancela corridas viejas de la misma rama/PR. Sin deploy, sin secretos, sin tests nuevos.

**Decisión: Opción A en el backend (sin Postgres en el CI).** Se evaluó la Opción B (servicio `postgres` en el runner + `npm run migration:run`) y se descartó por ahora: correr migraciones contra una base **vacía** detecta errores de SQL u orden, pero no el caso más probable en producción — una migración que rompe **por los datos existentes** (un `NOT NULL` sin default sobre filas viejas, un `CHECK` que viola datos previos). Tampoco habría evitado el incidente ya registrado de migraciones no aplicadas. Queda como mejora futura (≈15 líneas en el YAML) si alguna vez una migración rota llega a producción sin detectarse. Dato no verificable desde el repo: no hay `render.yaml` ni `migrationsRun`, así que no se sabe si Render corre `migration:run` en cada deploy — si lo hace, una migración rota tira el deploy y eso suma a favor de la B.

**Hallazgo: `main` del frontend ya estaba roto antes del CI** (Vercel no lo detecta porque solo corre `vite build`, que no chequea tipos). 11 errores de `tsc` + 7 de lint:
- Arreglado en el commit `39af9f7` del frontend (solo archivos sin cambios pendientes de Pablo): campo `isUpcoming` duplicado en `UpsertSetlistInput`; `validateSearch` de `/acordes` y `/letras` devolvía `songId`/`songIds` como `string | undefined` obligatorios, lo que con `exactOptionalPropertyTypes` obligaba a todo `<Link>` a esas rutas a pasar `search` (así fallaba el de `InicioPage`) — ahora son claves opcionales; formato Prettier en `SetlistDetail` y `GeneratedPasswordModal`.
- Arreglado en el working tree de Pablo, **sin commitear a pedido suyo** (lo junta él con su trabajo pendiente): formato Prettier de `useApp.tsx` y `MiniPlayer.tsx:119` (`current.duration` → `current?.duration || 0`, error introducido por esos mismos cambios pendientes, no presente en `main`). `InicioPage` y `AudioTracksModal` ya tenían el formato corregido en esos cambios.
- Los ~12.000 "errores" de lint que aparecen al correr `eslint` en Windows son CRLF (`core.autocrlf=true`); en el repo los archivos están en LF y en el runner Linux no aparecen.

**Hallazgo documentado — decisión consciente de alcance, no limitación oculta: el CI no frena push directos a `main` ni los commits de Lovable.** El workflow corre y marca rojo, pero Vercel y Render despliegan igual, porque escuchan el push por su cuenta. Los commits que Lovable sincroniza van directo a `main` y también se saltean el control. El CI solo funciona como control visible **si se trabaja con ramas + Pull Requests** (el check rojo aparece en el PR antes de mergear). Recién bloquearía el deploy real si en el futuro se configura **"Auto-Deploy: After CI Checks Pass"** en Render y el equivalente en Vercel (que espere los checks de GitHub antes de promover el deploy). Se dejó fuera de este ticket a propósito: el pedido era verificación, no tocar el deploy.

**Documentación desactualizada señalada, no corregida en este ticket:** `claude/stack-y-patrones-base.md` (frontend) dice que el stack usa oxlint/oxfmt en lugar de ESLint/Prettier; eso vale para el backend, pero el frontend real usa **ESLint + Prettier** (`eslint.config.js` con `eslint-plugin-prettier`). También dice Vite `^7` y el repo tiene Vite 8.

**Verificado en GitHub (corridas reales, no simuladas):**
- Push de los workflows a `main`: backend **verde** (run `36070722646`); frontend **rojo en lint** (run `36070719812`) por los 4 errores de formato que están arreglados pero sin commitear en el working tree de Pablo — `tsc` ya en verde ahí. `main` del frontend queda en rojo hasta que Pablo commitee esos cambios; es el estado real, no un falso positivo.
- Prueba del rojo: rama `ci/prueba-error-tipos` en cada repo con `export const pruebaCi: number = "esto no es un número";` → PR #1 en cada repo → **rojo en el paso `Tipos (tsc --noEmit)`**, exit code 2, lint y build `skipped` (frontend run `36072234543`, backend run `36072254874`).
- Revert del error pusheado al mismo PR → **verde en los 6 pasos** (frontend run `36072362463`, backend run `36072366448`). En la rama del frontend se había sumado el formato Prettier de los 3 archivos pendientes para que la rama pudiera quedar verde; nunca llegó a `main`.
- Limpieza: PRs #1 cerrados **sin mergear** (estado `CLOSED`, al borrar la rama de origen), ramas `ci/prueba-error-tipos` borradas en remoto y local, worktrees temporales eliminados.
- **Sin verificar en navegador:** el cambio de `validateSearch` en `/acordes` y `/letras` es equivalente en comportamiento (clave ausente en vez de `undefined`), pero no se abrió una canción desde un setlist para confirmarlo.

**Dónde mirar de ahora en más:** pestaña **Actions** de cada repo, y el check **"CI / tsc + lint + build"** al pie de cada PR.

---

## 2026-09-24 — Letras, Acordes, compases, favoritos, setlists reutilizables y links relacionados

**Motivo de negocio:** se completó una tanda de mejoras de uso diario para el repertorio: edición controlada de letras/acordes, mejor lectura de secciones y compases, exportaciones PDF más completas, favoritos compactos y filtrables, setlists reutilizables entre reuniones y enlaces externos asociados a cada canción.

### Letras y Acordes

- **Modo lectura por defecto en Letras:** la letra se muestra como texto no editable. El botón **Editar** habilita edición, atajos de secciones y guardado/cancelación.
- **Atajos de secciones:** `INTRO`, `ESTROFA 1`, `ESTROFA 2`, `CORO`, `PRE-CORO`, `PUENTE`, `INTERLUDIO`, `FINAL` y `SOLO`; insertan marcas ChordPro en la posición del cursor.
- Se reconocen `{coro}` y `[coro]`; se muestran en mayúsculas, más grandes y en dorado/naranja.
- Acordes tiene edición persistente, atajos de secciones y acordes diatónicos según la tonalidad seleccionada. Por ejemplo, en `D`: `D`, `Em`, `F#m`, `G`, `A`, `Bm`, `C#dim`.
- El atajo **Tab** inserta separación horizontal. El parser une una línea que solo contiene acordes con la línea de letra siguiente, corrigiendo canciones como “Desde mi interior”.
- Se ajustaron el espaciado entre acordes/letra, el tamaño inicial de Acordes (`25px`) y la vista de pantalla completa.

### PDFs y compás

- Letras y Acordes muestran `Compás 4/4`, `3/4`, `6/8`, etc., en el encabezado del PDF.
- Las secciones del PDF de Letras salen en dorado, mayúsculas y con tamaño mayor.
- Se agregó `Song.compas` en backend/frontend, selector en alta/edición y visualización en listas y encabezados.
- Migración aplicada: `1759000000000-AddSongTimeSignature`; el seed demo carga `4/4`.

### Favoritos y Setlists

- Favoritos ahora usa tarjetas mucho más compactas y un buscador por título o artista.
- Se agregó `Setlist.isUpcoming` para conservar listas reutilizables. Las nuevas nacen como próximas y cada tarjeta permite **Poner en próximas** o **Sacar de próximas** sin duplicar la lista.
- Migración aplicada: `1759100000000-AddSetlistUpcomingStatus`.

### Links relacionados por canción

- Se agregó la entidad uno-a-muchos `SongLink` (`song_links`) con `label`, `url`, `type` opcional y `order`.
- Nuevos endpoints: `GET/POST /canciones/:songId/links` y `PATCH/DELETE /links/:id`, usando los permisos existentes de `cancion`.
- En **Escuchar y Subir** se agregó un botón y modal para ver, abrir, agregar y eliminar links de YouTube, Drive, Spotify u otros.
- Migración aplicada: `1759200000000-AddSongLinks`.

**Incidente corregido:** después de agregar `compas` e `isUpcoming`, `/canciones` y `/setlists` devolvían `500` porque `synchronize` está desactivado y las migraciones no se habían aplicado. Se ejecutó `npm run migration:run` sin borrar datos.

**Verificado:** `tsc --noEmit` y build del backend exitosos; migraciones aplicadas; ESLint del frontend sin errores en las superficies modificadas. No se hizo una verificación visual automatizada completa de todos los breakpoints.

---

## 2026-09-24 — Letra en foto: subida y visualización reales (gap del pedido original cerrado)

**Motivo de negocio:** el diseño original de Letras pedía "texto plano editable o imagen subida, con mock de upload con preview". El toggle Texto/Imagen ya existía en `LetrasPage`, pero el lado "Imagen" era 100% mock — un `<input type="file">` sin `onChange`, que no hacía nada. Este ticket lo cierra con el mismo patrón de audio: URL firmada, el binario nunca pasa por Nest.

**Investigación previa:** `CreateSongDto`/`UpdateSongDto` ya aceptaban `lyricsImageKey?: string` — cero cambio de backend, igual que había pasado con `audioKey`. `StorageService.getUploadUrl` ya soporta `folder: "letras"` (solo se usaba `"audios"` hasta ahora). El toggle Texto/Imagen ya resolvía de antemano la pregunta de "¿reemplaza o convive?": conviven, nunca se pensó como exclusión mutua.

**Decisiones tomadas:**
- **Coexistencia confirmada** (no una decisión nueva, ya estaba en el diseño): el `chordpro` nunca se borra al subir una foto. Único agregado: si la canción ya tiene `lyricsImageKey`, la vista arranca en la pestaña "Imagen" en vez de "Texto" — más útil que forzar siempre la misma pestaña por defecto.
- **Whitelist de imagen deliberadamente sin HEIC:** `image/jpeg`, `image/png`, `image/webp`. HEIC no se soporta a propósito, no por olvido — el `<img>` de visualización no lo puede decodificar en Chrome/Firefox/Edge de escritorio ni en Android (solo Safari/iOS lo hace nativo), y permitir subir un formato que la mitad del equipo no puede ver rompe el propósito completo de la feature.
- **Límite de 8MB** (vs. los 20MB de audio) — una foto de una sola hoja de letra comprime normalmente a 2-6MB en JPEG aunque sea de alta resolución; 8MB da margen sin permitir capturas RAW gigantes por error. Mismo criterio que el de audio: puramente client-side, no hace cumplir nada un `PutObjectCommand` firmado así.
- **Helper de validación separado** (`image-validation.ts`), no generalizado con el de audio (`audio-validation.ts`) — las reglas (tipos, tamaño, mensajes) son realmente distintas entre los dos casos; generalizar hubiera ahorrado poco código a costa de una indirección genérica.
- **Ubicación de la UI: inline en la vista de detalle de `LetrasPage` que ya existía**, no un modal nuevo (a diferencia de multitracks, donde no existía ninguna UI). Se conectó el `input[type=file]` mockeado al flujo real.
- **Exportar a PDF una letra en foto: fuera de alcance, con el botón deshabilitado y explicado, no arreglado a medias.** Embeber la imagen en el PDF (`jsPDF.addImage`) requiere convertirla a data URL vía `<canvas>`, y el bucket de MinIO nunca tuvo configurada una política CORS para permitir ese uso (todo el consumo de URLs firmadas hasta ahora fue directo en `<audio>`/`<img>`, que no tienen esa restricción) — intentarlo ahora podría fallar en el momento de exportar con un error de "tainted canvas" no probado. Se prefirió dejarlo explícitamente para un ticket aparte que primero confirme/configure CORS en MinIO, en vez de arriesgar una feature a medias.

**Detalle técnico:**
- `types/song.ts`: `lyricsImage?: string` → `lyricsImageKey: string | null` — mismo criterio de honestidad que ya se aplicó a `audioKey` (era una key, no una URL, y el opcional escondía el `null` real del backend).
- Nuevo `src/features/canciones/lib/image-validation.ts` (`validateImageFile`, whitelist, `MAX_IMAGE_BYTES`).
- `songs.service.ts`: `CreateSongInput`/`UpdateSongInput` ganan `lyricsImageKey?: string`; `mapSong` mapea el campo directo (ya no lo omite condicionalmente).
- `LetrasPage.tsx`: la vista de detalle se separó en `SongLyricsDetail` (mismo archivo) para poder manejar su propio estado de subida/progreso sin ensuciar el componente de listado. Reusa `StorageClient` tal cual (URL firmada + progreso real por XHR) y `SongsService.updateSong`.

**Hallazgo de paso, no arreglado — pre-existente, no introducido por este ticket:** al verificar, la consola tira un warning de hidratación (`<button> cannot contain a nested <button>`) en el listado de Letras — el card de cada canción es un `<button>` que envuelve a `<FavButton/>`, que también renderiza un `<button>`. Confirmé que esta estructura ya estaba así en el código original, sin tocar; no es parte de este ticket arreglarlo, pero queda anotado por si se decide encarar un ticket de accesibilidad/HTML semántico más adelante (es HTML inválido, aunque hoy no rompe nada visible).

**Verificado con navegador real** (Playwright, con capturas): canción sin `lyricsImageKey` sigue mostrando su texto normal en la pestaña "Texto", y la pestaña "Imagen" muestra el placeholder de "sin foto todavía" en vez de romperse. Archivo no-imagen (`.wav`) rechazado con el mensaje claro, antes de tocar MinIO. Imagen real (PNG de prueba) subida con barra de progreso, persistida como `lyricsImageKey`, y confirmada cargando de verdad desde una URL firmada real (`img.complete === true`, dimensiones reales del archivo, no un `<img>` roto). Tras recargar la página, la vista de detalle abrió directo en la pestaña "Imagen" (por tener `lyricsImageKey`) y la foto siguió ahí. Se revirtió `lyricsImageKey` a `null` al terminar — las 21 canciones reales quedaron exactamente como estaban.

**Alcance respetado:** no se tocó el flujo de audio ni multitracks. No se tocó Setlists, Equipo, Roles y Permisos, Anotaciones, Favoritos, login. Sin OCR.

**Cierre:** con esto se cierra el último gap explícito del pedido original de Letras ("mock de upload con preview" → subida y visualización reales).

---

## 2026-09-24 — Fix chico: "Rol en el ministerio" como desplegable en Agregar miembro

**Motivo:** pedido directo de Pablo sobre el modal "Agregar miembro" (Equipo) — el campo "Rol en el ministerio" era texto libre; pidió que fuera un desplegable con los valores que ya existen en el equipo, no texto libre.

**Implementación:** `AddMemberModal.tsx` arma las opciones a partir de `useApp().users` (ya cargado, sin fetch nuevo) — no es un catálogo fijo en código, son los `ministryRole` que ya tienen los integrantes reales. Se filtran los dados de baja (mismo criterio que ya usa el filtro de instrumentos de `EquipoPage`) porque, al probarlo, aparecía `"Voluntario"` en la lista — arrastrado de dos cuentas de prueba (`test.verificacion@…`, `verificacion.alta2@…`) dadas de baja en el ticket de Equipo y nunca borradas físicamente (softRemove, como corresponde). No era un dato inventado ni un bug de cálculo, pero no tenía sentido ofrecerlo como opción para un alta nueva.

**Verificado con navegador real:** el desplegable muestra los 7 roles de ministerio reales de los integrantes activos (`Bajista`, `Baterista`, `Director de Ministerio`, `Guitarrista`, `Líder de alabanza`, `Sonido`, `Vocalista`), sin `"Voluntario"` de las cuentas de baja.

**Deuda anotada, no resuelta:** `EditMemberModal.tsx` (editar un integrante existente) tiene el mismo campo como texto libre — no se tocó porque no fue parte de este pedido puntual.

---

## 2026-09-24 — "Mi perfil": foto real, edición propia y cambio de contraseña (feature nueva)

**Motivo de negocio:** el ícono de perfil en el Sidebar no hacía nada (era un `<div>` estático). Se pidió una pantalla nueva donde **cualquier** usuario logueado —sin ningún permiso de admin— pueda subir su propia foto real, editar sus propios datos (nombre, ministryRole, instrumentos) y cambiar su propia contraseña. Distinto del ABM de Equipo (admin editando a cualquiera): acá nunca hay un `:id` de por medio, todo opera sobre el usuario autenticado.

**Investigación previa:** `User` no tenía ningún campo de foto real — se agregó `avatarKey` (nullable, migración `AddUserAvatarKey`) con el mismo criterio que `audioKey`/`lyricsImageKey`. No existía ningún endpoint de "mi perfil": `UsersService.update()` (el que usa el ABM de admin) está gateado por `equipo:update`, así que un Músico sin ese permiso no podía usarlo para editarse a sí mismo — hacían falta endpoints nuevos y separados.

**Backend nuevo, sin ningún permiso especial (solo autenticación):**
- `PATCH /auth/me` → `{name?, ministryRole?, instruments?, avatarKey?}`. El DTO (`UpdateMyProfileDto`) **ni siquiera tiene** campos `email`/`roles` — no es que se rechacen, directamente no existen como posibles. Nunca toma un `:id`, siempre opera sobre `@CurrentUser().id`, así que estructuralmente no hay forma de editar a otro usuario con este endpoint.
- `PATCH /auth/me/password` → `{currentPassword, newPassword}`. Verifica `currentPassword` con el mismo `bcrypt.compare` que ya usa `login()` (no se inventó un mecanismo nuevo). Mínimo de `newPassword`: 6 caracteres — se reusó el `@MinLength(6)` que ya regía el alta de usuarios en Equipo, no es una regla nueva.
- Se agregó `"avatares"` como tercera carpeta válida en `StorageService.getUploadUrl` (antes solo `"audios"`/`"letras"`) con su propia whitelist (`image/jpeg`, `image/png`, `image/webp`) — evita mezclar fotos de perfil con fotos de letra bajo el mismo prefijo de S3.

**Inconsistencia de JWT tras cambiar contraseña — señalada, no resuelta técnicamente, con mitigación barata:** el JWT viejo sigue siendo válido hasta las 8hs sin importar que la contraseña haya cambiado (no hay refresh ni invalidación de tokens — misma limitación ya documentada desde el ticket de login). No se agregó ninguna infraestructura nueva para esto. Mitigación: tras un cambio exitoso, la UI muestra *"Por seguridad, te recomendamos cerrar sesión y volver a entrar — tu sesión actual sigue activa con la contraseña anterior hasta que expire sola"* con un botón "Cerrar sesión ahora" — no forzado automáticamente.

**Scope agregado de paso, no un detalle menor — componente `Avatar` compartido:** ningún componente de la app renderizaba una foto real hasta ahora; los 6 sitios que muestran un avatar (`Sidebar`, `EquipoPage` ×2 —card y detalle—, `Annotations`, `SetlistDetail`, `SetlistCard`) pintaban `avatarColor`+`initials` inline, cada uno por su cuenta. Esto **no fue pedido explícitamente así** — fue una decisión de implementación para no duplicar 6 veces la lógica de "resolver `getDownloadUrl` o caer al círculo de color+iniciales". Se creó `Avatar` en `components/common/ui-bits.tsx` (mismo lugar que `RoleBadge`/`Cover`) y se reemplazaron los 6 sitios.
- **Cache en memoria por `avatarKey`, sin necesidad de invalidación manual:** cada subida de foto genera un `avatarKey` nuevo (`randomUUID()` en el backend, igual que `audioKey`/`lyricsImageKey`) — nunca se reusa el mismo key sobreescribiendo el archivo. Confirmado explícitamente antes de implementar la cache: como la key cambia con cada subida, una entrada vieja del `Map` simplemente queda sin referenciarse, nunca desactualizada — no hizo falta ningún mecanismo de invalidación.

**Bug real encontrado y arreglado en el camino — stacking context roto:** el modal `MiPerfilModal`, al principio, se armó anidado dentro de `SidebarContent` (dentro del `<aside className="fixed ...">`). Un elemento `position:fixed` crea su propio stacking context — el modal (también `fixed inset-0 z-50`) quedaba atrapado adentro del stacking context del `<aside>`, así que su `z-50` nunca se comparaba contra el contenido de `<main>` (que pinta después, al mismo nivel que el `<aside>`, y lo tapaba). Se solucionó subiendo el estado del modal a `AppLayout.tsx` y renderizándolo como hermano de `<MiniPlayer/>`, fuera de cualquier ancestro `fixed` — mismo nivel del árbol que ya usa `MiniPlayer` para poder ser `fixed` de verdad contra el viewport.

**Detalle técnico:**
- `types/user.ts`/`auth-store.ts`: `avatarKey: string | null` agregado a `User`/`AuthenticatedUser`.
- `authStore.refresh()` nuevo: re-pega a `/auth/me` siempre (a diferencia de `ensureRestored()`, que solo lo hace una vez) — se llama después de guardar el perfil para que `Sidebar` refleje el cambio sin relogear. Como `useApp().currentUser` prioriza la lista de Equipo (`users`) sobre el snapshot de `authStore`, también se llama `reloadUsers()` en el mismo momento — los dos refrescos hacen falta para que el cambio se vea en todos lados.
- Nuevo `src/features/perfil/services/perfil.service.ts` (`updateMyProfile`, `changeMyPassword`) y `src/features/perfil/components/MiPerfilModal.tsx`.

**Verificado con navegador real** (Playwright, con capturas), logueado como Joaquín (Músico, sin ningún permiso de admin): subida de foto real + edición de nombre, persistidos y reflejados en el Sidebar sin relogear. Campo email deshabilitado con nota explicativa, sin ningún campo de rol del sistema — confirmado que no puede tocar ninguno de los dos desde acá. Cambio de contraseña con la actual incorrecta rechazado con mensaje claro (400); con la correcta, funcionó. Cerré sesión y confirmé que la contraseña vieja ya no sirve (401) y la nueva sí. Confirmé la foto real reflejada en `Sidebar` y en la card de Equipo (no solo en el modal) vía `img.complete`/`naturalWidth` reales, no un `<img>` roto. Se revirtió todo el estado de prueba de Joaquín al final (nombre, instrumentos, `avatarKey` a `NULL` real, contraseña al hash original) — el endpoint de perfil propio no tiene forma de "borrar" una foto ya puesta (solo reemplazarla), mismo patrón ya existente para `audioKey`/`lyricsImageKey`, así que la limpieza de `avatarKey` se hizo por SQL directo.

**Alcance respetado:** no se tocó el ABM de Equipo (edición por admin, baja de usuarios), Setlists, Canciones, Roles y Permisos, Anotaciones, Favoritos, ni la lógica de login/AuthGate.

**Sin verificar:** el caso de sesión con JWT viejo tras cambiar contraseña en una segunda pestaña/dispositivo (documentado como deuda, no ejercitado). Concurrencia de dos guardados de perfil simultáneos del mismo usuario.

---

## 2026-09-24 — Diagnóstico de Estadísticas + guard de loading (frontend)

**Motivo:** verificar si el módulo de Estadísticas (`EstadisticasPage`) seguía funcionando correctamente desde que `Song`/`playStats` pasaron a ser reales, o si había quedado algún bug silencioso de shape/formato heredado del mock.

**Diagnóstico (investigación, no se tocó nada hasta confirmar):** la página ya leía `useApp().songs` real, sin ningún resto de mock. Se verificaron los 5 puntos pedidos inyectando `SongPlayStat` de prueba con meses/cantidades conocidos a propósito (la tabla real está hoy en **0 filas** — no "pocos datos", cero — así que no había forma de confirmar los cálculos solo mirando el gráfico vacío):
- **Más tocadas por mes**, **comparativa anual**, **distribución por tema** y **ranking histórico**: los cuatro dieron exactamente el resultado esperado, tanto replicando la lógica de forma aislada contra la respuesta real de `GET /canciones` como en el navegador real. `Song.tags` ya llega como `string[]` plano (no había desajuste de shape con `{id,valor}[]`) y el formato de `month` del backend (`"2026-09"`, vía `currentMonthKey()`) coincide exactamente con el que ya esperaba el frontend.
- La comparativa anual se va a ver vacía en producción hasta que exista más de un año de historial real — eso es falta de datos, no un cálculo roto (aclarado explícitamente para no confundir un caso con el otro).
- **Guard de carga:** mismo patrón que ya se había encontrado y corregido en `InicioPage`/`AcordesPage`/`SetlistsPage` (asumir `songs` no vacío por costumbre del mock), pero acá **no crasheaba** — ningún `useMemo` de esta página asume un elemento existente (no hay `songs[0]!`), así que con `songs=[]` durante el fetch los gráficos de Recharts simplemente se renderizaban vacíos un instante, sin romper nada. Se agregó igual el mismo guard por consistencia con el resto de los módulos ya parchados, no porque hiciera falta para evitar un crash.

**Fix aplicado (una línea, mismo patrón que `SetlistsPage`, con la salvedad de dónde va):** se agregó `songsLoadState` a la desestructuración y un `if (songsLoadState !== "ready") return <Skeletons rows={5} />` — pero el guard se puso **después** de todos los `useMemo` de la página, no antes (a diferencia de `SetlistsPage`, que no tiene hooks después de su guard). Esto es a propósito: `EstadisticasPage` sí tiene varios `useMemo` que dependen de `songs`, y ponerlos condicionalmente detrás de un `return` temprano violaría la regla de hooks — mismo criterio ya aplicado en `AcordesPage` cuando apareció este mismo problema.

**Verificado:** los cinco cálculos siguieron dando los mismos resultados correctos después de agregar el guard (se re-corrió la verificación con navegador real). Se limpiaron los `SongPlayStat` de prueba al terminar — la tabla volvió a 0 filas.

**Alcance respetado:** no se tocó ningún otro módulo.

---

## 2026-09-24 — Fix: `POST /canciones` no devolvía `playStats` (backend)

**Motivo:** deuda anotada en el ticket de audio real — `POST /canciones` no incluía `playStats` en la respuesta, a diferencia de `GET /canciones`/`GET /canciones/:id`, que sí la cargan. El frontend lo toleraba con `raw.playStats ?? []` en `mapSong`, pero eso era un parche, no una solución — el objetivo acá era que el shape de respuesta fuera consistente entre crear y leer.

**Causa real confirmada (no asumida):** en `SongsService.create()`, el objeto `Song` se arma con `songRepo.create({...})` sin tocar nunca `playStats`, y se devuelve directo el resultado de `save()`. `save()` de TypeORM devuelve el mismo objeto que se le pasó (con los campos generados) — **no autopuebla relaciones que nunca se asignaron**. Como `playStats` nunca se tocó, simplemente no existe en el objeto devuelto ni, por lo tanto, en el JSON de respuesta.

**`PATCH /canciones/:id` no tenía este bug** — confirmado leyendo el código, no asumido: `update()` arranca con `this.findById(id)`, que ya carga `relations: { tags: true, playStats: true }` antes de mutar nada, así que el objeto que termina guardándose y devolviéndose ya trae `playStats` cargado de entrada. Solo hacía falta arreglar `create()`.

**Fix:** después del `save()`, `create()` recarga la entidad vía `this.findById(saved.id)` — el mismo método que ya usa `update()` y que expone `GET /canciones/:id` — en vez de devolver el objeto crudo de `save()`. Esto no parchea solo `playStats`: garantiza que la respuesta de `POST` tenga el mismo shape que `GET` para cualquier relación de `Song`, presente o futura (si mañana se agrega otra relación, no va a volver a divergir). Costo: un `findOne` por PK extra, trivial.

**Alcance respetado:** no se tocó el `?? []` defensivo de `mapSong` en el frontend — sigue siendo una buena defensa aunque el backend ya esté arreglado (tolerar un array vacío nunca está de más). No se tocó Multitracks, Setlists, Equipo, Roles y Permisos, Anotaciones, Favoritos, login.

**Verificado contra la base real:** `POST /canciones` de prueba devolvió `playStats: []` en la respuesta (antes, el campo directamente no existía). `PATCH /canciones/:id` sobre la misma canción siguió devolviendo `playStats: []` sin ningún cambio de comportamiento. Alta real desde la UI ("Escuchar y Subir") sin ningún error de consola — `useApp`/`mapSong` siguen funcionando igual (el `?? []` ahora es un defensivo que nunca hace falta, no uno que tapaba un bug). Se borró la canción de prueba al terminar.

**Deuda resuelta, no solo parchada:** esta era la última pieza pendiente de la lista de gaps del ticket de audio real — el shape de `POST`/`GET`/`PATCH /canciones` es consistente de punta a punta.

---

## 2026-09-24 — UI de multitracks (`AudioTrack`): feature nueva de cero (frontend)

**Motivo de negocio:** `AudioTrack` (pistas adicionales de una canción — click y guía, sin click, solo de un instrumento, etc.) tenía el backend construido de un ticket anterior (`POST/GET /canciones/:songId/pistas`, `PATCH/DELETE /pistas/:id`) pero **nunca existió ninguna UI, ni siquiera mockeada**. Es una feature nueva de cero, no un mock→real.

**Investigación previa:** confirmé el shape real (`{id, label, audioKey, order}`, sin relaciones anidadas en la respuesta) y que los permisos ya habían quedado resueltos con el mismo criterio que después usé en Setlists, sin que hiciera falta re-decidir nada: `POST` → `cancion:write`, `PATCH`/`DELETE` → `cancion:update`/`cancion:delete`, `GET` → `cancion:read`. Se reutilizó `src/lib/storage-client.ts` (subida vía URL firmada + progreso real por XHR) tal cual, sin tocarlo.

**Decisiones tomadas, dos tenían que confirmarse con Pablo antes de construir algo no pedido:**
- **Ubicación de la UI:** modal aparte ("Pistas adicionales"), abierto con un ícono nuevo por fila en "Escuchar y Subir" — no un acordeón inline (la tabla ya está apretada, sobre todo en mobile) ni una sub-sección del `UploadModal` existente (que es sobre metadata de la canción, no sobre este sub-recurso).
- **Reproducción simultánea con el audio principal — pregunta de producto, confirmada explícitamente por Pablo, no asumida:** reproducir una pista pausa el audio principal si estaba sonando (un solo audio a la vez en la app). Implementado sin agregar ninguna API nueva a `useApp`: si `isPlaying` es `true` al arrancar una pista, se llama `toggle()` una vez. **Gap menor conocido, no resuelto:** si el modal de pistas está abierto con una pista sonando y el usuario le pega al play del `MiniPlayer` (que sigue visible, pegado abajo, para la canción ya cargada), ambos audios sonarían a la vez — coordinar la dirección inversa es bastante más trabajo por un caso muy marginal (el modal tapa el listado; solo se dispara tocando específicamente el `MiniPlayer` con el modal todavía abierto).
- **Orden:** no se construyó reorder (no fue pedido). Las pistas se muestran en el orden que ya devuelve el backend (`ORDER BY order ASC`). Único default decidido: al subir una pista nueva se manda `order: pistasActuales.length` en vez de dejar que caiga en el default `0` del backend, que las dejaría todas empatadas.

**Combinación de permisos no verificada, mismo criterio que en Setlists — anotada, no descartada:** `cancion:delete` **nunca se había ejercido en el frontend antes de este ticket** (confirmé por grep: cero usos). Igual que con `setlist:write`/`setlist:update`, confirmé contra el seed real: los 4 roles demo llevan `cancion:write`/`cancion:update`/`cancion:delete` siempre juntos (Admin, Líder y Sudo tienen las cuatro acciones de `cancion`; Músico solo `read`) — ninguno los tiene desacoplados hoy. Si alguien crea desde Roles y Permisos un rol con `cancion:write` pero sin `cancion:delete` (o viceversa), ese escenario no fue probado con un usuario real.

**Detalle técnico:**
- Nuevo `src/features/canciones/lib/audio-validation.ts`: extrae la whitelist de tipos de audio y el límite de 20MB, que hasta ahora vivían duplicados dentro de `UploadModal` — se iban a triplicar con este ticket, así que se sacaron a un helper compartido (`validateAudioFile`) y `UploadModal` se actualizó para usarlo (sin cambiar su comportamiento).
- Nuevos `src/features/canciones/types/audio-track.ts` y `src/features/canciones/services/audio-tracks.service.ts` (`listBySong`, `create`, `remove`).
- Nuevo `src/features/musica/escuchar/components/AudioTracksModal.tsx`: lista + reproducción (un `<audio>` local al modal, no el `audioRef` global de `useApp`) + alta con barra de progreso + borrado, gateado por `can("editSongs")` (alta) y la nueva `can("removeAudioTrack")` (borrado) — un usuario sin esos permisos ve la lista y puede reproducir, sin ver el form ni el ícono de borrar.
- `EscucharPage.tsx`: ícono `Layers` nuevo por fila, visible para cualquiera que vea el listado (no gateado — ver la lista de pistas no requiere más que `cancion:read`, que ya hace falta para llegar a esta pantalla).
- `core/auth/auth-store.ts`: nueva `AppAction` `removeAudioTrack` → `cancion:delete`.

**Verificado con navegador real** (Playwright, con capturas): subidas 2 pistas con nombres distintos a "Océanos" ("Click y guía", "Solo bajo"), ambas aparecieron listadas. Reproducción confirmada de punta a punta (`readyState:4`, `currentTime` avanzando, sin error). Borrado de "Solo bajo": desapareció de inmediato y, tras un refresh real de la página (no solo estado de cliente), siguió sin aparecer — "Click y guía" sí persistió. Logueado como Joaquín (Músico, sin `cancion:write`/`cancion:delete`): ve la pista restante y puede reproducirla, pero no ve el form de alta ni el botón de borrar. Se borró la pista de prueba restante al terminar — "Océanos" quedó sin ninguna pista adicional, igual que las otras 20 canciones reales.

**Alcance respetado:** no se tocó `Song.audioKey`, `UploadModal` (salvo la extracción del helper de validación) ni `MiniPlayer` del flujo principal — la única interacción nueva con ese flujo es la llamada a `toggle()` para pausarlo. No se tocó Setlists, Equipo, Roles y Permisos, Anotaciones, Favoritos, login. No se arregló el bug de `playStats` en `POST /canciones`.

**Sin verificar:** el escenario de permisos desacoplados de arriba. El gap menor de reproducción simultánea en la dirección MiniPlayer→pista. Concurrencia de dos personas subiendo/borrando pistas de la misma canción a la vez.

---

## 2026-09-24 — Audio real: subida y reproducción (gap prioritario resuelto)

**Motivo de negocio:** desde el ticket de Canciones había quedado documentado como gap prioritario que "Escuchar y Subir" permitía dar de alta canciones pero no subir audio real — `StorageService.getDownloadUrl` estaba escrito pero no expuesto, y no había UI de carga de archivo. Este ticket lo cierra.

**Investigación previa:** `StorageService.getUploadUrl(folder, contentType)` ya existía (usado por `POST /storage/upload-url`), sin ninguna validación de tipo ni tamaño. `getDownloadUrl` existía pero sin controller. El DTO de canción ya aceptaba `audioKey?: string` — no hizo falta tocarlo.

**Flujo implementado (URL firmada, el binario nunca pasa por Nest):**
1. El cliente valida tipo (whitelist de audio) y tamaño (≤20MB) antes de pedir nada.
2. `POST /storage/upload-url` con `{folder:"audios", contentType}` — el backend valida `contentType` contra la misma whitelist **antes** de firmar nada (si no matchea, `400` con mensaje claro, nunca un error crudo de S3/MinIO).
3. El browser sube el binario directo a MinIO con esa URL, vía `XMLHttpRequest` (no `fetch`, que no expone progreso de subida) — barra de progreso real, no un spinner.
4. Recién con el `audioKey` confirmado, se manda el alta/edición de la canción (`POST`/`PATCH /canciones`).
5. Reproducción: `GET /storage/download-url?key=...` (nuevo endpoint, `getDownloadUrl` ya escrito) resuelto bajo demanda en `MiniPlayer` cuando cambia la canción actual — nunca precacheado al listar (las URLs firmadas expiran en 1h).

**Decisiones evaluadas explícitamente, no heredadas:**
- **`GET /storage/download-url` sin permiso especial, solo JWT** — confirmado antes de exponerlo así: los 4 roles del seed (incluido Músico) tienen `cancion:read`, `Song` no tiene owner ni flag de visibilidad, y `GET /canciones` no filtra por usuario. No existe ningún caso hoy donde alguien vea una canción en el listado pero no debería poder escucharla — quien puede verla, puede reproducirla. Duplicar `cancion:read` como gate acá sería redundante, no más seguro.
- **Límite de 20MB: solo client-side, y esto tiene una implicancia real, no una limitación abstracta.** Un `PutObjectCommand` firmado así no lleva restricción de tamaño — **cualquiera con las devtools puede editar el `File` antes de la subida o pegarle directo a la URL firmada con un archivo más grande, y el límite de 20MB no lo va a detener.** Hacerlo cumplir de verdad requeriría cambiar a un presigned POST con política `content-length-range`, cambio de arquitectura fuera de alcance para esta app interna de una iglesia. Se acepta el riesgo explícitamente: no hay un actor malicioso realista en este contexto, pero quede escrito que no es una barrera de seguridad.
- **Cierre del modal a mitad de subida cancela, no sigue en segundo plano** — no hay infraestructura de tareas en background en la app, y el `audioKey` recién se manda al backend después de que la subida terminó con éxito, así que cancelar nunca deja una canción con un audio a medio subir. `AbortController` en un `useEffect` de desmontaje cubre también el caso de navegar a otra pantalla sin pasar por el botón de cerrar.
- **Un solo `UploadModal` con `song?: Song` opcional, no dos componentes separados** (a diferencia de Equipo, donde alta y edición sí tenían flujos realmente distintos — contraseña generada vs. no). Acá es el mismo formulario completo en ambos casos, solo cambia el submit (`POST` vs `PATCH`) y la precarga.

**Feature nueva agregada de paso, documentada como tal:** `EscucharPage` no tenía ningún botón de editar una canción existente — se agregó un ícono de lápiz por fila (gateado por `can("editSongs")`) porque la tarea pedía explícitamente poder subir audio "al dar de alta **o editar**", y no había ningún punto de entrada para lo segundo.

**Bugs de infraestructura/backend descubiertos de paso (no introducidos por este ticket, bloqueaban su verificación):**
1. **El bucket de MinIO nunca fue creado** — ni `docker-compose.yml` ni ningún script lo hacían. Nadie lo había notado porque hasta este ticket nadie había intentado subir un archivo real (todas las canciones tenían `audioKey: null`). `getUploadUrl()` firmaba una URL perfectamente válida contra un bucket inexistente, y el `PUT` real a MinIO devolvía 404. Se arregló agregando un chequeo idempotente en `StorageService.onModuleInit()` (`HeadBucketCommand`, y si no existe, `CreateBucketCommand`) — así cualquier entorno nuevo (clonar + `docker compose up`) funciona sin un paso manual extra, sin agregar un contenedor `mc` aparte. No es fatal si falla al bootear (solo loggea un warning).
2. **La respuesta de `POST /canciones` (alta) no incluye `playStats`** — a diferencia de `GET /canciones`, que sí la carga. Al probar el alta real por primera vez con el flujo completo (audio + form), el frontend crasheaba en `mapSong` al hacer `.map()` sobre `undefined`. Es un bug real del `create()` del backend de Canciones (`songRepo.save()` no recarga esa relación), pero **Canciones estaba fuera de alcance en este ticket** — se corrigió únicamente en el mapeo del frontend (`raw.playStats ?? []`), sin tocar el backend de Canciones. Queda pendiente para quien toque ese módulo de nuevo.

**Detalle técnico:**
- `types/song.ts`: `audioUrl: string` → `audioKey: string | null` (ya no se inventa una URL vacía; se guarda la key cruda, honesto con lo que realmente es).
- Nuevo `src/lib/storage-client.ts` (`getUploadUrl`, `getDownloadUrl`, `uploadFileWithProgress` con XHR) — vive en `lib/` por ser infraestructura transversal, no una entidad de dominio.
- `songs.service.ts`: `mapSong` ya no fabrica `audioUrl`; nuevo `SongsService.updateSong(id, dto)`.
- `useApp.tsx`: nuevo `updateSong(song)` (reemplazo local, mismo patrón que `addSong`).
- `UploadModal.tsx`: prop `song?: Song`, campo de audio real con validación de tipo/tamaño, barra de progreso, cancelación por `AbortController`.
- `EscucharPage.tsx`: botón "Editar" por fila.
- `MiniPlayer.tsx`: resuelve `getDownloadUrl` bajo demanda por canción; sin audio (`audioKey: null`) sigue sin sonar, silenciosamente, igual que antes de este ticket.

**Verificado con navegador real** (Playwright, con capturas): archivo no-audio (`.png` renombrado) rechazado con el mensaje claro **antes** de pegarle a MinIO. Archivo `.wav` real (2 segundos, generado localmente) subido con barra de progreso, canción creada con `audioKey` real persistido. Reproducción confirmada de punta a punta: `audio.readyState === 4` (`HAVE_ENOUGH_DATA`), `currentTime` avanzando hasta el final del clip sin ningún error — no un `<audio>` con `src` vacío. Repetí el mismo flujo editando una canción **existente** ("Bendito El Que Viene"): mostró "Todavía sin audio cargado", se le subió el `.wav`, quedó "Ya tiene audio cargado", y se reprodujo igual de bien. Confirmé que canciones con `audioKey: null` siguen sin sonar, sin ningún error visible (mismo comportamiento tolerante de antes). Al terminar, se revirtió `audioKey` de "Bendito El Que Viene" a `null` y se borraron todas las canciones de prueba creadas durante la verificación — las 21 canciones reales quedaron exactamente como estaban, todas con `audioKey: null`.

**Alcance respetado:** no se tocó multitracks, Setlists, Equipo, Roles y Permisos, Anotaciones, Favoritos ni login.

**Sin verificar:** comportamiento en una red realmente lenta/inestable (el ambiente de prueba es local, la barra de progreso se probó pero no bajo condiciones de red adversas). Múltiples subidas concurrentes desde dos sesiones distintas.

---

## 2026-09-24 — Fix: `DELETE /setlists/:id` respondía 500 (backend)

**Motivo:** bug real encontrado en el ticket anterior al limpiar datos de prueba — `DELETE /setlists/:id` devolvía 500 para cualquier setlist con items (todos, porque `items` no puede estar vacío al crear).

**Causa confirmada (no asumida por el resumen del ticket anterior):** `SetlistsService.remove()` llama `this.setlistRepo.softRemove(setlist)` con `setlist.items` ya cargado. `Setlist.items` estaba declarado `@OneToMany(..., { cascade: true })`, y `cascade: true` en TypeORM habilita los cinco tipos de cascada, incluido `"soft-remove"`. Al hacer `softRemove()` del padre, TypeORM intenta cascadear el soft-remove a cada `SetlistItem`, que no extiende `BaseAuditEntity` (no tiene `fecha_hora_baja`) — de ahí el 500 exacto (`Entity "SetlistItem" does not have delete date columns`).

**Decisión evaluada — dos caminos, elegido el de borrado físico de items:**
1. `SetlistItem` pasa a extender `BaseAuditEntity` (requiere migración).
2. **(Elegido)** La baja de un `Setlist` borra físicamente sus items (`remove()`/`delete()`, no soft-delete) y deja el `Setlist` en sí con baja lógica.

Comparé contra el resto del modelo antes de elegir: `Song` (con `BaseAuditEntity`, usa `softRemove()`) tiene `AudioTrack`/`SongPlayStat` como `@OneToMany` **sin cascade** — sus hijos quedan huérfanos-pero-intactos al borrar la canción. `AudioTracksService`, `RolesService` y `FavoritesService` usan `remove()` (borrado físico) porque sus entidades no tienen valor histórico propio ni extienden `BaseAuditEntity`. Confirmé por grep que **nada en el backend ni en el frontend consulta `SetlistItem` fuera de a través de su `Setlist` padre** — no hay reporte ni estadística que dependa de un item de setlist sobreviviendo a la baja de su setlist (`SongPlayStat`, que sí importa para Estadísticas, cuelga de `Song`, rama del modelo completamente distinta, sin relación con `Setlist`/`SetlistItem`). Agregar `BaseAuditEntity` a una entidad que nunca se consulta por sí sola ni se muestra en ningún lado como "dada de baja" es complejidad y migración sin ningún consumidor real — se eligió el borrado físico.

**Implementación (sin migración, sin cambio de schema):**
- `Setlist.items`: `cascade: true` → `cascade: ["insert", "update"]`. Esto es lo que arregla la causa raíz: sin este cambio, aunque se borren los items a mano antes, TypeORM seguiría intentando cascadear soft-remove sobre lo que quede en `setlist.items` en memoria. `create()`/`update()` no se vieron afectados porque ambos dependen únicamente de la cascada de `"insert"` (items siempre son instancias nuevas al guardar), nunca de `"remove"`/`"soft-remove"`.
- `SetlistsService.remove()`: agrega `await this.setlistItemRepo.delete({ setlist: { id } })` antes del `softRemove(setlist)` — mismo idioma que ya usaba `update()` para reemplazar items, no algo nuevo.

**Por qué `team` (M:N con `setlist_team_members`) nunca corrió el mismo riesgo — verificado, no asumido:** `Setlist.team` es un `@ManyToMany(() => User)` **sin ninguna opción de `cascade`** (default `false` en TypeORM cuando no se especifica). Un `ManyToMany` con cascade habilitado cascadearía hacia la entidad relacionada (`User`), no hacia la tabla de join — es decir, si `team` tuviera `cascade: true`, `softRemove(setlist)` intentaría soft-borrar a los `User` del equipo (que sí extienden `BaseAuditEntity`, así que ni siquiera explotaría de la misma forma, pero sería gravísimo: daría de baja usuarios reales solo por haber estado en el equipo de un setlist borrado). Como no hay cascade configurado, TypeORM no intenta ninguna operación sobre `User` ni sobre la tabla de join al hacer `softRemove()` del setlist — simplemente no toca nada de esa relación. Lo confirmé de forma empírica, no solo leyendo el código: creé un setlist de prueba con dos usuarios en el equipo, lo borré con el endpoint ya arreglado, y en la base real: el setlist quedó con `fecha_hora_baja` seteada, sus `setlist_items` quedaron en 0 filas (borrado físico correcto), las 2 filas de `setlist_team_members` **siguieron existiendo** (huérfanas, no se tocaron), y los 2 `User` referenciados siguieron con `fecha_hora_baja` en `null` — completamente intactos.

**Observación menor (no bug), para dejar anotada:** las filas de `setlist_team_members` de un setlist dado de baja quedan huérfanas para siempre (no se limpian, igual que `song_tags` cuando se borra una canción). Es inofensivo hoy porque nada las consulta directamente. Si en el futuro alguien arma un conteo tipo "en cuántos setlists participó este usuario" sumando filas de `setlist_team_members` sin hacer join contra `setlists` y filtrar `fecha_hora_baja IS NULL`, el número va a incluir setlists ya borrados — dejar esto anotado para esa eventual estadística.

**Verificado contra la base real:** creé un setlist de prueba con equipo asignado y un item, confirmé el estado antes de borrar (setlist activo, 1 item, 2 filas de team), llamé `DELETE /setlists/:id` real → **200**, no 500. Confirmé después: `fecha_hora_baja` seteada en el setlist, 0 filas en `setlist_items`, 2 filas huérfanas en `setlist_team_members`, los 2 usuarios sin ningún cambio. Repetí `PATCH /setlists/:id` (reemplazo de items) sobre un segundo setlist de prueba para confirmar que la cascada de `"insert"` sigue funcionando sin regresión — devolvió 200 con el item actualizado. `GET /setlists` no lista ninguno de los dos setlists borrados; `GET /setlists/:id` de uno de ellos devuelve 404. No se tocó "Culto de prueba" (el setlist real preexistente); los dos setlists de prueba de esta verificación quedaron dados de baja lógica, que es exactamente el estado correcto en el que deben quedar (no hizo falta limpieza manual por SQL esta vez).

**Alcance respetado:** no se agregó botón de borrar en la UI (queda para un ticket aparte). No se tocó Canciones, Equipo, Roles y Permisos, Anotaciones, Favoritos, login, ni el resto de la lógica de Setlists ya conectada.

**Sin verificar:** el endpoint de borrado sigue sin tener ninguna UI que lo dispare — este ticket fue exclusivamente el backend.

---

## 2026-09-24 — Setlists conectado al backend real, tablas de alias eliminadas (frontend)

**Motivo de negocio:** Setlists era el último módulo mockeado. Pablo pidió conectarlo por completo — próximos + historial, detalle con items ordenados, alta/edición, drag & drop, equipo asignado, tonalidad por item — y **eliminar las dos tablas de alias temporales** (`MOCK_USER_ID_TO_EMAIL`, `MOCK_SONG_ID_TO_TITLE`) que se habían ido extendiendo en los tickets de Equipo y Canciones, ya que Setlists era lo único que todavía dependía de ellas.

**Investigación previa:** `POST /setlists` crea todo junto en una sola llamada (setlist + items + team anidados en el mismo body) — no hay que crear el setlist primero y agregar items después. El backend asigna `position` automáticamente como el índice del array de `items` que se manda; el cliente nunca envía `position`. No existe ningún endpoint de "solo reordenar" ni de "un item a la vez": el único camino para persistir un reorder es `PATCH /setlists/:id` con el array `items` completo (el service real borra todos los `SetlistItem` del setlist y los recrea con `position = índice`). También confirmé que el backend no garantiza el orden de `items` por `position` en la respuesta de lectura — se vio en datos reales (`position: 1` antes que `position: 0`), así que el frontend ordena siempre client-side después de cada fetch.

**Tablas de alias eliminadas por completo, no solo dejadas de usar:** se borraron `buildMockIdAlias`, `remapSetlists` y sus dos tablas fuente de `useApp.tsx`/`mocks/data.ts`. Con `setlists` ahora real, **`mocks/data.ts` quedó sin ningún export** — se borró el archivo entero (y la carpeta `mocks/`). No queda ningún mock en la aplicación.

**Reorder — comportamiento ante fallo, definido explícitamente:** cada cambio (mover un item, cambiar su tonalidad, sacar una canción) dispara de inmediato un `PATCH` real con el setlist completo — optimista en el cliente, pero persistiendo ya mismo, nunca diferido. Si el `PATCH` falla, `useApp.updateSetlist` revierte el array de setlists al estado previo a la operación y `SetlistDetail` muestra un banner de error inline ("No se pudo guardar el cambio — se revirtió al último estado guardado"). Nunca queda un cambio visualmente aplicado pero no persistido sin avisar — que era el requisito explícito de este ticket.

**Feature nueva agregada de paso, no un ajuste técnico — el multi-select de equipo en `NewSetlistModal`:** antes de este ticket, el modal de alta no tenía ningún selector de equipo: hardcodeaba `teamIds: [currentUser.id]` (el creador quedaba como único integrante, sin forma de agregar a nadie más desde la UI). Se agregó un multi-select real de integrantes activos porque, si no, no había manera de verificar "equipo asignado contra el backend real" — el pedido explícito de este ticket — con datos reales. No es una consecuencia automática de conectar el backend, es una pieza de UI que no existía y se construyó para que hubiera algo concreto que probar.

**Detalle técnico:**
- Nuevo `features/musica/setlists/services/setlists.service.ts`: `listAll()`, `createSetlist(input)`, `updateSetlist(id, input)`, con el mapeo real→frontend (`leader.id`→`leaderId`, `team[].id`→`teamIds`, `items[].song.id`→`songId`, ordenado por `position`) — `SetlistCard`, `SetlistDetail`, `NewSetlistModal` y `pdf.ts` no necesitaron tocarse más allá de lo listado abajo, porque siguen consumiendo el mismo `Setlist`/`SetlistItem` de siempre.
- `useApp.tsx`: `setlists` pasa a fetch real con `loading/ready/error` (mismo patrón que songs/users). `updateSetlist` ahora devuelve `Promise<void>` (antes era síncrono) para que `SetlistDetail` pueda esperar el resultado real y mostrar el error si corresponde.
- Nuevas `AppAction`: `editSetlist`→`setlist:update` (reemplaza a `createSetlist` como gate de edición/reorder en `SetlistDetail` — antes se reusaba el permiso de creación para editar, que era semánticamente incorrecto aunque funcionara igual en la práctica) y `deleteSetlist`→`setlist:delete` (sin uso todavía, no hay botón de borrar setlist en la UI).
- **Combinación no verificada, dejada explícita:** hoy `setlist:write` y `setlist:update` viajan siempre juntos en los tres roles del seed (Admin y Líder tienen los cuatro permisos de `setlist`, Músico ninguno salvo `read`) — nunca se probó qué pasa si alguien desacopla estos permisos desde Roles y Permisos (por ejemplo, un rol con `setlist:write` pero sin `setlist:update`, que podría crear setlists pero no editarlos, o viceversa). El código ya distingue ambos permisos correctamente a nivel de gate, pero ese escenario concreto no se ejercitó con un usuario real.
- Corregido de paso el mismo patrón de bug de loading que ya había aparecido en `InicioPage`/`AcordesPage`: `SetlistsPage` no crasheaba con `setlists` vacío (ya tenía `EmptyState`), pero mostraba "No hay servicios agendados" por un instante antes de que terminara el fetch real — un falso vacío, no un crash. Se agregó `setlistsLoadState` con skeleton, mismo criterio que el resto de los módulos ya conectados.

**Bug de backend descubierto de paso, no arreglado (fuera de alcance, sin UI que lo dispare):** `DELETE /setlists/:id` devuelve 500 (`Entity "SetlistItem" does not have delete date columns`) para cualquier setlist con items — que son todos, porque `items` no puede estar vacío al crear. `Setlist.items` tiene `cascade: true` y el service llama `softRemove()`, que intenta soft-borrar en cascada los `SetlistItem`, pero esa entidad no extiende `BaseAuditEntity` (no tiene `fechaHoraBaja`). Nunca se manifestó antes porque no hay ningún botón de borrar setlist en la UI — lo encontré al intentar limpiar datos de prueba por API al final de este ticket y tuve que borrar directo por SQL. Lo dejo documentado en vez de arreglarlo porque no estaba en el alcance de este ticket y no lo dispara ningún flujo real hoy.

**Verificado con navegador real** (Playwright, con capturas): creé un setlist nuevo con dos canciones reales, tonalidad de un item distinta a su tonalidad original (Océanos: G→F#), y equipo asignado (Sofía como líder + Joaquín agregado desde el multi-select nuevo). Reordené los items con drag & drop. Navegué de nuevo a `/setlists` (equivalente a un refresh real — `SetlistsPage` guarda la selección en estado de componente, no en la URL, así que un F5 literal siempre vuelve al listado; comportamiento preexistente, no introducido acá) y confirmé que el orden nuevo, la tonalidad F# y el equipo persistieron contra la base real. Confirmé que el único setlist real preexistente ("Culto de prueba", de un ticket anterior) sigue mostrando nombres correctos de canciones e integrantes — no tenía ningún ID mock suelto, así que no hubo nada que migrar ni ocultar. Limpié los dos setlists de prueba al final (por SQL directo, ver bug de arriba) para no dejar la demo con basura.

**Sin verificar:** el escenario de permisos desacoplados de arriba. El borrado de un setlist desde la UI (no hay botón, y el endpoint real está roto — ver bug). Concurrencia de dos personas reordenando el mismo setlist a la vez.

---

## 2026-09-24 — Canciones, Anotaciones y Favoritos conectados al backend real (frontend)

**Motivo de negocio:** los tres módulos que dependen únicamente de `Song` y `User` (ambos ya reales desde tickets anteriores) seguían mockeados. Pablo pidió conectarlos y eliminar sus mocks por completo, mismo criterio que Roles y Permisos y Equipo.

**Investigación previa:** confirmé contra el backend real que `GET /canciones` pagina (`{data,total,page,limit}`, no un array plano — hoy hay **21 canciones reales**, no 20: las 20 del seed + una de prueba de un ticket anterior de `AudioTrack`), que `tags` viene como `{id,valor}[]` y `playStats` como `{month,plays}[]` (no un mapa), y que `Favorite`/`Annotation` tienen shapes propios (`GET /favoritos` → `string[]` de songIds nomás, `GET /anotaciones?songId=` → objetos con `author` completo pero sin `song`). `AudioTrack` (multitracks) ya está construido en el backend de punta a punta, pero el frontend nunca tuvo ninguna UI para eso — no hay mock que reemplazar, sería una pantalla nueva de cero, así que queda fuera de este ticket.

**Gap funcional prioritario, no nota al pie:** después de este ticket, "Escuchar y Subir" permite dar de alta canciones reales (título, artista, tono, BPM, duración, letra ChordPro, temas) pero **no subir audio real todavía**. `StorageService.getDownloadUrl(key)` está escrito en el backend pero no está expuesto por ningún controller, y no existe ninguna UI de selección/carga de archivo (el campo de audio del modal de alta es un placeholder deshabilitado con una nota explícita). Esto es candidato directo para el próximo ticket: expone un endpoint sobre `getDownloadUrl`, agrega el flujo real de upload (ya existe `POST /storage/upload-url` con URL prefirmada de S3/MinIO, solo falta la UI que lo use) y resuelve `audioKey → URL reproducible` en el `MiniPlayer`. Hoy las 21 canciones reales tienen `audioKey: null`, así que tampoco había nada que reproducir para verificar este flujo aunque se resolviera acá.

**Detalle técnico:**
- Nuevos `features/canciones/services/{songs,annotations,favorites}.service.ts`, cada uno con su propio mapeo del shape real del backend al `Song`/`Annotation` que ya consumía toda la UI. Esto evitó tocar `EstadisticasPage`, `EscucharPage`, `LetrasPage`, `FavoritosPage`, `MiniPlayer`, `SetlistCard`/`SetlistDetail` — todos siguen leyendo el mismo shape de siempre (`tags: string[]`, `audioUrl`, `playsByMonth: Record<mes,plays>`), normalizado en un solo punto de entrada.
- `canEditAnnotation` resuelto de raíz (ya no compara `r.name === "Admin" || "Líder"`): ahora es `isOwner ? can("editOwnAnnotation") : can("editAnyAnnotation")`, dos `AppAction` nuevas mapeadas a `anotacion-propia:update`/`anotacion:update` — el mismo criterio que usa `AnnotationsService.assertCanEdit()` del lado backend. Busqué en todo el frontend: era la única comparación por nombre de rol que quedaba.
- El input de "Publicar" anotación ahora está gateado por `hasAnyPermission(["anotacion:write","anotacion-propia:write"])` (agregado a `authStore` para este caso puntual de OR entre dos permisos) — antes cualquiera veía el input sin chequeo y el 403 real del backend llegaba recién al enviar.
- `toggleFavorite` pasa de `localStorage` a `POST /favoritos/:songId/toggle` real (por-usuario en el server), con actualización optimista y rollback si la llamada falla.
- `UploadModal` (alta de canción) se extendió con los campos que pide el DTO real y que el mock nunca necesitó: BPM (con ayuda explicando qué es), duración en minutos+segundos (con ayuda explicando para qué se usa), y letra en ChordPro (con ayuda de la sintaxis) — sin estos tres campos el alta real no tenía con qué completar `CreateSongDto`.
- **Tabla de alias temporal extendida:** ahora cubre usuarios (de antes) *y* canciones (`MOCK_SONG_ID_TO_TITLE` en `mocks/data.ts`, matcheando por título — los 20 títulos del seed coinciden 1:1 en orden con los del mock). Sigue siendo un puente temporal para lo único que queda mockeado (`setlists`, que referencia IDs `s1..s20`/`u1..u8` fijos) y se elimina por completo el día que Setlists se conecte al backend real — no antes.
- Se descubrió y corrigió de paso un bug de orden de carga: varias páginas (`InicioPage`, `AcordesPage`) asumían `songs`/`setlists` no vacíos porque el mock siempre tenía datos disponibles sincrónicamente; con el fetch real hay una ventana donde están vacíos mientras cargan. Se agregaron guards de loading (con fallback a `Skeletons`) — en `AcordesPage` los hooks se mantienen incondicionales (regla de hooks) y el guard se aplica solo en el return final.

**Verificado con navegador real** (Playwright, con capturas): listado de "Escuchar y Subir" mostrando exactamente **21 canciones reales** (no 20 — confirmé el motivo). Favorito marcado, página refrescada, favorito seguía activo (confirmado contra `GET /favoritos` real). Anotación creada como Sofía (Líder), visible con botón de editar para ella; logueada como Joaquín (Músico), ve la misma anotación de Sofía con candado (no editable) y sí puede editar la suya propia. Acordes: transposición (+2 semitonos, G→A), zoom (17px→19px) y modo "En vivo" probados sobre una canción real, sin tocar `chords.ts`/`ChordSheet.tsx`. Se limpiaron al final los datos de prueba (favoritos de Martín, anotación de prueba de Sofía) para no dejar la demo distinta de como estaba.

**Sin verificar:** la reproducción real de audio (no hay ninguna canción con `audioKey` cargado hoy, ver gap arriba). Concurrencia de dos personas editando anotaciones de la misma canción a la vez.

---

## 2026-09-24 — Equipo y Roles: ABM real de usuarios (backend + frontend)

**Motivo de negocio:** el módulo "Equipo y Roles" seguía 100% mockeado (usuarios hardcodeados en `mocks/data.ts`). Pablo pidió convertirlo en un ABM real, con el mismo criterio de reemplazo total ya usado en login y en Roles y Permisos, resolviendo de paso el hueco funcional documentado en el ticket anterior (un rol nuevo no se le podía asignar a nadie desde el frontend).

**Investigación previa (antes de escribir código):** el backend real ya tenía **todo** el CRUD de `/equipo` (`GET`, `GET /:id`, `POST`, `PATCH`, `DELETE`) construido en una sesión anterior pero nunca conectado al frontend, incluyendo baja lógica real vía `BaseAuditEntity.fechaHoraBaja`/`softRemove()`. `POST/DELETE /equipo/:userId/roles/:roleId` (asignar/quitar rol) también ya existía. Este ticket fue, en su gran mayoría, conectar frontend a algo que ya estaba construido — el único cambio de backend fue agregar `?incluirBajas=true` a `GET /equipo` (usa `withDeleted` de TypeORM) para poder resolver nombres de gente dada de baja en setlists viejos. **Cero migraciones nuevas.**

**Decisiones de diseño:**
- **Contraseña inicial generada por el sistema** (`crypto.getRandomValues` en el cliente, 12 caracteres), nunca tipeada por el admin. Va en el mismo campo `password` que ya pedía `CreateUserDto` — cero cambio de backend. Se muestra una única vez en un modal post-alta con botón "Copiar" y aviso de que no se vuelve a mostrar; no se loguea ni se persiste en ningún lado del cliente.
- **Usuario dado de baja referenciado en un setlist/anotación vieja:** se sigue mostrando su nombre (no "Usuario eliminado" — no está eliminado, está de baja, mismo criterio semántico de `fechaHoraBaja`), con una etiqueta "Dado de baja" en `SetlistDetail.tsx` reemplazando su `ministryRole`. En el listado de Equipo, los dados de baja quedan ocultos detrás de un toggle "Mostrar dados de baja"; si se muestran, aparecen atenuados y sin acceso a edición.
- **Roles del sistema en el editor de perfil:** al ser ahora M:N, es un multi-select contra `GET /roles` que, al guardar, hace el diff contra los roles actuales del usuario y llama `POST`/`DELETE /equipo/:userId/roles/:roleId` por cada cambio (no hay endpoint bulk). Si el admin tiene `equipo:update` pero no `rol:write`/`rol:delete`, puede editar el perfil pero el bloque de roles queda deshabilitado.
- **Cambio de la propia contraseña por el usuario logueado:** fuera de alcance, queda para un ticket de pantalla de perfil/cuenta aparte.

**Problema encontrado y resuelto (no estaba en el pedido original, pero rompía la app si no se tocaba):** `setlists`/`annotations` siguen 100% mockeados con IDs fijos `"u1".."u8"` (`teamIds`, `leaderId`, `authorId`), que antes coincidían con los IDs del mock `members`. Al pasar `Equipo` a usuarios reales (UUIDs de Postgres), esos IDs dejaban de matchear y todo el equipo asignado de los setlists mockeados se rompía. Solución: `useApp.tsx` arma, al cargar los usuarios reales, una tabla de alias `id-mock → id-real` matcheando por email (`MOCK_USER_ID_TO_EMAIL` en `mocks/data.ts`, con los mismos 8 emails del seed) y traduce los IDs de `mockSetlists`/`mockAnnotations` al cargarlos en el estado. **Esto es un puente temporal, no una solución permanente**: debería eliminarse por completo el día que Setlists/Anotaciones se conecten al backend real (ahí esos módulos dejan de tener IDs propios y usan los IDs reales directamente desde su propia API, sin necesidad de ningún alias).

**Detalle técnico:**
- `types/user.ts`: `role: SystemRole` (enum fijo de 3 valores) → `roles: UserRole[]` + `fechaHoraAlta`/`fechaHoraBaja` (espejo exacto de la entidad real, no un DTO recortado — así se descubrió que el campo se llama `fechaHoraAlta`, no `joinedAt` como tenía el mock).
- `RoleBadge` (`ui-bits.tsx`) dejó de ser un mapa cerrado de 3 roles: ahora renderiza uno o más badges reales, color por hash del nombre sobre una paleta fija (para no tener que tocar el componente cada vez que se crea un rol nuevo desde Roles y Permisos), con estado "Sin rol" para 0 roles.
- Nuevo `features/equipo/services/equipo.service.ts` (mismo patrón que `roles.service.ts`): `listMembers(incluirBajas?)`, `createMember`, `updateMember`, `removeMember`, `assignRole`, `unassignRole`.
- `useApp.tsx`: `users` pasa de `useState(members)` a un fetch real (`EquipoService.listMembers(true)`, siempre con bajas incluidas para poder resolver referencias históricas) con estado `loading`/`ready`/`error` y `reloadUsers()`. Se sacó el bridge por email que existía para `currentUser` desde el ticket de login (ya no hace falta: `users` y `authUser` comparten el mismo id real).
- `canEditAnnotation` se adaptó al nuevo shape (`currentUser.roles.some(r => r.name === "Admin" || r.name === "Líder")` en vez de comparar `currentUser.role`). **Esto no resuelve la deuda ya documentada de esa función, la vuelve más frágil todavía**: compara por nombre de rol en vez de por el permiso real `anotacion:update`/`anotacion:delete`, así que si alguien renombra el rol "Admin" o "Líder" desde la pantalla de Roles y Permisos, este chequeo deja de matchear y falla silenciosamente (deja de dejar editar a quien debería poder). Anotaciones sigue siendo un módulo mockeado y la solución de fondo (migrar a permisos reales) sigue fuera de alcance.
- `Sidebar`: el badge del usuario logueado pasa a leer `currentUser.roles` real en vez del mock — esto resuelve el hueco documentado en los dos tickets anteriores (Ana ahora se ve como "Sudo" en el Sidebar, no "Músico").
- Nuevos `AppAction`: `editTeamMember` (`equipo:update`), `removeTeamMember` (`equipo:delete`), `assignRole`/`unassignRole` (`rol:write`/`rol:delete`).

**Verificado con navegador real** (Playwright, con capturas): alta de un usuario nuevo con contraseña generada visible una única vez en el modal, login exitoso con esa contraseña generada. Edición de rol de Diego Sosa (agregado "Líder" además de "Músico"), guardado, verificado en la tarjeta. Dado de baja a Diego Sosa: confirmado que ya no puede loguearse (`401 Credenciales inválidas`, TypeORM excluye soft-deleted del login por defecto) y que sigue apareciendo en el detalle del setlist "Culto Domingo — Cielos Abiertos" con la etiqueta "Dado de baja" en vez de su `ministryRole`. Badge de Ana Ferrari confirmado como "Sudo" tanto en el listado de Equipo como en el Sidebar. Joaquín (sin `rol:write`/`equipo:update`) confirmado sin botón "Editar" visible en el perfil de otro integrante. Se revirtieron a mano, al terminar, los efectos secundarios de la propia verificación (Diego restaurado a activo/Músico, cuentas de prueba dadas de baja) para no dejar la demo en un estado distinto al esperado.

**Sobre "próximo login" vs. inmediato:** cambiar los roles de un usuario ya logueado en otra sesión **no** le cambia los permisos hasta que vuelva a loguearse — el JWT embebe `permissions` al momento del login (`AuthService.login`) y no hay endpoint de refresh (deuda ya documentada desde el ticket de login). No se implementó ningún mecanismo nuevo para esto, se mantiene el comportamiento existente.

**Sin verificar:** actualización de perfil (nombre/ministryRole/instrumentos) sin tocar roles — se ejercitó el flujo de guardado pero no se verificó explícitamente con un refresh de página después. Concurrencia de dos admins editando los roles del mismo usuario a la vez (el diff de `assignRole`/`unassignRole` no tiene ningún manejo de conflicto).

---

## 2026-09-24 — Conexión real de la pantalla "Roles y Permisos" (frontend)

**Motivo de negocio:** la pantalla de Roles y Permisos seguía mockeada desde el ticket original. Pablo pidió conectarla al backend real, eliminando el mock por completo (sin fallback, sin convivencia) — mismo patrón de reemplazo ya usado en el ticket de login.

**Alcance:** exclusivamente esta pantalla (`features/roles-permisos/`). No se tocó login/`AuthGate`, no se implementó asignación de roles a usuarios (ver hueco funcional abajo), y el badge del Sidebar quedó **explícitamente sin resolver** — es un mock separado (`members` en `mocks/data.ts`, con su propio campo `role` fijo), compartido con `EquipoPage`/`MemberModal`/`InicioPage`, no con esta pantalla. Conectarlo implica el módulo Equipo completo y es un ticket aparte.

**Shapes reales confirmados contra el backend antes de escribir el service** (no asumidos del diseño original):
- `GET /permisos` → `Array<{ resource, permissions: string[] }>`, sin wrapper de paginación — coincide con el diseño original.
- `GET /roles` → `Array<{ id, name, permissionsCount }>`, array plano.
- `GET /roles/:id/permisos` → `string[]` — **endpoint separado por rol**, no viene incluido en `GET /roles`. Esto cambió el diseño de datos respecto al mock (que tenía un único mapa `Record<roleId, string[]>` en memoria): ahora cada `RoleCard` pide sus propios permisos al expandirse por primera vez, sin ningún estado compartido entre tarjetas.
- `POST /roles` → devuelve `{ id, name }`, **sin** `permissionsCount` (el frontend asume 0 al insertarlo localmente en la lista).
- `PATCH /roles/:id/permisos` → devuelve `string[]` (el set que quedó guardado).

**Detalle técnico:**
- `features/roles-permisos/types/role.ts` (nuevo, reemplaza al `src/types/role.ts` global — ya no lo usaba nada fuera de esta feature) y `features/roles-permisos/services/roles.service.ts` (wrapper fino sobre el mismo `apiRequest` del ticket de login, sin tocarlo).
- `RoleCard` ya no recibe el mapa completo de permisos por props: al expandirse por primera vez pide `GET /roles/:id/permisos` y guarda su propio estado de carga/guardado. Al guardar, la página padre solo actualiza el `permissionsCount` de ESE rol en la lista (`.map()` puntual, nunca un refetch completo de `/roles`) — así, tener otra tarjeta expandida con cambios sin guardar y guardar una no la toca ni la resetea (se verificó con dos tarjetas expandidas a la vez).
- `lib/permissions.ts`: se sacó el catálogo mock (`CRUD_RESOURCES`/`CRUD_ACTIONS`/`PERMISSION_CATALOG`/`crudPermission`) — el catálogo real viene siempre de `/permisos`. Quedaron `resourceLabel()`/`actionLabel()` (antes `Record` tipados) como funciones con fallback al string crudo, porque ya no hay garantía en compile-time de qué recursos existen.
- `useApp.tsx`: se sacaron `roles`, `rolePermissions`, `addRole`, `updateRolePermissions` de `AppState` sin dejar rastro — nada más los consumía.
- El gate `can("manageRoles")` no necesitó ningún cambio: ya delegaba en el `useAuth()` real desde el ticket de login (`can: canReal` en `useApp.tsx`). Este ticket solo conectó los *datos* de la pantalla, el *acceso* a la pantalla ya era real.

**Hueco funcional conocido, no solo alcance recortado:** hasta que exista una pantalla de asignación de roles a usuarios (probablemente en Equipo, ver `POST/DELETE /equipo/:userId/roles/:roleId` que el backend ya expone pero el frontend no consume), **cualquier rol nuevo creado desde esta pantalla no se le puede asignar a nadie desde el frontend**. Sirve para definir el set de permisos de un rol, pero conectarlo a una persona real hoy solo se puede hacer pegándole directo a la API (como se hizo a mano para Sudo→Ana en el ticket anterior). No es una limitación de diseño a propósito, es una pieza que todavía no se construyó.

**Verificado con navegador real** (Playwright, con capturas): login como Martín (Admin) mostrando las 4 tarjetas reales — Admin, Líder, Músico y Sudo con sus 28 permisos, **sin ningún caso especial en el código** para mostrar Sudo (el diseño por catálogo genérico funcionó tal cual). Rol nuevo creado ("Prueba QA") mostrando "0 permisos" en la tarjeta colapsada antes de expandirla, no un texto raro. Edité los permisos de Líder (tildé `estadisticas:write`), guardé, **refresqué la página entera**, y confirmé que el cambio persistió contra la base real (16 → 17 permisos, checkbox tildado tras el reload) — no era solo un cambio visual que se perdía al recargar. Revertí ese cambio de prueba y borré el rol "Prueba QA" al final para no dejar basura en la base. Login como Joaquín (Músico) confirmando que sigue viendo "Sección restringida", ahora con el gate real de punta a punta.

**Sin verificar:** el borrado de un rol desde la UI (no hay botón de eliminar en el diseño de esta pantalla; se probó el `DELETE` directo contra la API solo para la limpieza post-test, no a través de la pantalla). Tampoco se probó qué pasa si dos personas editan el mismo rol al mismo tiempo desde dos sesiones distintas (último `PATCH` gana, sin ningún aviso de conflicto).

---

## 2026-09-24 — Rol Sudo (soporte técnico) con todos los permisos del catálogo

**Motivo de negocio:** Pablo pidió un cuarto rol, "Sudo", con absolutamente todos los permisos del catálogo sin excepción (incluido `rol:write`), asignado a un usuario existente del seed — no uno nuevo, para no caer en el fallback a `members[0]` del frontend que ya habíamos identificado como limitación conocida.

**Alcance:** exclusivamente seed y migración de datos. No se conectó la pantalla de Roles y Permisos (sigue mockeada) ni se tocó nada del flujo de login/`AuthGate`.

**A quién se le asignó y por qué:** a **Ana Ferrari** (`ana@cielosabiertos.org`, hoy Sonido/Consola), reemplazando su rol Músico — no a Martín (queda como único ejemplo de Admin) ni a Joaquín (a pedido explícito, se sigue usando como referencia de "Músico sin permisos"). Líder queda con sus dos ejemplos intactos (Sofía, Lucía) y Músico con cuatro (Joaquín, Camila, Nicolás, Diego) — ningún rol original quedó sin representante en el seed.

**Decisiones explícitas, con su razón:**
- **Sudo reemplaza a Músico en Ana, no convive con él.** Matemáticamente daba lo mismo para la propiedad de inmunidad buscada (`getPermissionsForUser` calcula la unión de permisos de todos los roles de un usuario, así que tener Sudo alcanza para ser inmune a que alguien le achique los permisos a otro rol, sin importar si además tiene ese otro rol o no) — se eligió reemplazar por claridad semántica: evita la pregunta de "por qué este usuario tiene dos roles a la vez".
- **El catálogo de Sudo es un snapshot fijo (28 permisos hardcodeados en la migración), no dinámico.** Se decidió así por consistencia con Admin/Líder/Músico, que ya funcionan igual — ninguno de los roles del sistema es "dinámico", todos son filas fijas en `role_permissions`. La alternativa (un caso especial en `AuthorizationService` que detecte el rol por nombre y le devuelva todo el catálogo en runtime) se descartó por frágil: se rompería si alguien renombra el rol "Sudo" desde la pantalla de administración. **Consecuencia a recordar:** si el catálogo de permisos crece (nuevo recurso), Sudo NO se entera solo — hace falta una migración nueva que le otorgue el permiso nuevo, tal como ya pasó cuando se agregó el recurso `rol` y hubo que dárselo a mano a Admin/Líder/Músico.
- **La migración funciona tanto contra la base ya poblada de este entorno como contra una instalación nueva desde cero**, porque se tocaron dos lugares a propósito: la migración (`AddSudoRole`) hace el swap de Ana si ya existe como usuario, y `run-seed.ts` también sabe darle "sudo" a Ana desde el arranque — sin este segundo cambio, alguien que clonara el repo y corriera el seed por primera vez habría terminado con Ana como Músico normal, no Sudo.

**Verificado con login real:** login contra `POST /auth/login` con `ana@cielosabiertos.org`, confirmando por API que su token trae `roles: ["Sudo"]` y 28 permisos (incluido `rol:write`). En el navegador: acceso sin restricción a `/roles-permisos` (no aparece "Sección restringida"), y visibles los botones "Agregar miembro" (Equipo), "Subir canción" (Escuchar) y "Nuevo setlist" (Setlists) — los mismos gates que antes solo dejaban pasar a Admin.

**Aclaración para no confundir en capturas futuras:** el badge del Sidebar y la lista de roles que muestra la propia pantalla de Roles y Permisos siguen viniendo del mock `useApp` (desconectado del backend real, documentado como deuda desde el ticket de login) — por eso Ana sigue apareciendo con el badge "Músico" ahí y "Sudo" no aparece en esa lista de 3 roles mockeados, aunque su sesión real tenga los 28 permisos. El gate de acceso (`can("manageRoles")`) sí usa el permiso real y la dejó entrar correctamente.

**Sin verificar:** el comportamiento de la migración `down()` (rollback) no se ejecutó, solo se revisó por lectura de código.

---

## 2026-09-23 — Rediseño visual de LoginPage + fix de un bug real en el interceptor de 401 (frontend)

**Motivo de negocio:** la pantalla de login ya funcionaba (ticket anterior), pero Pablo pidió verificar si tenía el mismo nivel de cuidado visual que el resto de la app — es lo primero que ve cualquiera que entra al sistema — y, si no, rediseñarla sin tocar la lógica de auth ya probada.

**Alcance:** exclusivamente la capa visual de `LoginPage.tsx`, más una excepción mínima y explícitamente autorizada en `api-client.ts` (ver bug abajo). No se tocó `auth-store.ts` ni `AuthGate`, ni se agregó funcionalidad nueva (recuperar contraseña, "recordarme", registro).

**Estado real encontrado antes de tocar nada** (verificado con capturas de pantalla y no asumido): la pantalla ya usaba los tokens reales de `styles.css` — no era un formulario genérico sin estilo — pero le faltaba la jerarquía visual del resto de la app (wordmark chico, sin el gradiente dorado que "Abiertos" tiene en Inicio, sin el fondo `gradient-sky` del hero).

**Bug real encontrado de paso (no cosmético):** al probar el flujo de contraseña incorrecta, la página recargaba por completo (confirmado viendo dos eventos "`[vite] connecting`" en la consola del browser durante un mismo intento) y el mensaje de error nunca llegaba a pintarse. Causa: el interceptor global de 401 en `api-client.ts` — pensado para detectar que una sesión activa expiró y forzar `logout()` + redirect — se disparaba también ante un 401 de la propia llamada a `POST /auth/login`, que no es una sesión expirada sino simplemente una contraseña incorrecta. El `catch` de `LoginPage` nunca llegaba a ejecutarse porque el `window.location.assign("/login")` ya estaba en curso.

**Detalle técnico:**
- `src/lib/api-client.ts`: excepción de una línea — un 401 con `path === "/auth/login"` ya no dispara `onUnauthorized()`. Se pidió confirmación explícita antes de tocar este archivo (estaba marcado fuera de alcance en el ticket anterior) porque no había forma de cumplir "estados de error claros" sin esta corrección.
- `src/features/auth/pages/LoginPage.tsx`: wordmark con el mismo tratamiento `text-gradient-gold` que usa "Abiertos" en `InicioPage`, fondo con `gradient-sky` sutil (mismo gradiente del hero de Inicio, en baja opacidad), `glow` en el ícono, validación propia de campos vacíos vía `noValidate` (en vez del tooltip nativo del browser, inconsistente entre navegadores), y el mensaje de error real del backend en una caja con ícono y borde en vez de un párrafo de texto suelto.

**Verificado con navegador real** (Playwright, con capturas — no solo lectura de código): desktop (1440px) y mobile (390px, viewport tipo iPhone) del estado limpio; contraseña incorrecta mostrando el mensaje real del backend ("Credenciales inválidas") sin ningún reload (0 reloads detectados) y sin salir de `/login`, en ambos tamaños de pantalla; campos vacíos mostrando el mensaje propio sin navegar; estado de loading confirmado con la respuesta de login demorada artificialmente (botón `disabled`, texto "Ingresando…", sin doble submit al clickear de nuevo mientras carga) y el login terminando bien después.

**Sin verificar:** accesibilidad con lector de pantalla (no se probó con uno real, solo se agregaron `label`/`htmlFor`/`role="alert"` razonables). Tampoco se probó en un browser real de gama baja/con red lenta real (solo se simuló latencia con Playwright).

---

## 2026-09-23 — Extensión de JWT_EXPIRES_IN de 15m a 8h (backend)

**Motivo de negocio:** con expiración de 15 minutos y sin endpoint de refresh, cualquier ensayo o servicio real (más largo que 15 minutos) iba a deslogueaar a los músicos en medio del uso. Pablo pidió extenderlo a 8hs — para una app interna de equipo de iglesia, el riesgo de seguridad de una sesión más larga es aceptable.

**Alcance:** exclusivamente el valor de expiración del JWT y su configuración asociada. No se implementó un endpoint de refresh (queda para más adelante si hace falta) y no se tocó nada del flujo de `AuthGate`/login ya commiteado.

**Investigación previa a tocar el valor** (pedida explícitamente antes de asumir nada):
- Se encontraron **4 lugares** con el valor `15m`, no uno: `.env` (real, no versionado), `.env.example`, el fallback en `src/config/configuration.ts`, y el default de Joi en `src/config/env.validation.ts`. Se actualizaron los 4 juntos para que no queden desincronizados.
- **No hay ningún test en el proyecto** (confirmado con `find`: cero `.spec.ts`/`.test.ts`, y los configs `vitest.*.config.ts` que `package.json` referencia ni siquiera existen) — nada dependía del valor corto.
- **Los tokens ya emitidos no se ven afectados**: el `exp` se calcula y graba dentro del JWT en el momento de firmarlo (`jwtService.signAsync`), no se recalcula después. Quien esté logueado con un token viejo sigue expirando a los 15 minutos originales; solo los tokens nuevos (emitidos tras reiniciar con la variable nueva) duran 8hs.

**Verificado con login real:** reinicio del backend con `JWT_EXPIRES_IN=8h`, login real contra `martin@cielosabiertos.org`, y decodificación manual del JWT resultante — `iat` y `exp` con exactamente 8 horas de diferencia, no 15 minutos.

**Sin verificar:** comportamiento real durante un servicio de 8+ horas (no se simuló ese caso límite).

---

## 2026-09-23 — Login real en el frontend (reemplazo del selector de rol mock)

**Motivo de negocio:** el frontend elegía "quién sos" con un `<select>` de rol mockeado en el Sidebar. Pablo pidió reemplazarlo por completo por un login real contra `POST /auth/login` + `GET /auth/me`, sin que conviva ningún "modo demo sin sesión" — si no hay sesión válida, se va a `/login`, sin excepción.

**Alcance:** exclusivamente identidad/autenticación del usuario logueado (JWT en `localStorage`, guard de ruta, `can()` real). El resto de los módulos (canciones, setlists, favoritos, anotaciones, la propia pantalla de Roles y Permisos) siguen consumiendo datos 100% mockeados — no se conectó ninguna entidad de negocio en este ticket.

**Detalle técnico:**

- `src/lib/api-client.ts`: cliente HTTP único. El doc de patrones asume un endpoint de refresh de token que este backend no tiene (solo `/auth/login` y `/auth/me`, `JWT_EXPIRES_IN` fijo en 15 min). El singleton que el doc pide para evitar refreshes paralelos se reinterpretó como un singleton de **logout**: ante un 401, todos los requests en vuelo esperan la misma promesa de "cerrar sesión y redirigir", en vez de disparar cada uno la suya.
- `src/core/auth/auth-store.ts`: store plano (no React Context) para que el guard de ruta pueda leerlo fuera del árbol de componentes. Expone `login`, `logout` (limpia `localStorage` Y redirige a `/login` en el mismo paso, sin dejar un estado intermedio inconsistente) y `can(action)`, que traduce los nombres de acción que ya usaba la UI mockeada (`manageTeam`, `editSongs`, `createSetlist`, `viewStats`, `manageRoles`) a un permiso real del catálogo (`equipo:write`, `cancion:write`, `setlist:write`, `estadisticas:read`, `rol:write` respectivamente) — mapeo verificado contra los 3 roles originales antes de aplicarlo, mismo resultado que el mock para esos tres casos.
- `src/core/guards/AuthGate.tsx`: reemplaza al `beforeLoad` que se había planteado originalmente. Con el JWT en `localStorage` (no en cookie), el servidor no puede saber si hay sesión durante el render SSR de TanStack Start — un `beforeLoad` quedaría ciego ahí. En su lugar, este componente gatea el render según el estado real del store (que arranca en `"loading"` tanto en servidor como en la primera pasada del cliente) y solo muestra el layout una vez que el cliente confirmó la sesión contra `/auth/me`; mientras tanto (o si no hay sesión, fuera de `/login`), muestra un spinner en vez del contenido ya armado.
- `src/hooks/useApp.tsx`: se sacaron `setCurrentUserId`/`setRole` (selector mock, reemplazo total). `currentUser` — que todavía usan `NewSetlistModal`, `SetlistCard/Detail` y `canEditAnnotation` para autoría mockeada — ahora se **deriva matcheando el email real logueado contra el array mock `members`** (confirmado que son las mismas 8 personas que el seed real del backend). `can()` deja de mirar un `role` mock y delega en el store real.

**Deuda conocida, documentada a pedido explícito (no se resuelve en este ticket):** `canEditAnnotation` (en `useApp.tsx`) sigue comparando contra `currentUser.role === "admin" || "lider"` — el rol mock, estático — en vez del permiso real `anotacion:update`/`anotacion:delete` que `AnnotationsService` ya usa en el backend desde el ticket de Roles y Permisos. Como el rol real ahora es editable en runtime (un admin puede sacarle todos los permisos a "Líder" desde la pantalla de Roles y Permisos), estas dos fuentes pueden discrepar: alguien podría ver el candado de "no podés editar" en el mock cuando el backend real lo dejaría, o viceversa. No se corrigió porque las anotaciones siguen siendo un módulo 100% mockeado, fuera del alcance de este ticket — queda para cuando se conecte ese módulo al backend real.

**Verificado con navegador real** (Playwright, no solo curl/`tsc`): sin sesión, `/` termina en `/login`; login real con `martin@cielosabiertos.org` (Admin) muestra su nombre/rol real en el Sidebar, acceso a "Roles y Permisos" sin restricción, y los botones "Agregar miembro"/"Subir canción" visibles; logout limpia la sesión y vuelve a `/login`; login con `joaquin@cielosabiertos.org` (Músico) muestra "Sección restringida" en Roles y Permisos y oculta esos mismos botones — confirmado con capturas de pantalla, no solo por presencia de texto en el HTML.

**Sin verificar:** qué pasa si el token expira en medio de una sesión activa (no hay refresh; con `JWT_EXPIRES_IN=15m` esto va a pasar en uso real durante un ensayo largo) — no se simuló ese escenario. Tampoco se probó el caso de un usuario real sin contraparte en el mock `members` (cae a `members[0]` por diseño, pero no se ejecutó ese caso concreto).

---

## 2026-09-23 — Gestión de Roles y Permisos (backend)

**Motivo de negocio:** Pablo pidió reemplazar el sistema de roles fijo (3 valores hardcodeados con `@Check`) por uno dinámico: un admin puede crear roles nuevos y decidir qué permisos tiene cada uno desde una pantalla de administración, sin tocar código. Es la primera vez que se toca el mecanismo de autorización desde el scaffold inicial — no es una feature aislada, es un reemplazo del corazón del sistema de permisos.

**Alcance:** Backend completo (entidades, migración, endpoints). El frontend queda mockeado por decisión explícita — el proyecto no tiene todavía cliente HTTP ni login real, y conectar solo esta pantalla al backend real habría sido adelantar la integración de una sola pantalla mientras el resto sigue mockeado. Se decidió también, a pedido, **sin ventana de vigencia** en `User↔Role`: relación M:N simple, sin fechas desde/hasta — no había necesidad de negocio concreta que la justificara.

**Detalle técnico:**

- **`Role`** (`roles`): `id`, `name` (único, texto libre, sin `@Check`) — reemplaza el `User.role` fijo.
- **`User.role`** (columna + `@Check` admin/lider/musico) **se eliminó**. Se reemplaza por `User.roles`, `@ManyToMany` hacia `Role` vía tabla puente `user_roles`, sin entidad de join propia (mismo patrón ya usado en `Setlist.team`/`Song.tags`).
- **`RolePermission`** cambió de `(role: string, permission: string)` a `(roleId: uuid FK → Role, permission: string)` — pasa de comparar por valor a tener una relación TypeORM real (`@ManyToOne`, `onDelete: CASCADE`).
- **`AuthorizationService.getPermissionsForRole(role)`** → **`getPermissionsForUser(userId)`**: agrega (unión sin duplicados) los permisos de *todos* los roles que tenga el usuario, vía join contra `user_roles`.
- Nuevo recurso de catálogo **`rol`** (`rol:read/write/update/delete`): gobierna crear/renombrar/borrar roles, editar su set de permisos, y asignar/quitar roles a un usuario. Se decidió que viva separado de `equipo:*` (que sigue siendo solo para editar el perfil de un integrante) para no atar administración de accesos a permisos de edición de perfil.
- **Bug real corregido de paso**: `AnnotationsService.assertCanEdit` tenía hardcodeado `user.role === "admin" || user.role === "lider"`, bypaseando el catálogo de permisos y rompiendo con el nuevo modelo (ya no hay un string de rol garantizado). Se reemplazó por `user.permissions.includes("anotacion:update"/"anotacion:delete")` — mismo criterio, expresado en el propio catálogo en vez de duplicado como caso especial.
- Nuevos endpoints: `GET /permisos` (catálogo agrupado por recurso, fuente única de verdad para el frontend), CRUD de `/roles` + `PATCH /roles/:id/permisos` (reemplaza el set completo, no incremental — se explicó la razón: la UI de tarjetas con checkboxes ya arma el estado completo deseado antes de guardar), y `POST`/`DELETE /equipo/:userId/roles/:roleId` para asignar/quitar.
- Migración `AddRolesAndPermissions`: crea `roles`/`user_roles`, recrea `role_permissions` con la nueva forma, siembra 3 roles (Admin/Líder/Músico) con los mismos permisos que ya estaban vigentes, migra los usuarios existentes según su `role` anterior, y recién ahí borra la columna/constraint vieja. `down()` revierte completo, incluyendo picking de rol único por prioridad Admin > Líder > Músico si un usuario terminó con más de uno (limitación documentada en el propio migration, inherente a volver de M:N a un solo valor).

**Verificado con requests HTTP reales** (no solo `tsc`): migración corrida contra la base ya poblada de sesiones anteriores (no una base limpia); login trayendo `roles`/`permissions` correctos; creación de un rol nuevo arrancando sin permisos; `PATCH .../permisos` con un permiso que ningún otro rol del usuario tenía, confirmando que el login siguiente lo agrega a la unión; remoción del rol confirmando que el permiso desaparece; un usuario sin `rol:write` recibiendo 403 al intentar crear un rol; y el flujo completo de moderación de anotaciones (autora, no-autora sin permiso → 403, líder con permiso → edita) para confirmar que el fix de `AnnotationsService` no rompió el comportamiento existente.

**Sin verificar:** la pantalla de frontend (queda mockeada, pendiente del pase de conexión real al backend). No se agregó soft-delete a `Role` — si se borra un rol en uso, los usuarios simplemente lo pierden (cascada en `user_roles` y en `role_permissions`); no se pidió lo contrario, pero es un punto a confirmar con Pablo si en el futuro se necesita auditoría de qué rol tuvo cada usuario históricamente.

---

## 2026-09-22 — Pin de TypeScript a la serie estable 5.x y fix de watch mode

**Motivo de negocio:** Pablo reportó dos avisos del editor en `tsconfig.json` ("el `rootDir` debe fijarse explícitamente" y "`baseUrl` está deprecado") y sospechó que el backend había quedado con TypeScript 7 (preview/latest) instalado, generando drift de versión respecto del frontend — que fija `^5.8.x` — y repitiendo la causa raíz que ya nos había obligado a esquivar `@nestjs/cli generate` durante el scaffold inicial.

**Alcance acotado:** Exclusivamente versión de TypeScript y su configuración asociada. No se tocó schema de base de datos, entidades ni lógica de negocio (pedido explícito).

**Detalle técnico:**

- Se verificó `package.json` y `package-lock.json`: `typescript` ya estaba fijado en `"^5.8.3"` — **idéntico** al string declarado en el frontend — y resolviendo a `5.9.3` (la última versión estable de la serie 5.x, confirmada contra el registro de npm). No había drift real ni TypeScript 7 instalado; la hipótesis inicial de Pablo no se confirmó para el paquete `typescript` en sí.
- `tsconfig.json` ya tenía el fix de una sesión anterior (`rootDir: "./src"` explícito, sin `baseUrl`, `paths` con rutas relativas `"./src/*"`), y `tsc --noEmit` ya daba limpio antes de tocar nada en esta sesión.
- **Bug real encontrado de paso** (no relacionado con TypeScript): al re-probar `npm run dev` de punta a punta, el paso `start:dev` fallaba — `@swc/cli@0.8.1` (versión a la que se forzó el upgrade en la sesión de fix de vulnerabilidades de npm) requiere `chokidar` como *peer dependency opcional* para el flag `-w` (watch), y no estaba instalado (`Error: Cannot find module 'chokidar'`). Se agregó `chokidar: "^5.0.0"` como devDependency explícita.
- Se corrió `npm install` (sin cambios de versión de `typescript`, ya estaba correcto) y se re-verificó `npm run dev` completo con los contenedores parados desde cero: `docker compose down` → `npm run dev` → creación/arranque de contenedores → polling de Postgres → `migration:run` (sin pendientes) → `start:dev` en watch mode → Nest arriba con todas las rutas mapeadas, incluidas las de `pistas`/`AudioTrack` agregadas en la sesión anterior.

**Sobre `@nestjs/cli`/`@nestjs/schematics`:** siguen sin poder instalarse junto con TypeScript 5.x estable, y esto **no** es un efecto del drift a TS7 que se sospechaba. `@nestjs/schematics` (única versión publicada hoy, la de la línea Nest 12) declara `peerDependencies: { typescript: ">=6.0.0" }` — es un requisito estructural de esa versión de schematics, no algo que se arregle bajando de una versión "mala" de TypeScript a una "buena": mientras el proyecto se mantenga en Nest 12 + TypeScript 5.x (para no arrastrar los cambios de la serie 6/7, todavía muy nueva), el workaround de `swc --watch` + `node --watch` en vez de `nest generate`/`nest start --watch` sigue siendo necesario. No se migró nada de vuelta a la CLI de Nest.

**Verificado:**
- `tsc --noEmit` sin salida, exit code 0.
- `npm run dev` de punta a punta desde cero (containers abajo → arriba, polling, migraciones, arranque en watch mode) con request real a `/api/health` respondiendo `status: ok`.
- `npm install` sin conflictos de peer dependencies, 0 vulnerabilidades.

**Sin verificar:**
- Si el editor de Pablo deja de mostrar los dos avisos después de este cambio. El archivo de config y la versión resuelta de TypeScript ya eran correctos *antes* de este cambio (ambos arreglados en una sesión previa), así que si los avisos persisten en el editor, lo más probable es un TS Language Server desactualizado/cacheado en VS Code (acción sugerida: "TypeScript: Restart TS Server" o recargar la ventana), no un problema real del proyecto.
