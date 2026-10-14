import React from 'react';
import {Composition} from 'remotion';
import './film/fonts';
import {FPS, H, W} from './film/tokens';
import {Proof} from './scenes/Proof';
import {PROOF_DURATION} from './data/proof';
import {V4Film} from './film/V4Film';
import {FILM_END} from './motion/timing';

export const Root: React.FC = () => (
  <>
    {/* V4 · um pensamento contínuo, voz AERA Narradora F1 (a V3.1 está em archive/v3_1-src). */}
    <Composition id="GAVEA-V4-FILM" component={V4Film} durationInFrames={FILM_END} fps={FPS} width={W} height={H} defaultProps={{audio: true}} />
    <Composition id="GAVEA-V4-FILM-SILENT" component={V4Film} durationInFrames={FILM_END} fps={FPS} width={W} height={H} defaultProps={{audio: false}} />
    {/* V1 · prova arquivada (rota 3D), mantida só como histórico */}
    <Composition id="BUILD2030-PROOF" component={Proof} durationInFrames={PROOF_DURATION} fps={FPS} width={W} height={H} defaultProps={{guides: false, scratchVoice: false}} />
  </>
);
