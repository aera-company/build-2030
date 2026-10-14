/* Locução V4 · GAVEA / BUILD 2030 com a MESMA voz e tratamento do teaser da AERA.
   Fonte: ~/Desktop/AERA_BRAND_FILM_01 (scripts/gen-vo.mjs, src/data/voTiming.json, docs/V1_RELATORIO.md §7):
   voz "AERA Narradora F1" SjR6urfwxmM7UisfZHpj · eleven_v3 · pt · stability 0.55 · similarity 0.8 · style 0.15
   · speaker boost · speed 0.95 · cues [calm]/[confident] · sem processamento na voz.
   Lição do teaser: frases soltas puxavam para pt-PT; por isso cada bloco sai numa tomada única e é cortado
   por frase pelos timestamps (scripts/fit-vo-v4.py), com pré-rolo de 0,22 s.
   Uso: ELEVENLABS_API_KEY=sk_... node scripts/gen-vo-v4.mjs [--only t1,t2] [--stability 0.7]
   Sai em public/audio/vo/raw/v4_<tomada>.mp3 + .json (alinhamento por caractere). */
import {writeFileSync, mkdirSync} from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('Defina ELEVENLABS_API_KEY.'); process.exit(1); }
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const VOICE = 'SjR6urfwxmM7UisfZHpj'; // AERA Narradora F1 (teaser AERA aprovado)
const MODEL = 'eleven_v3';
const only = arg('--only', '')?.split(',').filter(Boolean);
const stability = Number(arg('--stability', '0.55'));
const suffix = arg('--suffix', '');

/** Tomadas: um bloco de pensamento por chamada. [tag, texto] */
const TAKES = {
  t1: ['[calm]', 'A GAVEA cresceu. E novas possibilidades vieram com esse crescimento.'],
  t2: ['[calm]', 'Fortalecer a marca. Ampliar presença. Criar novas oportunidades.'],
  t3: ['[calm]', 'Organizar conhecimento. Simplificar processos. Aplicar inteligência onde ela realmente gera valor.'],
  t4: ['[calm]', 'É nesse encontro entre marca, negócio e tecnologia que a AERA quer atuar.'],
  t5: ['[confident]', 'Transformando estratégia em sistema. E sistema em movimento.'],
  t6: ['[calm]', 'Build 2030.'],
  t7: ['[confident]', 'Construir. Escalar. Liderar.'],
};

mkdirSync('public/audio/vo/raw', {recursive: true});
for (const [id, [tag, text]] of Object.entries(TAKES)) {
  if (only.length && !only.includes(id)) continue;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': KEY, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      text: `${tag} ${text}`,
      model_id: MODEL,
      language_code: 'pt',
      voice_settings: {stability, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true, speed: 0.95},
    }),
  });
  if (!res.ok) { console.error(id, res.status, await res.text()); process.exit(1); }
  const j = await res.json();
  const buf = Buffer.from(j.audio_base64, 'base64');
  writeFileSync(`public/audio/vo/raw/v4_${id}${suffix}.mp3`, buf);
  writeFileSync(`public/audio/vo/raw/v4_${id}${suffix}.json`, JSON.stringify({text, tag, stability, alignment: j.alignment}, null, 1));
  console.log(id, buf.length, 'bytes');
}
console.log('Voz V4 gerada. Agora: python3 scripts/fit-vo-v4.py');
