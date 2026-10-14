/* Locução V5 · GAVEA / BUILD 2030 com a MESMA voz e tratamento do teaser da AERA.
   Fonte: ~/Desktop/AERA_BRAND_FILM_01 (scripts/gen-vo.mjs, src/data/voTiming.json, docs/V1_RELATORIO.md §7):
   voz "AERA Narradora F1" SjR6urfwxmM7UisfZHpj · eleven_v3 · pt · stability 0.55 · similarity 0.8 · style 0.15
   · speaker boost · speed 0.95 · cues [calm]/[confident] · sem processamento na voz.
   Lição do teaser: frases soltas puxavam para pt-PT; por isso cada bloco sai numa tomada única e é cortado
   por frase pelos timestamps (scripts/fit-vo-v5.py), com pré-rolo de 0,22 s.
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
  // Pronúncia: GAVEA se fala "Gávia" (só no texto de geração; na tela continua GAVEA). IA se fala "i-á".
  // Toda tomada termina em [pause]: sem ela o v3 come a última sílaba.
  t1: ['[confident]', 'AERA apresenta. Gávia Build 2030. [pause] [long pause]'],
  t2: ['[confident]', 'A Gávia cresceu. E esse crescimento abre novas possibilidades. [pause] [long pause]'],
  t3: ['[confident]', 'Na marca e no marketing, a AERA entra para construir posicionamento, design system, planejamento e direção criativa, conectando comunicação, comercial e oportunidades. [pause] [long pause]'],
  t4: ['[confident]', 'Em novas tecnologias, a AERA conduz soluções de I.A. para o negócio: sistemas, automações, conhecimento, processos e novas ferramentas. [pause] [long pause]'],
  t5: ['[confident]', 'Duas frentes que se encontram no mesmo ponto: marca, negócio e tecnologia trabalhando juntos. [pause] [long pause]'],
  t6: ['[confident]', 'Transformar estratégia em sistema. E sistema em movimento. [pause] [long pause]'],
  t7: ['[confident]', 'Construir. Escalar. Liderar. [pause] [long pause]'],
  t8: ['[calm]', 'Gávia Build 2030. [pause] [long pause]'],
  // passe final: a agência segue (o fim reaproveita o "Gávia Build 2030" da abertura, não é gerado de novo)
  ta: ['[confident]', 'A AERA estrutura a direção. A agência segue na execução, com planejamento, critérios e uma visão comum. [pause] [long pause]'],
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
  writeFileSync(`public/audio/vo/raw/v5_${id}${suffix}.mp3`, buf);
  writeFileSync(`public/audio/vo/raw/v5_${id}${suffix}.json`, JSON.stringify({text, tag, stability, alignment: j.alignment}, null, 1));
  console.log(id, buf.length, 'bytes');
}
console.log('Voz V4 gerada. Agora: python3 scripts/fit-vo-v5.py');
