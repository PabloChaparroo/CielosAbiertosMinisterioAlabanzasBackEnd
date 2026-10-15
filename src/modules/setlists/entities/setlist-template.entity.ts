import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseAuditEntity } from "../../../common/entities/base-audit.entity";
import type { SetlistSection } from "./setlist-item.entity";

export interface SetlistTemplateItem {
  songId: string;
  key: string;
  note?: string;
  section?: SetlistSection;
}

/**
 * Lista predefinida: canciones (con tono y nota) listas para reutilizar al armar un setlist.
 * No tiene fecha, líder ni equipo: eso se elige al crear el setlist a partir de ella.
 */
@Entity("setlist_templates")
export class SetlistTemplate extends BaseAuditEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  title!: string;

  /** Canciones en orden. Las dadas de baja se filtran en el frontend. */
  @Column({ type: "jsonb", default: () => "'[]'" })
  items!: SetlistTemplateItem[];
}
