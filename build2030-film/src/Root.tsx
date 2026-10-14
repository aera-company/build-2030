import React from 'react';
import {Composition} from 'remotion';
import './film/fonts';
import {FPS, H, W} from './film/tokens';
import {Proof} from './scenes/Proof';
import {PROOF_DURATION} from './data/proof';
import {V5Film} from './film/V5Film';
import {FILM_END} from './motion/timing';

export const Root: React.FC = () => (
  <>
    {/* V5 · filme-proposta com música, voz AERA Narradora F1 (V4 em archive/v4-src, V3.1 em archive/v3_1-src). */}
    <Composition id="GAVEA-V5-FILM" component={V5Film} durationInFrames={FILM_END} fps={FPS} width={W} height={H} defaultProps={{audio: true, vo: 1.3}} />
    <Composition id="GAVEA-V5-FILM-SILENT" component={V5Film} durationInFrames={FILM_END} fps={FPS} width={W} height={H} defaultProps={{audio: false, vo: 1.3}} />
    {/* V1 · prova arquivada (rota 3D), mantida só como histórico */}
    <Composition id="BUILD2030-PROOF" component={Proof} durationInFrames={PROOF_DURATION} fps={FPS} width={W} height={H} defaultProps={{guides: false, scratchVoice: false}} />
  </>
);
