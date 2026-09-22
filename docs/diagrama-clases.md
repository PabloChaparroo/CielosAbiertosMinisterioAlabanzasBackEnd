# Diagrama de clases — modelo de datos

Generado a partir de las entidades TypeORM reales en `src/**/*.entity.ts` (no es un diseño aspiracional: refleja el código tal como quedó scaffoldeado). Las columnas de auditoría (`fechaHoraAlta`, `fechaHoraModificacion`, `fechaHoraBaja`) se muestran una sola vez en `BaseAuditEntity` en vez de repetirse en cada entidad que la extiende.

```mermaid
classDiagram
  class BaseAuditEntity {
    <<abstract>>
    +fechaHoraAlta: Date
    +fechaHoraModificacion: Date
    +fechaHoraBaja: Date?
  }

  class User {
    <<tabla: users>>
    +id: string
    +email: string
    +passwordHash: string
    +name: string
    +role: string
    +ministryRole: string
    +instruments: string[]
    +avatarColor: string
    +initials: string
  }
  note for User "CHECK: role IN ('admin','lider','musico')"

  class Tag {
    <<tabla: tags>>
    +id: string
    +valor: string
  }
  note for Tag "CHECK: valor IN ('Adoración','Júbilo','Navidad','Sanidad','Bautismo','Comunión','Entrega','Gratitud')"

  class Song {
    <<tabla: songs>>
    +id: string
    +title: string
    +artist: string
    +key: string
    +bpm: number
    +duration: number
    +cover: string
    +audioKey: string?
    +chordpro: string
    +lyricsImageKey: string?
  }

  class SongPlayStat {
    <<tabla: song_play_stats>>
    +songId: string
    +month: string
    +plays: number
  }
  note for SongPlayStat "PK compuesta (songId, month); índice único (song, month).
Relación circular Song ↔ SongPlayStat: se resolvió tipando ambos lados
(Song.playStats y SongPlayStat.song) como Relation&lt;T&gt; de typeorm,
para evitar el ReferenceError de dependencia circular entre módulos
compilados que rompía el arranque (ver AGENTS/sesión de scaffolding)."

  class Setlist {
    <<tabla: setlists>>
    +id: string
    +title: string
    +date: Date
    +type: string
  }
  note for Setlist "CHECK: type IN ('Culto Domingo','Ensayo','Evento Especial')"

  class SetlistItem {
    <<tabla: setlist_items>>
    +id: string
    +key: string
    +note: string?
    +position: number
  }
  note for SetlistItem "SNAPSHOT INMUTABLE: 'key' es la tonalidad elegida
para ESE evento puntual, copiada al armar el setlist. NO es una referencia
en vivo a Song.key — si la tonalidad original de la canción cambia después,
este valor no se actualiza (comentario textual en el código: 'puede diferir
de la tonalidad original de la canción')."

  class Annotation {
    <<tabla: annotations>>
    +id: string
    +text: string
  }

  class Favorite {
    <<tabla: favorites>>
    +userId: string
    +songId: string
  }
  note for Favorite "PK compuesta (userId, songId). No extiende BaseAuditEntity:
solo tiene fechaHoraAlta (creación), sin soft delete ni fecha de modificación."

  class RolePermission {
    <<tabla: role_permissions>>
    +role: string
    +permission: string
  }
  note for RolePermission "PK compuesta (role, permission). NO tiene relación
FK real en el código: 'role' se compara por valor de string contra User.role,
no hay @ManyToOne/@OneToMany declarado — es un catálogo, no una asociación."

  BaseAuditEntity <|-- User
  BaseAuditEntity <|-- Song
  BaseAuditEntity <|-- Setlist
  BaseAuditEntity <|-- Annotation

  Song "*" --> "*" Tag : tags
  Song "1" --> "*" SongPlayStat : playStats / song
  Setlist "*" --> "1" User : leader
  Setlist "1" --> "*" SetlistItem : items / setlist
  Setlist "*" --> "*" User : team
  SetlistItem "*" --> "1" Song : song
  Annotation "*" --> "1" Song : song
  Annotation "*" --> "1" User : author
  Favorite "*" --> "1" User : user
  Favorite "*" --> "1" Song : song
```

## Notas sobre fidelidad al código

- **Todas las entidades listadas existen literalmente** como archivos `*.entity.ts` bajo `src/modules/**` y `src/common/authorization/`: `Song`, `SongPlayStat`, `User`, `Setlist`, `SetlistItem`, `Annotation`, `Favorite`, `Tag`, `RolePermission`. No hay ninguna entidad adicional en el proyecto.
- **`BaseAuditEntity`** no es una tabla propia (no tiene `@Entity`): es la clase abstracta de `src/common/entities/base-audit.entity.ts` que `User`, `Song`, `Setlist` y `Annotation` extienden. `SetlistItem`, `SongPlayStat`, `Tag`, `RolePermission` y `Favorite` **no** la extienden — `Favorite` sólo tiene su propio `fechaHoraAlta`, y el resto no tiene ninguna columna de auditoría.
- **Todas las relaciones son unidireccionales salvo dos**: `Song ↔ SongPlayStat` (vía `Song.playStats` / `SongPlayStat.song`) y `Setlist ↔ SetlistItem` (vía `Setlist.items` / `SetlistItem.setlist`) son las únicas con `@OneToMany` + `@ManyToOne` declarados en ambos lados. El resto (`Song.tags`, `Setlist.leader`, `Setlist.team`, `SetlistItem.song`, `Annotation.song`, `Annotation.author`, `Favorite.user`, `Favorite.song`) sólo tiene el decorador en un lado — el otro lado del código no declara ningún campo inverso.
- **`RolePermission` no está unida por clave foránea** a `User`: su columna `role` es un `varchar` que se compara por valor contra `User.role` en `AuthorizationService`, no hay relación TypeORM entre ambas entidades.
- El único snapshot inmutable real del modelo es `SetlistItem.key`, documentado como tal en el propio código.
