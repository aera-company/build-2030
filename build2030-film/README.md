# GAVEA GROUP / BUILD 2030 · 60 s motion (Remotion)

Workspace isolado do filme. A landing (`../app`) é fonte de material, não o entregável.

- Docs (ler nesta ordem): `docs/GAVEA_BUILD2030_60S_SCRIPT_V1.md`, `_ASSET_AUDIT_V1.md`, `_STORYBOARD_V1.md`, `_MOTION_MAP_V1.md`. Master Brief: `../GAVEA_BUILD2030_60S_MOTION_MASTER_BRIEF_V1.md`.
- Gramática: `~/Desktop/AERA_BRAND_FILM_01` (mecânica) e `out/AERA_BF01_V2_preview_16x9.mp4` (feeling). Componentes herdados em `src/components/` (Written, GlyphWord, Field, Window, Grain); glifos da Mona Sans em `src/data/glyphs.json` (`python3 scripts/build-glyphs.py`).
- Material: `public/media/yt/` (episódio real, marca d'água cortada), `public/media/p35/`, `public/media/trade/`, `public/plates/` (mundo 3D renderizado por `../app/scripts/plates.mjs`), `public/brand/` (marcas oficiais, intactas), `public/audio/sfx` (AERA), `public/audio/bed` (drone numpy), `public/audio/scratch` (voz macOS, só para medir tempo).
- Prova: `src/scenes/Proof.tsx` + `src/data/proof.ts` (linha do tempo em frames) + `src/data/sfx.ts` (cues).

```bash
npm run dev
```

```bash
npm run stills:proof
```

```bash
npm run render:proof
```

Locução final: `ELEVENLABS_API_KEY=... node scripts/gen-vo.mjs` (a chave do MCP não tem permissão de voz). Versões Remotion pinadas (4.0.488); render segmentado + concat (`scripts/render-proof.sh`), lição do playbook.
