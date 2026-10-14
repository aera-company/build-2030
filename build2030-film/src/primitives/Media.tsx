import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {H, W} from '../motion/design';

/** Câmera de uma camada de imagem: escala em torno de uma origem + translação. */
export type Cam = {s: number; tx?: number; ty?: number; ox?: number; oy?: number};

const camStyle = (cam: Cam): React.CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: W,
  height: H,
  transform: `translate(${cam.tx ?? 0}px, ${cam.ty ?? 0}px) scale(${cam.s})`,
  transformOrigin: `${cam.ox ?? W / 2}px ${cam.oy ?? H / 2}px`,
});

const fill: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'};

/**
 * Plano de imagem em tela cheia. A imagem nunca é redesenhada: só máscara, câmera e grade.
 * `clip` = clip-path CSS em coordenadas de tela. `filter` = grade (duotone) ou exposição.
 */
export const Plate: React.FC<{
  clip?: string;
  cam?: Cam;
  filter?: string;
  opacity?: number;
  children: React.ReactNode;
}> = ({clip, cam = {s: 1}, filter, opacity = 1, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, clipPath: clip, overflow: 'hidden', opacity}}>
    <div style={{...camStyle(cam), filter}}>{children}</div>
  </div>
);

export const StillImg: React.FC<{src: string; pos?: string}> = ({src, pos = '50% 50%'}) => (
  <Img src={staticFile(src)} style={{...fill, objectPosition: pos}} />
);

/** Clipe que começa a tocar no frame global `from` (offset `startFrom` dentro do arquivo). */
export const ClipVideo: React.FC<{src: string; from: number; startFrom?: number; rate?: number; pos?: string}> = ({
  src,
  from,
  startFrom = 0,
  rate = 1,
  pos = '50% 50%',
}) => (
  <Sequence from={from} layout="none">
    <OffthreadVideo src={staticFile(src)} muted startFrom={startFrom} playbackRate={rate} style={{...fill, objectPosition: pos}} />
  </Sequence>
);

/** clip-path inset em px de tela. */
export const inset = (top: number, right: number, bottom: number, left: number) =>
  `inset(${Math.max(0, top)}px ${Math.max(0, right)}px ${Math.max(0, bottom)}px ${Math.max(0, left)}px)`;
