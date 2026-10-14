/* Stills da V5 (um bundle, muitos frames, meia resolução) + folha de contato.
   Uso: node scripts/stills-v5.mjs <frames,separados> [saida.jpg] */
import {spawnSync} from 'node:child_process';
import {mkdirSync, rmSync} from 'node:fs';
const FR = (process.argv[2] ?? '0').split(',').map(Number);
const sheet = process.argv[3] ?? 'out/stills-v5/sheet.jpg';
const run = (cmd, args) => { const r = spawnSync(cmd, args, {stdio: ['ignore', 'ignore', 'inherit']}); if (r.status !== 0) process.exit(r.status ?? 1); };
rmSync('out/stills-v5', {recursive: true, force: true});
mkdirSync('out/stills-v5', {recursive: true});
run('npx', ['remotion', 'bundle', '--out-dir=out/stills-v5/bundle']);
for (const f of FR) run('npx', ['remotion', 'still', 'out/stills-v5/bundle', 'GAVEA-V5-FILM-SILENT', `out/stills-v5/f${String(f).padStart(4, '0')}.jpg`, `--frame=${f}`, '--scale=0.5', '--image-format=jpeg', '--timeout=180000']);
run('python3', ['-c', `
import glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob('out/stills-v5/f*.jpg')); ims=[Image.open(f) for f in fs]
w,h=ims[0].size; cols=4; rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(w*cols,(h+22)*rows),(20,20,20)); d=ImageDraw.Draw(S)
for i,(f,im) in enumerate(zip(fs,ims)):
  x=(i%cols)*w; y=(i//cols)*(h+22); S.paste(im,(x,y+22)); n=int(f.split('/f')[-1][:4]); d.text((x+6,y+4),'f%d  %.2fs'%(n,n/30),fill=(255,220,0))
S.save('${sheet}',quality=86)`]);
console.log('ok', sheet);
