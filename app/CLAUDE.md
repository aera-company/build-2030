# GAVEA / BUILD 2030 · app

Experiência HTML one-page (Next.js 16 + React 19 + Tailwind v4 + Lenis) que
apresenta a função `AERA / DIRECTION` dentro da GAVEA. Apresentação presencial,
desktop first (1440×900), scroll conduzido pelo Tiago.

**Fonte estratégica:** `../docs/GAVEA_BUILD2030_MASTER_BRIEF_V2.md`,
`HTML_ARCHITECTURE_V1`, `COPY_V1`. **Direção atual: `../docs/BUILD2030_ZIRKA_RESET_V1.md`**
(space first, Zirka como referência dominante). Histórico: `BUILD2030_BASE_AUDIT_V1.md`,
`BUILD2030_ZIRKA_REFERENCE_TRANSLATION_V1.md`, `BUILD2030_FIRST_IMPLEMENTATION_REPORT_V1.md`
(passe tipográfico, rejeitado em 11/10; código em `archive/v1-typographic/`).

## Modelo mental

Não há seções. Há **um mundo WebGL** (`src/world/World.ts`, three.js sem R3F) visto
por **uma câmera em spline** (`src/world/camera-path.ts`), dentro de um palco fixo
com spacer alto (`src/experience/Experience.tsx`). O scroll vira `P = j / JOURNEY_TOTAL`
(`j = scrollY / vh`, `journey.ts`, 8 viewports). Todos os instantes estão em
`src/world/moments.ts`. Um único loop (`src/motion/scroll-store.ts`, sempre vivo via
`setLive`) chama `tick(state)` em cada camada; nada de React state no caminho quente.

Camadas: `WorldLayer` (canvas three.js; publica âncoras 3D projetadas),
`AnnotationLayer` (labels presos ao espaço, marca, as poucas headlines), `TopBar`,
`DebugPanel`. Primitivos: `EditorialLabel`, `BrandMark` (logo oficial, intacto).

Hierarquia: objeto/ambiente → câmera/luz → labels → headlines (raras). Nenhuma
palavra acima de ~25% da tela; hoje a maior é ~5%. **Nunca footage dentro de tipo.**
Footage real só como prova física (painéis do modelo com textura de vídeo).

## Regras que não se negociam

- **Logo oficial intacto.** Só `public/brand/gavea-group-hor-branco.png` dentro
  de `BrandMark`. Nunca redesenhar, recolorir, separar o símbolo, dar glow.
- **Zero geração paga.** Greybox em three.js; footage real da P-35 (`public/media/clips/`,
  manifesto em `src/lib/media.ts`) só nos painéis de prova.
- **Sem HUD / telemetria falsa / cards / glass / blur animado.** Labels mono
  pequenos, um por imagem.
- **Copy** vem de `docs/GAVEA_BUILD2030_COPY_V1.md`. Sem travessões. Sentence
  case em português; caixa alta só em BUILD 2030, DIRECTION, MARKETING
  DIRECTION, AI & INTELLIGENCE e labels.
- **Motion tokens** em `src/motion/tokens.ts`. Easings cúbicos/expo, sem spring.
- **Performance:** rAF único, DPR ≤ 2, vídeos só tocam quando a camada os ativa,
  frames carregam keyframes primeiro.
- **Git:** o projeto ainda não tem `.git` próprio. Não rodar `git` aqui sem
  ordem do Tiago (cai no git acidental da HOME).

## Comandos

`npm run dev` (`:3030`) · `npm run build` · `npm start` · `npm run lint`.
Debug: `http://localhost:3030/?debug=1` (jornada, bloco, estado do hero, frame,
viewport, FPS). Nunca em produção.

## Onde mexer

- Instantes (quando cada coisa acontece) → `src/world/moments.ts`.
- Caminho de câmera, névoa e luz → `src/world/camera-path.ts`.
- Geometria, materiais, zonas, trajetória, painéis → `src/world/World.ts`.
- Labels e headlines → `src/experience/layers/AnnotationLayer.tsx`.
- Comprimento da jornada → `LENS` em `src/experience/journey.ts`.
- Mídia → `src/lib/media.ts` + `public/media/`.
- Cores e tipografia → `src/app/globals.css` (Mona Sans variável local + Geist Mono).
- Frames de revisão: abrir `/?at=0.45` etc. e capturar; salvar em `../docs/review-frames/`.
