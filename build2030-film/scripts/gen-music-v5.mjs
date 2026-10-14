/* Trilha V5 (camada 01 · música) no ElevenLabs Music, por plano de composição alinhado aos atos do filme.
   90 BPM: uma batida = 20 frames a 30 fps. Uso: ELEVENLABS_API_KEY=... node scripts/gen-music-v5.mjs [sufixo] */
import {writeFileSync} from 'node:fs';
const suffix = process.argv[2] ?? '';
const S = (name, ms, pos, neg = []) => ({section_name: name, positive_local_styles: pos, negative_local_styles: neg, duration_ms: ms, lines: []});
const plan = {
  positive_global_styles: ['minimal electronic', 'instrumental', '90 BPM', 'warm analog synth textures', 'soft rhythmic pulse', 'subtle organic percussion: shaker, rim, wood block, soft hand percussion', 'understated melodic motif on a soft plucked synth', 'modern', 'premium', 'elegant', 'confident', 'light and airy low end', 'clean mix'],
  negative_global_styles: ['vocals', 'piano', 'corporate inspirational', 'trailer', 'epic drums', 'cinematic boom', 'EDM', 'techno', 'four on the floor kick', 'heavy sub bass', 'drone', 'dark', 'orchestral', 'guitar'],
  sections: [
    S('Intro', 8000, ['sparse', 'warm pad swell', 'soft pulse', 'motif enters gently'], ['drums']),
    S('Lift', 6000, ['groove locks in', 'organic percussion enters', 'three light accents']),
    S('Brand', 13000, ['flowing steady groove', 'motif developed', 'warm, elegant forward motion']),
    S('Technology', 15600, ['more rhythmic and precise', 'glassy arpeggio texture', 'clock-like light percussion', 'a bit more energy']),
    S('Meeting point', 9100, ['breath', 'percussion drops out', 'open airy pad', 'motif stated simply', 'light and hopeful'], ['drums']),
    S('System in motion', 5600, ['groove returns', 'layers accumulate', 'forward motion builds']),
    S('Three accents', 4000, ['three clean percussive accents on the downbeats', 'then the groove reduces']),
    S('Landing', 6000, ['one clean resolving chord', 'gentle tail', 'quiet ending'], ['boom', 'big hit', 'fade-in drums']),
  ],
};
const res = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
  method: 'POST',
  headers: {'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json'},
  body: JSON.stringify({composition_plan: plan, model_id: 'music_v1'}),
});
if (!res.ok) { console.error(res.status, (await res.text()).slice(0, 400)); process.exit(1); }
writeFileSync(`public/audio/music/raw/v5_music${suffix}.mp3`, Buffer.from(await res.arrayBuffer()));
writeFileSync(`public/audio/music/raw/v5_music${suffix}.plan.json`, JSON.stringify(plan, null, 1));
console.log('ok', suffix);
