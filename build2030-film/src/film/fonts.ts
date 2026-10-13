import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_DISPLAY, FONT_MONO} from './tokens';

const load = (family: string, file: string, descriptors: FontFaceDescriptors) => {
  const face = new FontFace(family, `url(${staticFile(file)}) format('woff2-variations')`, descriptors);
  return face.load().then((loaded) => {
    (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded);
  });
};

const handle = delayRender('GAVEA fonts', {timeoutInMilliseconds: 180000});

Promise.all([
  load(FONT_DISPLAY, 'fonts/MonaSans-var.woff2', {weight: '200 900', stretch: '75% 125%'}),
  load(FONT_MONO, 'fonts/GeistMono-wght.woff2', {weight: '100 900'}),
])
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error('GAVEA fonts failed', err);
    continueRender(handle);
  });
