/**
 * GAVEA / BUILD 2030 · V4 · D · o campo claro.
 * D1 o ponto inverte o campo; MARCA, NEGÓCIO e TECNOLOGIA nascem como três campos; a linha cruza os três
 *    e chega ao centro na palavra "AERA"; em "atuar" a cruz se abre.
 * D2 a cruz vira eixo e camada AERA; em "estratégia" peças soltas; em "sistema" elas travam e as camadas se estendem.
 * D3 em "movimento": a direção sai do eixo, as peças descem (execução), viram imagem, a AERA conecta,
 *    sobem e são validadas na camada AERA até a liderança. O último check devolve o filme ao navy.
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {wordWidth} from '../components/GlyphWord';
import {C, H, M, W} from '../motion/design';
import {glide, lerp, leave, Pt, ramp, settle} from '../motion/easing';
import {E0, FIELD, FIELD_ANG, I_X, RAILS} from '../motion/geometry';
import {T07, T08, T10, T11} from '../motion/timing';
import {DUO_FILTER} from '../primitives/Grade';
import {LineMB, type LineState} from '../primitives/Line';
import {ClipVideo, inset, StillImg} from '../primitives/Media';
import {BlurDef, ImpactWord, TickLabel} from '../primitives/Type';

export const CREAM_END = T11.invert[1] + 2;

/* ================================================================== D1 · o encontro */

const crossHead = (f: number) => lerp(-20, E0[0], ramp(f, T07.cross[0], T07.cross[1], settle));
const absorb = (f: number) => ramp(f, T07.absorb[0], T07.absorb[1], glide);
const fieldCenter = (f: number, k: number): Pt => {
  const d = FIELD.d * (1 - absorb(f));
  return [E0[0] + Math.cos(FIELD_ANG[k]) * d, E0[1] + Math.sin(FIELD_ANG[k]) * d];
};
/** frame em que a cabeça da linha entra no campo k */
const entryAt = (k: number) => {
  const c = fieldCenter(T07.cross[0], k);
  const dy = c[1] - E0[1];
  const x = c[0] - Math.sqrt(FIELD.r * FIELD.r - dy * dy);
  for (let t = T07.cross[0]; t <= T07.cross[1]; t++) if (crossHead(t) >= x) return t;
  return T07.cross[1];
};
const ENTRY = [0, 1, 2].map(entryAt);
const FIELD_NAMES = ['Marca', 'Negócio', 'Tecnologia'];

const Fields: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T07.fields[0] - 1 || f > T07.absorb[1]) return null;
  const ab = absorb(f);
  const lit = ramp(f, T07.aera - 2, T07.aera + 6, settle) * (1 - ramp(f, T07.open[1], T07.absorb[1], glide));
  const circles = [0, 1, 2].map((k) => {
    const g = ramp(f, T07.fields[k], T07.fields[k] + 20, settle);
    return {c: fieldCenter(f, k), r: FIELD.r * lerp(0.86, 1, g) * (1 - ab), g};
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
      <defs>
        {circles.map((c, k) => (
          <clipPath key={k} id={`fd${k}`}>
            <circle cx={c.c[0]} cy={c.c[1]} r={Math.max(0.1, c.r)} />
          </clipPath>
        ))}
      </defs>
      {circles.map((c, k) =>
        c.g > 0 ? (
          <circle key={k} cx={c.c[0]} cy={c.c[1]} r={Math.max(0.1, c.r)} fill="rgba(27,143,181,0.045)" opacity={c.g} />
        ) : null,
      )}
      {/* a interseção dos três acende quando a AERA é dita */}
      {lit > 0 ? (
        <g clipPath="url(#fd0)">
          <g clipPath="url(#fd1)">
            <circle cx={circles[2].c[0]} cy={circles[2].c[1]} r={Math.max(0.1, circles[2].r)} fill={C.teal} opacity={0.16 * lit} />
          </g>
        </g>
      ) : null}
      {circles.map((c, k) => {
        if (c.g <= 0) return null;
        const hit = Math.max(0, 1 - Math.abs(f - ENTRY[k] - 3) / 9);
        return (
          <circle
            key={`s${k}`}
            cx={c.c[0]}
            cy={c.c[1]}
            r={Math.max(0.1, c.r)}
            fill="none"
            stroke={hit > 0 ? C.teal : C.ink}
            strokeWidth={1.3 + 1.2 * hit}
            opacity={lerp(0.42, 1, hit)}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - c.g}
            transform={`rotate(${[-200, -20, 70][k]} ${c.c[0]} ${c.c[1]})`}
          />
        );
      })}
    </svg>
  );
};

const FieldLabels: React.FC = () => {
  const pos: Array<{x: number; y: number; align: 'left' | 'right'}> = [0, 1, 2].map((k) => {
    const c = [E0[0] + Math.cos(FIELD_ANG[k]) * FIELD.d, E0[1] + Math.sin(FIELD_ANG[k]) * FIELD.d];
    if (k === 0) return {x: c[0] - FIELD.r * 0.78, y: c[1] - FIELD.r * 0.78 - 26, align: 'right'};
    if (k === 1) return {x: c[0] + FIELD.r * 0.78, y: c[1] - FIELD.r * 0.78 - 26, align: 'left'};
    return {x: c[0] + FIELD.r * 0.62, y: c[1] + FIELD.r * 0.8, align: 'left'};
  });
  return (
    <>
      {FIELD_NAMES.map((n, k) => (
        <TickLabel key={n} text={n} x={pos[k].x} y={pos[k].y} at={T07.fields[k] + 3} out={T07.absorb[0] - 4} size={22} color={C.ink} tracking={0.22} align={pos[k].align} />
      ))}
    </>
  );
};

/* ================================================================== D2–D3 · camadas e peças */

const PIECE = {w: 268, h: 151, gap: 24};
const PIECE_X0 = W - M - (4 * PIECE.w + 3 * PIECE.gap);
const pieceX = (k: number) => PIECE_X0 + k * (PIECE.w + PIECE.gap);
const pieceCX = (k: number) => pieceX(k) + PIECE.w / 2;
const PIECES = [
  {src: 'media/v3/landing.mp4', kind: 'clip'},
  {src: 'media/v3/designsystem.png', kind: 'still'},
  {src: 'media/v3/stacker.mp4', kind: 'clip'},
  {src: 'media/v3/pessoas.mp4', kind: 'clip'},
] as const;
const Y_AERA = RAILS[1].y;
const Y_AG = RAILS[2].y - PIECE.h - 2;
const Y_LID = RAILS[0].y - PIECE.h - 2;
const Y_WIRE = Y_AERA + 14;
/** onde cada peça aparece antes de virar sistema (fora de ordem, girada, em outra escala) */
const SCATTER = [
  {dx: 40, dy: -300, r: -8, s: 0.86},
  {dx: 180, dy: 250, r: 6, s: 0.92},
  {dx: -150, dy: -205, r: 4, s: 1.08},
  {dx: 50, dy: 190, r: -11, s: 0.9},
];

const snapAt = (f: number, k: number) => ramp(f, T08.snap[0] + k * 2, T08.snap[1] + k * 2, settle);
const pieceState = (f: number, k: number) => {
  const sn = snapAt(f, k);
  const sc = SCATTER[k];
  const float = (1 - sn) * Math.sin(f / 23 + k * 1.7) * 7;
  const d = ramp(f, T10.drop + k * T10.dropStep, T10.drop + k * T10.dropStep + T10.dropDur, glide);
  const r = ramp(f, T10.approve + k * T10.riseStep, T10.approve + k * T10.riseStep + T10.riseDur, glide);
  const yw = lerp(Y_WIRE + sc.dy, Y_WIRE, sn) + float;
  return {x: lerp(pieceX(k) + sc.dx, pieceX(k), sn), y: lerp(lerp(yw, Y_AG, d), Y_LID, r), rot: lerp(sc.r, 0, sn), s: lerp(sc.s, 1, sn)};
};
const crossAt = (k: number) => {
  const a = T10.approve + k * T10.riseStep;
  for (let t = a; t < a + T10.riseDur + 2; t++) if (pieceState(t, k).y + PIECE.h / 2 <= Y_AERA) return t;
  return a + T10.riseDur;
};

/** A linha no campo claro: ponto → cruza → cruz → eixo + camada AERA → ligações da direção. */
export const lineCream = (f: number): LineState | null => {
  if (f < T07.invert[0] || f >= T11.invert[0]) return null;
  const y = E0[1];
  const col = C.teal;
  if (f < T07.cross[0]) return {pts: [E0, [E0[0] + 0.01, y]], color: col, head: {p: E0, o: 1}, headColor: C.teal};
  if (f < T07.open[0]) {
    const hx = crossHead(f);
    const arrived = f >= T07.cross[1];
    const headO = arrived ? 1 - ramp(f, T07.aera + 4, T07.aera + 16) : 1;
    return {
      pts: [[0, y], [Math.max(0.01, hx), y]],
      color: col,
      nodes: arrived ? [] : [{p: E0, r: 4.5, o: 1}],
      head: headO > 0 ? {p: [hx, y], o: headO} : null,
      headColor: C.teal,
    };
  }
  const op = ramp(f, T07.open[0], T07.open[1], settle);
  const sl = ramp(f, T07.slide[0], T07.slide[1], glide);
  const ax = lerp(E0[0], I_X, sl);
  const branches: NonNullable<LineState['branches']> = [
    {a: [ax, y], b: [ax, lerp(y, RAILS[0].y, op)]},
    {a: [ax, y], b: [ax, lerp(y, RAILS[2].y, op)]},
  ];
  for (let k = 0; k < 4; k++) {
    const g = ramp(f, T10.connect + k * 3, T10.connect + k * 3 + 10, settle) * (1 - ramp(f, T10.approve + k * T10.riseStep - 2, T10.approve + k * T10.riseStep + 6, leave));
    if (g > 0) branches.push({a: [pieceCX(k), Y_AERA], b: [pieceCX(k), lerp(Y_AERA, Y_AG, g)]});
  }
  return {pts: [[lerp(0, M, sl), y], [lerp(lerp(E0[0], W, op), W - M, sl), y]], color: col, branches};
};

/** Camadas de tinta (liderança e agência) e a faixa AERA: nascem quando a estratégia vira sistema. */
const Rails: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T08.rails[0]) return null;
  const band = ramp(f, T08.band[0], T08.band[1], settle);
  const lead = ramp(f, T10.board, T10.board + 14, settle);
  return (
    <>
      <div style={{position: 'absolute', left: lerp(I_X, M, band), width: lerp(0, W - 2 * M, band), top: Y_AERA + 12, height: 84, background: 'rgba(27,143,181,0.1)'}} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {[0, 2].map((r, j) => {
          const a = ramp(f, T08.rails[0] + j * 6, T08.rails[1] + j * 6, settle);
          return (
            <g key={r}>
              <line x1={I_X} y1={RAILS[r].y} x2={lerp(I_X, W - M, a)} y2={RAILS[r].y} stroke={C.ink} strokeWidth={1.1} opacity={0.6} />
              <line x1={I_X} y1={RAILS[r].y} x2={lerp(I_X, M, a)} y2={RAILS[r].y} stroke={C.ink} strokeWidth={1.1} opacity={0.6} />
            </g>
          );
        })}
        {lead > 0 ? <line x1={I_X} y1={RAILS[0].y} x2={lerp(I_X, W - M, lead)} y2={RAILS[0].y} stroke={C.teal} strokeWidth={2.4} /> : null}
      </svg>
    </>
  );
};

/** Legenda: quem faz o quê acende quando acontece (dirige · executa · valida). */
const Legend: React.FC = () => {
  const notes = [
    {t: 'valida', at: T10.board},
    {t: 'dirige', at: T10.packets[0]},
    {t: 'executa', at: T10.fill},
  ];
  return (
    <>
      {RAILS.map((r, i) => (
        <React.Fragment key={i}>
          <TickLabel text={['Liderança', 'AERA · Direção', 'Agência · Execução'][i]} x={M} y={r.y - 32} at={T08.labels[i]} out={T11.invert[1]} size={16} color={i === 1 ? C.teal : C.ink} tracking={0.18} />
          <TickLabel text={notes[i].t} x={M} y={r.y + 14} at={T08.labels[i] + 4} out={notes[i].at} size={13} color={C.mutedInk} tracking={0.16} />
          <TickLabel text={notes[i].t} x={M} y={r.y + 14} at={notes[i].at} out={T11.invert[1]} size={13} color={C.teal} tracking={0.16} />
        </React.Fragment>
      ))}
    </>
  );
};

/** Direção: um pacote sai do eixo e corre na camada AERA até cada peça. */
const Packets: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T10.packets[0] || f > T10.approve + 30) return null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
      {[0, 1, 2, 3].map((k) => {
        const a = T10.packets[0] + k * 4;
        if (f < a) return null;
        const run = ramp(f, a, a + 14, glide);
        const prev = ramp(f - 1, a, a + 14, glide);
        const x = lerp(I_X, pieceCX(k), run);
        const v = (x - lerp(I_X, pieceCX(k), prev)) * 0.5;
        const tick = ramp(f, a + 14, a + 22, settle);
        return (
          <g key={k}>
            {run < 1 ? <circle cx={x - v * 2} cy={Y_AERA} r={4.5} fill={C.teal} opacity={0.2} /> : null}
            {run < 1 ? <circle cx={x - v} cy={Y_AERA} r={4.5} fill={C.teal} opacity={0.4} /> : null}
            <circle cx={x} cy={Y_AERA} r={run < 1 ? 5 : 5.5} fill={C.teal} />
            <line x1={pieceCX(k)} y1={Y_AERA} x2={pieceCX(k)} y2={Y_AERA - 14 * tick} stroke={C.teal} strokeWidth={1.4} />
          </g>
        );
      })}
    </svg>
  );
};

/** As peças: soltas (estratégia) → travam (sistema) → descem (execução) → imagem → sobem com check (validação). */
const Pieces: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T08.scatter - 1) return null;
  return (
    <>
      {PIECES.map((pc, k) => {
        const w0 = T08.scatter + k * T08.scatterStep;
        if (f < w0) return null;
        const st = pieceState(f, k);
        const pv = pieceState(f - 1, k);
        const draw = ramp(f, w0, w0 + 14, settle);
        const sketch = ramp(f, w0 + 6, w0 + 18, settle);
        const fill = ramp(f, T10.fill + k * T10.fillStep, T10.fill + k * T10.fillStep + 14, settle);
        const exec = Math.max(0, 1 - Math.abs(f - (T10.exec + k * 3 + 6)) / 10);
        const vx = (st.x - pv.x) * 0.5;
        const vy = (st.y - pv.y) * 0.5;
        const id = `pcmb-${k}`;
        const bx = Math.min(10, Math.abs(vx) * 0.6);
        const by = Math.min(10, Math.abs(vy) * 0.6);
        const mb = bx + by > 0.4;
        return (
          <div key={k} style={{position: 'absolute', left: st.x, top: st.y, width: PIECE.w, height: PIECE.h, transform: `rotate(${st.rot}deg) scale(${st.s})`, filter: mb ? `url(#${id})` : undefined}}>
            {mb ? <BlurDef id={id} sx={bx} sy={by} /> : null}
            <div style={{position: 'absolute', inset: 0, overflow: 'hidden', clipPath: inset(PIECE.h * (1 - fill), 0, 0, 0), background: C.navyDeep}}>
              <div style={{position: 'absolute', inset: 0, filter: DUO_FILTER}}>
                {pc.kind === 'clip' ? <ClipVideo src={pc.src} from={T10.fill + k * T10.fillStep - 8} /> : <StillImg src={pc.src} pos="50% 30%" />}
              </div>
            </div>
            <svg width={PIECE.w} height={PIECE.h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <rect x={0.5} y={0.5} width={PIECE.w - 1} height={PIECE.h - 1} fill="none" stroke={exec > 0 ? C.teal : C.ink} strokeWidth={exec > 0 ? 1.2 + 1.6 * exec : 1.2} opacity={lerp(0.8, exec > 0 ? 1 : 0.35, fill)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
              <g opacity={sketch * (1 - fill)} stroke={C.ink} strokeWidth={1}>
                <line x1={16} y1={22} x2={16 + 120 * sketch} y2={22} />
                <line x1={16} y1={36} x2={16 + 80 * sketch} y2={36} />
                <rect x={16} y={56} width={(PIECE.w - 32) * sketch} height={PIECE.h - 76} fill="none" />
                <line x1={16} y1={56} x2={16 + (PIECE.w - 32) * sketch} y2={PIECE.h - 20} />
              </g>
            </svg>
          </div>
        );
      })}
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {[0, 1, 2, 3].map((k) => {
          const c = crossAt(k);
          const a = ramp(f, c - 1, c + 7, settle);
          if (a <= 0) return null;
          const d = ramp(f, c + 2, c + 10, settle);
          const x = pieceCX(k);
          return (
            <g key={k}>
              <circle cx={x} cy={Y_AERA} r={14 * a} fill={C.teal} />
              <path d={`M ${x - 6} ${Y_AERA} L ${x - 1.5} ${Y_AERA + 5} L ${x + 7} ${Y_AERA - 5}`} fill="none" stroke={C.cream} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} />
            </g>
          );
        })}
      </svg>
    </>
  );
};

/** Origem da volta ao navy: o último check. */
export const NAVY_ORIGIN: Pt = [pieceCX(3), Y_AERA];
export const CHECK_AT = [0, 1, 2, 3].map(crossAt);
export const PIECE_SNAP = [0, 1, 2, 3].map((k) => T08.snap[0] + k * 2 + 12);

/* ================================================================== tudo o que é claro */

export const CreamLayers: React.FC = () => {
  const f = useCurrentFrame();
  const inv = ramp(f, T07.invert[0], T07.invert[1], settle);
  const radius = lerp(0, 2350, inv);
  const drift = lerp(1, 1.014, ramp(f, T07.invert[0], T11.invert[0], glide));
  const aeraW = wordWidth('AERA') * 96;
  return (
    <>
      <div style={{position: 'absolute', left: E0[0] - radius, top: E0[1] - radius, width: radius * 2, height: radius * 2, borderRadius: '50%', background: C.cream}} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: `${E0[0]}px ${E0[1]}px`}}>
        <Fields />
        <FieldLabels />
        <Rails />
        <Legend />
        <Pieces />
        <Packets />
        <LineMB at={lineCream} f={f} />
        <ImpactWord word="AERA" x={E0[0] - aeraW / 2} baseY={E0[1]} at={T07.aera} out={T07.absorb[0] - 2} size={96} color={C.ink} track={140} inDur={18} />
        <TickLabel text="01 · Brand & Marketing Direction" x={M} y={64} at={T08.index} out={T10.board + 6} size={15} color={C.teal} />
      </div>
    </>
  );
};
