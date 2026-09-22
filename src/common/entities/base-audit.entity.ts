import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseAuditEntity {
  @CreateDateColumn({ name: "fecha_hora_alta", type: "timestamptz" })
  fechaHoraAlta!: Date;

  @UpdateDateColumn({ name: "fecha_hora_modificacion", type: "timestamptz" })
  fechaHoraModificacion!: Date;

  @DeleteDateColumn({ name: "fecha_hora_baja", type: "timestamptz", nullable: true })
  fechaHoraBaja!: Date | null;
}
