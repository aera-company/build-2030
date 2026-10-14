/**
 * GAVEA / BUILD 2030 · V5 · D e E · o centro do filme.
 * D (benchmark) "Duas frentes que se encontram no mesmo ponto": duas linhas, uma de cada lado, chegam juntas ao ponto;
 *   MARCA, NEGÓCIO e TECNOLOGIA nascem como três campos; "trabalhando juntos" acende a interseção; AERA aparece nela.
 * E "Transformar estratégia em sistema": os serviços das duas frentes aparecem soltos; em "sistema" a linha do encontro
 *   se divide nas duas frentes e cada fragmento trava no seu lugar, ligado ao eixo da AERA. "E sistema em movimento":
 *   pacotes correm, as frentes se ligam por arcos, imagens viajam; uma delas sai do centro e vira o plano do CONSTRUIR.
 */
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {C, H, M, micro, W} from '../motion/design';
import {glide, lerp, leave, Pt, pull, ramp, settle} from '../motion/easing';
import {E0, FIELD, FIELD_ANG, SLOT_X, Y_A, Y_B} from '../motion/geometry';
import {T_A, T_D, T_E} from '../motion/timing';
import {DUO_FILTER} from '../primitives/Grade';
import {LineMB, type LineState} from '../primitives/Line';
import {ClipVideo} from '../primitives/Media';
import {BlurDef, TickLabel} from '../primitives/Type';

const END = T_E.hero[1] + 2;
/** logo oficial da AERA (wordmark escuro, sem a tagline), sem distorção: 600×102 */
const LOGO = {w: 300, h: 51};
const LIFT = 110; // na fala da agência o sistema sobe e abre espaço embaixo
const Y_G = 900; // a linha da execução (agência), em coordenadas de tela
const MARK_X = [400, 1280, 1560];
const lift = (f: number) => LIFT * ramp(f, T_A.lift[0], T_A.lift[1], glide);

/* ================================================================== D · os três campos */

const absorb = (f: number) => ramp(f, T_E.absorb[0], T_E.absorb[1], glide);
const fieldCenter = (f: number, k: number): Pt => {
  const d = FIELD.d * (1 - absorb(f));
  return [E0[0] + Math.cos(FIELD_ANG[k]) * d, E0[1] + Math.sin(FIELD_ANG[k]) * d];
};

const Fields: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_D.fields[0] - 1 || f > T_E.absorb[1]) return null;
  const ab = absorb(f);
  const lit = ramp(f, T_D.together[0], T_D.together[1], settle) * (1 - ab);
  const circles = [0, 1, 2].map((k) => {
    const g = ramp(f, T_D.fields[k], T_D.fields[k] + 20, settle);
    return {c: fieldCenter(f, k), r: FIELD.r * lerp(0.86, 1, g) * (1 - ab), g};
  });
  const breathe = 1 + 0.012 * Math.sin((f - T_D.fields[0]) / 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
      <defs>
        {circles.map((c, k) => (
          <clipPath key={k} id={`v5fd${k}`}>
            <circle cx={c.c[0]} cy={c.c[1]} r={Math.max(0.1, c.r * breathe)} />
          </clipPath>
        ))}
      </defs>
      {circles.map((c, k) => (c.g > 0 ? <circle key={k} cx={c.c[0]} cy={c.c[1]} r={Math.max(0.1, c.r * breathe)} fill="rgba(27,143,181,0.045)" opacity={c.g} /> : null))}
      {lit > 0 ? (
        <g clipPath="url(#v5fd0)">
          <g clipPath="url(#v5fd1)">
            <circle cx={circles[2].c[0]} cy={circles[2].c[1]} r={Math.max(0.1, circles[2].r * breathe)} fill={C.teal} opacity={0.17 * lit} />
          </g>
        </g>
      ) : null}
      {circles.map((c, k) =>
        c.g > 0 ? (
          <circle key={`s${k}`} cx={c.c[0]} cy={c.c[1]} r={Math.max(0.1, c.r * breathe)} fill="none" stroke={C.ink} strokeWidth={1.3} opacity={0.45} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - c.g} transform={`rotate(${[-200, -20, 70][k]} ${c.c[0]} ${c.c[1]})`} />
        ) : null,
      )}
    </svg>
  );
};

const FieldLabels: React.FC = () => {
  const names = ['Marca', 'Negócio', 'Tecnologia'];
  return (
    <>
      {names.map((n, k) => {
        const c = [E0[0] + Math.cos(FIELD_ANG[k]) * FIELD.d, E0[1] + Math.sin(FIELD_ANG[k]) * FIELD.d];
        const pos = k === 0 ? {x: c[0] - FIELD.r * 0.78, y: c[1] - FIELD.r * 0.78 - 26, align: 'right' as const} : k === 1 ? {x: c[0] + FIELD.r * 0.78, y: c[1] - FIELD.r * 0.78 - 26, align: 'left' as const} : {x: c[0] + FIELD.r * 0.62, y: c[1] + FIELD.r * 0.8, align: 'left' as const};
        return <TickLabel key={n} text={n} x={pos.x} y={pos.y} at={T_D.fields[k] + 3} out={T_E.absorb[0] - 4} size={22} color={C.ink} tracking={0.22} align={pos.align} />;
      })}
    </>
  );
};

/* ================================================================== E · os fragmentos das duas frentes */

const CHIPS = [
  // frente 01 (régua de cima)
  {t: 'Posicionamento', p: [240, 180], r: -9},
  {t: 'Design system', p: [660, 240], r: 6},
  {t: 'Planejamento', p: [1180, 170], r: -4},
  {t: 'Direção criativa', p: [1560, 250], r: 11},
  {t: 'Comunicação', p: [300, 620], r: -7},
  {t: 'Conexão comercial', p: [1480, 610], r: 8},
  {t: 'Oportunidades', p: [820, 880], r: -12},
  // frente 02 (régua de baixo)
  {t: 'Sistemas de IA', p: [540, 430], r: 5},
  {t: 'Automações', p: [1320, 420], r: -6},
  {t: 'Conhecimento', p: [170, 900], r: 9},
  {t: 'Processos', p: [1080, 960], r: -5},
  {t: 'Ferramentas internas', p: [1620, 880], r: 7},
  {t: 'Apoio à decisão', p: [700, 720], r: -10},
  {t: 'Novas tecnologias', p: [1250, 740], r: 4},
] as const;
const slotOf = (i: number): Pt => [SLOT_X[i % 7], i < 7 ? Y_A : Y_B];
const chipIn = (f: number, i: number) => ramp(f, T_E.scatter + i * T_E.scatterStep, T_E.scatter + i * T_E.scatterStep + 10, settle);
const chipSnap = (f: number, i: number) => ramp(f, T_E.snap[0] + (i % 7), T_E.snap[1] + (i % 7), settle);

const Chips: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_E.scatter - 1 || f >= T_E.hero[1]) return null;
  const fade = 1 - ramp(f, T_E.hero[0] + 6, T_E.hero[1] - 4);
  return (
    <>
      {CHIPS.map((c, i) => {
        const a = chipIn(f, i);
        if (a <= 0) return null;
        const s = chipSnap(f, i);
        const sp = chipSnap(f - 1, i);
        const sl = slotOf(i);
        const drift = (1 - s) * Math.sin(f / 19 + i) * 8;
        const x = lerp(c.p[0], sl[0], s);
        const y = lerp(c.p[1] + drift, sl[1], s);
        const vx = x - lerp(c.p[0], sl[0], sp);
        const vy = y - lerp(c.p[1], sl[1], sp);
        const rot = lerp(c.r, 0, s);
        const above = i < 7 ? (i % 7) % 2 === 0 : (i % 7) % 2 === 1;
        const id = `chipmb${i}`;
        const bx = Math.min(10, Math.abs(vx) * 0.35);
        const by = Math.min(10, Math.abs(vy) * 0.35);
        const mb = bx + by > 0.5;
        const ty = s >= 1 ? (above ? -30 : 12) : -9;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${lerp(0.7, 1, a)})`, transformOrigin: '0 0', opacity: a * fade, filter: mb ? `url(#${id})` : undefined}}>
            {mb ? <BlurDef id={id} sx={bx} sy={by} /> : null}
            <div style={{position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: C.teal}} />
            <div style={{position: 'absolute', left: s >= 1 ? 0 : 14, top: lerp(-9, ty, ramp(f, T_E.snap[1], T_E.snap[1] + 8, settle)), whiteSpace: 'nowrap', ...micro(14, C.ink, 0.14), textTransform: 'uppercase'}}>{c.t}</div>
          </div>
        );
      })}
    </>
  );
};

/* ================================================================== E · o sistema em movimento */

const ARCS: Array<[number, number]> = [[0, 4], [2, 3], [4, 2], [5, 0], [1, 6], [6, 5]];
const arcPt = (a: number, b: number, t: number): Pt => {
  const x0 = SLOT_X[a];
  const x1 = SLOT_X[b];
  const u = 1 - t;
  return [u * u * u * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x1 + t * t * t * x1, u * u * u * Y_A + 3 * u * u * t * E0[1] + 3 * u * t * t * E0[1] + t * t * t * Y_B];
};
const TILES = [
  {src: 'media/v3/designsystem.png', path: (t: number): Pt => [lerp(E0[0], W - M - 80, t), Y_A]},
  {src: 'media/trade/08-historico.png', path: (t: number): Pt => [lerp(E0[0], M + 80, t), Y_B]},
  {src: 'media/v3/mem/m03.jpg', path: (t: number): Pt => arcPt(0, 4, t)},
  {src: 'media/v3/intel.png', path: (t: number): Pt => [lerp(E0[0], W - M - 80, t), Y_B]},
  {src: 'media/v3/mem/m07.jpg', path: (t: number): Pt => [lerp(E0[0], M + 80, t), Y_A]},
  {src: 'media/trade/03-propostas.png', path: (t: number): Pt => arcPt(5, 0, 1 - t)},
];

const Motion: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_E.flow || f >= T_E.hero[1]) return null;
  const fade = 1 - ramp(f, T_E.hero[0] + 6, T_E.hero[1] - 4);
  const items: React.ReactNode[] = [];
  // pacotes nas duas réguas, sempre saindo do eixo
  [Y_A, Y_B].forEach((y, r) => {
    for (let j = 0; j < 3; j++) {
      for (const dir of [-1, 1]) {
        const ph = (((f - T_E.flow) * 1 + j * 12 + r * 6) % 36) / 36;
        const x = E0[0] + dir * ph * (W / 2 - M);
        items.push(<circle key={`p${r}${j}${dir}`} cx={x} cy={y} r={3.6} fill={C.teal} opacity={Math.min(1, ph * 8, (1 - ph) * 5) * ramp(f, T_E.flow, T_E.flow + 8)} />);
      }
    }
  });
  // as frentes se ligam
  ARCS.forEach(([a, b], k) => {
    const at = T_E.arcs + k * 3;
    const g = ramp(f, at, at + 12, settle);
    if (g <= 0) return;
    const d = `M ${SLOT_X[a]} ${Y_A} C ${SLOT_X[a]} ${E0[1]} ${SLOT_X[b]} ${E0[1]} ${SLOT_X[b]} ${Y_B}`;
    const ph = ((f - at) % 30) / 30;
    const p = arcPt(a, b, ph);
    items.push(
      <g key={`a${k}`}>
        <path d={d} fill="none" stroke={C.teal} strokeWidth={1.2} opacity={0.6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
        {g >= 1 ? <circle cx={p[0]} cy={p[1]} r={3.4} fill={C.teal} opacity={Math.min(1, ph * 6, (1 - ph) * 6)} /> : null}
      </g>,
    );
  });
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fade}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        {items}
      </svg>
      {/* imagens começam a viajar pelas rotas */}
      {TILES.map((tl, k) => {
        const a = T_E.travel + k * 3;
        if (f < a || f > a + 40) return null;
        const t = ramp(f, a, a + 40, glide);
        const tp = ramp(f - 1, a, a + 40, glide);
        const p = tl.path(t);
        const q = tl.path(tp);
        const id = `tlmb${k}`;
        const bx = Math.min(12, Math.abs(p[0] - q[0]) * 0.3);
        const by = Math.min(12, Math.abs(p[1] - q[1]) * 0.3);
        const o = Math.min(1, t * 6, (1 - t) * 6);
        return (
          <div key={k} style={{position: 'absolute', left: p[0] - 68, top: p[1] - 38, width: 136, height: 77, overflow: 'hidden', opacity: o, boxShadow: '0 10px 30px rgba(10,24,38,0.25)', filter: bx + by > 0.5 ? `url(#${id})` : undefined}}>
            {bx + by > 0.5 ? <BlurDef id={id} sx={bx} sy={by} /> : null}
            <div style={{position: 'absolute', inset: 0, filter: DUO_FILTER}}>
              <Img src={staticFile(tl.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** O logo oficial nasce da linha na interseção (máscara na linha, sem fade, sem brilho) e vira o centro do sistema. */
const AeraLogo: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_D.aera - 1 || f > T_E.hero[0] + 12) return null;
  const a = ramp(f, T_D.aera, T_D.aera + 18, settle);
  const out = ramp(f, T_E.hero[0] - 2, T_E.hero[0] + 10, leave);
  const rise = (1 - a + out) * (LOGO.h + 12);
  return (
    <div style={{position: 'absolute', left: E0[0] - LOGO.w / 2, top: E0[1] - 10 - LOGO.h, width: LOGO.w, height: LOGO.h + 2, overflow: 'hidden'}}>
      <Img src={staticFile('brand/aera-wordmark_ink.png')} style={{position: 'absolute', left: 0, top: rise, width: LOGO.w, height: LOGO.h}} />
    </div>
  );
};

/** "A AERA estrutura a direção. A agência segue na execução…": o eixo da AERA desce até a linha da execução. */
const Agency: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_A.agency - 8 || f > T_E.hero[0] + 8) return null;
  const out = 1 - ramp(f, T_A.out, T_E.hero[0] + 6);
  const yB = Y_B - LIFT;
  const ax = ramp(f, T_A.agency - 8, T_A.agency + 8, settle);
  const ln = ramp(f, T_A.agency, T_A.agency + 18, settle);
  const ex = Math.max(0, 1 - Math.abs(f - T_A.exec - 6) / 12);
  const items: React.ReactNode[] = [];
  // a direção desce pelo eixo e se espalha na execução
  if (ln >= 1) {
    for (let j = 0; j < 3; j++) {
      const ph = (((f - T_A.agency - 18) + j * 10) % 30) / 30;
      const down = Math.min(1, ph * 2.2);
      const spread = Math.max(0, ph * 2.2 - 1) / 1.2;
      if (down < 1) items.push(<circle key={`d${j}`} cx={E0[0]} cy={lerp(yB, Y_G, down)} r={3.6} fill={C.teal} />);
      else for (const dir of [-1, 1]) items.push(<circle key={`s${j}${dir}`} cx={E0[0] + dir * spread * (W / 2 - M)} cy={Y_G} r={3.4} fill={C.teal} opacity={1 - spread} />);
    }
  }
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: W, height: H}}>
        <line x1={E0[0]} y1={yB} x2={E0[0]} y2={lerp(yB, Y_G, ax)} stroke={C.teal} strokeWidth={2.4} />
        <line x1={E0[0]} y1={Y_G} x2={lerp(E0[0], W - M, ln)} y2={Y_G} stroke={ex > 0 ? C.teal : C.ink} strokeWidth={1.3 + ex} opacity={0.75} />
        <line x1={E0[0]} y1={Y_G} x2={lerp(E0[0], M, ln)} y2={Y_G} stroke={ex > 0 ? C.teal : C.ink} strokeWidth={1.3 + ex} opacity={0.75} />
        {MARK_X.map((x, k) => {
          const g = ramp(f, T_A.marks[k], T_A.marks[k] + 8, settle);
          return g > 0 ? <circle key={k} cx={x} cy={Y_G} r={5.5 * g} fill={C.ink} /> : null;
        })}
        {items}
      </svg>
      <TickLabel text="AERA · Direção" x={E0[0] + 16} y={E0[1] - LIFT + 12} at={T_A.direction} size={15} color={C.teal} tracking={0.18} />
      <TickLabel text="Agência · Execução" x={M} y={Y_G - 32} at={T_A.agency + 2} size={16} color={C.ink} tracking={0.18} />
      {['Planejamento', 'Critérios', 'Visão comum'].map((n, k) => (
        <TickLabel key={n} text={n} x={MARK_X[k] + 14} y={Y_G + 12} at={T_A.marks[k] + 1} size={14} color={C.ink} tracking={0.16} />
      ))}
    </div>
  );
};

/** Uma imagem sai do centro (a cor chega) e vira o plano do CONSTRUIR. */
const Hero: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_E.hero[0] || f > T_E.hero[1] + 1) return null;
  const g = ramp(f, T_E.hero[0], T_E.hero[1], pull);
  const gp = ramp(f - 1, T_E.hero[0], T_E.hero[1], pull);
  const w = lerp(150, W, g);
  const h = (w * 9) / 16;
  const cy = lerp(E0[1] - LIFT - 30, H / 2, g);
  const v = (w - lerp(150, W, gp)) * 0.5;
  const blur = Math.min(8, v * 0.05);
  return (
    <div style={{position: 'absolute', left: W / 2 - w / 2, top: cy - h / 2, width: w, height: h, overflow: 'hidden', boxShadow: g < 1 ? '0 30px 80px rgba(10,24,38,0.35)' : undefined, filter: blur > 0.4 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${w / W})`, transformOrigin: '0 0', filter: 'contrast(1.05) saturate(0.95)'}}>
        <ClipVideo src="media/v3/construir.mp4" from={T_E.hero[0]} />
      </div>
    </div>
  );
};

/* ================================================================== a linha do centro */

export const lineCenter = (f: number): LineState | null => {
  if (f < T_D.invert[0] + 4 || f >= T_E.hero[0] + 10) return null;
  const y = E0[1];
  const col = C.teal;
  if (f < T_D.converge[0]) return {pts: [E0, [E0[0] + 0.01, y]], color: col, head: {p: E0, o: 1}, headColor: C.teal};
  if (f < T_D.converge[1]) {
    const c = ramp(f, T_D.converge[0], T_D.converge[1], settle);
    const xl = lerp(-10, E0[0], c);
    const xr = lerp(W + 10, E0[0], c);
    return {pts: [[0, y], [Math.max(0.01, xl), y]], color: col, branches: [{a: [W, y], b: [xr, y]}], nodes: [{p: E0, r: 4, o: 1}, {p: [xr, y], r: 4.6, o: 1}], head: {p: [xl, y], o: 1}, headColor: C.teal};
  }
  // a luz corre pela linha, dos dois lados, e chega à interseção no tempo do logo
  const pul = f >= T_D.pulse[0] && f < T_D.pulse[1] ? ramp(f, T_D.pulse[0], T_D.pulse[1], (u) => u * u) : -1;
  const pulses = pul >= 0 ? [{p: [lerp(0, E0[0], pul), y] as Pt, r: 4.5, o: 1}, {p: [lerp(W, E0[0], pul), y] as Pt, r: 4.5, o: 1}] : [];
  const sp = ramp(f, T_E.split[0], T_E.split[1], settle);
  const ax = ramp(f, T_E.axis[0], T_E.axis[1], settle);
  const yA = lerp(y, Y_A, sp);
  const yB = lerp(y, Y_B, sp);
  const x0 = lerp(0, M, sp);
  const x1 = lerp(W, W - M, sp);
  const flash = Math.max(1 - ramp(f, T_D.converge[1], T_D.converge[1] + 16), ramp(f, T_D.aera - 2, T_D.aera) * (1 - ramp(f, T_D.aera, T_D.aera + 14)));
  const branches: NonNullable<LineState['branches']> = [{a: [x0, yB], b: [x1, yB]}];
  if (ax > 0) {
    branches.push({a: [E0[0], Y_A], b: [E0[0], lerp(Y_A, y - LOGO.h - 16, ax)]});
    branches.push({a: [E0[0], Y_B], b: [E0[0], lerp(Y_B, y + 22, ax)]});
  }
  const fade = 1 - ramp(f, T_E.hero[0], T_E.hero[0] + 10);
  return {pts: [[x0, yA], [x1, yA]], color: col, branches: sp > 0 ? branches : [], nodes: pulses, head: flash > 0 ? {p: E0, o: flash} : null, headColor: C.teal, opacity: fade};
};

export const Center: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T_D.invert[0] || f >= END) return null;
  const inv = ramp(f, T_D.invert[0], T_D.invert[1], settle);
  const radius = lerp(0, 2350, inv);
  const drift = lerp(1, 1.02, ramp(f, T_D.invert[0], T_E.split[0], glide));
  return (
    <>
      <div style={{position: 'absolute', left: E0[0] - radius, top: E0[1] - radius, width: radius * 2, height: radius * 2, borderRadius: '50%', background: C.cream}} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-lift(f)}px) scale(${lerp(drift, 1, ramp(f, T_E.split[0], T_E.split[1], settle))})`, transformOrigin: `${E0[0]}px ${E0[1]}px`}}>
        <Fields />
        <FieldLabels />
        <LineMB at={lineCenter} f={f} />
        <Chips />
        <Motion />
        <AeraLogo />
        <TickLabel text="01 · Marca e marketing" x={M} y={Y_A - 70} at={T_E.labels} out={T_E.hero[0]} size={15} color={C.teal} />
        <TickLabel text="02 · Novas tecnologias e IA" x={M} y={Y_B + 54} at={T_E.labels + 4} out={T_E.hero[0]} size={15} color={C.teal} />
      </div>
      <Agency />
      <Hero />
    </>
  );
};
