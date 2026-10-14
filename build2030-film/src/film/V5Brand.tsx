/**
 * GAVEA / BUILD 2030 · V5 · B · frente 01 · Brand & Marketing Direction.
 * A régua dos planos sobe e o campo claro se abre a partir dela: a régua vira a estrutura da AERA.
 * "a AERA entra para construir": a cabeça corre na régua e, em cada serviço falado, planta um nó de onde sobe
 * uma peça real da marca (wireframe → imagem). "conectando comunicação, comercial e oportunidades": rotas saem
 * das peças até três destinos e começam a correr. Não é lista: é estrutura que liga trabalho a resultado.
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, H, M, W} from '../motion/design';
import {glide, lerp, Pt, ramp, settle} from '../motion/easing';
import {D_X, PIECE5, S_X, Y_D, Y_R} from '../motion/geometry';
import {T05, T_B} from '../motion/timing';
import {DUO_FILTER} from '../primitives/Grade';
import {LineMB, type LineState} from '../primitives/Line';
import {ClipVideo, inset, StillImg} from '../primitives/Media';
import {TickLabel} from '../primitives/Type';

const SERVICES = ['Posicionamento', 'Design system', 'Planejamento', 'Direção criativa'];
const MEDIA = [
  {src: 'media/v3/landing.mp4', kind: 'clip'},
  {src: 'media/v3/designsystem.png', kind: 'still'},
  {src: 'media/v3/stacker.mp4', kind: 'clip'},
  {src: 'media/v3/pessoas.mp4', kind: 'clip'},
] as const;
const DEST = ['Comunicação', 'Conexão comercial', 'Oportunidades'];
/** [serviço, destino] */
const ROUTES: Array<[number, number]> = [[1, 0], [3, 0], [0, 1], [2, 1], [2, 2], [3, 2]];
const PIECE_TOP = Y_R - 22 - PIECE5.h;
const END = T_B.invert[1] + 2;

const bez = (s: number, d: number, t: number): Pt => {
  const p0: Pt = [S_X[s], Y_R];
  const p1: Pt = [S_X[s], Y_R + 170];
  const p2: Pt = [D_X[d], Y_D - 170];
  const p3: Pt = [D_X[d], Y_D];
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
};
const routePath = (s: number, d: number) => `M ${S_X[s]} ${Y_R} C ${S_X[s]} ${Y_R + 170} ${D_X[d]} ${Y_D - 170} ${D_X[d]} ${Y_D}`;

/** a cabeça: entra pela esquerda na palavra "AERA" e para em cada serviço quando ele é dito */
const KEYS: Array<[number, number]> = [[T_B.enter, M], ...T_B.services.map((t, k): [number, number] => [t, S_X[k]])];
const headX = (f: number) => {
  if (f <= KEYS[0][0]) return M;
  for (let i = 1; i < KEYS.length; i++) if (f < KEYS[i][0]) return lerp(KEYS[i - 1][1], KEYS[i][1], ramp(f, KEYS[i - 1][0], KEYS[i][0], glide));
  return KEYS[KEYS.length - 1][1];
};

export const lineBrand = (f: number): LineState | null => {
  if (f < T05.open[0] || f >= END) return null;
  const nodes = S_X.map((x, k) => ({p: [x, Y_R] as Pt, r: 5.5, o: ramp(f, T_B.services[k] - 1, T_B.services[k] + 3)})).filter((n) => n.o > 0);
  const headO = f >= T_B.enter ? 1 - ramp(f, T_B.services[3] + 4, T_B.services[3] + 16) : 0;
  return {pts: [[M, Y_R], [W - M, Y_R]], color: C.teal, nodes, head: headO > 0 ? {p: [headX(f), Y_R], o: headO} : null, headColor: C.teal};
};

/** A estrutura vem antes do conteúdo: quatro molduras tracejadas sobem da régua em "marketing". */
const Skeleton: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_B.index) return null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
      {S_X.map((x, k) => {
        const a = T_B.index + k * 4;
        const g = ramp(f, a, a + 14, settle);
        const gone = ramp(f, T_B.services[k] + 6, T_B.services[k] + 14);
        if (g <= 0 || gone >= 1) return null;
        const h = PIECE5.h * g;
        return (
          <g key={k} opacity={0.45 * (1 - gone)}>
            <rect x={x - PIECE5.w / 2} y={PIECE_TOP + PIECE5.h - h} width={PIECE5.w} height={h} fill="none" stroke={C.ink} strokeWidth={1} strokeDasharray="5 6" />
            <line x1={x} y1={Y_R} x2={x} y2={Y_R - 22 * g} stroke={C.ink} strokeWidth={1} />
          </g>
        );
      })}
    </svg>
  );
};

const Pieces: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {MEDIA.map((m, k) => {
        const t = T_B.services[k];
        if (f < t - 1) return null;
        const g = ramp(f, t, t + 12, settle);
        const fill = ramp(f, t + 8, t + 22, settle);
        const x = S_X[k] - PIECE5.w / 2;
        const h = PIECE5.h * g;
        const u = ramp(f, t, END, glide);
        return (
          <div key={k} style={{position: 'absolute', left: x, top: PIECE_TOP + PIECE5.h - h, width: PIECE5.w, height: h, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, bottom: 0, width: PIECE5.w, height: PIECE5.h}}>
              <div style={{position: 'absolute', inset: 0, clipPath: inset(PIECE5.h * (1 - fill), 0, 0, 0), background: C.navyDeep, overflow: 'hidden'}}>
                <div style={{position: 'absolute', inset: 0, filter: DUO_FILTER, transform: `scale(${lerp(1.12, 1.0, u)})`}}>
                  {m.kind === 'clip' ? <ClipVideo src={m.src} from={t} /> : <StillImg src={m.src} pos={`50% ${lerp(20, 45, u)}%`} />}
                </div>
              </div>
              <svg width={PIECE5.w} height={PIECE5.h} style={{position: 'absolute', inset: 0}}>
                <rect x={0.5} y={0.5} width={PIECE5.w - 1} height={PIECE5.h - 1} fill="none" stroke={C.ink} strokeWidth={1.2} opacity={lerp(0.75, 0.3, fill)} />
                <g opacity={(1 - fill) * g} stroke={C.ink} strokeWidth={1}>
                  <line x1={16} y1={24} x2={140} y2={24} />
                  <line x1={16} y1={38} x2={96} y2={38} />
                  <rect x={16} y={58} width={PIECE5.w - 32} height={PIECE5.h - 78} fill="none" />
                </g>
              </svg>
            </div>
          </div>
        );
      })}
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {S_X.map((x, k) => {
          const g = ramp(f, T_B.services[k], T_B.services[k] + 6, settle);
          return g > 0 ? <line key={k} x1={x} y1={Y_R} x2={x} y2={Y_R - 22 * g} stroke={C.teal} strokeWidth={1.6} /> : null;
        })}
      </svg>
      {SERVICES.map((s, k) => (
        <TickLabel key={s} text={s} x={S_X[k] - PIECE5.w / 2} y={PIECE_TOP - 28} at={T_B.services[k] + 2} size={16} color={C.ink} tracking={0.16} />
      ))}
    </>
  );
};

const Routes: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_B.dest[0] - 6) return null;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {ROUTES.map(([s, d], i) => {
          const a = T_B.dest[d] - 6 + (i % 2) * 3;
          const draw = ramp(f, a, a + 14, settle);
          if (draw <= 0) return null;
          const dots: React.ReactNode[] = [];
          if (draw >= 1) {
            for (let j = 0; j < 2; j++) {
              const ph = ((f - a - 14 + j * 17 + i * 5) % 34) / 34;
              const p = bez(s, d, ph);
              dots.push(<circle key={j} cx={p[0]} cy={p[1]} r={3.6} fill={C.teal} opacity={Math.min(1, ph * 6, (1 - ph) * 6)} />);
            }
          }
          return (
            <g key={i}>
              <path d={routePath(s, d)} fill="none" stroke={C.teal} strokeWidth={1.3} opacity={0.75} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
              {dots}
            </g>
          );
        })}
        {D_X.map((x, d) => {
          const g = ramp(f, T_B.dest[d], T_B.dest[d] + 8, settle);
          return g > 0 ? (
            <g key={d}>
              <circle cx={x} cy={Y_D} r={7 * g} fill={C.teal} />
              <circle cx={x} cy={Y_D} r={18 * g} fill="none" stroke={C.teal} strokeWidth={1} opacity={0.4 * g} />
            </g>
          ) : null;
        })}
      </svg>
      {DEST.map((n, d) => (
        <TickLabel key={n} text={n} x={D_X[d] + 26} y={Y_D - 9} at={T_B.dest[d] + 1} size={17} color={C.ink} tracking={0.16} />
      ))}
    </>
  );
};

export const BrandFront: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T05.open[0] || f >= END) return null;
  const o = ramp(f, T05.open[0], T05.open[1], settle);
  const reach = Math.max(Y_R, H - Y_R) + 20;
  const push = lerp(1, 1.035, ramp(f, T05.open[0], END, glide));
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: C.cream, clipPath: inset(Y_R - reach * o, 0, H - Y_R - reach * o, 0)}} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: `${W / 2}px ${Y_R}px`}}>
        <TickLabel text="01 · Brand & Marketing Direction" x={M} y={64} at={T_B.index} size={15} color={C.teal} />
        <TickLabel text="AERA · Direção" x={M} y={Y_R - 32} at={T_B.enter} size={16} color={C.teal} tracking={0.18} />
        <Skeleton />
        <Pieces />
        <Routes />
        <LineMB at={lineBrand} f={f} />
      </div>
    </>
  );
};
