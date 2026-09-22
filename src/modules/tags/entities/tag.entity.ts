import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export const TAG_VALUES = [
  "Adoración",
  "Júbilo",
  "Navidad",
  "Sanidad",
  "Bautismo",
  "Comunión",
  "Entrega",
  "Gratitud",
] as const;
export type TagValue = (typeof TAG_VALUES)[number];

@Entity("tags")
@Check(
  `"valor" IN ('Adoración','Júbilo','Navidad','Sanidad','Bautismo','Comunión','Entrega','Gratitud')`,
)
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  valor!: TagValue;
}
