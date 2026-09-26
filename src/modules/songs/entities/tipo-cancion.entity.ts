import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Tipo de canción del ministerio: "Alabanza" (rápida) o "Adoración" (lenta). Es una tabla y no
 * una lista fija para poder sumar tipos más adelante cargando una fila. Hoy se cargan por
 * migración (no hay ABM desde la app). No confundir con el tema (tag) "Adoración".
 */
@Entity("tipos_cancion")
export class TipoCancion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", unique: true })
  nombre!: string;
}
