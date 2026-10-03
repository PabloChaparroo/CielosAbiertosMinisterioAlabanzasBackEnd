/** Instrumentos que puede tocar un miembro del equipo (pedido de Pablo). Puede tener varios. */
export const INSTRUMENTS = [
  "Guitarra eléctrica",
  "Guitarra acústica",
  "Teclado",
  "Voz",
  "Percusión",
  "Batería",
  "Bajo",
  "Sonido",
  "Multimedia",
] as const;
export type Instrument = (typeof INSTRUMENTS)[number];
