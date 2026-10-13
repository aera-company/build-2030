/** Cues de som da prova: frame, arquivo em public/audio/sfx, ganho. */
export type Cue = {at: number; file: string; gain: number};
import {SPRINT, T} from './proof';

const sprintHits = SPRINT.map((s, i) => ({at: s.at, file: i % 2 ? 'thud' : `slam_${(i % 5) + 1}`, gain: 0.55}));

export const CUES: Cue[] = [
  {at: 0, file: 'riser', gain: 0.5},
  ...sprintHits,
  {at: T.presentsIn, file: 'tick', gain: 0.5},
  {at: T.mark, file: 'thud', gain: 0.7},
  {at: T.build, file: 'tick_hi', gain: 0.5},
  {at: T.world, file: 'port_ambience', gain: 0.35},
  ...T.labels.map((f) => ({at: f, file: 'tick', gain: 0.5})),
  {at: T.punch1.at, file: 'slam_2', gain: 0.5},
  {at: T.punch2.at, file: 'slam_3', gain: 0.5},
  {at: T.system, file: 'node_1', gain: 0.6},
  {at: T.system + 10, file: 'node_2', gain: 0.6},
  {at: T.system + 20, file: 'node_3', gain: 0.6},
  {at: T.synthOne, file: 'pivot', gain: 0.6},
  {at: T.synthMany, file: 'pivot', gain: 0.5},
  {at: T.oss, file: 'tick_hi', gain: 0.5},
  {at: T.invert, file: 'invert', gain: 0.7},
  {at: T.line, file: 'line_draw', gain: 0.6},
  {at: T.direction, file: 'light_seam', gain: 0.6},
  {at: T.direction + 8, file: 'tick', gain: 0.4},
  {at: T.direction + 20, file: 'tick', gain: 0.4},
  {at: T.direction + 32, file: 'tick', gain: 0.4},
  {at: T.board, file: 'tick', gain: 0.5},
  ...T.fronts.map((f, i) => ({at: f, file: `node_${(i % 3) + 1}`, gain: 0.5})),
  ...T.verbs.map((f) => ({at: f, file: 'thud', gain: 0.55})),
  {at: T.cut, file: 'cut', gain: 0.8},
  {at: T.brand, file: 'line_draw', gain: 0.5},
];
