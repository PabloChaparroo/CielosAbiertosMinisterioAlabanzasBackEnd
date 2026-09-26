import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/** Temas originales del catálogo */
const BASE_TAGS = [
  "Adoración",
  "Júbilo",
  "Navidad",
  "Sanidad",
  "Bautismo",
  "Comunión",
  "Entrega",
  "Gratitud",
] as const;

/**
 * Temas agregados con el cancionero real (migración AddCancioneroTags): los 28 que usa el
 * documento, tal cual, sin fusionar — Pablo los va a revisar y ordenar a mano.
 */
export const CANCIONERO_TAGS = [
  "Fe",
  "Rendición",
  "Identidad",
  "Exaltación",
  "Búsqueda",
  "Alabanza",
  "Guerra Espiritual",
  "Avivamiento",
  "Servicio",
  "Victoria",
  "Milagros",
  "Esperanza",
  "Confianza",
  "Testimonio",
  "Fidelidad",
  "Espíritu Santo",
  "Protección",
  "Salvación",
  "Poder",
  "Redención",
  "Majestad",
  "Oración",
  "Reino de Dios",
  "Hambre espiritual",
  "Restauración",
  "Resurrección",
  "Humildad",
  "Consagración",
] as const;

export const TAG_VALUES = [...BASE_TAGS, ...CANCIONERO_TAGS] as const;
export type TagValue = (typeof TAG_VALUES)[number];

/** Lista SQL de valores permitidos, para el CHECK (misma fuente que TAG_VALUES) */
export const TAG_VALUES_SQL = TAG_VALUES.map((v) => `'${v}'`).join(",");

@Entity("tags")
@Check("CHK_tags_valor", `"valor" IN (${TAG_VALUES_SQL})`)
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  valor!: TagValue;
}
