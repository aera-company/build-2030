import React from 'react';
import {Composition} from 'remotion';
import './film/fonts';
import {FPS, H, W} from './film/tokens';
import {Proof} from './scenes/Proof';
import {PROOF_DURATION} from './data/proof';
import {V3Film} from './film/V3Film';
import {FILM_END, PROOF_END} from './motion/timing';

export const Root: React.FC = () => (
  <>
    {/* V3 · filme-proposta (Storyboard V3 travado). */}
    <Composition id="GAVEA-V3-FILM" component={V3Film} durationInFrames={FILM_END} fps={FPS} width={W} height={H} defaultProps={{audio: true}} />
    <Composition id="GAVEA-V3-FILM-SILENT" component={V3Film} durationInFrames={FILM_END} fps={FPS} width={W} height={H} defaultProps={{audio: false}} />
    {/* prova 00:00–00:31 */}
    <Composition id="GAVEA-V3-PROOF" component={V3Film} durationInFrames={PROOF_END} fps={FPS} width={W} height={H} defaultProps={{audio: true}} />
    <Composition id="GAVEA-V3-PROOF-SILENT" component={V3Film} durationInFrames={PROOF_END} fps={FPS} width={W} height={H} defaultProps={{audio: false}} />
    {/* V1 · prova arquivada (rota 3D), mantida só como histórico */}
    <Composition id="BUILD2030-PROOF" component={Proof} durationInFrames={PROOF_DURATION} fps={FPS} width={W} height={H} defaultProps={{guides: false, scratchVoice: false}} />
  </>
);
