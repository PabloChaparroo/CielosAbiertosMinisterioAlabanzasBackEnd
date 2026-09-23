import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Texto libre a propósito: un admin puede crear roles nuevos desde la
 * pantalla de administración en cualquier momento, sin catálogo fijo ni
 * @Check — a diferencia de Tag.valor.
 */
@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  name!: string;
}
