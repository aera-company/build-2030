/**
 * Som da V4: três camadas, uma gramática.
 * 01 bed (scripts/make-bed-v4.py) · 02 mundo (texturas reais, sempre ao fundo) · 03 eventos do sistema
 * (a mesma família de síntese do filme da AERA, cada som em três planos: _f frente, _m meio, _b fundo).
 * A voz (AERA Narradora F1) senta dentro da mixagem: o bed abaixa 5 dB e o mundo 3 dB só enquanto há fala;
 * os eventos leem a energia real da voz palavra a palavra e só os que caem nos respiros tocam inteiros.
 */
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {B05_START, nodeLand, speaking, T01, T02, T03, T04, T06, T07, T08, T10, T11, T12, T13, T14, T14B, T15, T16, VO, VO_LINES} from '../motion/timing';
import {CHECK_AT, PIECE_SNAP} from './V4Cream';

type Z = 'f' | 'm' | 'b';
type Cue = {at: number; file: string; gain: number; z: Z};
const cue = (at: number, file: string, gain: number, z: Z = 'm'): Cue => ({at, file, gain, z});

/** impactos: ficam sob a voz (−3 dB); o resto abaixa 6 dB; o miúdo sai se cair sobre sílaba */
const IMPACT = /^(slam|invert|thud|color_wipe)/;

export const CUES_V4: Cue[] = [
  // A · abertura
  cue(T01.presentsIn, 'tick', 0.24, 'b'),
  cue(T01.trace[0], 'line_draw', 0.34),
  cue(T01.pivot[0], 'pivot', 0.4),
  cue(T02.logoRise[1] - 4, 'thud', 0.38, 'f'),
  ...[0, 5, 10, 15, 25, 30, 35, 40].map((d) => cue(T02.write[0] + 2 + d, 'tick', 0.13, 'b')),
  cue(T02.stamp, 'tick', 0.24),
  cue(T03.rise[0], 'line_draw', 0.38),
  cue(T03.rise[1] - 2, 'water_ring', 0.24),
  cue(T03.collapse[0], 'pivot', 0.32),
  cue(T04.ticks, 'tick', 0.2, 'b'),
  cue(T04.ticks + 8, 'tick', 0.16, 'b'),
  // B · três impactos, um por plano
  ...B05_START.map((s, k) => cue(s, `slam_${k + 1}`, 0.5 + k * 0.04, 'f')),
  // C · o real vira informação
  cue(T06.freeze, 'cut', 0.26, 'f'),
  cue(T06.crop[0], 'line_draw', 0.2, 'b'),
  cue(T06.crop[1], 'tick_hi', 0.26, 'f'),
  cue(T06.window[0], 'open_cell', 0.42),
  cue(T06.k1.freeze, 'cut', 0.2),
  cue(T06.k1.tag, 'tick_hi', 0.24, 'f'),
  cue(T06.k1.detach[0], 'packet_1', 0.26),
  cue(nodeLand(0), 'node_1', 0.32),
  cue(T06.p2, 'thud', 0.36, 'f'),
  cue(T06.k2.freeze, 'cut', 0.2),
  cue(T06.k2.tag, 'tick_hi', 0.24, 'f'),
  cue(T06.k2.detach[0], 'packet_2', 0.26),
  cue(nodeLand(1), 'node_2', 0.32),
  cue(T06.p3, 'open_cell', 0.3, 'b'),
  cue(T06.node3, 'packet_3', 0.24),
  cue(nodeLand(2), 'node_3', 0.32),
  cue(T06.collapse[0], 'pivot', 0.32),
  cue(T06.rise[0], 'line_draw', 0.36),
  cue(T06.converge[1] - 2, 'tick_hi', 0.44, 'f'),
  // D · AERA
  cue(T07.invert[0], 'invert', 0.7, 'f'),
  ...T07.fields.map((a, k) => cue(a, `node_${k + 1}`, 0.3)),
  cue(T07.cross[0], 'line_draw', 0.36),
  cue(T07.aera, 'thud', 0.42, 'f'),
  cue(T07.aera + 1, 'tick_hi', 0.3, 'f'),
  cue(T07.open[0], 'pivot', 0.38),
  cue(T07.absorb[0], 'pivot', 0.2, 'b'),
  cue(T07.slide[0], 'line_draw', 0.24, 'b'),
  ...[0, 1, 2, 3].map((k) => cue(T08.scatter + k * T08.scatterStep, `packet_${k + 1}`, 0.16, 'b')),
  ...PIECE_SNAP.map((a) => cue(a, 'tick_hi', 0.28, 'f')),
  cue(T08.rails[0], 'line_draw', 0.3),
  ...T08.labels.map((a) => cue(a, 'tick', 0.16, 'b')),
  ...[0, 1, 2, 3].map((k) => cue(T10.packets[0] + k * 4, `packet_${k + 1}`, 0.24)),
  ...[0, 1, 2, 3].map((k) => cue(T10.drop + k * T10.dropStep + T10.dropDur - 2, 'thud', 0.26)),
  ...[0, 1, 2, 3].map((k) => cue(T10.fill + k * T10.fillStep + 10, 'open_cell', 0.18, 'b')),
  cue(T10.exec + 4, 'tick_hi', 0.26),
  cue(T10.connect, 'line_draw', 0.22),
  ...CHECK_AT.map((a) => cue(a, 'tick_hi', 0.32, 'f')),
  cue(T10.board, 'thud', 0.36, 'f'),
  // E · tecnologia
  cue(T11.invert[0], 'invert', 0.62, 'f'),
  cue(T11.lineDown[0], 'line_draw', 0.3),
  ...[0, 1, 2, 3].map((k) => cue(T11.row + k * T11.rowStep, 'tick', 0.15, 'b')),
  cue(T11.row + 4 * T11.rowStep, 'node_2', 0.28),
  cue(T11.clip, 'thud', 0.4, 'f'),
  cue(T11.clip + T11.freeze, 'cut', 0.22),
  cue(T11.clip + T11.tag[0], 'tick_hi', 0.22, 'f'),
  cue(T11.clip + T11.tag[0] + 3, 'tick_hi', 0.18, 'f'),
  cue(T11.clip + T11.detach[0], 'packet_1', 0.24),
  cue(T11.clip + T11.detach[0] + 3, 'packet_2', 0.22),
  cue(T12.collapse[0], 'pivot', 0.3),
  cue(T12.rulerUp[0], 'line_draw', 0.32),
  cue(T12.trade[0], 'open_cell', 0.42, 'f'),
  cue(T12.tradeSwap, 'paper_sweep', 0.2, 'b'),
  cue(T12.toBar[0], 'pivot', 0.3),
  ...Array.from({length: 6}, (_, i) => cue(T12.type[0] + i * 3, 'tick', 0.1, 'b')),
  cue(T12.enter, 'packet_4', 0.36),
  cue(T12.window[0], 'open_cell', 0.3),
  cue(T12.close[0], 'pivot', 0.24, 'b'),
  cue(T13.pivot[0], 'pivot', 0.4),
  cue(T13.panels[0], 'line_draw', 0.28),
  cue(T13.logo, 'tick_hi', 0.24),
  // F · convergência, BUILD 2030, verbos, assinatura
  cue(T13.out[0], 'pivot', 0.3),
  cue(T14.tracks[0], 'node_1', 0.3),
  cue(T14.tracks[0] + 4, 'node_2', 0.3),
  cue(T14.cards[0], 'paper_sweep', 0.28),
  ...Array.from({length: 5}, (_, i) => cue(T14.cards[0] + 4 + i * 5, `packet_${(i % 4) + 1}`, 0.14, 'b')),
  cue(T14.top[0] + 6, 'thud', 0.4, 'f'),
  cue(T14.open[0], 'color_wipe', 0.44, 'f'),
  cue(T14.toWater[0], 'line_draw', 0.32),
  cue(T14.toWater[1] - 2, 'water_ring', 0.3),
  ...[0, 5, 10, 15, 22, 27, 32, 37].map((d) => cue(T14B.write[0] + 2 + d, 'tick', 0.12, 'b')),
  cue(T14B.write[1] + 2, 'thud', 0.36, 'f'),
  ...T15.verbs.map((v, k) => cue(v, `slam_${k + 3}`, 0.62, 'f')),
  cue(T16.collapse[1] - 2, 'tick_hi', 0.32, 'f'),
  cue(T16.line[0], 'line_draw', 0.3),
  cue(T16.logo + 6, 'thud', 0.32),
  cue(T16.title + 8, 'tick', 0.22),
  ...T16.labels.map((a) => cue(a, 'tick', 0.16, 'b')),
  cue(T16.aera, 'tick', 0.16, 'b'),
];

/** Silêncios: nenhuma cauda atravessa (fade de 4 frames antes). */
export const SILENCES: Array<[number, number]> = [T06.silence, T10.silence, T12.silence, T14.silence, T15.silence].map((s) => [s[0], s[1]]);
const gate = (at: number, lf: number) => {
  const t = at + lf;
  for (const [a, b] of SILENCES) {
    if (at < a && t >= a - 4 && t < b) return Math.max(0, Math.min(1, (a - t) / 4));
  }
  return 1;
};
const silent = (fr: number) => {
  let g = 1;
  for (const [a, b] of SILENCES) g = Math.min(g, Math.max(0, Math.min(1, Math.max((a - fr) / 4, (fr - b) / 4))));
  return g;
};

/** Presença da voz, por frase, com rampa de 8 frames (para o bed e o mundo). */
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
/** Fala real perto do cue (palavra a palavra). */
const onSyllable = (at: number) => {
  for (let d = -2; d <= 4; d++) if (speaking(at + d)) return true;
  return false;
};
const duckCue = (c: Cue) => {
  if (!onSyllable(c.at)) return 1;
  if (IMPACT.test(c.file)) return 0.7;
  if (c.gain < 0.25) return 0;
  return 0.5;
};

/** Camada 02 · mundo: [arquivo, de, até, ganho, início dentro do arquivo (s)] */
const WORLD: Array<[string, number, number, number, number]> = [
  ['water', 0, 176, 0.55, 0],
  ['port', 280, 380, 0.42, 2],
  ['port', 372, 670, 0.32, 6],
  ['steel', 560, 700, 0.4, 0],
  ['hum', 660, 958, 0.34, 0],
  ['engine', 764, 846, 0.36, 3],
  ['hum', 1458, 1830, 0.36, 9],
  ['engine', 1500, 1574, 0.34, 10],
  ['water', 1840, 1898, 0.42, 6],
  ['port', 1840, 2012, 0.4, 11],
  ['water', 1908, 2012, 0.4, 9],
  ['steel', 2006, 2074, 0.6, 8],
  ['water', 2070, 2138, 0.6, 12],
  ['engine', 2134, 2198, 0.52, 14],
];
const fade = (fr: number, a: number, b: number) => Math.max(0, Math.min(1, (fr - a) / 18, (b - fr) / 18));

export const V4Audio: React.FC<{bus?: number; bed?: number; world?: number; vo?: number}> = ({bus = 0.6, bed = 1.2, world = 1.25, vo = 1.3}) => (
  <>
    {/* 01 · bed: −5 dB sob a fala */}
    <Audio src={staticFile('audio/bed/bed_v4.wav')} volume={(fr) => bed * (1 - 0.44 * voActive(fr))} />
    {/* 02 · mundo: −3 dB sob a fala; some nos silêncios */}
    {WORLD.map(([file, a, b, g, off], i) => (
      <Sequence key={`w${i}`} from={a} durationInFrames={b - a}>
        <Audio src={staticFile(`audio/world/${file}.wav`)} startFrom={Math.round(off * 30)} volume={(lf) => world * g * fade(a + lf, a, b) * silent(a + lf) * (1 - 0.3 * voActive(a + lf))} />
      </Sequence>
    ))}
    {/* 03 · eventos */}
    {CUES_V4.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={150}>
        <Audio src={staticFile(`audio/sfx4/${c.file}_${c.z}.wav`)} volume={(lf) => c.gain * bus * gate(c.at, lf) * duckCue(c)} />
      </Sequence>
    ))}
    {/* voz */}
    {Object.entries(VO_LINES).map(([id, l]) =>
      id in VO ? (
        <Sequence key={id} from={VO[id as keyof typeof VO]} durationInFrames={l.frames + 4}>
          <Audio src={staticFile(l.file)} volume={vo} />
        </Sequence>
      ) : null,
    )}
  </>
);
