/* Locução GAVEA / BUILD 2030 via ElevenLabs (precisa de uma chave com permissão text_to_speech).
   Uso: ELEVENLABS_API_KEY=sk_... node scripts/gen-vo.mjs [--voice zzpxFfJfnIxSj4DpCkzF] [--model eleven_multilingual_v2] [--only l01,l02]
   Sai em public/audio/vo/lNN.mp3. Texto: docs/GAVEA_BUILD2030_60S_SCRIPT_V1.md (locução V1). */
import {writeFileSync, mkdirSync} from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('Defina ELEVENLABS_API_KEY.'); process.exit(1); }
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const voice = arg('--voice', 'zzpxFfJfnIxSj4DpCkzF'); // GAVEA Narradora V6 (voz feminina desenhada no PLAN27)
const model = arg('--model', 'eleven_multilingual_v2');
const only = arg('--only', '')?.split(',').filter(Boolean);

const LINES = {
  l01: 'A GAVEA já conecta diferentes capacidades para entregar soluções integradas.',
  l02: 'Agora, essa mesma lógica pode orientar a próxima fase da empresa.',
  l03: 'BUILD 2030 propõe uma nova camada de direção.',
  l04: 'Na marca e no marketing, a AERA define posicionamento, sistema, planejamento e direção, conectando diretoria, agência, comercial e parceiros.',
  l05: 'E em novas tecnologias, transforma necessidades reais em projetos de IA, sistemas e novas ferramentas para o negócio.',
  l06: 'Duas frentes. Uma mesma lógica.',
  l07: 'Direção para construir, escalar e liderar.',
  l08: 'A próxima fase pode começar por aqui.',
};

mkdirSync('public/audio/vo', {recursive: true});
for (const [id, text] of Object.entries(LINES)) {
  if (only.length && !only.includes(id)) continue;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_192`, {
    method: 'POST',
    headers: {'xi-api-key': KEY, 'Content-Type': 'application/json'},
    body: JSON.stringify({text, model_id: model, voice_settings: {stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true, speed: 0.93}}),
  });
  if (!res.ok) { console.error(id, res.status, await res.text()); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(`public/audio/vo/${id}.mp3`, buf);
  console.log(id, buf.length, 'bytes');
}
