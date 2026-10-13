/* Stills da prova em frames-chave. Uso: node scripts/stills-proof.mjs [comp] [frames,separados,por,virgula] */
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const comp = process.argv[2] ?? 'BUILD2030-PROOF';
const FR = (process.argv[3] ?? '12,40,110,128,175,215,300,360,430,470,640,700,770,805').split(',').map(Number);
mkdirSync('out/stills', {recursive: true});
for (const f of FR) {
  const r = spawnSync('npx', ['remotion', 'still', comp, `out/stills/f${String(f).padStart(4, '0')}.png`, `--frame=${f}`, '--timeout=180000'], {stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log('stills ok');
