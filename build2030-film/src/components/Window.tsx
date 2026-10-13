import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {LINE_DARK_STRONG, type Rect} from '../film/tokens';
import {lerp} from '../film/motion';

/**
 * Janela de mídia do Field: um retângulo no grid que se abre por máscara a partir
 * de uma borda (ou do eixo) e segura foto/vídeo em object-fit cover.
 * A mídia nunca é redesenhada: só máscara, posição e escala.
 */
export type From = 'axis' | 'left' | 'right' | 'top' | 'bottom' | 'center';

export const insetFor = (r: Rect, p: number, from: From, axisY?: number): string => {
  const q = 1 - p;
  switch (from) {
    case 'left':
      return `inset(0px ${r.w * q}px 0px 0px)`;
    case 'right':
      return `inset(0px 0px 0px ${r.w * q}px)`;
    case 'top':
      return `inset(0px 0px ${r.h * q}px 0px)`;
    case 'bottom':
      return `inset(${r.h * q}px 0px 0px 0px)`;
    case 'center':
      return `inset(${(r.h / 2) * q}px ${(r.w / 2) * q}px ${(r.h / 2) * q}px ${(r.w / 2) * q}px)`;
    case 'axis': {
      const ay = Math.min(Math.max((axisY ?? r.y + r.h / 2) - r.y, 0), r.h);
      return `inset(${ay * q}px 0px ${(r.h - ay) * q}px 0px)`;
    }
  }
};

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

export const Window: React.FC<{
  r: Rect;
  reveal?: number;
  from?: From;
  axisY?: number;
  frame?: boolean;
  frameColor?: string;
  opacity?: number;
  transform?: string;
  children?: React.ReactNode;
}> = ({r, reveal = 1, from = 'center', axisY, frame = false, frameColor = LINE_DARK_STRONG, opacity = 1, transform, children}) => (
  <div
    style={{
      position: 'absolute',
      left: r.x,
      top: r.y,
      width: r.w,
      height: r.h,
      clipPath: insetFor(r, reveal, from, axisY),
      opacity,
      transform,
      overflow: 'hidden',
    }}
  >
    {children}
    {frame ? <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 1px ${frameColor}`, pointerEvents: 'none'}} /> : null}
  </div>
);

const cover = (scale: number, mono: boolean, pos: string): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: pos,
  transform: `scale(${scale})`,
  transformOrigin: '50% 50%',
  filter: mono ? 'grayscale(1) contrast(1.05)' : undefined,
});

export const Photo: React.FC<{src: string; scale?: number; mono?: boolean; pos?: string; opacity?: number}> = ({
  src,
  scale = 1,
  mono = true,
  pos = '50% 50%',
  opacity = 1,
}) => <Img src={staticFile(src)} style={{...cover(scale, mono, pos), opacity}} />;

/** Clipe de vídeo. `from` = frame (local da cena) em que o clipe começa a tocar; `startFrom` = offset dentro do arquivo. */
export const Clip: React.FC<{src: string; from?: number; startFrom?: number; rate?: number; scale?: number; mono?: boolean; pos?: string; opacity?: number}> = ({
  src,
  from = 0,
  startFrom = 0,
  rate = 1,
  scale = 1,
  mono = true,
  pos = '50% 50%',
  opacity = 1,
}) => (
  <Sequence from={from} layout="none">
    <OffthreadVideo src={staticFile(src)} muted startFrom={startFrom} playbackRate={rate} style={{...cover(scale, mono, pos), opacity}} />
  </Sequence>
);
