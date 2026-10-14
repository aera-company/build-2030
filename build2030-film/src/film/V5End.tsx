/**
 * GAVEA / BUILD 2030 · V5 · F · verbos e assinatura.
 * Três acentos musicais: CONSTRUIR (a imagem que veio viajando do sistema), ESCALAR e LIDERAR sobem da régua no tempo.
 * Depois o mundo colapsa num ponto; o ponto traça a régua; marca oficial e BUILD 2030 com a voz ("Gávia Build 2030");
 * um único pouso musical em "2030". Sem frase final.
 */
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {wordWidth} from '../components/GlyphWord';
import {C, M, W} from '../motion/design';
import {glide, lerp, lerpLog, pull, ramp, settle} from '../motion/easing';
import {RULER_Y, SIG, WORD_X} from '../motion/geometry';
import {FILM_END, T15, T16, T_E} from '../motion/timing';
import {LineMB, type LineState} from '../primitives/Line';
import {ClipVideo, inset, Plate} from '../primitives/Media';
import {ImpactWord, TickLabel} from '../primitives/Type';

const VERBS = ['CONSTRUIR.', 'ESCALAR.', 'LIDERAR.'];

const VerbPlate: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame();
  const s = T15.verbs[k];
  const next = k < 2 ? T15.verbs[k + 1] : T16.collapse[0];
  const u = ramp(f, s, next + 16, glide);
  // ESCALAR e LIDERAR sobem de dentro da régua em 8 frames, no acento
  const p = k === 0 ? 1 : ramp(f, s - 4, s + 6, settle);
  const clip = k === 0 ? undefined : inset(RULER_Y * (1 - p), 0, 0, 0);
  if (k === 0) {
    return (
      <Plate cam={{s: lerp(1.0, 1.08, u)}} filter="contrast(1.05) saturate(0.95)">
        <ClipVideo src="media/v3/construir.mp4" from={T_E.hero[0]} />
      </Plate>
    );
  }
  if (k === 1) {
    return (
      <Plate clip={clip} cam={{s: lerp(1.16, 1.03, u), ty: lerp(40, 0, p)}} filter="contrast(1.05) saturate(0.95)">
        <ClipVideo src="media/v3/escalar.mp4" from={s - 6} />
      </Plate>
    );
  }
  return (
    <Plate clip={clip} cam={{s: lerp(1.04, 1.12, u), tx: lerp(30, -40, u), ty: lerp(40, 0, p), oy: 360}} filter="contrast(1.04) saturate(1.02)">
      <Img src={staticFile('media/v3/panorama.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    </Plate>
  );
};

export const lineEnd = (f: number): LineState | null => {
  if (f < T15.line[0] || f >= FILM_END) return null;
  const col = C.tealSoft;
  if (f < T16.collapse[0]) {
    const g = ramp(f, T15.line[0], T15.line[1], settle);
    return {pts: [[lerp(W / 2, M, g), RULER_Y], [lerp(W / 2, W - M, g), RULER_Y]], color: col};
  }
  const c = ramp(f, T16.collapse[0], T16.collapse[1], pull);
  const l = ramp(f, T16.line[0], T16.line[1], settle);
  const y = lerp(RULER_Y, SIG.lineY, c);
  const half = f < T16.line[0] ? lerp(W / 2 - M, 0, c) : lerp(0, SIG.half, l);
  const headO = ramp(f, T16.collapse[1] - 6, T16.collapse[1]) * (1 - ramp(f, T16.line[1] - 4, T16.line[1] + 10));
  return {pts: [[W / 2 - half, y], [W / 2 + half + 0.01, y]], color: col, head: headO > 0 ? {p: [W / 2, y], o: headO} : null};
};

const Signature: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T16.logo - 1) return null;
  const logoW = (SIG.logoH * 2901) / 563;
  const lr = ramp(f, T16.logo, T16.logo + 16, settle);
  const titleW = wordWidth('BUILD 2030') * SIG.titleSize;
  return (
    <>
      <div style={{position: 'absolute', left: W / 2 - logoW / 2, top: SIG.logoBase - SIG.logoH, width: logoW, height: SIG.logoH + 2, overflow: 'hidden'}}>
        <Img src={staticFile('brand/gavea-group_hor_branco.png')} style={{position: 'absolute', left: 0, top: (1 - lr) * (SIG.logoH + 4), width: logoW, height: SIG.logoH}} />
      </div>
      <ImpactWord word="BUILD 2030" x={W / 2 - titleW / 2} baseY={SIG.titleBase} at={T16.title} size={SIG.titleSize} inDur={14} track={60} />
      <TickLabel text="Brand & Marketing Direction" x={W / 2 - SIG.half} y={SIG.lineY + 22} at={T16.labels[0]} size={15} color={C.tealSoft} />
      <TickLabel text="New Technologies & AI" x={W / 2 + SIG.half} y={SIG.lineY + 22} at={T16.labels[1]} size={15} color={C.tealSoft} align="right" />
      {/* assinatura da AERA: o wordmark oficial (branco, sem tagline), pequeno, revelado por máscara */}
      {f >= T16.aera - 1 ? (
        <div style={{position: 'absolute', left: W / 2 - 54, top: 940, width: 108, height: 20, overflow: 'hidden'}}>
          <Img src={staticFile('brand/aera-wordmark_branco.png')} style={{position: 'absolute', left: 0, top: (1 - ramp(f, T16.aera, T16.aera + 14, settle)) * 20, width: 108, height: 18}} />
        </div>
      ) : null}
    </>
  );
};

export const Ending: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T15.verbs[0]) return null;
  const k = f >= T15.verbs[2] ? 2 : f >= T15.verbs[1] ? 1 : 0;
  const col = ramp(f, T16.collapse[0], T16.collapse[1], pull);
  const sc = lerpLog(1, 0.004, col);
  const radius = lerp(1300, 0, col);
  return (
    <>
      {f < T16.collapse[1] ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${sc})`, transformOrigin: `${W / 2}px ${SIG.lineY}px`, clipPath: col > 0 ? `circle(${radius}px at ${W / 2}px ${SIG.lineY}px)` : undefined}}>
          {[0, 1, 2].map((j) => (j <= k && j >= k - 1 ? <VerbPlate key={j} k={j} /> : null))}
          <div style={{position: 'absolute', left: 0, top: RULER_Y - 320, width: W, height: 320, background: 'linear-gradient(rgba(5,15,26,0), rgba(5,15,26,0.55))'}} />
          {f < T16.collapse[0] ? <LineMB at={lineEnd} f={f} /> : null}
          {VERBS.map((v, j) => (
            <ImpactWord key={v} word={v} x={WORD_X} baseY={RULER_Y} at={T15.verbs[j] + 1} out={j < 2 ? T15.verbs[j + 1] - 5 : T16.collapse[0] - 2} inDur={10} track={j === 0 ? 0 : 50} />
          ))}
        </div>
      ) : null}
      {f >= T16.collapse[0] ? <LineMB at={lineEnd} f={f} /> : null}
      <Signature />
    </>
  );
};
