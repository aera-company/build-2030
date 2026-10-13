import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {CUES} from '../data/sfx';

export const SfxTrack: React.FC<{bus?: number}> = ({bus = 0.6}) => (
  <>
    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={150}>
        <Audio src={staticFile(`audio/sfx/${c.file}.wav`)} volume={c.gain * bus} />
      </Sequence>
    ))}
  </>
);

export const Bed: React.FC<{level?: number}> = ({level = 0.7}) => <Audio src={staticFile('audio/bed/bed_proof.wav')} volume={level} />;

/** Voz de referência (macOS say) para medir o tempo; não é a locução final. */
export const ScratchVoice: React.FC<{lines: Array<{at: number; file: string}>; level?: number}> = ({lines, level = 0.9}) => (
  <>
    {lines.map((l, i) => (
      <Sequence key={i} from={l.at} durationInFrames={240}>
        <Audio src={staticFile(`audio/scratch/${l.file}.wav`)} volume={level} />
      </Sequence>
    ))}
  </>
);
