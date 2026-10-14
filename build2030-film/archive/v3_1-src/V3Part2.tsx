/**
 * GAVEA / BUILD 2030 · V3 · B08–B16.
 * Continuação do mesmo sistema: a linha de B07 vira grid (B09), volta a ser camadas (B10),
 * desce como régua do real (B11), sobe e vira a barra de pergunta (B12), pivota e costura o split (B13),
 * pousa na linha d'água (B14), sustenta os verbos (B15) e colapsa num ponto que redesenha a assinatura (B16).
 */
import React from 'react';
import {Freeze, Img, staticFile, useCurrentFrame} from 'remotion';
import {wordWidth} from '../components/GlyphWord';
import {C, GRID, H, M, TYPE, W} from '../motion/design';
import {glide, lerp, lerpLog, leave, Pt, pull, ramp, settle} from '../motion/easing';
import {
  BAR, HUB, I_X, ONE_WIN, RAILS, RULER_Y, SIG, STACK, TAGS11, WATER_Y, WORD_X, ANCHOR_Y,
} from '../motion/geometry';
import {B11_END, FILM_END, SERVICE_AT, T08B, T09, T10, T11, T12, T13, T14, T15, T16} from '../motion/timing';
import {DUO_FILTER} from '../primitives/Grade';
import {LineMB, type LineState} from '../primitives/Line';
import {ClipVideo, inset, Plate, StillImg} from '../primitives/Media';
import {BlurDef, ImpactWord, LineSentence, MaskLines, TickLabel} from '../primitives/Type';

/* ================================================================== B08–B10 · fase clara: direção → execução → aprovação */

/** Quatro peças: nascem como wireframe na camada AERA (direção), descem até a agência (execução), viram imagem real e sobem até a liderança (aprovação). */
const PIECE = {w: 268, h: 151, gap: 24};
const PIECE_X0 = W - M - (4 * PIECE.w + 3 * PIECE.gap);
const pieceX = (k: number) => PIECE_X0 + k * (PIECE.w + PIECE.gap);
const pieceCX = (k: number) => pieceX(k) + PIECE.w / 2;
const SERVICES = ['Posicionamento', 'Design system', 'Planejamento', 'Critério'];
const PIECES = [
  {src: 'media/v3/landing.mp4', kind: 'clip'},
  {src: 'media/v3/designsystem.png', kind: 'still'},
  {src: 'media/v3/stacker.mp4', kind: 'clip'},
  {src: 'media/v3/pessoas.mp4', kind: 'clip'},
] as const;
const Y_AERA = RAILS[1].y;
const Y_AG = RAILS[2].y - PIECE.h - 2; // topo da peça apoiada na régua da agência
const Y_LID = RAILS[0].y - PIECE.h - 2; // topo da peça apoiada na régua da liderança
const Y_WIRE = Y_AERA + 14;

const pieceY = (f: number, k: number) => {
  const d = ramp(f, T09.drop + k * 5, T09.drop + k * 5 + T09.dropDur, glide);
  const r = ramp(f, T10.approve + k * T10.riseStep, T10.approve + k * T10.riseStep + T10.riseDur, glide);
  return lerp(lerp(Y_WIRE, Y_AG, d), Y_LID, r);
};
/** frame em que o centro da peça cruza a camada AERA na subida */
const crossAt = (k: number) => {
  const a = T10.approve + k * T10.riseStep;
  for (let t = a; t < a + T10.riseDur + 2; t++) if (pieceY(t, k) + PIECE.h / 2 <= Y_AERA) return t;
  return a + T10.riseDur;
};

/** A linha na fase clara: eixo + camada AERA + as ligações de direção (AERA → peça). */
export const lineCream = (f: number): LineState | null => {
  if (f < T09.wire - 2 || f >= T11.invert[0]) return null;
  const branches: NonNullable<LineState['branches']> = [
    {a: [I_X, Y_AERA], b: [W - M, Y_AERA]},
    {a: [I_X, Y_AERA], b: [M, Y_AERA]},
  ];
  for (let k = 0; k < 4; k++) {
    const g = ramp(f, T10.connect + k * 3, T10.connect + k * 3 + 10, settle) * (1 - ramp(f, T10.approve + k * T10.riseStep - 2, T10.approve + k * T10.riseStep + 6, leave));
    if (g > 0) branches.push({a: [pieceCX(k), Y_AERA], b: [pieceCX(k), lerp(Y_AERA, Y_AG, g)]});
  }
  return {pts: [[I_X, RAILS[0].y], [I_X, RAILS[2].y]], color: C.teal, branches};
};

/** Legenda das camadas (à esquerda do eixo) com o verbo que acende quando é dito. */
const Legend: React.FC = () => {
  const f = useCurrentFrame();
  const notes = [
    {t: 'aprova', at: T10.board},
    {t: 'dirige', at: T10.connect},
    {t: 'executa', at: T10.exec},
  ];
  return (
    <>
      {RAILS.map((r, i) => (
        <React.Fragment key={i}>
          <TickLabel text={['Liderança', 'AERA · Direção', 'Agência · Execução'][i]} x={M} y={r.y - 34} at={[898, 904, 910][i]} out={T11.invert[1]} size={18} color={i === 1 ? C.teal : C.ink} tracking={0.18} />
          <TickLabel text={notes[i].t} x={M} y={r.y + 16} at={[902, 908, 914][i]} out={T11.invert[1]} size={14} color={C.mutedInk} tracking={0.16} />
          <TickLabel text={notes[i].t} x={M} y={r.y + 16} at={notes[i].at} out={T11.invert[1]} size={14} color={C.teal} tracking={0.16} />
        </React.Fragment>
      ))}
      {f >= T10.board ? (
        <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
          <line x1={I_X} y1={RAILS[0].y} x2={lerp(I_X, W - M, ramp(f, T10.board, T10.board + 14, settle))} y2={RAILS[0].y} stroke={C.teal} strokeWidth={2.4} />
        </svg>
      ) : null}
    </>
  );
};

/** Serviços: um pacote corre na camada AERA a partir do eixo e para no lugar da peça quando a palavra é dita. */
const Services: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SERVICE_AT[0] - 14 || f >= T11.invert[1]) return null;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {SERVICES.map((_, k) => {
          const t = SERVICE_AT[k];
          if (f < t - 12) return null;
          const run = ramp(f, t - 12, t, glide);
          const prev = ramp(f - 1, t - 12, t, glide);
          const x = lerp(I_X, pieceCX(k), run);
          const v = (x - lerp(I_X, pieceCX(k), prev)) * 0.5;
          const tick = ramp(f, t, t + 8, settle);
          return (
            <g key={k}>
              {run < 1 ? <circle cx={x - v * 2} cy={Y_AERA} r={4.5} fill={C.teal} opacity={0.2} /> : null}
              {run < 1 ? <circle cx={x - v} cy={Y_AERA} r={4.5} fill={C.teal} opacity={0.4} /> : null}
              <circle cx={x} cy={Y_AERA} r={run < 1 ? 5 : 5.5} fill={C.teal} />
              <line x1={pieceCX(k)} y1={Y_AERA} x2={pieceCX(k)} y2={Y_AERA - 16 * tick} stroke={C.teal} strokeWidth={1.4} />
            </g>
          );
        })}
      </svg>
      {SERVICES.map((sv, k) => (
        <TickLabel key={sv} text={sv} x={pieceX(k)} y={Y_AERA - 40} at={SERVICE_AT[k] + 1} out={T10.approve + k * T10.riseStep - 4} size={15} color={C.ink} tracking={0.14} />
      ))}
    </>
  );
};

/** As peças: wireframe (direção) → desce → vira imagem (execução) → acende (critério) → sobe (aprovação). */
const Pieces: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T09.wire - 1 || f >= T11.invert[1]) return null;
  return (
    <>
      {PIECES.map((pc, k) => {
        const w0 = T09.wire + k * T09.wireStep;
        if (f < w0) return null;
        const y = pieceY(f, k);
        const x = pieceX(k);
        const draw = ramp(f, w0, w0 + 12, settle);
        const sketch = ramp(f, w0 + 6, w0 + 16, settle);
        const fill = ramp(f, T10.fill + k * T10.fillStep, T10.fill + k * T10.fillStep + 14, settle);
        const exec = Math.max(0, 1 - Math.abs(f - (T10.exec + k * 3 + 6)) / 10);
        const vy = (pieceY(f, k) - pieceY(f - 1, k)) * 0.5;
        const id = `pcmb-${k}`;
        const blur = Math.min(10, Math.abs(vy) * 0.6);
        return (
          <div key={k} style={{position: 'absolute', left: x, top: y, width: PIECE.w, height: PIECE.h, filter: blur > 0.4 ? `url(#${id})` : undefined}}>
            {blur > 0.4 ? <BlurDef id={id} sx={0} sy={blur} /> : null}
            {/* imagem real: sobe de dentro da régua da agência */}
            <div style={{position: 'absolute', inset: 0, overflow: 'hidden', clipPath: inset(PIECE.h * (1 - fill), 0, 0, 0), background: C.navyDeep}}>
              <div style={{position: 'absolute', inset: 0, filter: DUO_FILTER}}>
                {pc.kind === 'clip' ? <ClipVideo src={pc.src} from={T10.fill + k * T10.fillStep - 8} /> : <StillImg src={pc.src} pos="50% 30%" />}
              </div>
            </div>
            {/* wireframe desenhado pela linha */}
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

/** Tudo o que é claro de B08 a B10. */
export const CreamSystem: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T08B.index - 10 || f >= T11.invert[1] + 2) return null;
  return (
    <>
      <TickLabel text="01 · Brand & Marketing Direction" x={M} y={64} at={T08B.index} out={T10.board + 6} size={15} color={C.teal} />
      <Legend />
      <Services />
      <Pieces />
      <MaskLines lines={['Um sistema para todos os pontos de contato.']} x={M} y={GRID.top} at={T09.sentence} out={T09.sentenceOut} size={50} color={C.ink} />
      <MaskLines lines={['A agência segue no dia a dia.']} x={M} y={GRID.top} at={T10.sentence} out={T10.sentenceOut} size={50} color={C.ink} />
    </>
  );
};

/** Origem da inversão de volta ao navy: o último check. */
export const NAVY_ORIGIN: Pt = [pieceCX(3), Y_AERA];

/* ================================================================== B11 · o real vira informação */

const C11 = T11.clips;
const N11 = [C11[1], C11[2], B11_END];
const SRC11 = ['media/v3/processos.mp4', 'media/v3/conhecimento.mp4', 'media/v3/decisao.mp4'];
const WORDS11 = ['PROCESSOS.', 'CONHECIMENTO.', 'DECISÃO.'];

const Plane11: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const s = C11[k];
  const fz = s + T11.freeze;
  const p = ramp(f, s - 4, s + 14, settle);
  const clip =
    k === 0
      ? inset(RULER_Y * (1 - p), 0, (H - RULER_Y) * (1 - ramp(f, s - 4, s + 6, settle)), 0)
      : k === 1
        ? inset(0, 0, 0, W * (1 - p))
        : inset(lerp(0, RULER_Y, ramp(f, T12.collapse[0], T12.collapse[1], leave)), 0, Math.max(H * (1 - p), lerp(0, H - RULER_Y, ramp(f, T12.collapse[0], T12.collapse[1], leave))), 0);
  const video = <ClipVideo src={SRC11[k]} from={s - 6} />;
  const freeze = ramp(f, fz, fz + 4, settle);
  return (
    <Plate clip={clip} cam={{s: lerp(1.08, 1.02, ramp(f, s - 6, N11[k], glide)), tx: k === 1 ? lerp(120, 0, p) : 0}} filter={`${DUO_FILTER} brightness(${lerp(1, 0.78, freeze)})`}>
      {f >= fz ? <Freeze frame={fz}>{video}</Freeze> : video}
    </Plate>
  );
};

const Tags11: React.FC = () => {
  const f = useCurrentFrame();
  if (f < C11[0] || f > T12.barOpen[1]) return null;
  const items: React.ReactNode[] = [];
  TAGS11.forEach((tags, k) => {
    const s = C11[k];
    const visible = f >= s + T11.tag[0] - 1;
    if (!visible) return;
    tags.forEach((t, j) => {
      const t0 = s + T11.tag[0] + j * 3;
      const draw = ramp(f, t0, t0 + 8, settle);
      const det = ramp(f, s + T11.detach[0] + j * 3, s + T11.detach[1] + j * 3, glide);
      const shrink = ramp(f, s + T11.detach[0] + j * 3, s + T11.detach[0] + 6 + j * 3, leave);
      const cx = t.x + t.w / 2;
      const cy = t.y + t.h / 2;
      const nx = lerp(cx, HUB[0], det);
      const ny = lerp(cy, HUB[1], det);
      const prev = ramp(f - 1, s + T11.detach[0] + j * 3, s + T11.detach[1] + j * 3, glide);
      const vx = (nx - lerp(cx, HUB[0], prev)) * 0.5;
      const vy = (ny - lerp(cy, HUB[1], prev)) * 0.5;
      const rw = t.w * (1 - shrink);
      const rh = t.h * (1 - shrink);
      const inBar = ramp(f, T12.barOpen[0], T12.barOpen[0] + 6);
      items.push(
        <g key={`${k}-${j}`}>
          {rw > 1 ? (
            <rect x={cx - rw / 2} y={cy - rh / 2} width={rw} height={rh} fill="none" stroke={C.tealSoft} strokeWidth={1.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          ) : null}
          {shrink > 0 ? (
            <>
              <circle cx={nx - vx * 2} cy={ny - vy * 2} r={5} fill={C.tealSoft} opacity={0.18 * (1 - inBar)} />
              <circle cx={nx - vx} cy={ny - vy} r={5} fill={C.tealSoft} opacity={0.35 * (1 - inBar)} />
              <circle cx={nx} cy={ny} r={5.5} fill={C.head} opacity={1 - inBar} />
            </>
          ) : null}
        </g>,
      );
    });
  });
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {items}
      </svg>
      {TAGS11.map((tags, k) =>
        tags.map((t, j) => (
          <TickLabel key={`${k}${j}`} text={t.label} x={t.x} y={t.y - 26} at={C11[k] + T11.tag[0] + 4 + j * 3} out={C11[k] + T11.detach[0] + j * 3} size={15} color={C.cream} tracking={0.2} />
        )),
      )}
    </>
  );
};

/* ================================================================== B12 · GAVEA ONE */

const barState = (f: number) => {
  const open = ramp(f, T12.barOpen[0], T12.barOpen[1], settle);
  const close = ramp(f, T12.close[0], T12.close[1], leave);
  const y = lerp(BAR.y, BAR.upY, ramp(f, T12.barUp[0], T12.barUp[1], glide));
  return {open, close, y, h: BAR.h * open * (1 - close)};
};

const QUESTION = 'Quero entender o status da P-35';

/** GAVEA Trade (em uso): a régua se abre numa janela; depois a janela se comprime e vira a barra do portal. */
const TRADE = {w: 1200, h: 675};
const TradeWindow: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T12.trade[0] || f >= T12.toBar[1]) return null;
  const o = ramp(f, T12.trade[0], T12.trade[1], settle);
  const m = ramp(f, T12.toBar[0], T12.toBar[1], glide);
  const w = lerp(TRADE.w, BAR.half * 2, m);
  const h = lerp(TRADE.h * o, BAR.h, m);
  const swap = ramp(f, T12.tradeSwap, T12.tradeSwap + 14, settle);
  const push = lerp(1.0, 1.06, ramp(f, T12.trade[0], T12.toBar[0], glide));
  return (
    <>
      <div style={{position: 'absolute', left: W / 2 - w / 2, top: BAR.y - h / 2, width: w, height: h, borderRadius: lerp(0, BAR.h / 2, m), border: `1.6px solid ${C.tealSoft}`, overflow: 'hidden', background: C.navyDeep}}>
        <div style={{position: 'absolute', left: W / 2 - TRADE.w / 2 - (W / 2 - w / 2), top: BAR.y - TRADE.h / 2 - (BAR.y - h / 2), width: TRADE.w, height: TRADE.h, opacity: 1 - Math.min(1, m * 1.6), transform: `scale(${push})`, filter: 'saturate(0.75) brightness(0.94)'}}>
          <Img src={staticFile('media/trade/01-login.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '0% 50%'}} />
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - swap) * 100}%)`}}>
            <Img src={staticFile('media/trade/08-historico.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
          </div>
        </div>
      </div>
      <TickLabel text="GAVEA Trade" x={W / 2 - TRADE.w / 2} y={BAR.y - TRADE.h / 2 - 30} at={T12.tradeLabel} out={T12.toBar[0]} size={15} color={C.tealSoft} />
      <TickLabel text="Cotação · Proposta · Follow-up" x={W / 2 + TRADE.w / 2} y={BAR.y + TRADE.h / 2 + 14} at={T12.tradeLabel + 6} out={T12.toBar[0]} size={15} color={C.cream} align="right" />
    </>
  );
};

const OneMoment: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T12.barOpen[0] || f > T12.close[1] + 2) return null;
  const b = barState(f);
  const x0 = BAR.cx - BAR.half;
  const n = Math.floor(QUESTION.length * ramp(f, T12.type[0], T12.type[1], (t) => t));
  const typing = f >= T12.type[0] && f < T12.enter;
  const cursorOn = typing || (f < T12.enter + 2 && Math.floor(f / 8) % 2 === 0);
  const win = ramp(f, T12.window[0], T12.window[1], settle) * (1 - ramp(f, T12.close[0] - 4, T12.close[0] + 6, leave));
  const pulse = 1 + 0.35 * Math.max(0, Math.sin(((f - T12.enter) / 10) * Math.PI)) * (f >= T12.enter && f < T12.enter + 10 ? 1 : 0);
  return (
    <>
      {/* janela do protótipo: abre da borda de baixo da barra */}
      {win > 0 ? (
        <div style={{position: 'absolute', left: ONE_WIN.x, top: ONE_WIN.y, width: ONE_WIN.w, height: ONE_WIN.h, clipPath: inset(0, 0, ONE_WIN.h * (1 - win), 0), overflow: 'hidden', boxShadow: `inset 0 0 0 1px rgba(127,198,220,0.35)`}}>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.0, 1.16, ramp(f, T12.window[0], T12.close[1], glide))})`, transformOrigin: '42% 78%', filter: 'saturate(0.85) brightness(1.05)'}}>
            <ClipVideo src="media/v3/one.mp4" from={T12.window[0] - 4} />
          </div>
        </div>
      ) : null}
      {b.h > 1 ? (
        <div style={{position: 'absolute', left: x0, top: b.y - b.h / 2, width: BAR.half * 2, height: b.h, borderRadius: b.h / 2, border: `1.6px solid ${C.tealSoft}`, background: 'rgba(8,30,47,0.94)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 48 - 7 * pulse, top: b.h / 2 - 7 * pulse, width: 14 * pulse, height: 14 * pulse, borderRadius: '50%', background: C.head, boxShadow: `0 0 ${18 * pulse}px rgba(230,246,255,0.7)`}} />
          <div style={{position: 'absolute', left: 84, top: b.h / 2 - 22, fontFamily: 'GAVEA Display', fontVariationSettings: '"wght" 480, "wdth" 100', fontSize: 34, lineHeight: '44px', color: C.cream, whiteSpace: 'nowrap', letterSpacing: '-0.01em'}}>
            {QUESTION.slice(0, n)}
            <span style={{display: 'inline-block', width: 2, height: 34, marginLeft: 4, verticalAlign: '-6px', background: C.tealSoft, opacity: cursorOn ? 1 : 0}} />
          </div>
        </div>
      ) : null}
      <TickLabel text="Pergunte ao GAVEA ONE" x={x0 + 8} y={BAR.y - BAR.h / 2 - 30} at={T12.barOpen[1] - 4} out={T12.enter} size={14} color={C.tealSoft} />
      <TickLabel text="Futuro Portal GAVEA · protótipo" x={ONE_WIN.x} y={ONE_WIN.y + ONE_WIN.h + 18} at={T12.labels[0]} out={T12.close[0] - 2} size={15} color={C.tealSoft} />
      <TickLabel text="GAVEA ONE · IA aplicada à decisão" x={ONE_WIN.x + ONE_WIN.w} y={ONE_WIN.y + ONE_WIN.h + 18} at={T12.labels[1]} out={T12.close[0]} size={15} color={C.cream} align="right" />
    </>
  );
};

/* ================================================================== B13 · split */

const Split: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T13.panels[0] - 1 || f > T14.open[1]) return null;
  const p = ramp(f, T13.panels[0], T13.panels[1], settle);
  const u = ramp(f, T13.out[0], T13.out[1], glide);
  const sc = lerp(1, STACK.w / W, u);
  const logoH = 138;
  const logoW = (logoH * 3257) / 1352;
  const lr = ramp(f, T13.logo, T13.logo + 16, settle);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${sc}) rotate(${-2 * u}deg)`, transformOrigin: '50% 50%', boxShadow: u > 0 ? '0 30px 80px rgba(0,0,0,0.5)' : undefined}}>
      <div style={{position: 'absolute', inset: 0, background: C.cream, clipPath: inset(0, W / 2, 0, (W / 2) * (1 - p))}}>
        <div style={{position: 'absolute', left: W / 4 - logoW / 2, top: 520 - logoH, width: logoW, height: logoH + 4, overflow: 'hidden'}}>
          <Img src={staticFile('brand/gavea-group_hor_cor.png')} style={{position: 'absolute', left: 0, top: (1 - lr) * (logoH + 6), width: logoW, height: logoH}} />
        </div>
        <TickLabel text="01 · Marca e marketing" x={M} y={64} at={T13.index} out={T13.out[0] - 2} size={15} color={C.teal} />
        <LineSentence text="Comunicar melhor." x={M} baseY={RULER_Y} at={T13.sent[0]} out={T13.out[0] - 4} size={56} color={C.ink} />
      </div>
      <Plate clip={inset(0, (W / 2) * (1 - p), 0, W / 2)} cam={{s: 1.1, ox: 0, oy: H / 2, tx: 880}} filter={DUO_FILTER}>
        <ClipVideo src="media/v3/operar.mp4" from={T13.panels[0] - 6} />
      </Plate>
      <div style={{position: 'absolute', left: W / 2, top: RULER_Y - 300, width: W / 2, height: 300, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.6))', opacity: p}} />
      <TickLabel text="02 · Tecnologia e IA" x={W / 2 + M} y={64} at={T13.index + 4} out={T13.out[0] - 2} size={15} color={C.tealSoft} />
      <LineSentence text="Operar com mais inteligência." x={W / 2 + M} baseY={RULER_Y} at={T13.sent[1]} out={T13.out[0] - 4} size={56} color={C.cream} />
    </div>
  );
};

/* ================================================================== B14 · memória → cor */

const MEM = Array.from({length: 12}, (_, i) => `media/v3/mem/m${String(i + 1).padStart(2, '0')}.jpg`);
const stackPos = (j: number) => ({dx: ((j * 37) % 84) - 42, dy: ((j * 53) % 52) - 26, r: ((j * 29) % 11) - 5});

const MemoryStack: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T14.cards[0] || f > T14.open[1] + 2) return null;
  const cx = W / 2 - STACK.w / 2;
  const cy = H / 2 - STACK.h / 2;
  return (
    <>
      {MEM.map((src, j) => {
        const t0 = T14.cards[0] + j * T14.cardStep;
        if (f < t0) return null;
        const a = ramp(f, t0, t0 + 14, settle);
        const ap = ramp(f - 1, t0, t0 + 14, settle);
        const ang = (j * 137.5 * Math.PI) / 180;
        const dist = 1500;
        const sp = stackPos(j);
        const x = lerp(Math.cos(ang) * dist, sp.dx, a);
        const y = lerp(Math.sin(ang) * dist, sp.dy, a);
        const v = Math.hypot(Math.cos(ang) * dist - sp.dx, Math.sin(ang) * dist - sp.dy) * (a - ap);
        const id = `memmb-${j}`;
        const bx = Math.min(16, Math.abs(Math.cos(ang)) * v * 0.3);
        const by = Math.min(16, Math.abs(Math.sin(ang)) * v * 0.3);
        return (
          <div key={j} style={{position: 'absolute', left: cx + x, top: cy + y, width: STACK.w, height: STACK.h, transform: `rotate(${lerp(sp.r * 3, sp.r, a)}deg)`, boxShadow: '0 24px 60px rgba(0,0,0,0.55)', outline: '1px solid rgba(243,241,236,0.14)', filter: bx + by > 0.6 ? `url(#${id})` : undefined}}>
            {bx + by > 0.6 ? <BlurDef id={id} sx={bx} sy={by} /> : null}
            <div style={{position: 'absolute', inset: 0, filter: DUO_FILTER}}>
              <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          </div>
        );
      })}
    </>
  );
};

/** O panorama: chega como o último cartão (a primeira cor do filme) e abre até a tela inteira. */
const Panorama: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T14.top[0] || f >= T15.verbs[0]) return null;
  const land = ramp(f, T14.top[0], T14.top[1], settle);
  const open = ramp(f, T14.open[0], T14.open[1], settle);
  const w = lerp(STACK.w, W, open);
  const h = lerp(STACK.h, H, open);
  const x = W / 2 - w / 2;
  const y = H / 2 - h / 2 + (1 - land) * 900;
  const cam = ramp(f, T14.cam[0], T14.cam[1], glide);
  const s = lerp(1.03, 1.09, cam);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', boxShadow: open < 1 ? '0 30px 80px rgba(0,0,0,0.55)' : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: `translateX(${lerp(0, -40, cam) * open}px) scale(${s})`, transformOrigin: `50% ${(WATER_Y / H) * 100}%`, filter: 'contrast(1.04) saturate(1.02)'}}>
        <Img src={staticFile('media/v3/panorama.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(5,15,26,0.5), rgba(5,15,26,0) 34%)', opacity: open}} />
    </div>
  );
};

/* ================================================================== B15 · verbos */

const VERBS = [
  {word: 'CONSTRUIR.', src: 'media/v3/construir.mp4', cam: (u: number) => ({s: lerp(1.0, 1.07, u)})},
  {word: 'ESCALAR.', src: 'media/v3/escalar.mp4', cam: (u: number) => ({s: lerp(1.14, 1.02, u)})},
  {word: 'LIDERAR.', src: 'media/v3/liderar.mp4', cam: (u: number) => ({s: 1.06, tx: lerp(30, -30, u)})},
];

const Verbs: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T15.verbs[0] || f >= T16.collapse[1]) return null;
  const k = f >= T15.verbs[2] ? 2 : f >= T15.verbs[1] ? 1 : 0;
  const v = VERBS[k];
  const s = T15.verbs[k];
  const next = k < 2 ? T15.verbs[k + 1] : T16.collapse[0];
  const u = ramp(f, s, next + 20, glide);
  const col = ramp(f, T16.collapse[0], T16.collapse[1], pull);
  const sc = lerpLog(1, 0.004, col);
  const radius = lerp(1300, 0, col);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${sc})`, transformOrigin: `${W / 2}px ${SIG.lineY}px`, clipPath: col > 0 ? `circle(${radius}px at ${W / 2}px ${SIG.lineY}px)` : undefined}}>
      <Plate cam={v.cam(u)} filter="contrast(1.05) saturate(0.95)">
        <ClipVideo src={v.src} from={s - 10} />
      </Plate>
      <div style={{position: 'absolute', left: 0, top: RULER_Y - 320, width: W, height: 320, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))'}} />
      {f < T16.collapse[0] ? <LineMB at={lineNavy} f={f} /> : null}
      <ImpactWord key={k} word={v.word} x={WORD_X} baseY={RULER_Y} at={s + 1} inDur={12} />
    </div>
  );
};

/* ================================================================== B16 · assinatura */

const Signature: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T16.logo - 1) return null;
  const logoW = (SIG.logoH * 2901) / 563;
  const lr = ramp(f, T16.logo, T16.logo + 18, settle);
  const titleW = wordWidth('BUILD 2030') * SIG.titleSize;
  return (
    <>
      <div style={{position: 'absolute', left: W / 2 - logoW / 2, top: SIG.logoBase - SIG.logoH, width: logoW, height: SIG.logoH + 2, overflow: 'hidden'}}>
        <Img src={staticFile('brand/gavea-group_hor_branco.png')} style={{position: 'absolute', left: 0, top: (1 - lr) * (SIG.logoH + 4), width: logoW, height: SIG.logoH}} />
      </div>
      <ImpactWord word="BUILD 2030" x={W / 2 - titleW / 2} baseY={SIG.titleBase} at={T16.title} size={SIG.titleSize} inDur={16} />
      <TickLabel text="Brand & Marketing Direction" x={W / 2 - SIG.half} y={SIG.lineY + 22} at={T16.labels[0]} size={15} color={C.tealSoft} />
      <TickLabel text="New Technologies & AI" x={W / 2 + SIG.half} y={SIG.lineY + 22} at={T16.labels[1]} size={15} color={C.tealSoft} align="right" />
      <LineSentence text="Vamos construir?" x={W / 2} baseY={836} at={T16.sentence} size={62} align="center" />
      <TickLabel text="AERA" x={W / 2 - 26} y={986} at={T16.aera} size={16} color={C.cream} tracking={0.32} />
    </>
  );
};

/* ================================================================== a linha na fase navy (B11 → B16) */

const TRACK_A = 880;
const TRACK_B = 1012;

export const lineNavy = (f: number): LineState | null => {
  if (f < T11.invert[0] || f >= FILM_END) return null;
  const col = C.tealSoft;
  // B11 · o trilho AERA desce e vira a régua do real
  if (f < T12.rulerUp[0]) {
    const y = lerp(RAILS[1].y, RULER_Y, ramp(f, T11.lineDown[0], T11.lineDown[1], glide));
    return {pts: [[M, y], [W - M, y]], color: f < T11.invert[0] + 6 ? C.teal : col};
  }
  // B12 · sobe e se contrai até a largura da barra; vira a barra; volta a ser linha no fechamento
  if (f < T13.pivot[0]) {
    if (f < T12.trade[0]) {
      const u = ramp(f, T12.rulerUp[0], T12.rulerUp[1], glide);
      const y = lerp(RULER_Y, BAR.y, u);
      return {pts: [[lerp(M, W / 2 - TRADE.w / 2, u), y], [lerp(W - M, W / 2 + TRADE.w / 2, u), y]], color: col};
    }
    if (barState(f).h > 3 || f < T12.close[0]) return null;
    return {pts: [[BAR.cx - BAR.half, BAR.upY], [BAR.cx + BAR.half, BAR.upY]], color: col};
  }
  // B13 · pivota e vira a costura vertical; no fim pivota de novo e deita na base
  if (f < T13.out[1]) {
    const pv = ramp(f, T13.pivot[0], T13.pivot[1], glide);
    const back = ramp(f, T13.out[0], T13.out[1], glide);
    const cx = W / 2;
    const cy = lerp(lerp(BAR.upY, H / 2, pv), RULER_Y, back);
    const ang = lerp(0, Math.PI / 2, pv) + lerp(0, Math.PI / 2, back);
    const half = lerp(lerp(BAR.half, H / 2 + 6, pv), W / 2 + 6, back);
    return {pts: [[cx - Math.cos(ang) * half, cy - Math.sin(ang) * half], [cx + Math.cos(ang) * half, cy + Math.sin(ang) * half]], color: pv < 1 || back > 0 ? col : C.teal, width: lerp(2.6, 3.4, pv * (1 - back))};
  }
  // B14 · a base se divide em duas trilhas (as duas frentes) que convergem e pousam juntas na linha d'água
  if (f < T15.lineDrop[0]) {
    const sp = ramp(f, T14.tracks[0], T14.tracks[1], settle);
    const c = ramp(f, T14.toWater[0], T14.toWater[1], glide);
    const yA = lerp(lerp(RULER_Y, TRACK_A, sp), WATER_Y, c);
    const yB = lerp(lerp(RULER_Y, TRACK_B, sp), WATER_Y, c);
    const land = ramp(f, T14.toWater[1] - 6, T14.toWater[1] + 2) * (1 - ramp(f, T14.toWater[1] + 4, T14.toWater[1] + 24, glide));
    return {pts: [[0, yA], [W, yA]], color: c > 0.98 ? C.head : col, width: 2.6, glow: 0.6 * land, opacity: 0.95, branches: c < 0.999 ? [{a: [0, yB], b: [W, yB]}] : []};
  }
  // B15 · régua dos verbos
  if (f < T16.collapse[0]) {
    const t = ramp(f, T15.lineDrop[0], T15.lineDrop[1], glide);
    return {pts: [[lerp(0, M, t), lerp(WATER_Y, RULER_Y, t)], [lerp(W, W - M, t), lerp(WATER_Y, RULER_Y, t)]], color: lerp(0, 1, t) > 0.5 ? col : C.head};
  }
  // B16 · colapsa num ponto; o ponto traça a régua da assinatura
  const c = ramp(f, T16.collapse[0], T16.collapse[1], pull);
  const l = ramp(f, T16.line[0], T16.line[1], settle);
  const y = lerp(RULER_Y, SIG.lineY, c);
  const half = f < T16.line[0] ? lerp(W / 2 - M, 0, c) : lerp(0, SIG.half, l);
  const headO = ramp(f, T16.collapse[1] - 6, T16.collapse[1]) * (1 - ramp(f, T16.line[1] - 4, T16.line[1] + 10));
  return {pts: [[W / 2 - half, y], [W / 2 + half + 0.01, y]], color: col, head: headO > 0 ? {p: [W / 2, y], o: headO} : null};
};

/* ================================================================== camadas navy (acima do disco) */

export const NavyLayers: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T11.invert[0]) return null;
  const inv = ramp(f, T11.invert[0], T11.invert[1], settle);
  const r = lerp(0, 2400, inv);
  return (
    <>
      <div style={{position: 'absolute', left: NAVY_ORIGIN[0] - r, top: NAVY_ORIGIN[1] - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.navyDeep}} />
      {/* B11 */}
      {f < T12.collapse[1] + 1
        ? [0, 1, 2].map((k) => (f >= C11[k] - 6 && f < (k < 2 ? N11[k] + 18 : T12.collapse[1] + 1) ? <Plane11 key={k} k={k} /> : null))
        : null}
      {f < B11_END + 4 ? (
        <div style={{position: 'absolute', left: 0, top: RULER_Y - 300, width: W, height: 300, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))', opacity: ramp(f, C11[0], C11[0] + 12) * (1 - ramp(f, B11_END - 6, B11_END + 4))}} />
      ) : null}
      {f < T12.rulerUp[0] ? <LineMB at={lineNavy} f={f} /> : null}
      <Tags11 />
      <TickLabel text="02 · New Technologies & AI" x={M} y={64} at={T11.index} out={T12.close[0]} size={15} color={C.tealSoft} />
      {WORDS11.map((w, k) => (
        <ImpactWord key={w} word={w} x={WORD_X} baseY={RULER_Y} at={C11[k]} out={N11[k] - 8} />
      ))}
      {WORDS11.map((_, k) => (
        <TickLabel key={k} text={`0${k + 1} / 03`} x={W - M} y={ANCHOR_Y + 8} at={C11[k]} out={N11[k] - 2} size={16} color={C.cream} align="right" />
      ))}
      <TickLabel text="Do real à informação" x={WORD_X + 8} y={ANCHOR_Y} at={C11[0] + 2} out={B11_END - 6} size={TYPE.n4 + 1} color={C.tealSoft} tracking={0.22} />
      {/* B12 */}
      <TradeWindow />
      <OneMoment />
      {/* B13 / B14 */}
      <Split />
      <MemoryStack />
      <Panorama />
      <TickLabel text="04 · A visão" x={M} y={64} at={T14.index} out={T15.verbs[0] - 6} size={15} color={C.cream} />
      <MaskLines lines={['Duas frentes.', 'Uma mesma direção.']} x={M} y={GRID.top} at={T14.sentence} out={T15.verbs[0] - 10} stagger={T14.sentenceStagger} />
      <TickLabel text="01 · Marca e marketing" x={M} y={TRACK_A - 30} at={T14.tracks[0] + 6} out={T14.toWater[0]} size={14} color={C.tealSoft} />
      <TickLabel text="02 · Novas tecnologias e IA" x={M} y={TRACK_B + 14} at={T14.tracks[0] + 10} out={T14.toWater[0]} size={14} color={C.tealSoft} />
      {f >= T12.rulerUp[0] && f < T15.verbs[0] ? <LineMB at={lineNavy} f={f} /> : null}
      {/* B15 / B16 */}
      <Verbs />
      {f >= T16.collapse[0] ? <LineMB at={lineNavy} f={f} /> : null}
      <Signature />
    </>
  );
};

export const PART2_END = FILM_END;
