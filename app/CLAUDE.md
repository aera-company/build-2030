# GAVEA / BUILD 2030 · app

Experiência HTML one-page (Next.js 16 + React 19 + Tailwind v4 + Lenis + three.js) que
apresenta BUILD 2030 como a próxima camada da GAVEA GROUP. Apresentação presencial,
desktop first (1440×900), scroll conduzido pelo Tiago. **Hoje só existe o hero.**

**Direção atual (HERO V2, 11/10 à noite, referência máxima Emons):**
`../docs/GAVEA_BUILD2030_HERO_DIRECTION_V2.md` (conceito, tradução da Emons, uso dos
3 assets), `GAVEA_BUILD2030_HERO_STORYBOARD_V2.md` (sete beats),
`GAVEA_BUILD2030_HERO_CAMERA_PATH_V2.md` (uma travessia). Frames: `../docs/review-frames-hero-v2/`.
Assets de referência: `../public/selected-assets/` (A limpo, B explicativo, C atmosfera).
Histórico: Reset V2 "one object" em `archive/v2-system/` (docs `BUILD2030_SPATIAL_*`),
reset Zirka (`BUILD2030_ZIRKA_RESET_V1.md`), V1 tipográfica em `archive/v1-typographic/`.
Fonte estratégica: `../docs/GAVEA_BUILD2030_MASTER_BRIEF_V2.md`, `COPY_V1`.

**A história do hero (não mudar sem brief):** chegada (AERA apresenta → marca → BUILD 2030
pequeno) → entrada no berço STS → operação no pátio → capacidades reveladas (Operação,
Logística, Terminais, Trade, Tecnologia, Green) → camada de sistema (rotas teal) → direção
estratégica (mais presença / conexão / oportunidades / inteligência) → lockup
(marca + BUILD 2030 + Construir. Escalar. Liderar.).

## Modelo mental

Não há seções. Há **um terminal** (`src/world/World.ts` + `src/world/terminal/*`: céu,
chão e água, pátio instanciado, guindastes STS/RTG/móveis, navios, galpões e torre,
veículos, rotas) visto por **uma câmera em spline** (`src/world/camera-path.ts`, x ao
longo do cais, fov variável), dentro de um palco fixo com spacer alto
(`src/experience/Experience.tsx`). O scroll vira `P = j / JOURNEY_TOTAL` (`j = scrollY / vh`,
`journey.ts`, 9 viewports ≈ 30 s). Todos os instantes estão em `src/world/moments.ts`
(`M`, `ZONES`, `LINES`, `LOCKUP`). Um único loop (`src/motion/scroll-store.ts`, sempre vivo
via `setLive`) chama `tick(state)` em cada camada; nada de React state no caminho quente.
Cada módulo do terminal devolve `{ group, occluders?, update?(t, p, sys) }`.

Pós (World.ts): RenderPass → GTAOPass → UnrealBloomPass → ShaderPass(GradeShader, `grade.ts`) → OutputPass.
Água da bacia é `three/addons/objects/Water.js` (reflexo real); sprites de brilho estão desligados
(`sprite()` em `materials.ts` devolve invisível) porque viram quadrados pretos no passe de normais do GTAO.

Camadas: `WorldLayer` (canvas three.js com EffectComposer + bloom leve; publica âncoras
3D projetadas com oclusão), `AnnotationLayer` (labels presos ao mundo, abertura, lockup),
`TopBar`, `DebugPanel`. Primitivos: `EditorialLabel`, `BrandMark` (logo oficial, intacto).

Hierarquia: mundo/operação (80%) → sistema visual: paleta, névoa, rotas (15%) → marca
explícita (5%). Nenhuma palavra acima de ~12% da tela antes do lockup. **Nunca footage
dentro de tipo. Nunca HUD.** O teal só existe na camada de sistema.

## Regras que não se negociam

- **Logo oficial intacto.** Só `public/brand/gavea-group-hor-branco.png` dentro de
  `BrandMark`. Nunca redesenhar, recolorir, separar o símbolo, dar glow. O logo que
  aparece dentro do Asset C é reinterpretado e não entra.
- **Zero geração paga.** O mundo é geométrico em tempo real; os assets A/B/C são só
  referência (nenhum pixel entra). Texturas e HDRI em `public/tex` e `public/env` são
  Poly Haven (CC0); o `.hdr` original fica no disco, o app carrega a versão limitada `.jpg`
  (feita com o script Python inline que decodifica RGBE, ver histórico da sessão de 13/10).
- **Sem HUD / telemetria falsa / cards / glass / neon.** Labels mono pequenos, presos ao mundo.
- **Copy** mínimo (universo completo no storyboard). Sem travessões. Sentence case em
  português; caixa alta só em BUILD 2030 e labels.
- **Motion tokens** em `src/motion/tokens.ts`. Easings cúbicos/expo, sem spring.
- **Performance:** rAF único, DPR ≤ 1.5, contêineres instanciados, ≤ 6 point lights,
  sombras só do sol (2048, seguem o alvo da câmera).
- **Git:** repo público `aera-company/build-2030`. Nenhum commit/push sem ordem do Tiago.

## Comandos

`npm run dev` (`:3030`) · `npm run build` · `npm start` · `npm run lint`.
Debug: `?debug=1` (painel) · `?at=0.6` (abre em 60%) · `?capture=1` (API `window.__b2030`:
`goto(P)`, `play(ms)`, `ready()`). Nunca em produção.
Captura de revisão (8 frames + gravação do scroll, 1440×900, Chrome headless via
puppeteer-core): `node scripts/capture.mjs http://localhost:3030 ../docs/review-frames-hero-v2`
com o dev server no ar. No painel do app, só a primeira navegação de um lote compõe:
para ver vários P, carregar `?at=0&capture=1` uma vez e usar `window.__b2030.goto(P)`.

## Onde mexer

- Instantes, zonas, linhas, lockup → `src/world/moments.ts`.
- Caminho de câmera, fov, névoa, exposição → `src/world/camera-path.ts`.
- Planta do terminal (posições) → `src/world/terminal/layout.ts`.
- Paleta e helpers de material → `src/world/materials.ts`.
- Cada família de objeto → `src/world/terminal/{sky,ground,containers,cranes,vessels,buildings,vehicles,routes}.ts`.
- Luz, bloom, montagem, âncoras → `src/world/World.ts`.
- Labels, abertura, lockup → `src/experience/layers/AnnotationLayer.tsx`.
- Comprimento da jornada → `LENS` em `src/experience/journey.ts`.
- Cores e tipografia → `src/app/globals.css` (Mona Sans variável local + Geist Mono).
