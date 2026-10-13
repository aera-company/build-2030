import React from 'react';
import {Composition} from 'remotion';
import './film/fonts';
import {FPS, H, W} from './film/tokens';
import {Proof} from './scenes/Proof';
import {PROOF_DURATION} from './data/proof';

export const Root: React.FC = () => (
  <>
    <Composition id="BUILD2030-PROOF" component={Proof} durationInFrames={PROOF_DURATION} fps={FPS} width={W} height={H} defaultProps={{guides: false, scratchVoice: false}} />
    <Composition id="BUILD2030-PROOF-GUIDES" component={Proof} durationInFrames={PROOF_DURATION} fps={FPS} width={W} height={H} defaultProps={{guides: true, scratchVoice: true}} />
    <Composition id="BUILD2030-PROOF-SCRATCHVOICE" component={Proof} durationInFrames={PROOF_DURATION} fps={FPS} width={W} height={H} defaultProps={{guides: false, scratchVoice: true}} />
  </>
);
