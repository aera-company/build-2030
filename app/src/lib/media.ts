/* ============================================================
   MANIFESTO DE MÍDIA
   Motion não conhece arquivo. Conhece este manifesto.
   Trocar um asset amanhã = trocar uma entrada aqui.
   Fonte de tudo hoje: footage real da P-35 (drone, 848 px),
   recortada sem a marca d'água e ampliada para 1600/1280 px.
   ============================================================ */

export type SequenceSource = {
  type: "sequence";
  /** Quantidade de frames. */
  count: number;
  /** Caminho do frame n (1-based). */
  path: (n: number) => string;
  /** Poster imediato (frame 1). */
  poster: string;
  /** Proporção nativa do frame. */
  aspect: number;
};

export type VideoSource = {
  type: "video";
  src: string;
  poster: string;
  aspect: number;
};

export type ImageSource = {
  type: "image";
  src: string;
  aspect: number;
};

export type MediaSource = SequenceSource | VideoSource | ImageSource;

/** Sequência do hero: zenital da P-35 rebocada (0:50–0:58 da fonte), 12 fps. */
export const HERO_SEQUENCE: SequenceSource = {
  type: "sequence",
  count: 96,
  path: (n) => `/media/hero/frame_${String(n).padStart(4, "0")}.webp`,
  poster: "/media/hero/poster.webp",
  aspect: 16 / 9,
};

const clip = (name: string): VideoSource => ({
  type: "video",
  src: `/media/clips/${name}.mp4`,
  poster: `/media/clips/${name}.webp`,
  aspect: 16 / 9,
});

/** Janelas de material real. Nome = o que a imagem mostra, sem telemetria. */
export const CLIPS = {
  /** Baía de Guanabara, popa e ponte ao fundo. */
  mar: clip("mar"),
  /** Proa, casco e rebocador: aço. */
  aco: clip("aco"),
  /** Entrada no dique seco, zenital: porto. */
  porto: clip("porto"),
  /** Casco no cais, zenital, galpões. */
  cais: clip("cais"),
  /** Equipe com cabos e defensa GAVEA LOGÍSTICA: operação. */
  operacao: clip("operacao"),
  /** Stacker GAVEA LOGÍSTICA, macro: equipamento. */
  equipamento: clip("equipamento"),
  /** Equipe no cais. */
  equipe: clip("equipe"),
  /** Popa com serra ao fundo. */
  baia: clip("baia"),
} as const;

export const BRAND = {
  /** Marca oficial GAVEA GROUP, horizontal, branca. Entra intacta. */
  groupHorizontalWhite: {
    src: "/brand/gavea-group-hor-branco.png",
    width: 3567,
    height: 622,
    alt: "GAVEA GROUP",
  },
} as const;
