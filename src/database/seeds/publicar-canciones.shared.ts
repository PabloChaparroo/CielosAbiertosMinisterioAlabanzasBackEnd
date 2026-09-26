/**
 * Lo compartido entre songs:export (lee la base local) y songs:publish (escribe en otra base,
 * ej. Neon): el formato del archivo intermedio y cómo se eligen las canciones con --solo.
 */

/** Archivo intermedio, relativo a la raíz del backend (npm run corre ahí) */
export const PUBLICAR_FILE = "src/database/seeds/data/publicar-canciones.json";

export interface CancionAPublicar {
  title: string;
  artist: string;
  key: string;
  bpm: number;
  compas: string;
  duration: number;
  cover: string;
  chordpro: string;
  tipo: string;
  tags: string[];
  links: Array<{
    label: string;
    url: string;
    type: string | null;
    order: number;
  }>;
}

/** Título + artista, sin distinguir mayúsculas ni espacios de los bordes */
export const norm = (s: string) => s.trim().toLocaleLowerCase("es");
export const songKey = (title: string, artist: string) =>
  `${norm(title)}|${norm(artist)}`;

/** Lee los --solo "Título|Artista" de la línea de comandos (al menos uno, obligatorio) */
export function parseSolo(argv: string[]): Array<{ title: string; artist: string }> {
  const selected: Array<{ title: string; artist: string }> = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] !== "--solo") continue;
    const value = argv[i + 1] ?? "";
    const parts = value.split("|");
    if (parts.length !== 2 || !parts[0]!.trim() || !parts[1]!.trim()) {
      throw new Error(`--solo "${value}": tiene que ser "Título|Artista"`);
    }
    selected.push({ title: parts[0]!.trim(), artist: parts[1]!.trim() });
    i++;
  }
  if (!selected.length) {
    throw new Error('falta al menos un --solo "Título|Artista" (no se procesa el cancionero entero)');
  }
  const keys = selected.map((s) => songKey(s.title, s.artist));
  if (new Set(keys).size !== keys.length) throw new Error("hay un --solo repetido");
  return selected;
}
