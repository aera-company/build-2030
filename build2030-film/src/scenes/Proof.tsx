import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain} from '../components/Grain';
import {Rule, Node, Reveal} from '../components/Field';
import {Written, baselineFor} from '../components/Written';
import {wordWidth} from '../components/GlyphWord';
import {expoOut, glide, leave, ramp, settle} from '../film/motion';
import {FPS, H, MUTED, NAVY, NAVY_DEEP, TEAL, TEAL_SOFT, W, WHITE, indexStyle, microStyle, sentenceStyle} from '../film/tokens';
import {FRONTS, LABELS, SPRINT, T, VERBS} from '../data/proof';
import {Bed, ScratchVoice, SfxTrack} from '../components/Audio';

/* ------------------------------------------------------------------
   PROVA · 27 s · B01 sprint → B02 marca → B03/B04 mundo + labels →
   B05 sistema + síntese → B06 virada → B07 DIRECTION → B08 verbos →
   (2 s) B09 BRAND & MARKETING DIRECTION começa e corta.
   ------------------------------------------------------------------ */

/** Fragmento real: plano cheio, grade navy (dessatura 15 %, contraste, sombras para navy) para casar com o mundo ao entardecer. */
const Clip: React.FC<{clip: string; at: number; dur: number; scale?: number; dim?: number; startFrom?: number}> = ({clip, at, dur, scale = 1, dim = 1, startFrom = 0}) => (
  <Sequence from={at} durationInFrames={dur} premountFor={20}>
    <AbsoluteFill style={{opacity: dim}}>
      <OffthreadVideo src={staticFile(`media/${clip}.mp4`)} startFrom={startFrom} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: 'saturate(0.82) contrast(1.08) brightness(0.92)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,30,47,0.35) 0%, rgba(8,30,47,0.15) 50%, rgba(5,15,26,0.45) 100%)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: NAVY, opacity: 0.12, mixBlendMode: 'color'}} />
    </AbsoluteFill>
  </Sequence>
);

const Plate: React.FC<{name: string; at: number; dur: number; opacity?: (f: number) => number}> = ({name, at, dur, opacity}) => {
  const f = useCurrentFrame();
  return (
    <Sequence from={at} durationInFrames={dur} premountFor={30}>
      <AbsoluteFill style={{opacity: opacity ? opacity(f) : 1}}>
        <OffthreadVideo src={staticFile(`plates/${name}.mp4`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </Sequence>
  );
};

/** Label preso ao mundo: micro + régua vertical de 24 px crescendo, nó na base. */
const inPunch = (f: number) => (f >= T.punch1.at && f < T.punch1.at + T.punch1.dur) || (f >= T.punch2.at && f < T.punch2.at + T.punch2.dur);

const WorldLabel: React.FC<{text: string; x: number; y: number; at: number; outAt: number}> = ({text, x, y, at, outAt}) => {
  const f = useCurrentFrame();
  if (f < at || f > outAt + 12 || inPunch(f)) return null;
  const p = ramp(f, at, at + 14, expoOut);
  const exit = ramp(f, outAt, outAt + 10, leave);
  return (
    <div style={{position: 'absolute', left: x, top: y - 46, opacity: 1 - exit}}>
      <Reveal progress={p} style={{...microStyle, color: WHITE}}>
        {text}
      </Reveal>
      <Rule x={0} y={22} length={24} orientation="v" color={WHITE} progress={p} opacity={0.7} />
      <Node x={0.5} y={46} r={2} color={TEAL_SOFT} opacity={p} />
    </div>
  );
};

const Sentence: React.FC<{text: string; x: number; y: number; size: number; at: number; outAt?: number; color?: string}> = ({text, x, y, size, at, outAt = 99999, color = WHITE}) => {
  const f = useCurrentFrame();
  if (f < at || f > outAt + 14) return null;
  const exit = ramp(f, outAt, outAt + 12, leave);
  return (
    <div style={{position: 'absolute', left: x, top: y, color, opacity: 1 - exit, transform: `translateY(${-26 * exit}px)`}}>
      <Reveal progress={ramp(f, at, at + 20, settle)} style={sentenceStyle(size)}>
        {text}
      </Reveal>
    </div>
  );
};

const Micro: React.FC<{text: string; x: number; y: number; at: number; outAt?: number; color?: string; tick?: boolean}> = ({text, x, y, at, outAt = 99999, color = MUTED, tick}) => {
  const f = useCurrentFrame();
  if (f < at || f > outAt + 12) return null;
  const p = ramp(f, at, at + 14, expoOut);
  const exit = ramp(f, outAt, outAt + 10, leave);
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 10, opacity: 1 - exit}}>
      {tick ? <div style={{width: 20, height: 1, background: color, opacity: 0.6, transform: `scaleX(${p})`, transformOrigin: '0 0'}} /> : null}
      <Reveal progress={p} style={{...microStyle, color}}>
        {text}
      </Reveal>
    </div>
  );
};

/** Marca oficial: entra assentando (fade + 2 % de escala), depois vai para o canto. Nunca redesenhada. */
const Mark: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.mark) return null;
  const inn = ramp(f, T.mark, T.mark + 14, settle);
  const corner = ramp(f, T.world, T.world + 24, glide);
  const exit = ramp(f, T.invert, T.invert + 12, leave);
  const w = 360 - (360 - 150) * corner;
  const x0 = (W - 360) / 2;
  const y0 = H * 0.42 - 30;
  const x = x0 + (48 - x0) * corner;
  const y = y0 + (30 - y0) * corner;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: inn * (1 - exit), transform: `scale(${1.02 - 0.02 * inn})`, transformOrigin: '50% 50%'}}>
      <Img src={staticFile('brand/gavea-group_hor_branco.png')} style={{width: '100%', display: 'block'}} />
    </div>
  );
};

/** Índice da barra (como no hero): `AERA × GAVEA` e o beat atual; no corte final o índice tica. */
const Index: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.world) return null;
  const p = ramp(f, T.world, T.world + 16, expoOut);
  const label = f >= T.direction ? '04 / Direction' : f >= T.invert ? '03 / A virada' : '02 / Sistema';
  const ticking = f >= T.brand ? Math.floor((f - T.brand) / 3) : -1;
  const text = ticking < 0 ? label : ticking < 8 ? `05 / ${'·'.repeat(ticking + 1)}` : '05 / Brand & marketing direction';
  return (
    <div style={{position: 'absolute', right: 48, top: 36, display: 'flex', gap: 28, opacity: p}}>
      <span style={{...indexStyle, color: MUTED}}>AERA × GAVEA</span>
      <span style={{...indexStyle, color: WHITE}}>{text}</span>
    </div>
  );
};

export const Proof: React.FC<{guides?: boolean; scratchVoice?: boolean}> = ({guides = false, scratchVoice = false}) => {
  const f = useCurrentFrame();
  const dim = 1 - 0.6 * ramp(f, T.dim, T.dim + 10, glide);
  const worldIn = ramp(f, T.world, T.world + 12, glide);
  const invert = ramp(f, T.invert, T.invert + 14, glide);
  const lineGrow = ramp(f, T.line, T.line + 18, expoOut);
  const lineToAxis = ramp(f, T.direction - 10, T.direction + 20, glide);
  const dirSize = Math.min(190, 1180 / wordWidth('DIRECTION'));
  const dirX = 160;
  const dirBase = baselineFor(540, dirSize) + 40 * lineToAxis;
  const axisY = 540 + (dirBase + 18 - 540) * lineToAxis; // a linha desce e vira a base de DIRECTION
  const brandSize = Math.min(78, 1500 / wordWidth('BRAND & MARKETING DIRECTION'));
  return (
    <AbsoluteFill style={{background: NAVY_DEEP}}>
      {/* B01 · sprint físico */}
      {SPRINT.map((s) => (
        <Clip key={s.clip + s.at} clip={s.clip} at={s.at} dur={s.dur} scale={s.scale} dim={s.at >= 88 ? dim : 1} />
      ))}

      {/* B03–B05 · mundo 3D e punches reais */}
      <Plate name="chegada" at={T.world} dur={T.system - T.world} opacity={() => worldIn} />
      <Clip clip={T.punch1.clip} at={T.punch1.at} dur={T.punch1.dur} />
      <Plate name="sistema" at={T.system} dur={T.qOut - T.system} opacity={(ff) => 1 - 0.92 * ramp(ff, T.invert, T.invert + 14, glide)} />
      <Clip clip={T.punch2.clip} at={T.punch2.at} dur={T.punch2.dur} />

      {/* navy da virada */}
      <AbsoluteFill style={{background: NAVY_DEEP, opacity: 0.55 * invert, pointerEvents: 'none'}} />

      {/* abertura */}
      <Micro text="AERA apresenta" x={96} y={H - 120} at={T.presentsIn} outAt={T.presentsOut} color={WHITE} tick />
      <Mark />
      <Micro text="BUILD 2030" x={W / 2 - 62} y={H * 0.42 + 70} at={T.build} outAt={T.world} color={WHITE} />

      {/* capacidades presas ao mundo e síntese */}
      {LABELS.map((l, i) => (
        <WorldLabel key={l.text} text={l.text} x={l.x} y={l.y} at={T.labels[i]} outAt={T.system - 6} />
      ))}
      <Sentence text="Uma GAVEA." x={120} y={H - 300} size={62} at={T.synthOne} outAt={T.invert - 10} />
      <Sentence text="Múltiplas capacidades." x={120} y={H - 226} size={62} at={T.synthMany} outAt={T.invert - 10} />
      <Micro text="One stop shop" x={120} y={H - 140} at={T.oss} outAt={T.invert - 10} color={TEAL_SOFT} tick />

      {/* B06 · a linha única */}
      {f >= T.line && f < T.brand ? (
        <Rule x={W / 2} y={axisY} length={W - 2 * dirX} orientation="h" color={f >= T.direction ? WHITE : TEAL} progress={lineGrow} from="center" thickness={1.5} opacity={0.9 - 0.45 * lineToAxis} />
      ) : null}
      <Sentence text="E se essa mesma lógica de integração" x={160} y={400} size={46} at={T.q1} outAt={T.qOut} />
      <Sentence text="orientasse a próxima fase?" x={160} y={458} size={46} at={T.q2} outAt={T.qOut} />

      {/* B07 · DIRECTION escrita pela linha; diretoria acima; as cinco frentes que já existem, abaixo */}
      {f >= T.direction - 2 && f < T.brand ? <Written word="DIRECTION" size={dirSize} x={dirX} y={dirBase} at={T.direction} write={48} outAt={T.cut} /> : null}
      <Micro text="Diretoria" x={dirX} y={300} at={T.board} outAt={T.cut} color={WHITE} />
      {f >= T.board && f < T.brand ? <Rule x={dirX + 1} y={322} length={60} orientation="v" color={WHITE} progress={ramp(f, T.board, T.board + 14, expoOut)} opacity={0.5} /> : null}
      {FRONTS.map((t, i) => (
        <React.Fragment key={t}>
          {f >= T.fronts[i] && f < T.brand ? <Rule x={dirX + 1 + i * 250} y={dirBase + 18} length={48} orientation="v" color={WHITE} progress={ramp(f, T.fronts[i], T.fronts[i] + 12, expoOut)} opacity={0.5} /> : null}
          {f >= T.fronts[i] && f < T.brand ? <Node x={dirX + 1 + i * 250} y={dirBase + 18} r={2.5} color={TEAL_SOFT} opacity={ramp(f, T.fronts[i], T.fronts[i] + 8)} /> : null}
          <Micro text={t} x={dirX + i * 250} y={dirBase + 76} at={T.fronts[i]} outAt={T.cut} color={WHITE} />
        </React.Fragment>
      ))}
      {VERBS.map((v, i) => (
        <Sentence key={v} text={v} x={1440} y={330 + i * 54} size={34} at={T.verbs[i]} outAt={T.cut} />
      ))}

      {/* B09 · amostra: corte seco, a próxima palavra começa a ser escrita */}
      {f >= T.brand ? (
        <>
          <AbsoluteFill style={{background: NAVY_DEEP}} />
          <Written word="BRAND & MARKETING DIRECTION" size={brandSize} x={160} y={baselineFor(540, brandSize)} at={T.brand + 2} write={70} />
        </>
      ) : null}

      <Index />
      <Grain opacity={0.06} />

      <Bed level={0.7} />
      <SfxTrack bus={0.6} />
      {scratchVoice ? (
        <ScratchVoice
          lines={[
            {at: T.world + 6, file: 'l01'},
            {at: T.invert + 6, file: 'l02'},
            {at: T.direction, file: 'l03'},
            {at: T.brand + 2, file: 'l04'},
          ]}
        />
      ) : null}

      {guides ? (
        <div style={{...indexStyle, position: 'absolute', left: 48, bottom: 24, color: '#ff5a1f'}}>
          f {String(f).padStart(4, '0')} · {(f / FPS).toFixed(2)} s
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
