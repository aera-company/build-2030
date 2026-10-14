/* Locução V3.1 · GAVEA / BUILD 2030 via ElevenLabs, com tempo por caractere (endpoint with-timestamps).
   Uso: ELEVENLABS_API_KEY=sk_... node scripts/gen-vo.mjs [--voice zzpxFfJfnIxSj4DpCkzF] [--model eleven_multilingual_v2] [--only v01,v02]
   Sai em public/audio/vo/raw/v3_<id>.mp3 + v3_<id>.json (alinhamento). Depois: zsh scripts/fit-vo.sh
   Texto e entradas: referência de VO aprovada (V3.1), entradas em src/motion/timing.ts (VO). */
import {writeFileSync, mkdirSync} from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('Defina ELEVENLABS_API_KEY.'); process.exit(1); }
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const voice = arg('--voice', 'zzpxFfJfnIxSj4DpCkzF'); // GAVEA Narradora V6
const model = arg('--model', 'eleven_multilingual_v2');
const only = arg('--only', '')?.split(',').filter(Boolean);

/** [texto, velocidade]. A velocidade faz a fala caber na janela até a próxima entrada. */
const LINES = {
  v01: ['Um novo ciclo começa agora.', 0.97],
  v02: ['E a próxima fase pede mais.', 0.97],
  v03: ['Pede estrutura. Pede direção.', 0.97],
  v04: ['A AERA propõe ocupar essa camada em duas frentes.', 1.05],
  v05: ['Na marca e no marketing: posicionamento, design system, planejamento e critério.', 1.0],
  v06: ['A agência segue no dia a dia. A AERA conecta direção, execução e aprovação com a diretoria.', 1.2],
  v07: ['Em Novas Tecnologias: sistemas, IA, conhecimento e processos — do GAVEA Trade ao futuro Portal GAVEA.', 1.2],
  v08: ['Para comunicar melhor, decidir melhor e operar com mais inteligência.', 1.2],
  v09: ['Duas frentes. Uma mesma direção.', 0.97],
  v10: ['Construir. Escalar. Liderar.', 0.93],
  v11: ['Vamos construir?', 0.97],
};

mkdirSync('public/audio/vo/raw', {recursive: true});
for (const [id, [text, speed]] of Object.entries(LINES)) {
  if (only.length && !only.includes(id)) continue;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': KEY, 'Content-Type': 'application/json'},
    body: JSON.stringify({text, model_id: model, language_code: 'pt', voice_settings: {stability: 0.45, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true, speed}}),
  });
  if (!res.ok) { console.error(id, res.status, await res.text()); process.exit(1); }
  const j = await res.json();
  const buf = Buffer.from(j.audio_base64, 'base64');
  writeFileSync(`public/audio/vo/raw/v3_${id}.mp3`, buf);
  writeFileSync(`public/audio/vo/raw/v3_${id}.json`, JSON.stringify({text, speed, alignment: j.alignment}, null, 1));
  console.log(id, buf.length, 'bytes');
}
console.log('Voz gerada. Agora: zsh scripts/fit-vo.sh && zsh scripts/render-v3.sh GAVEA-V3-FILM out/GAVEA_BUILD2030_MOTION_V3_60s.mp4 1799');
