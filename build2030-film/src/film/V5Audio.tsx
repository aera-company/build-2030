/**
 * Som da V5: quatro camadas, com hierarquia.
 * 01 MÚSICA (scripts/make-music-v5.py, 90 BPM): carrega a continuidade e os acentos; abaixa 5 dB só sob a fala.
 * 02 VOZ (AERA Narradora F1, src/data/voV5.json).
 * 03 MUNDO: água, porto, aço, máquina, sempre ao fundo e com passa-alta em 140 Hz (nada de grave contínuo).
 * 04 SISTEMA: só os eventos que importam (nascimento de linha, travas, inversões, janelas), em três planos.
 * O grave é pontuação: está nos acentos da música, não em um drone.
 */
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {FILM_END, speaking, T01, T02, T03, T05, T_A, T_B, T_C, T_D, T_E, T12, T15, T16, VO, VO_LINES} from '../motion/timing';

type Z = 'f' | 'm' | 'b';
type Cue = {at: number; file: string; gain: number; z: Z};
const cue = (at: number, file: string, gain: number, z: Z = 'm'): Cue => ({at, file, gain, z});
const IMPACT = /^(slam|invert|thud|color_wipe)/;

export const CUES_V5: Cue[] = [
  // A
  cue(T01.trace[0], 'line_draw', 0.26),
  cue(T02.logoRise[1] - 3, 'tick_hi', 0.22, 'f'),
  ...[0, 9, 18, 27].map((d) => cue(T02.write[0] + 2 + d, 'tick', 0.08, 'b')),
  cue(T03.rise[0], 'line_draw', 0.26),
  cue(T05.collapse[0], 'pivot', 0.22),
  // B · frente 01
  cue(T05.open[0], 'open_cell', 0.3),
  cue(T_B.enter, 'line_draw', 0.18),
  ...T_B.services.map((t, k) => cue(t, `node_${(k % 3) + 1}`, 0.22)),
  cue(T_B.dest[0] - 6, 'line_draw', 0.14, 'b'),
  ...T_B.dest.map((t) => cue(t, 'tick_hi', 0.2)),
  // C · frente 02
  cue(T_B.invert[0], 'invert', 0.45, 'f'),
  cue(T_C.need, 'thud', 0.22),
  cue(T_C.freeze, 'cut', 0.16),
  cue(T_C.tag, 'tick_hi', 0.18, 'f'),
  cue(T_C.ai, 'open_cell', 0.2, 'b'),
  cue(T_C.aiNode, 'packet_3', 0.2),
  ...T_C.row.slice(1).map((t, k) => cue(t, `node_${(k % 3) + 1}`, 0.18, 'b')),
  cue(T12.trade[0], 'open_cell', 0.32, 'f'),
  cue(T12.toBar[0], 'pivot', 0.22),
  ...Array.from({length: 5}, (_, i) => cue(T12.type[0] + i * 3, 'tick', 0.07, 'b')),
  cue(T12.enter, 'packet_4', 0.28),
  cue(T12.window[0], 'open_cell', 0.24),
  cue(T12.close[0], 'pivot', 0.2, 'b'),
  // D · o encontro
  cue(T_D.invert[0], 'invert', 0.5, 'f'),
  cue(T_D.converge[0], 'line_draw', 0.3),
  cue(T_D.converge[1], 'tick_hi', 0.32, 'f'),
  ...T_D.fields.map((t, k) => cue(t, `node_${k + 1}`, 0.18)),
  cue(T_D.pulse[0], 'line_draw', 0.2, 'b'), // a luz corre até o logo; o logo em si é o sino da música
  // E · estratégia em sistema, sistema em movimento
  ...[0, 5, 10].map((d, k) => cue(T_E.scatter + d, `packet_${k + 1}`, 0.1, 'b')),
  cue(T_E.split[0], 'line_draw', 0.26),
  cue(T_E.snap[1] - 4, 'tick_hi', 0.28, 'f'),
  cue(T_E.arcs, 'packet_1', 0.14),
  cue(T_E.arcs + 9, 'packet_2', 0.12),
  cue(T_A.agency - 8, 'line_draw', 0.2), // o eixo da AERA desce até a execução
  cue(T_E.hero[0], 'open_cell', 0.28),
  cue(T_E.hero[1] - 8, 'color_wipe', 0.3, 'f'),
  // F · verbos (o acento é da música; aqui só o transiente do corte) e assinatura
  ...T15.verbs.map((t) => cue(t, 'cut', 0.14, 'f')), // o acento é da música; aqui só o transiente do corte
  cue(T16.collapse[1] - 2, 'tick_hi', 0.26, 'f'),
  cue(T16.line[0], 'line_draw', 0.22),
  cue(T16.title + 6, 'tick', 0.12),
  ...T16.labels.map((t) => cue(t, 'tick', 0.09, 'b')),
];

/** Camada 03 · mundo: [arquivo, de, até, ganho, início dentro do arquivo (s)] */
const WORLD: Array<[string, number, number, number, number]> = [
  ['water_hp', 0, 150, 0.45, 0],
  ['port_hp', 156, 400, 0.3, 2],
  ['engine_hp', 818, 900, 0.22, 3],
  ['port_hp', 1226, 1500, 0.16, 8],
  ['steel_hp', 1894, 1962, 0.42, 8],
  ['water_hp', 1954, 2022, 0.42, 12],
  ['port_hp', 2014, 2060, 0.42, 11],
];
const fade = (fr: number, a: number, b: number) => Math.max(0, Math.min(1, (fr - a) / 14, (b - fr) / 14));

/** Presença da voz por bloco, rampa de 8 frames (para música e mundo). */
const voActive = (fr: number) => {
  let a = 0;
  for (const [id, l] of Object.entries(VO_LINES)) {
    const s = VO[id as keyof typeof VO];
    if (s === undefined) continue;
    const e = s + l.frames;
    a = Math.max(a, Math.min(1, Math.max(0, (fr - (s - 8)) / 8), Math.max(0, (e + 8 - fr) / 8)));
  }
  return a;
};
const onSyllable = (at: number) => {
  for (let d = -2; d <= 4; d++) if (speaking(at + d)) return true;
  return false;
};
const duckCue = (c: Cue) => {
  if (!onSyllable(c.at)) return 1;
  if (IMPACT.test(c.file)) return 0.7;
  if (c.gain < 0.2) return 0;
  return 0.5;
};

export const V5Audio: React.FC<{music?: number; bus?: number; world?: number; vo?: number}> = ({music = 1.0, bus = 0.6, world = 1.0, vo = 1.3}) => (
  <>
    <Audio src={staticFile('audio/music/music_v5.wav')} volume={(fr) => music * (1 - 0.44 * voActive(fr))} />
    {/* ar contínuo e muito baixo por baixo de tudo: os respiros da voz nunca caem no vazio */}
    <Audio src={staticFile('audio/world/port_hp.wav')} loop volume={(fr) => world * 0.1 * Math.min(1, fr / 12, (FILM_END - fr) / 2)} />
    {WORLD.map(([file, a, b, g, off], i) => (
      <Sequence key={`w${i}`} from={a} durationInFrames={b - a}>
        <Audio src={staticFile(`audio/world/${file}.wav`)} startFrom={Math.round(off * 30)} volume={(lf) => world * g * fade(a + lf, a, b) * (1 - 0.3 * voActive(a + lf))} />
      </Sequence>
    ))}
    {CUES_V5.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={150}>
        <Audio src={staticFile(`audio/sfx4/${c.file}_${c.z}.wav`)} volume={c.gain * bus * duckCue(c)} />
      </Sequence>
    ))}
    {Object.entries(VO_LINES).map(([id, l]) =>
      id in VO ? (
        <Sequence key={id} from={VO[id as keyof typeof VO]} durationInFrames={l.frames + 4}>
          <Audio src={staticFile(l.file)} volume={vo} />
        </Sequence>
      ) : null,
    )}
  </>
);
