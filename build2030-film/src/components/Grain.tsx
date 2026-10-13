import React from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * Grão de filme determinístico: ruído fractal SVG com seed que cicla por frame.
 * `screen` no campo escuro, `multiply` no claro.
 */
export const Grain: React.FC<{opacity?: number; mode?: 'screen' | 'multiply'}> = ({
  opacity = 0.08,
  mode = 'screen',
}) => {
  const frame = useCurrentFrame();
  const seed = (frame % 7) + 1;
  const id = `grain-${mode}`;
  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        mixBlendMode: mode,
        pointerEvents: 'none',
      }}
    >
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
};
