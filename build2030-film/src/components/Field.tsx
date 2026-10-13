import React from 'react';
import {useVideoConfig} from 'remotion';
import {indexStyle, microStyle} from '../film/tokens';

/** Régua do Field: cresce de uma origem (0..1). */
export const Rule: React.FC<{
  x: number;
  y: number;
  length: number;
  orientation: 'h' | 'v';
  color: string;
  progress?: number;
  from?: 'start' | 'center' | 'end';
  thickness?: number;
  opacity?: number;
}> = ({x, y, length, orientation, color, progress = 1, from = 'start', thickness = 1, opacity = 1}) => {
  const origin = from === 'start' ? '0% 0%' : from === 'center' ? '50% 50%' : '100% 100%';
  const horizontal = orientation === 'h';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: horizontal ? length : thickness,
        height: horizontal ? thickness : length,
        background: color,
        opacity,
        transformOrigin: origin,
        transform: horizontal ? `scaleX(${progress})` : `scaleY(${progress})`,
      }}
    />
  );
};

/** Nó do Field: ponto centrado em (x, y). */
export const Node: React.FC<{x: number; y: number; r?: number; color: string; opacity?: number}> = ({
  x,
  y,
  r = 1.75,
  color,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: color,
      opacity,
    }}
  />
);

/** Cruzeta de registro (+). */
export const Cross: React.FC<{x: number; y: number; size?: number; color: string; opacity?: number}> = ({
  x,
  y,
  size = 24,
  color,
  opacity = 1,
}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity}}>
    <div style={{position: 'absolute', left: 0, top: size / 2, width: size, height: 1, background: color}} />
    <div style={{position: 'absolute', left: size / 2, top: 0, width: 1, height: size, background: color}} />
  </div>
);

/** Seta vertical do Field (rail + chevron), como `FieldArrow` do site. */
export const FieldArrow: React.FC<{x: number; y: number; length: number; color: string; progress?: number}> = ({
  x,
  y,
  length,
  color,
  progress = 1,
}) => (
  <div style={{position: 'absolute', left: x - 4.5, top: y, width: 9, height: length, opacity: progress}}>
    <div
      style={{
        position: 'absolute',
        left: 4,
        top: 0,
        width: 1,
        height: length,
        background: color,
        transformOrigin: '0 0',
        transform: `scaleY(${progress})`,
      }}
    />
    <svg viewBox="0 0 9 5" style={{position: 'absolute', left: 0, bottom: 0, width: 9, height: 5}}>
      <path d="M0.5 0.5 L4.5 4.5 L8.5 0.5" fill="none" stroke={color} strokeWidth={1} />
    </svg>
  </div>
);

/** Texto revelado por máscara da esquerda para a direita (progress 0..1). */
export const Reveal: React.FC<{progress: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  progress,
  children,
  style,
}) => <div style={{...style, clipPath: `inset(-0.2em ${(1 - progress) * 100}% -0.2em 0)`}}>{children}</div>;

type LabelProps = {
  x: number;
  y: number;
  color: string;
  progress?: number;
  align?: 'left' | 'right';
  /** Escala tipográfica do formato (Layout.s). */
  s: number;
  children: React.ReactNode;
};

const anchored = (x: number, y: number, align: 'left' | 'right', W: number, color: string): React.CSSProperties => ({
  position: 'absolute',
  left: align === 'left' ? x : undefined,
  right: align === 'right' ? W - x : undefined,
  top: y,
  color,
  textAlign: align,
});

export const Micro: React.FC<LabelProps> = ({x, y, color, progress = 1, align = 'left', s, children}) => {
  const {width} = useVideoConfig();
  return (
    <div style={anchored(x, y, align, width, color)}>
      <Reveal progress={progress} style={{...microStyle, fontSize: 10.5 * s}}>
        {children}
      </Reveal>
    </div>
  );
};

export const Index: React.FC<LabelProps> = ({x, y, color, progress = 1, align = 'left', s, children}) => {
  const {width} = useVideoConfig();
  return (
    <div style={anchored(x, y, align, width, color)}>
      <Reveal progress={progress} style={{...indexStyle, fontSize: 11 * s}}>
        {children}
      </Reveal>
    </div>
  );
};
