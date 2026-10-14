import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import voManifest from '../data/voV3.json';
import {B05_START, SERVICE_AT, T01, T02, T03, T04, T06, T07, T08, T09, T10, T11, T12, T13, T14, T15, T16, VO} from '../motion/timing';

/**
 * Som da V3: cada evento gráfico tem o seu som, e só ele. Sem música.
 * Bed grave sintetizado (scripts/make-bed-v3.py) com os dois silêncios embutidos.
 * Voz: só toca o que scripts/gen-vo.mjs gerou (src/data/voV3.json); sem chave, o filme sai só com som.
 */
type Cue = {at: number; file: string; gain: number};

const writeTicks: Cue[] = [0, 4, 8, 12, 21, 25, 29, 33].map((d) => ({at: T02.write[0] + 2 + d, file: 'tick', gain: 0.16}));
const slams = ['slam_1', 'slam_2', 'slam_3', 'slam_4', 'slam_5'];
const typeTicks: Cue[] = Array.from({length: 6}, (_, i) => ({at: T12.type[0] + i * 3, file: 'tick', gain: 0.09}));

export const CUES_V3: Cue[] = [
  // B01–B07
  {at: T01.presentsIn, file: 'tick', gain: 0.3},
  {at: T01.trace[0], file: 'light_seam', gain: 0.42},
  {at: T01.straighten[0], file: 'line_draw', gain: 0.3},
  {at: T01.pivot[0], file: 'pivot', gain: 0.45},
  {at: T02.logoRise[0], file: 'tick_hi', gain: 0.3},
  {at: T02.logoRise[1] - 4, file: 'thud', gain: 0.42},
  ...writeTicks,
  {at: T02.stamp, file: 'tick', gain: 0.3},
  {at: T03.rise[0], file: 'line_draw', gain: 0.42},
  {at: T03.rise[1] - 2, file: 'water_ring', gain: 0.28},
  {at: T03.collapse[0], file: 'pivot', gain: 0.38},
  {at: T04.ticks, file: 'tick', gain: 0.22},
  {at: T04.ticks + 6, file: 'tick', gain: 0.18},
  {at: T04.anchor, file: 'tick_hi', gain: 0.32},
  ...B05_START.map((s, k) => ({at: s, file: slams[k], gain: 0.48 + k * 0.045})),
  {at: B05_START[3] + 16, file: 'open_cell', gain: 0.36},
  {at: T06.pull[0], file: 'thud', gain: 0.5},
  ...[0, 1, 2].map((i) => ({at: T06.fold[0] + i * 4, file: `packet_${i + 1}`, gain: 0.3})),
  ...[0, 1, 2, 3, 4].map((i) => ({at: T06.fold[0] + 12 + i * 3, file: `node_${(i % 3) + 1}`, gain: 0.3})),
  {at: T06.converge[0], file: 'line_draw', gain: 0.38},
  {at: T06.converge[1] - 2, file: 'tick_hi', gain: 0.48},
  {at: T07.invert[0], file: 'invert', gain: 0.72},
  {at: T07.pivot[0], file: 'pivot', gain: 0.45},
  {at: T07.letters[0], file: 'light_seam', gain: 0.3},
  {at: T07.iFill[0], file: 'tick', gain: 0.38},
  {at: T07.branch1[0], file: 'node_1', gain: 0.42},
  {at: T07.label1, file: 'tick', gain: 0.24},
  {at: T07.branch2[0], file: 'node_2', gain: 0.42},
  {at: T07.label2, file: 'tick', gain: 0.24},
  // B08 · camadas; cada serviço chega com a palavra
  {at: T08.rails[0], file: 'line_draw', gain: 0.32},
  ...T08.labels.map((l) => ({at: l, file: 'tick', gain: 0.24})),
  ...SERVICE_AT.map((t, k) => ({at: t, file: `node_${(k % 3) + 1}`, gain: 0.34})),
  // B09 · direção: wireframes desenhados, descem até a agência
  ...[0, 1, 2, 3].map((k) => ({at: T09.wire + k * T09.wireStep, file: 'line_draw', gain: 0.14})),
  ...[0, 1, 2, 3].map((k) => ({at: T09.drop + k * 5 + T09.dropDur - 2, file: 'thud', gain: 0.32})),
  // B10 · execução, conexão, critério, aprovação
  ...[0, 1, 2, 3].map((k) => ({at: T10.fill + k * T10.fillStep + 10, file: 'open_cell', gain: 0.22})),
  ...[0, 1, 2, 3].map((k) => ({at: T10.connect + k * 3, file: `packet_${k + 1}`, gain: 0.26})),
  {at: T10.exec + 4, file: 'tick_hi', gain: 0.3},
  ...[0, 1, 2, 3].map((k) => ({at: T10.approve + k * T10.riseStep + 11, file: 'tick_hi', gain: 0.3})),
  {at: T10.board, file: 'thud', gain: 0.36},
  // B11 · de volta ao navy; o real vira informação
  {at: T11.invert[0], file: 'invert', gain: 0.6},
  {at: T11.lineDown[0], file: 'line_draw', gain: 0.3},
  ...T11.clips.flatMap((c, k) => [
    {at: c, file: slams[k + 1], gain: 0.5},
    {at: c + T11.freeze, file: 'cut', gain: 0.22},
    {at: c + T11.tag[0], file: 'tick', gain: 0.22},
    {at: c + T11.detach[0], file: `packet_${k + 1}`, gain: 0.26},
  ]),
  // B12 · GAVEA Trade → futuro Portal GAVEA
  {at: T12.collapse[0], file: 'pivot', gain: 0.3},
  {at: T12.rulerUp[0], file: 'line_draw', gain: 0.32},
  {at: T12.trade[0], file: 'open_cell', gain: 0.36},
  {at: T12.tradeSwap, file: 'paper_sweep', gain: 0.22},
  {at: T12.toBar[0], file: 'pivot', gain: 0.3},
  ...typeTicks,
  {at: T12.enter, file: 'packet_4', gain: 0.38},
  {at: T12.window[0], file: 'open_cell', gain: 0.3},
  {at: T12.close[0], file: 'pivot', gain: 0.24},
  // B13 · costura
  {at: T13.pivot[0], file: 'pivot', gain: 0.42},
  {at: T13.panels[0], file: 'light_seam', gain: 0.3},
  {at: T13.logo, file: 'tick_hi', gain: 0.26},
  // B14 · duas trilhas convergem; memória; cor
  {at: T13.out[0], file: 'pivot', gain: 0.32},
  {at: T14.tracks[0], file: 'node_1', gain: 0.32},
  {at: T14.tracks[0] + 4, file: 'node_2', gain: 0.32},
  {at: T14.cards[0], file: 'paper_sweep', gain: 0.3},
  ...Array.from({length: 5}, (_, i) => ({at: T14.cards[0] + 4 + i * 5, file: `packet_${(i % 4) + 1}`, gain: 0.16})),
  {at: T14.top[0] + 6, file: 'thud', gain: 0.42},
  {at: T14.open[0], file: 'color_wipe', gain: 0.46},
  {at: T14.toWater[0], file: 'line_draw', gain: 0.34},
  {at: T14.toWater[1] - 2, file: 'water_ring', gain: 0.34},
  // B15 · verbos: o corte cai na palavra
  {at: T15.lineDrop[0], file: 'line_draw', gain: 0.2},
  ...T15.verbs.map((v, k) => ({at: v, file: slams[k + 2], gain: 0.62})),
  // B16 · assinatura
  {at: T16.collapse[1] - 2, file: 'tick_hi', gain: 0.32},
  {at: T16.line[0], file: 'line_draw', gain: 0.32},
  {at: T16.logo + 6, file: 'thud', gain: 0.34},
  {at: T16.title + 8, file: 'tick', gain: 0.24},
  ...T16.labels.map((l) => ({at: l, file: 'tick', gain: 0.18})),
  {at: T16.aera, file: 'tick', gain: 0.18},
];

/** Silêncios: nenhuma cauda atravessa (fade de 4 frames antes). */
const SILENCES: Array<[number, number]> = [
  [T06.silence[0], T06.silence[1]],
  [T15.silence[0], T15.silence[1]],
];
const gate = (at: number, lf: number) => {
  const t = at + lf;
  for (const [a, b] of SILENCES) {
    if (at < a && t >= a - 4 && t < b) return Math.max(0, Math.min(1, (a - t) / 4));
  }
  return 1;
};

const VO_LINES = (voManifest as {lines: Record<string, {file: string; frames: number}>}).lines;
/** Bed abaixa sob a voz (rampa de 6 frames). */
const voActive = (fr: number) => {
  let a = 0;
  for (const [id, l] of Object.entries(VO_LINES)) {
    const s = VO[id as keyof typeof VO];
    if (s === undefined) continue;
    const e = s + l.frames;
    a = Math.max(a, Math.min(1, Math.max(0, (fr - (s - 6)) / 6), Math.max(0, (e + 6 - fr) / 6)));
  }
  return a;
};

/** Sob a voz: efeitos −6 dB; ticks e pacotes miúdos (ganho < 0,25) saem; slams e inversões ficam. */
const duckSfx = (c: Cue) => {
  const v = voActive(c.at);
  if (v < 0.5) return 1;
  if (c.gain < 0.25 && !c.file.startsWith('slam')) return 0;
  return c.file.startsWith('slam') || c.file === 'invert' ? 0.7 : 0.5;
};

export const V3Audio: React.FC<{bus?: number; bed?: number; vo?: number}> = ({bus = 0.55, bed = 0.85, vo = 1.35}) => (
  <>
    <Audio src={staticFile('audio/bed/bed_v3.wav')} volume={(fr) => bed * (1 - 0.45 * voActive(fr))} />
    {CUES_V3.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={150}>
        <Audio src={staticFile(`audio/sfx/${c.file}.wav`)} volume={(lf) => c.gain * bus * gate(c.at, lf) * duckSfx(c)} />
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
