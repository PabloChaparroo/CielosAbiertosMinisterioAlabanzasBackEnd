/**
 * Cancionero real de la iglesia ("Adoraciones", 61 canciones), para `npm run songs:import`.
 *
 * Letra y acordes copiados TAL CUAL del documento, sin corregir ni completar nada (ni acordes
 * raros como [Emb], [D#aug] o [A/C#m]). Lo único que se sacó:
 * - el texto que agregó una IA al armar el documento (descripciones, "Busca la letra…",
 *   "Rellena la letra aquí…", "(Sigue con):", etc.); si esa frase venía antes de acordes, los
 *   acordes quedan;
 * - números de página, encabezados "PLANTILLA" / "LETRA CON ACORDES" y los renglones en blanco
 *   que dejó la extracción del PDF (queda una línea en blanco entre secciones).
 * Donde el documento no traía letra, la canción queda solo con la progresión de acordes: la
 * letra la completa el equipo desde la app (no se buscó en ningún lado).
 *
 * Metadatos: los del documento. Decisiones de Pablo para lo que faltaba o era ambiguo:
 * artista faltante → "Sin especificar"; tipo → Adoración, salvo 4 Alabanzas; duración (el
 * documento no la trae) → 4:00; tonalidad con varias opciones → la primera / la de inicio.
 */
export interface CancioneroSong {
  title: string;
  artist: string;
  key: string;
  bpm: number;
  compas: string;
  tags: string[];
  tipo: "Adoración" | "Alabanza";
  chordpro: string;
}

const ADORACION = "Adoración" as const;
const ALABANZA = "Alabanza" as const;

export const CANCIONERO: CancioneroSong[] = [
  {
    title: "A quién iré",
    artist: "Marcos Witt",
    key: "G",
    bpm: 84,
    compas: "4/4",
    tags: ["Adoración", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Intro}
[G] [Bm] [G] [D] - [A]

{Verso}
[D]¿A quién iré en necesi[Bm]dad?
[G]¿A quién iré en busca de [D]paz? - [A]
[D]¿Y quién podrá mi vida sa[Bm]ciar de verdad?
[G]¿Quién más tendrá de mí compa[D]sión? - [A]
[D]¿Y entenderá mi cora[Bm]zón?
[G]¿Quién cambiará mi eterni[D]dad? sino - [A]Tú, Jesús.

{Coro}
[D]Cristo, ¿a dónde [F#m]más podría [G]ir? [%]
[D]Cristo, ¿qué otro lu[F#m]gar puede exis[G]tir? [%]
[Em]Solo Tú tienes pa[%]labras de amor,
[G]camino al Padre y ver[A]dad eres Tú.
[D]Cristo, ¿a dónde [F#m]más podría [Bm]ir? [%]`,
  },
  {
    title: "Apasionado",
    artist: "Barak",
    key: "F",
    bpm: 70,
    compas: "4/4",
    tags: ["Adoración", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Bb] [F] [C] [Dm]
[Bb] [F] [C] [F]

{Verso}
[Dm]Llévame al lugar se[Bb]creto donde es[F]tás
[Dm]Acércame más a tu [Bb]gloria y majes[F]tad
[Dm]Despierta mi espíri[Bb]tu, sáciame más de [F]ti
[Dm]Mi corazón siempre esta[Bb]rá dispuesto para [F]ti

{Coro}
[Bb]Nada apagará mi [F]fuego, [C]mis ganas de ado[Dm]rarte
[Bb]Mi anhelo es postrarme [F]ante [C]ti por siem[F]pre
[Bb]Viviré apasio[F]nado, de [C]tu gloria enamo[Dm]rado
[Bb]Mi anhelo es postrarme [F]ante [C]ti por siem[F]pre

{Instrumental}
[Dm] [Bb] [F]
[Dm] [Bb] [F]
[C]

{Puente}
[Dm]Apasionado busco tu [Bb]rostro, nada po[F]drá detenerme
[Dm]Apasionado busco tu [Bb]rostro, nada po[F]drá detenerme
[Dm]Apasionado busco tu [Bb]rostro, nada po[F]drá detenerme
[Dm]Apasionado busco tu [Bb]rostro, nada po[F]drá detenerme`,
  },
  {
    title: "Al estar ante ti",
    artist: "Sin especificar",
    key: "D",
    bpm: 72,
    compas: "4/4",
    tags: ["Adoración"],
    tipo: ADORACION,
    chordpro: `{Intro}
[D] [A] [Em] [Bm] - [A/C#]
[D] [A] [Em] [Bm] - [A/C#]
[A]

{Verso}
[D]Al estar ante ti
[A]Adorando frente al mar de cristal
[Em]Entre la multitud
En a[Bm]sombro allí me ha[A/C#]bré de postrar
[D]Y mi canto uniré
[A]A millones proclamándote Rey
[Em]Y mi voz oirás
Entre [Bm]las multitudes can[A/C#]tar
[A]

{Coro}
[D/F#]Digno es el cor[G]dero de Dios
[D/F#]El que fue inmolado en la [G]cruz - [A/C#]
Digno de la [Bm]honra y el po[A]der
La sabi[G]duría suya [A/C#]es

{2do Coro}
Y al que es[C]tá en el trono sea el ho[A]nor [%]
[D]Santo Santo Santo es el Se[Em]ñor - [G]
[A]Reina por los siglos con poder [%]

{Final}
[C]Todo lo que existe es por [G]Él - [A] [D]Todo lo que existe es por [G]Él - [A] [D]Todo lo que existe es por [G]Él - [A] [D]`,
  },
  {
    title: "Aquí estoy",
    artist: "Hillsong United",
    key: "A",
    bpm: 71,
    compas: "4/4",
    tags: ["Adoración", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Intro}
[A]

{Verso}
[A]Tú eres el principio, [D]tuya es la eternidad
[A/C#]Llamaste el mundo [F#m]a exis[D]tencia
[A]Me acerco a ti, [D]con mi vida en tus manos
[A/C#]Rindiendo mi [F#m]volun[D]tad

{Pre-coro}
[D]A ti mi [Bm]alma rin[F#m]do [%]
[D]Tu gracia [E]me ha sal[F#m]vado
[D]Y para [E]siempre en ti [F#m]confia[%]ré

{Coro}
[D]Aquí es[A]toy, mis [E]manos alza[F#m]ré hacia ti
[D]A ti me rindo, [A]todo [E]lo que soy

{Final}
[D]Rindo a ti [Bm]mi ser, [F#m]a ti mi [A]alma entrego
[Bm]Todo lo que soy Se[E]ñor [%]
(Termina con la progresión del Verso)
Final = Verso`,
  },
  {
    title: "Amor sin condición",
    artist: "Cory Asbury / Bethel Music",
    key: "Dm",
    bpm: 72,
    compas: "6/8",
    tags: ["Adoración", "Gratitud"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Dm] [C] [Bb] [F]
[Dm] [C] [Bb] [F]

{Verso}
[Dm]Antes de ha[C]blar, Tú cantabas sobre [Bb]mí
[Dm]Tú has sido [C]tan, tan bueno para [Bb]mí
[Dm]Antes de respi[C]rar, soplaste tu aliento en [Bb]mí
[Dm]Tú has sido [C]tan, tan bueno para [Bb]mí

{Coro}
Oh, el in[Dm]menso, sin i[C]gual, asombro[Bb]so amor de [F]Dios
Que me [Dm]busca y de[C]ja las noventa y [Bb]nueve por [F]mí
No lo [Dm]puedo ga[C]nar, ni lo me[Bb]rezco, tu te en[F]tregas por mí
Oh, el in[Dm]menso, sin i[C]gual, asombro[Bb]so amor de [F]Dios`,
  },
  {
    title: "A tus pies",
    artist: "Miel San Marcos ft. Christine D'Clario",
    key: "A",
    bpm: 68,
    compas: "4/4",
    tags: ["Adoración", "Fe", "Entrega", "Rendición"],
    tipo: ADORACION,
    chordpro: `{Intro}
[A] [A/F#] [A/E] [A/F#]

{Verso}
[A]A tus pies arde [E/G#]mi corazón
[F#m7]A tus pies entrego [D]lo que soy
[A]Ese lugar de mi se[E/G#]guridad
[F#m7]Donde nadie me [D]puede señalar

{Pre-coro}
[A]Me perdonaste, me [E]acercaste a tu presencia
[F#m7]Me levantaste y hoy me [E]postro a adorarte

{Coro}
[A/C#]No hay lugar más [D]alto, más [E]grande
Que estar a tus [F#m]pies, que estar a tus pies
[A/C#]No hay lugar más [D]alto, más [E]grande
Que estar a tus [F#m]pies, que estar a tus pies

{Puente}
[D]Y aquí [E]permanece[A] - ré, pos[E/G#]trado a tus [F#m7]pies
[D]Y aquí [E]permanece[F#m]ré, a los pies de Cristo
[D]Y aquí [E]permanece[A] - ré, pos[E/G#]trado a tus [F#m7]pies
[D]Y aquí [E]permanece[F#m]ré, a los pies de Cristo`,
  },
  {
    title: "Abba Padre",
    artist: "Miel San Marcos ft. Marcela Gándara",
    key: "Am",
    bpm: 72,
    compas: "4/4",
    tags: ["Adoración", "Identidad", "Fe", "Sanidad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Am] - [G] [C]
[Am] - [G] [C]

{Verso}
[Am]Me compraste [G]con tu [C]sangre
[Am]Me escogiste, [G]me a[C]maste
[Dm]Me vestiste de alegría
[Am]Te acor[F]daste de mi do[G]lor
[Am]En tu sombra [G]me escon[C]diste
[Am]Desde el vientre [G]me apar[C]taste
[Dm]Me llamaste por mi nombre
[Am]Te glorifi[F]carás en [G]mí

{Coro}
[Am]Abba [F]Padre, tu [C]hijo [G]soy
[Am]Abba [F]Padre, mi [C]primer a[G]mor

{Coro 2}
[F]Corro a tus [C]brazos, per[Am]tenezco a [G]ti
[Dm]Abba [C]Padre, tu [G]hijo soy

{Puente}
[F]Vuelvo a mi hogar
[C]Donde soy libre
[Am]Donde me amas
[G]Tú eres mi herencia
[F]Vuelvo a mi hogar
[C]Yo no soy huérfano
[Am]Yo no estoy solo
[G]Mi Padre es mi herencia`,
  },
  {
    title: "Al Estar Aquí",
    artist: "Marcos Witt ft. Taya",
    key: "F#",
    bpm: 60,
    compas: "4/4",
    tags: ["Adoración", "Comunión", "Exaltación", "Fe"],
    tipo: ADORACION,
    chordpro: `{Intro}
[F#] [B] [Emb] - [C#] [B] - [Bm]
[F#] - [C#] [D#m7] - [%]
[B] - [F#/Bb] [G#m7] - [C#sus4]
[F#] - [F#/Bb] [D#m7]- [%]

{Verso 1}
[F#]-Al estar en la pre[C#]sencia de tu divini[D#m7]-dad [%]
[G#m7]Y al contemplar la hermosura de tu santi[C#sus4]dad [D] - [E]

{Coro 1}
Mi [A]-Cristo, mi [E/G#]Rey, nadie es como [F#m7]Tú [%]
Me rindo de [D]-amor a [A/C#]Ti, y a [Bm7]-tu majes[Esus4]tad [%]
Te [A]-adoraré [C#7]te ado[F#m7]raré [%]
[Bm7]Te adora[Esus4]ré, mi Se[%]ñor
[A]-Al es[A/C#]tar a[F#m7]quí delante de [A/C#]ti
Te adora[Bm7]ré - [A] [Esus4] [%]
[A]Al es[A/C#]tar a[D]quí delante de [Dm]ti
Te adora[A]ré - [Esus4] [A] [%]

{Verso 1}
(Interludio corto antes de subir)
[F#] - [C#] [D#m7] [%]

{Coro}
Mi [B]Cristo, mi [F#/Bb]Rey, nadie es como [G#m7]Tú - [C#sus4]
Me rindo de [F#]amor a [F#/Bb]Ti, y a [D#m7]tu majestad [%]
Te [G#m7]adoraré te ado[C#sus4]raré
[F#]Te adora[F#/Bb]ré, mi Se[D#m7]ñor - [F#/A#]
[G#m7]Al estar a[F#]quí - delante de [C#sus4]ti [%]
[F#]Te adora[F#/A#]ré, mi Se[B]ñor - [Bm]
[C#]Te adora[C#sus4]ré, mi Se[F#]ñor [%]`,
  },
  {
    title: "Creo en ti",
    artist: "Julio Melgar",
    key: "Am",
    bpm: 70,
    compas: "4/4",
    tags: ["Adoración", "Fe", "Sanidad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Am] - [G] [F]
[Am] - [G] [F]

{Verso}
[Am]-Quiero levan[G]tar a ti mis [F]manos
Mara[C]villoso Je[G]sús, milagroso Señor
[Am]-Llena este lu[G]gar de tu pre[F]sencia
Y haz des[C]cender tu po[G]der a los que estamos aquí

{Pre-coro}
[Am]Creo en [G]ti Je[F]sús Y en lo que harás en mí
[Am]Creo en [G]ti Je[F]sús Y en lo que harás en mí

{Coro}
[Am]En mí, en [F]mí
Recibe toda la [C]gloria, recibe toda la [G]honra
Precioso hijo de Dios
[Am]Recibe toda la [F]gloria, recibe toda la [C]honra Precioso hijo de [G]Dios`,
  },
  {
    title: "Cuando levanto mis manos",
    artist: "Samuel Hernández",
    key: "D",
    bpm: 63,
    compas: "4/4",
    tags: ["Adoración", "Sanidad", "Fe", "Rendición"],
    tipo: ADORACION,
    // la línea en blanco después de los acordes es a propósito: sin ella, el parser pega una
    // línea de solo acordes con la letra de abajo, y acá los acordes no son de esa línea
    chordpro: `[G][A][F#m][Bm]
[Em][A][D][D7]

Levanto mis manos
Aunque no tenga fuerzas
Levanto mis manos
Aunque tenga mil problemas
Cuando levanto mis manos
Comienzo a sentir
Una uncion que me hace cantar
Cuando levanto mis manos
Comienzo a sentir el fuego
Cuando levanto mis manos
Mis cargas se van
Nuevas fuerzas Tú me das
Todo esto es posible, todo esto es posible
Cuando levanto mis manos
A ver los coros, levanto mis manos
Levanto mis manos aunque no tenga fuerzas
Aunque no tenga fuerzas aunque tenga mil problemas
Levanto mis manos levantalas altas al cielo conmigo
Aunque tenga mil problemas algo sucede cuando levantas tus manos
Cuando levanto mis manos ¿que comienzas a sentir?
Comienzo a sentir
Una uncion que me hace cantar cantale al señor
Cuando levanto mis manos
Comienzo a sentir el fuego eso mismo estoy sintiendo ahora mismo
Cuando levanto mis manos se van tus cargas y tus problemas tambien
Mis cargas se van
Nuevas fuerzas Tú me das
Todo esto es posible, todo esto es posible
Cuando levanto mis manos
Cuando levanto mis manos
Yo comienzo a sentir
Una uncion que me hace cantar
Cuando levanto mis manos
Comienzo a sentir el fuego el fuego
Cuando levanto mis manos
Mis cargas se van
Nuevas fuerzas Tú me das
Todo esto es posible, todo esto es posible todo esto es posible
Cuando levanto mis manos
Todo esto es posible, todo esto es posible ¿como es que dice el coro?
Cuando levanto mis manos
La ra la
Levanta tus manos`,
  },
  {
    title: "Cristo Jesús",
    artist: "Un Corazón",
    key: "F",
    bpm: 67,
    compas: "4/4",
    tags: ["Adoración", "Rendición", "Fe", "Gratitud"],
    tipo: ADORACION,
    chordpro: `{Coro}
[F]Cristo Je[G]sús
Eres mi pleni[Am]tud - [Em]
[F]Cristo Je[C]sús
Eres mi pleni[Am]tud - [Em]`,
  },
  {
    title: "Cuan Grande es Dios",
    artist: "Chris Tomlin / En Espíritu y en Verdad",
    key: "G",
    bpm: 70,
    compas: "4/4",
    tags: ["Adoración", "Exaltación", "Júbilo"],
    tipo: ADORACION,
    chordpro: `{Intro}
[G] [G] - [D/F#] [Em] [Em] - [D] [C] [D] [G]

{Verso}
[G] [G] - [D/F#] [Em] [Em] - [D] [C] [D] [G]

{Coro}
¡Cuán [G]grande es [G] - [D/F#]Dios!
Cántale, cuán [Em]grande es [Em] - [D]Dios
Y todos lo ve[C]rán, cuán [D]grande es [G]Dios

{Puente}
[G] [C] [G] - [D/F#] [Em] [Am] [D] [G]

{Final}
[G] - [D/F#] [Em] [Am] [D]
[C] [Cm] [G]`,
  },
  {
    title: "Desde mi interior",
    artist: "Sin especificar",
    key: "Am",
    bpm: 69,
    compas: "4/4",
    tags: ["Adoración", "Rendición", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Intro}
[F] [C] - [G] |:]

{Verso}
[F]Mil veces te fa[C]llé, mas tú fuiste [G]fiel
[F]Tu gracia me levan[C]tó, me basta tu a[G]mor
[F]Dios eterno, tu [C]luz por siempre bri[G]llará
[F]Y tu gloria incompa[C]rable sin fi[G]nal

{Coro}
[Am] - [F] [C] - [G] |:]
[Am] - [F] [G] - [Am] - [G] | [F] [G] | [F] - [G] |

{Puente}
[F] [C] [Am] [G]
[F] [Am] [G] [Dm]

{Intro}`,
  },
  {
    title: "Digno",
    artist: "Marcos Brunet",
    key: "A",
    bpm: 65,
    compas: "4/4",
    tags: ["Adoración", "Exaltación"],
    tipo: ADORACION,
    chordpro: `{Verso}
[A]No tengo nada para ofre[F#m]cer
[D]Nada que te pueda sorpren[F#m]der - [E]

{Precoro}
[D] [Dm] [A] [E] |:]

{Coro}
[A] [E] [F#m] [E]`,
  },
  {
    title: "Dios Imparable",
    artist: "En Espíritu y en Verdad / Marcos Brunet",
    key: "A",
    bpm: 82,
    compas: "3/4",
    tags: ["Fe", "Júbilo", "Adoración"],
    tipo: ALABANZA,
    chordpro: `{Intro}
[A/C#] [D] [F#m] [E] |:]

{Verso}
[A/C#]Eres el [D]Dios, que a[F#m]bre el mar [E]Rojo
[A/C#]Eres el [D]Dios, que a[F#m]bre los cie[E]los

{Precoro}
[D] [E] [F#m] - [%] x3] | [E]

{Coro}
[D] [E] [A] - [E/G#] [F#m] |:]
[D] [E] [F#m] |% :]

{Coro 2}
[Bm] [E] [F#m] [%]
[Bm] [E]

{Puente}
[F#m] - [E/G#] [A] - [A/C#] [Bm]`,
  },
  {
    title: "Dios es más grande",
    artist: "Miel San Marcos",
    key: "A",
    bpm: 84,
    compas: "4/4",
    tags: ["Fe", "Júbilo", "Guerra Espiritual"],
    tipo: ALABANZA,
    chordpro: `{Intro}
[A] [%] [E] [%]

{Verso}
[A]Dios es más [%]grande que [E]mi proble[%]ma
[Bm]Dios es más [D]grande que [A]mi dolor |:]

{Precoro}
[E] [F#m] [E] [D]

{Coro}
[A] [%] [E] [%]
[Bm] [D] [F#m] [E] |:]
[D] [%]

{Puente}
[D] [E] [F#m] [E] - [A/C#]

{Intro}

{Coro}

{Puente}`,
  },
  {
    title: "Dios háblame",
    artist: "Barak",
    key: "A",
    bpm: 70,
    compas: "4/4",
    tags: ["Adoración", "Fe", "Comunión"],
    tipo: ADORACION,
    chordpro: `{Intro}
[D] [F#m] [D] [F#m] [D] [F#m] [E] [%]

{Verso}
[A]Dios hábla[E/G#]me, que tu [F#m]siervo es[D]cucha
[A/C#]Dispuesto es[E]toy...
[A] [E/G#] [F#m] [D] [A/C#] [E] |:]

{Precoro}
[F#m] - [A/C#] [D] - [A/C#] [Bm] - [A] [E]

{Coro}
[A] [F#m] [D] [F#m] - [E] |:]
[A] [F#m]

{Puente}
[F] [G] [F] [Dm] [E] [F]

{Modulación (Key Bb)}
[Bb] [Gm] [Eb] [Bb/D] - [F] |:]`,
  },
  {
    title: "Deseable",
    artist: "Marcos Brunet",
    key: "G",
    bpm: 64,
    compas: "4/4",
    tags: ["Adoración", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Em] - [G/B] [C] - [D]

{Estrofa}
[Em]Eres her[G/B]moso, de[C]seable...
[Em] - [G/B] [C] |:]

{Pre coro}
[G/B] - [C] [G/B] - [C] [Am] - [C] [D]

{Coro}
[G] [D/F#] [Am7] - [G/B] [C] - [D] |:]`,
  },
  {
    title: "Este es mi deseo",
    artist: "Hillsong",
    key: "G",
    bpm: 72,
    compas: "4/4",
    tags: ["Adoración", "Rendición", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C] [%] [Bm] [Em]
[C] [%] [Bm] [D/F#]

{Verso}
[G] - [D/F#] [Em] [G] [D/F#] [Em] - [D/F#] [G] [F] [C] - [D] |:]

{Coro}
[G]Este es mi de[D]seo, [Am]honrarte a [C] - [D]Ti
[G]Con todo mi [D/F#]ser te ado[Am]raré [C] - [D]
[G] [D] [Am] [C] - [D] [G] [D/F#] [Am] [C] - [D] |:]
[C] [%]`,
  },
  {
    title: "Espíritu santo",
    artist: "Sin especificar",
    key: "G",
    bpm: 67,
    compas: "4/4",
    tags: ["Adoración", "Comunión"],
    tipo: ADORACION,
    chordpro: `{Verso}
[G] [D] [Em] [C] |:]

{Coro}
[G] [D] [Em] [C]

{Puente}
[G] [Am] [Em] [C] |:]
[D] [C/E] [C/B] [C] x4] [C] [D]`,
  },
  {
    title: "Exaltado estás",
    artist: "Miel San Marcos",
    key: "C",
    bpm: 75,
    compas: "4/4",
    tags: ["Exaltación", "Júbilo"],
    tipo: ALABANZA,
    chordpro: `{Intro}
[C] [G] [Am7] [F] |:]

{Verso}
[C] [G] [Am7] [F]
[C] [G] [F] [%] |:]

{PreCoro}
[Am] [Em] [Am] [Em] [F] [G] [C/E] [G] [F] [G]

{PreCoro 2}
[F] [G]

{Coro}
[C] [G/B] [Am7] [F] |:]

{Coro 2}
[C/E] [G] [Am7] [F] |:]

{Solo Instrumental}
[C] [G/B] [Am7] [F] [C] [G/B] [Am7] [G]

{Puente}
[C] [G/B] [Am7] [F] [C/G] [F/A] [Am7] [F]

{Final}
[C] [G/B] [Am7] - [G] [F]`,
  },
  {
    title: "Enamórame",
    artist: "Abel Zavala",
    key: "E",
    bpm: 62,
    compas: "4/4",
    tags: ["Adoración", "Rendición", "Comunión"],
    tipo: ADORACION,
    chordpro: `{Verso}
[E]Quiero entre[A]gar - [B]te [E]mis ilu[C#m]siones
[G#m] - [A]...
[E] [A] - [B] [E] [C#m] [G#m] - [A] | [C#m] - [B] [A] - [B] [E] |:]

{Coro}
[A] [E/G#] - [C#m] [A] - [B] [D] - [E]
[A] [E/G#] - [C#m] [A] - [E/G#] [F#m]
[A] - [E/G#] [F#m] [B] - [E]`,
  },
  {
    title: "En memoria de ti",
    artist: "Sin especificar",
    key: "A",
    bpm: 66,
    compas: "4/4",
    tags: ["Comunión", "Gratitud", "Adoración", "Rendición"],
    tipo: ADORACION,
    chordpro: `{Intro}
[A] - [D] - [A] - [F#m] [F#m] [E] - [D] - [A] [A]

{Verso}
[A] - [D] - [A] - [F#m] [F#m] [E] - [D] - [A] [A]

{Coro}
[F#m] [E/G#] [A] [D] [A] [D] [A] [%] [E]

{Puente}
[Bm] [E] [A/C#m] [D] x4]

{Final}
[Bm] [E] [A] - [A/C#m] [D]`,
  },
  {
    title: "El nombre",
    artist: "Un Corazón y Averly Morillo",
    key: "Eb",
    bpm: 72,
    compas: "4/4",
    tags: ["Exaltación", "Fe", "Sanidad", "Júbilo"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Eb] [Ab] |:] x2

{Verso}
[Eb] [Ab] [Eb] [Ab]
[Eb] [Ab] [Cm7] - [Bb] [Ab]

{Pre coro}
[Bb] [Cm7] - [Ab]
[Bb] [Cm7] - [Bb] - [%]

{Coro}
[Eb]Tu nombre es [Fm7]Cristo
[Eb/G]El rey de [Cm7]gloria - [Bb]
[Eb] [Fm7] [Eb/G] [Cm7] - [Bb] |:]

{Interludio} (Igual a la Intro)

{Verso 2}
[Eb] [%] [Eb] [Ab]
[Eb/G] - [Bb/D] - [Eb] [Cm7] - [Bb] [Ab]

{Pre coro 2}
[Bb] [Cm7] - [Ab]
[Bb] [Eb/G] - [Ab] [Bb]

{Coro 2}
[Eb] [Fm7] [Eb/G] [Cm7] | [Bb] x3]
[Eb/G] [Ab] [Eb/Bb] [Cm7] - [Bb]

{Instrumental}
[Cm] [Ab] [Eb] [Bb]
3ro: [Gm] [Bb]

{Puente y Van}
[Cm] [Ab] [Eb] [Gm] x4]
[Cm] [Ab] [Eb] [Gm] |:]

{Coro Final}
[Eb] [Fm7] [Eb/G] [Cm7] - [Bb]
[Eb/G] [Ab] [Eb/Bb] [Cm7] - [Bb]`,
  },
  {
    title: "Santo espíritu",
    artist: "Averly Morillo",
    key: "B",
    bpm: 65,
    compas: "4/4",
    tags: ["Búsqueda", "Adoración", "Comunión"],
    tipo: ADORACION,
    chordpro: `{Intro}
[B/D#] [F#] |:]

{Verso}
[B/D#] [F#] [B/D#] [F#]
[C#] - [F#] [B]

{Coro}
[F#] [C#] [G#m] - [D#m] [C#] |:]
[G#m] - [D#m] [C#]

{Interludio}
[B/D#] [F#] |:]

{Verso 2}
[B/D#] [F#] [B/D#] [F#] - [F#/Bb]
[B/D#] [F#] - [F#/Bb] [B/G#] [F#/C#] [B]
[C#] [F#/Bb] - [B] - [B]
(Aquí luego se repite el Coro y el Interludio)

{Inter/Puente}
[B] - [C#] [D#m] - [C/F] [F#] [C#/F]
Subida: [B] [B] [B/G#] [C#]
Coro Batería: [C#] - [F#] [B]

{Coro Final}
[F#] [C#] [G#m] - [D#m] [C#] |:]
[G#m] - [D#m] [C#] x4] [B]`,
  },
  {
    title: "Salmos 108",
    artist: "Sin especificar",
    key: "Em",
    bpm: 74,
    compas: "4/4",
    tags: ["Júbilo", "Alabanza", "Exaltación"],
    tipo: ALABANZA,
    chordpro: `{Intro}
[Em] [D] [Bm7] [Em] |:]

{Verso}
[Em] [D] [Am] - [G] [D]
[Em] [D] [Am] - [G] [B]

{Coro}
[Em] [D] [Bm7] [Em] |:]

{Puente}
[C] [D] [Bm7] [Em] |:]`,
  },
  {
    title: "Santo Espíritu",
    artist: "Christine D'Clario / Bryan & Katie Torwalt",
    key: "D",
    bpm: 68,
    compas: "4/4",
    tags: ["Adoración", "Búsqueda", "Comunión"],
    tipo: ADORACION,
    chordpro: `{Intro}
[G] [A] [F#m] [G]

{Verso}
[Bm]No hay nada que [A]valga más
[G]Que tu presencia, Señor
[Bm] [A] [G] [Em] |:]
[G] [A]

{Coro}
[G]Santo Espíritu, [A]eres bienvenido a[D]quí - [A/C#]
Inunda este lu[G]gar y llena la at[Em]mósfera
[G] [A] [D] - [A/C#] | [G] [Em] [A] [Bm] [F#m] |:]

{Puente}
[Bm] [A] [F#m] [G] |:]
[Em] [Bm] [A] |:]`,
  },
  {
    title: "Si tú presencia conmigo no va",
    artist: "Sin especificar",
    key: "D",
    bpm: 68,
    compas: "4/4",
    tags: ["Búsqueda", "Rendición", "Fe"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Em] [G] [D] [A]

{Verso}
[Em] - [D] [A] [D] - [A] [Bm] |:]

{Coro}
[Em7] [G] [D] - [A] [Bm7]
[Em7] [G] [D] [A]

{Puente}
[Em] [G] [D] - [A] [Bm7]`,
  },
  {
    title: "Santo por siempre",
    artist: "IBI",
    key: "G",
    bpm: 70,
    compas: "4/4",
    tags: ["Adoración", "Exaltación", "Júbilo"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C] - [G] [D] [Bm] [Em] - [D] [G] |:]
_2doVers [G]

{Verso}
[G] [C] - [G] [Em] - [D] [C] |:]

{Pre coro}
[C] - [G] [D] [Em] - [D] [C]

{Coro}
[C] - [G] [D] [Bm7] [Em]
[Am] - [G] [D] [G] [%]`,
  },
  {
    title: "Hay una unción",
    artist: "Sin especificar",
    key: "A",
    bpm: 68,
    compas: "4/4",
    tags: ["Sanidad", "Adoración", "Fe", "Comunión"],
    tipo: ADORACION,
    chordpro: `{Verso}
[D]Hay una un[E]ción a[A]quí
Ca[F#m]yendo sobre [D]mí
Mu[E]dándome, cam[A]biando mi [%]ser |:]

{Coro}
[D]Mi espíri[E]tu y mi [A]alma se está [E/G#]lle - [F#m]nando
Con el po[D]der de tu Es[E]píritu [A]Santo [%]

{Interludio}
[F#m] [%] [D] [%] [A] [%]`,
  },
  {
    title: "Heme aquí",
    artist: "Marcos Witt",
    key: "G",
    bpm: 60,
    compas: "4/4",
    tags: ["Entrega", "Rendición", "Servicio"],
    tipo: ADORACION,
    chordpro: `{Verso}
[G] - [Em] [C] - [D] |:]

{Coro}
[C] - [D] [G] - [D/F#] - [Em]
[Am] - [D] [C] - [G]`,
  },
  {
    title: "Hasta que tu gloria",
    artist: "Sin especificar",
    key: "Em",
    bpm: 70,
    compas: "4/4",
    tags: ["Búsqueda", "Adoración", "Avivamiento"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C] - [Em] [D] |:]

{Verso}
[Em] [C] [G] [D] |:]

{PreCoro}
[Am] [G] [D] [%] |:]

{Coro}
[Em] [C] [G] [D] |:]

{Puente}
[C] - [Em] [D] |:]`,
  },
  {
    title: "Hermoso nombre",
    artist: "Hillsong Worship",
    key: "D",
    bpm: 68,
    compas: "4/4",
    tags: ["Exaltación", "Adoración", "Fe", "Victoria"],
    tipo: ADORACION,
    chordpro: `{Intro}
[D]

{Verso 1}
[D]Tú fuiste el Verbo en el principio
[G]Unigé[Bm]nito de [A]Dios
[Bm]El miste[A/C#]rio de tu [D]gloria
[G]Revela[Bm]do en tu a[A]mor

{Verso 2}
[D] [%] [G] - [Bm] [A] |:] [Bm] - [A/C#] [D] [G] - [Bm] [A] |:]

{Coro}
[D] [A] [Bm] [A] [G]
(Se repite, luego sube la intensidad)
[D/F#] [A] [Bm] [A] [G] |:]
[D] [A] [G]

{Puente}
[G] [A/C#] [Bm] [F#m] x8]`,
  },
  {
    title: "Inagotable Amor",
    artist: "Hillsong",
    key: "C#",
    bpm: 84,
    compas: "6/8",
    tags: ["Gratitud", "Adoración", "Identidad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C#] [%] [Bbm] [%] [Ab] [%] [Gb] [%] :]

{Verso}
[C#] [%] [Bbm] [%] [Ab] [%] [Gb] [%] |:]

{Pre Coro}
[Ab] [%] [Gb] [%]

{Coro}
[C#] [%] [Bbm] [%] [Ab] [%] [Gb] [%] |:]

{Bajar inten}
[C#] [%]

{Puente}
[Bbm] [%] [Gb] [%] [C#] [%] [Ab] |:]`,
  },
  {
    title: "La niña de tus ojos",
    artist: "Daniel Calveti",
    key: "C",
    bpm: 68,
    compas: "4/4",
    tags: ["Identidad", "Gratitud", "Restauración"],
    tipo: ADORACION,
    chordpro: `{Verso y Coro}
Me [C]viste a mí, cuando [G]nadie me vio
Me a[Am]maste a mí, cuando [F]nadie me amó
Y me [C]diste nombre, yo soy [G]tu niña
La [Am]niña de tus [F]ojos, porque me amaste a mí
[C] [G] [Am] [F]`,
  },
  {
    title: "Lo harás otra vez",
    artist: "Elevation Worship",
    key: "Eb",
    bpm: 86,
    compas: "4/4",
    tags: ["Fe", "Milagros", "Esperanza", "Confianza"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Eb] [%] [Bb/D] [%] :]

{Verso}
[Eb] [%] [Bb/D] [%] ||:]

{Coro}
[Gm] [F] [Bb] [Eb] ||:]
[Bb/D] [Eb] |:]

{Puente}
[Eb] [%] [Bb/D] [%] ||:]`,
  },
  {
    title: "Lo único que quiero",
    artist: "Marcela Gándara / Marcos Brunet",
    key: "F#",
    bpm: 68,
    compas: "4/4",
    tags: ["Búsqueda", "Rendición", "Adoración"],
    tipo: ADORACION,
    chordpro: `{Intro}
[B] [F#/Bb] [B] [C#]

{Verso y Coro}
[B] [F#/Bb] [B] [C#]

{Puente}
[B] [F#] [Ebm] [C#] |:]
[B] [C#] [Ebm] [F#] |:]`,
  },
  {
    title: "La bondad de Dios",
    artist: "Bethel Music",
    key: "G",
    bpm: 68,
    compas: "4/4",
    tags: ["Gratitud", "Testimonio", "Fidelidad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[G] [%] [%] [%] |:]

{Verso}
[G] [C] - [G]
[G/E] - [C] [G] - [D/F#]
[G] [C] - [G]
[G/E] - [D] [G]

{Coro}
[C] [G] [D] - [D/B] |:]
[C] [G] - [D/F#] - [G/E]
[C] - [D]

{Inter/Puente}
[G/B] [C] [D] [G] |:] [G] (Y va al coro)`,
  },
  {
    title: "Llueve",
    artist: "Tercer Cielo",
    key: "E",
    bpm: 73,
    compas: "4/4",
    tags: ["Avivamiento", "Búsqueda", "Espíritu Santo"],
    tipo: ADORACION,
    chordpro: `{Verso}
[C#m] [A] [E] [B] |:]

{Coro}
[A]Llueve, [B]llueve
[C#m]Llueve sobre [B]mí - [G#m]
[A] [B] [C#m] [B] - [G#m] |:]`,
  },
  {
    title: "Mi refugio",
    artist: "Sin especificar",
    key: "C",
    bpm: 70,
    compas: "4/4",
    tags: ["Confianza", "Protección", "Fe"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C] [G] [C/E] [G]

{Verso 1}
[C] [G] [C/E] [G]

{Verso 2}
[C] [G] [Am] [G]
[C/E] [G] [Am] [G]

{Coro}
[F] - [G] [Am] - [C/E]
[F] - [G/B] [Am] - [Gm] | [F] - [G]
[Am] - [B/G] [C] [G]

{Inter/Puente Subir}
[F] - [G] [Am] - [B/G] [C] [G] |:]
[Dm] - [C/E] [F] - [G/B] [C] [G]`,
  },
  {
    title: "Mi Dios puede Salvar",
    artist: "Hillsong",
    key: "A",
    bpm: 71,
    compas: "4/4",
    tags: ["Salvación", "Esperanza", "Poder"],
    tipo: ADORACION,
    chordpro: `{Intro}
[D] [A] [F#m] [E] |:]

{Verso}
[D] [A] [F#m] [E] |:]
[D] [E] [D] [E]

{Coro}
Cristo puede [A]mover mon[E]tañas
Mi Dios puede sal[D]var, mi [A]Dios puede sal[F#m]var - [E]
[A] [E] [D] - [A] [F#m] - [E] |:]

{Puente}
[D] [A] [E] [F#m]
[D] [A] [E] |:]`,
  },
  {
    title: "Océanos",
    artist: "Hillsong Zion",
    key: "Bm",
    bpm: 66,
    compas: "4/4",
    tags: ["Confianza", "Fe", "Rendición"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Bm] - [A/C#] [D] [A] [G] |:]

{Verso}
[Bm] - [A/C#] [D] [A] [G] |:]

{Coro}
Y a tu [G]nombre cla[D]ma[A]ré
En ti mis [G]ojos fi[D]ja[A]ré
[G] [D] [A] |:]

{Puente}
[Bm] [G] [D] [A] x4]
[G] [D] [A] [Em] |:]
[Bm] [C#] - [D] [A] [Em] |:]`,
  },
  {
    title: "Preciosa Sangre",
    artist: "Julio Melgar / Marco Barrientos",
    key: "A",
    bpm: 70,
    compas: "4/4",
    tags: ["Gratitud", "Salvación", "Redención"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Bm] [A] [F#m] [C#m]

{Verso}
[Bm] [A] [F#m] [C#m] |:]

{Precoro}
[Bm] [A] [F#m] [D]
[A] [F#m] [C#m] [E]

{Coro}
[D] [A] [F#m] [E]
[D] [A] [E] [%]

{Puente}
[Bm] [F#m] [D] [A] - [E]
[Bm] [F#m] [C#m] [E] |:]`,
  },
  {
    title: "Poderoso Dios",
    artist: "Aliento",
    key: "Bb",
    bpm: 73,
    compas: "4/4",
    tags: ["Exaltación", "Majestad", "Adoración"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Bb]

{Verso}
[Cm] [Gm] [Bb] [F] |:]

{Coro}
Pode[Bb]roso [F]Dios
Pode[Cm]roso [Bb]Dios - [F]
[Bb] [F] [Cm] - [Bb] [F] |:]

{Puente}
[Eb] [Bb] [F] |:]
[Eb] [%]`,
  },
  {
    title: "Padre nuestro",
    artist: "Bethel",
    key: "B",
    bpm: 70,
    compas: "4/4",
    tags: ["Oración", "Rendición", "Reino de Dios"],
    tipo: ADORACION,
    chordpro: `{Intro}
[B] [%] [G#m] [E] |:]

{Verso}
[B] [%] [E] [F#] |:]

{Coro}
[E] [C#m] [G#m] [F#]

{Puente}
[E] [%] - [F#] [G#m] [F#]`,
  },
  {
    title: "Precioso Jesús",
    artist: "Esperanza de Vida",
    key: "C",
    bpm: 70,
    compas: "4/4",
    tags: ["Adoración", "Exaltación", "Comunión"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C] [G] [Am] - [F] [G] |:]

{Verso}
[C] [G/B] [Am] - [F] [G] |:]

{PreCoro}
[Am] - [G/B] [F] x3]
[Dm] [F] - [G]

{Coro}
[F] - [Am] [G] x3]
[Dm] [F] - [G] |:]
[C] [G]`,
  },
  {
    title: "Por un momento de tu presencia",
    artist: "Aliento",
    key: "G",
    bpm: 68,
    compas: "4/4",
    tags: ["Búsqueda", "Sanidad", "Hambre espiritual"],
    tipo: ADORACION,
    chordpro: `{Intro}
[G] [D] [Em] [C]
[G] [D] [Em] [C]

{Verso}
Por un [G]momento en Tu pre[Bm]sencia aahhh [Em]
[C]Por un instante de Tu amor
Por un [G]destello de Tu [Bm]gloria aahh [Em]
[C]Por un minuto nada mas

{PreCoro}
[G]Todo daria, no impor[D]taria
[Am]Lo que tenga que pasar
[D]Lo que tenga que esperar

{Coro}
Tengo [G]hambre de Ti, de Tu pre[B7]sencia
De Tu fra[Em]gancia, de Tu po[C]der

{Final}
[D] [C] [D] [G]`,
  },
  {
    title: "¿Quién podrá?",
    artist: "Coalo Zamorano / Aline Barros",
    key: "A",
    bpm: 72,
    compas: "4/4",
    tags: ["Exaltación", "Adoración", "Majestad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[A] [%] [A/C#] - [D] [A]

{Verso}
[A] [%] [A/C#] - [D] [A]

{Precoro}
[A/C#] - [D] [E] - [F#m]
[A/C#] - [D] [A]

{Coro (Santo)}
[D] [E] [C#] [F#m] - [E]
[D] [E] [F#m] - [E] [D]

{Interludio}
[E] - [F#] - [C#]
[G#] - [A] - [E] - [F#]

{Puente}
[F#m7] [E] [D] - [A/C#] [Bm] |:]
[F#m7] [E] [D] - [A/C#] [Bm]
[F#m7] [E/G#] [D] [Bm] |:]`,
  },
  {
    title: "Quiero Conocer a Jesús",
    artist: "Alessandro Vilas Boas",
    key: "G",
    bpm: 64,
    compas: "4/4",
    tags: ["Comunión", "Búsqueda", "Identidad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C] [D] [Em] [Bm] |:]

{Verso}
[C] [D] [Em] [Bm] |:]

{Coro}
[C] [D] [Em] [Bm] |:]

{Jeshua}
[C] - [Bm] [C] - [D] [Em] [Bm] |:]

{Amado}
[C] - [G/B] [Am] [G] [D] |:]`,
  },
  {
    title: "Renuévame señor Jesús",
    artist: "Marcos Witt",
    key: "D",
    bpm: 60,
    compas: "4/4",
    tags: ["Restauración", "Sanidad", "Rendición"],
    tipo: ADORACION,
    chordpro: `{Verso}
[D] - [G] [A] - [D]
[G] - [Em] [A] [%] |:]

{Coro}
[D] - [A/C#] [Bm] - [F#m]
[G] - [Em] [A] [%]
[D] - [A/C#] [Bm] - [F#m]
[G] - [A] [D] [%] |:]

{Final}
[G] [A] [D] |:]`,
  },
  {
    title: "Tumbas a Jardines",
    artist: "Elevation Worship",
    key: "B",
    bpm: 70,
    compas: "6/8",
    tags: ["Resurrección", "Milagros", "Fe", "Testimonio"],
    tipo: ADORACION,
    chordpro: `{Intro}
[B] [%] - [E] |:]

{Verso}
[B] [%] - [E]
[G#m] [F#] [E] [%] |:]

{Coro}
[B] [%] [G#m] [%] [E] [%] [B] [%] |:]

{Interludio}
[B] [%] - [E] |:]

{Puente}
[B] [%] - [E] x2]
[B] [%] [G#m] - [E] [B] x3]
[G#m] - [E] [B] [%] |:]`,
  },
  {
    title: "Tu amor no tiene fin",
    artist: "Generación 12 / Gateway",
    key: "E",
    bpm: 74,
    compas: "4/4",
    tags: ["Gratitud", "Adoración", "Confianza"],
    tipo: ADORACION,
    chordpro: `{Intro}
[A] [C#m] [E] [G#m]

{Verso}
[A] [%] [E] - [B/D#] |:]

{Coro}
[A] [%] [E] - [B/D#] [x4]

{Puente}
[A] [C#m] [E] [G#m] |:]`,
  },
  {
    title: "Trae aquí el cielo",
    artist: "Barak",
    key: "Bm",
    bpm: 70,
    compas: "4/4",
    tags: ["Avivamiento", "Búsqueda", "Espíritu Santo", "Sanidad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Bm] [%] [D] [%]

{Verso}
[D] [%] [Bm7] [%]
[G] [%] [Bm7] [A] |:]

{Precoro}
[G] [D] [Bm7] [A]

{Coro}
[D] [A] [Bm7] [G] |:]
[Bm] [%]

{Instrumental}
[D] [A] [Bm7] [G]

{Puente}
[D] [A] [Bm7] [G] x3] [G]`,
  },
  {
    title: "Tus cuerdas de amor",
    artist: "Julio Melgar",
    key: "F",
    bpm: 67,
    compas: "4/4",
    tags: ["Testimonio", "Gratitud", "Fe", "Sanidad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[Dm] [Bb] [F] [%] ||:]

{Verso}
[Dm] [Bb] [F] [%] ||:]

{Precoro}
[C] [Am/C] [Bb/C]
[F] [C/E] [Dm7] |:] [Bb]

{Coro}
[F] [Dm7] [Am7] [Bb] ||
[Gm] [Dm] [C] [%]

{Instrumental}
[Dm] [C] [Am] [Bb] |:] [Gm] [Dm7] [C] [%]`,
  },
  {
    title: "Te quiero adorar",
    artist: "Barak",
    key: "C#m",
    bpm: 73,
    compas: "4/4",
    tags: ["Adoración", "Rendición", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Intro}
[C#m] [A] |:]

{Verso}
[C#m] - [A] [E/G#] - [B]
[C#m] - [A] [B] [%] |:]

{Precoro}
[A] - [G#m] [B]
[A] [B]

{Coro}
[C#m] - [A] [E] [B/D#] |:]

{Puente}
[C#m] - [A] [B] - [G#m] |:]`,
  },
  {
    title: "Vine a adorarte",
    artist: "Tim Hughes / Marcela Gándara",
    key: "D",
    bpm: 68,
    compas: "4/4",
    tags: ["Adoración", "Gratitud", "Humildad"],
    tipo: ADORACION,
    chordpro: `{Intro}
[D] - [A] [Em] - [G] |:]

{Verso}
[D] - [A] [Em] - [G]
[D] - [A] [G] [%]

{Coro}
[D] [A] [Bm] [G]

{Puente}
[D] - [Bm] [G] [A] - [Bm] [G] |:]`,
  },
  {
    title: "Ven espíritu ven",
    artist: "Marcos Barrientos",
    key: "G",
    bpm: 60,
    compas: "4/4",
    tags: ["Comunión", "Espíritu Santo", "Rendición"],
    tipo: ADORACION,
    chordpro: `{Verso}
[G] - [D/F#]
[Em] - [G/D]
[C] - [Am7]
[D] | :]

{Coro}
[G] - [D/F#]
[Em] - [G/D]
[C] - [Am7]
[D] | :]`,
  },
  {
    title: "Yo te busco",
    artist: "Marcos Witt",
    key: "C",
    bpm: 85,
    compas: "4/4",
    tags: ["Búsqueda", "Adoración", "Espíritu Santo"],
    tipo: ADORACION,
    chordpro: `{Verso}
[C] - [F] [C] || [F] [%] [C] [%] |:]

{Coro}
[C/E] - [F] [%] [Am] - [G] [%]
[C/E] - [F] [Dm] [C] |:]`,
  },
  {
    title: "Yo navegaré",
    artist: "Sin especificar",
    key: "Dm",
    bpm: 70,
    compas: "4/4",
    tags: ["Espíritu Santo", "Avivamiento", "Adoración"],
    tipo: ADORACION,
    chordpro: `{Verso / Coro}
[Dm] [C] [Bb] [Gm] [A]
(Esta progresión circular se repite constantemente a lo largo de toda la letra)`,
  },
  {
    title: "Yo quiero más de ti",
    artist: "Jaime Murrell",
    key: "G",
    bpm: 60,
    compas: "4/4",
    tags: ["Rendición", "Consagración", "Entrega"],
    tipo: ADORACION,
    chordpro: `{Verso}
[G] [C] [D] [G] - [D/F#] [Em] [D#aug] - [D] [A/C#] - [C] [Am] [D]

{Coro}
[C] - [D] [Bm] - [Em]
[C] - [D] [G] - [G7]`,
  },
  {
    title: "Yo me rindo a Él",
    artist: "Sin especificar",
    key: "C",
    bpm: 68,
    compas: "4/4",
    tags: ["Entrega", "Consagración", "Rendición"],
    tipo: ADORACION,
    chordpro: `{Verso / Coro}
[C] - [Am] [Dm] [G] [C]
[C] [C/E] - [F] || [C] - [G] [C]`,
  },
];

/**
 * Canciones de prueba del seed demo (seed:run) y la "Prueba Multitrack": se dan de baja al
 * importar. Se identifican por título + artista exactos, así nunca se toca una canción real
 * con el mismo título (ej. "Océanos" de Hillsong Zion vs. la de prueba de Hillsong United).
 */
export const CANCIONES_DE_PRUEBA: Array<[title: string, artist: string]> = [
  ["Océanos", "Hillsong United"],
  ["Digno de Alabanza", "Marco Barrientos"],
  ["Nada Nos Separará", "Marcos Witt"],
  ["Al Que Está Sentado", "Miel San Marcos"],
  ["Sana Nuestra Tierra", "Marco Barrientos"],
  ["Aguas Vivas", "Generación 12"],
  ["Renuévame", "Marcos Witt"],
  ["Gloria a Dios en las Alturas", "Coral Cielos"],
  ["Noche de Paz Renovada", "Cielos Abiertos"],
  ["Tu Mesa", "Averly Morillo"],
  ["Cuán Grande Es Él", "Himno"],
  ["Espíritu Santo Ven", "Barak"],
  ["Levanto Mis Manos", "Samuel Hernández"],
  ["Correré", "Miel San Marcos"],
  ["Tuyo Es Mi Corazón", "Danilo Montero"],
  ["El Río de Dios", "Generación 12"],
  ["Cordero de Dios", "Cielos Abiertos"],
  ["Bendito El Que Viene", "Marcos Brunet"],
  ["Mi Refugio", "Lucía Fernández"],
  ["Hoy Te Doy Gracias", "Cielos Abiertos"],
  ["Prueba Multitrack", "Test"],
];
