# GAVEA / BUILD 2030
## BASE AUDIT V1
### Auditoria da `new-3d-landbase` antes de tocar em código

**Data:** 11/10/2026
**Base auditada:** `new-3d-landbase/` (commit `2028476`, "Base landing 3D + intelligence adaptada ao Next 16")
**Projeto novo:** `GAVEA_BUILD2030_DIRECTION/app/`
**Regra:** a base é fundação, não direção visual. Preservar o que é saudável; trocar identidade e conteúdo por completo.

---

## 1. Stack atual

| Camada | O que existe | Veredito |
|---|---|---|
| Framework | Next.js 16.2.2 (App Router), React 19.2.4, TypeScript 5 | FICA |
| CSS | Tailwind v4 via `@tailwindcss/postcss`, tokens em `:root` + `@theme inline` | FICA (tokens trocados) |
| Scroll | Lenis 1.3.21 (`lerp 0.1`, `duration 1.2`, `syncTouch false`), desligado em `prefers-reduced-motion` | FICA, com ajuste fino |
| Motion | Framer Motion 12 (só em `AnimatedSection` / reveals pós-hero) | FICA instalado, não entra no primeiro passe |
| Fontes | Geist Sans + Geist Mono via `next/font/google` | Geist Mono FICA (labels). Display passa a ser Mona Sans variável (local, `wdth 75–125`, `wght 200–900`) |
| Config | `turbopack.root` fixado em `next.config.ts` (evita o `package-lock.json` da HOME) | FICA, obrigatório |
| Deploy | `vercel.json` mínimo | FICA, sem deploy neste passe |
| Node | v24.15.0 / npm 11.12.1 | OK |

---

## 2. Arquitetura do hero (`src/components/sections/Hero.tsx`, 410 linhas)

**Modelo:** `<section>` de `400vh` (`.scroll-animation`) com wrapper interno `sticky top-0` de `100dvh`. Um `<canvas>` cobre a viewport. O handler de scroll calcula `progress = -rect.top / (offsetHeight - innerHeight)`, escolhe `frameIndex = floor(progress * FRAME_COUNT)` e desenha com cover-fit.

**O que é saudável (FICA):**
- `requestAnimationFrame` + `tickingRef` (um update por frame, nunca síncrono).
- Canvas e opacidades atualizados por ref, nunca por React state.
- DPR limitado a 2.
- Listener de scroll `{ passive: true }`.
- Cover-fit centralizado correto.
- Desenho só quando o índice muda (`lastFrameRef`).

**O que é limitação para a nova direção (MUDA):**
- Um componente monolítico mistura motor, copy, HUD, cards de annotation e loading. Precisa virar primitivos reutilizáveis (`FrameSequence`, `MotionType`, `MediaWindow`, `EditorialLabel`, `Trajectory`).
- A sequência de frames é a única mídia possível. A nova direção exige que o mesmo motor aceite `image | video | sequence` (seção 29 do prompt) sem reescrever motion.
- O progresso é linear: um frame por fatia igual do scroll. A nova direção pede eventos (abertura, aceleração, transformação, revelação, hold, hand-off), ou seja, uma timeline com segmentos e easings por camada.
- Cada seção escuta `scroll` por conta própria. Com 4 blocos + trajetória persistente isso vira 5 listeners. Precisa de um único loop de scroll distribuindo progresso para assinantes.
- `powerReadout` (87.3%), `SISTEMA // DIAGNÓSTICO`, cantos HUD e `card-surface` com radius 20 + glass: tudo isso é exatamente o que a direção proíbe (telemetria falsa, HUD militar, glassmorphism). SAI.
- Zoom 1.3x hardcoded no mobile dentro de `drawFrame`. Vira parâmetro.

---

## 3. Sistema de frames (`src/lib/hero.ts` + `public/frames/`)

- `FRAME_COUNT = 169`, `framePath(n)` → `/frames/frame_0001.jpg`. A pasta `public/frames/` está vazia (só README).
- Pré-carrega **todos** os frames antes de animar, com tela de loading. Para 100–170 frames de 1600 px isso é 7–15 MB antes do primeiro pixel. Aceitável para apresentação presencial, ruim como estratégia.

**Nova estratégia de carregamento (MUDA):**
1. Frame 0 entra como `<img>` poster imediato (sem tela de loading).
2. Carrega primeiro os keyframes (1 a cada 6), depois preenche os intervalos em ordem.
3. O canvas desenha o frame carregado mais próximo do índice pedido; nunca trava esperando.
4. Decodificação via `img.decode()` para não bloquear a main thread.
5. Mídias dos blocos seguintes (vídeos curtos) carregam por `IntersectionObserver`, `preload="metadata"`, play só quando visíveis.
6. Um único tamanho hoje (1600×900). O path aceita variante para servir 960 px no mobile depois.

---

## 4. Sistema de scroll

- Lenis com `lerp 0.1` e `duration 1.2`: sensação premium, sem lag perceptível no trackpad. Mantido. Vale testar `lerp 0.12` se a trajetória parecer "atrasada".
- `MotionConfig reducedMotion="user"` já embutido.
- `scroll-behavior` e animações cortadas em `prefers-reduced-motion` via `globals.css`.
- Não há smooth scroll duplicado nem `scroll-snap`. Bom.

---

## 5. Assets

### Na base
Nenhum asset de projeto. `favicon.svg`, `robots.txt`, README de frames.

### No projeto novo (`GAVEA_BUILD2030_DIRECTION/public/`)
| Pasta | Conteúdo | Uso |
|---|---|---|
| `brand/` | `logo gavea hor simples branco cor2 1.png` (3567×622, branco puro, alpha) | Marca oficial. Entra intacta como `<img>`. |
| `motion-ref/` | `Academy Pass ... Human Academy.mp4` (14 MB) | Referência de ritmo. Não vai para o app. |
| `gavea-trade/`, `real-gavea/`, `selected-assets/` | vazios | A preencher. |
| `archive-reference/moodboard.png` | moodboard gerado por IA | Direção de paleta apenas. O logo dentro dele NÃO é oficial. |

### Material real localizado fora do projeto (zero crédito)
| Fonte | Natureza | Decisão |
|---|---|---|
| `GAVEA PLAN27/APRESENTAÇÃO  G A V E A/video_gavea-demo-ver-final/VIDEO-2026-06-11-19-34-44.mp4` (848×478, 30 fps, 135 s, marca d'água GAVEA GROUP no canto superior direito) | **Footage real** da P-35 rebocada na Baía de Guanabara: mar aberto, casco, zenital, dique seco, equipe, stacker GAVEA LOGÍSTICA | **Fonte principal.** Crop `760×426` a partir de `(0,52)` remove a marca d'água; upscale lanczos para 1600×900. Trechos com marca BR/Petrobras e letreiro no casco (0:17–0:24, 1:06–1:08) ficam fora. |
| `GAVEA PLAN27/site/public/media/video/p35-*.mp4` | proxies 848 px já cortados do mesmo footage | Referência de corte; regeramos a partir da fonte para controlar crop. |
| `GAVEA PLAN27/GAVEA_MOTION/assets/brand/gavea-group_hor_{branco,cor}.png` | logo oficial recortado (2901×563) | Cor oficial amostrada: navy `#081E2F`, teal `#006B90`. |
| `GAVEA PLAN27/GAVEA_MOTION/assets/brand/MonaSans-var.woff2` (98 KB) | fonte variável usada no projeto de motion | Display do projeto (`wdth` 75–125 dá condensado e expandido para escala). |
| `titulos-gavea/GAVEA_footage_graded-B.mp4`, `HERO GAVEA/video-*.mp4`, `GAVEA_TEASER/gavea-guindaste.mp4`, `gavea-meeting.mp4`, pasta `01_FOTOS-IA/` | vídeo institucional e fotos **geradas por IA** (pôr do sol, operário olhando o horizonte, capacetes com logo composto) | **Arquivo.** É a lista de clichês que a direção proíbe. Não entra. |
| `HERO GAVEA/new-3d-landbase/public/frames/` (171 webp 1920×1080) | frames do vídeo IA acima | Não entra. |

### Referências de motion (não entram no app)
- `~/Downloads/ScreenRecording_10-08-2026 22.mov` (24 s, Reels): elementos que persistem e se transformam (linha → círculos → cartão), zoom contínuo, nada corta, tudo vira outra coisa.
- `~/Desktop/Starter ... Human Academy.mp4`: grão, logotipo enorme sobre imagem, flashes de imagem, contraste de escala.
- `public/motion-ref/Academy Pass ... .mp4`: macro de material, palavras empilhadas que trocam, cards em perspectiva (não copiar), humano quente contra sistema frio.

---

## 6. Dependências

| Pacote | Versão | Uso no passe 1 |
|---|---|---|
| `next` | 16.2.2 | sim |
| `react` / `react-dom` | 19.2.4 | sim |
| `lenis` | ^1.3.21 | sim |
| `framer-motion` | ^12.38 | instalado, sem uso no passe 1 (reveals pós-hero ficam para depois) |
| `geist` | ^1.7 | não usado (fontes vêm de `next/font`) |
| `tailwindcss` / `@tailwindcss/postcss` | ^4 | sim |

Nada novo a instalar. Sem Three.js, sem GSAP, sem Remotion: o motor de canvas + um loop de scroll resolve a direção. Motivo técnico para trocar o motor não existe; o que falta é **composição e timeline**, não WebGL.

---

## 7. Riscos de performance

| Risco | Mitigação |
|---|---|
| Upscale de 848 px para 1600 px (fonte única real tem baixa resolução) | Grade escuro, grão, uso em janelas/máscaras e em movimento. O full-bleed estático fica curto. Asset RM-6 (originais do drone) resolve. |
| 108 frames webp ≈ 7–8 MB | Carregamento progressivo (keyframes primeiro), poster imediato. |
| 4 a 6 vídeos curtos simultâneos | Só tocam quando visíveis; `preload="metadata"`; 1280 px, CRF 24, sem áudio. |
| Texto gigante com footage dentro (`clip-path` de texto) | Um elemento por bloco, `will-change: transform`, sem filtros animados sobre ele. |
| Blur animado em muitos elementos (campo de palavras) | Blur discretizado em 3 níveis de profundidade, não interpolado por frame. |
| 5 listeners de scroll | Um `ScrollStore` com um rAF distribuindo para assinantes. |
| Disco da máquina com 3,6 GB livres | Nada de copiar mídia grande. Só derivados leves entram em `app/public/media/`. |

---

## 8. O que fica, o que muda, o que sai

### FICA
- Modelo sticky + canvas + cover-fit + DPR ≤ 2 + rAF por ref.
- Lenis e seus defaults Safari-safe; reduced-motion embutido.
- Tailwind v4 com tokens em `:root`.
- `turbopack.root`, alias `@/`, estrutura `src/app`, `src/components`, `src/lib`.
- `globals.css`: foco visível, `touch-action`, `grain` (ajustado), reduced-motion.

### MUDA
- **Seção sticky por bloco vira um palco fixo com jornada global** (`j = scrollY / vh`). Motivo mensurável: com sticky por seção, entre o fim de um bloco (p = 1) e o início do próximo (p = 0) há 100vh em que A congela e sobe enquanto B entra de baixo. Isso é o "8 seções empilhadas" que o brief proíbe. O motor de canvas/cover-fit/rAF por ref da base fica intacto dentro do palco.
- `Hero.tsx` vira `HeroExperience` composto por primitivos (`FrameSequence`, `MotionType`, `MediaWindow`, `EditorialLabel`, `Trajectory`, `BrandMark`, `NoiseTexture`).
- Progresso linear vira timeline com segmentos e easings (`src/motion/tokens.ts`, `segment()`).
- Pré-carregamento total vira progressivo.
- Listener por seção vira `ScrollStore` único.
- Tokens: `--background` `#0a0a0b` → navy `#081E2F`; `--accent` dourado → teal `#006B90` (como sinal, não neon); display Geist → Mona Sans.
- `.scroll-animation` fixo de 400vh vira altura por bloco (hero ~320vh).

### SAI
- `ANNOTATIONS` e os cards `card-surface` (glass, radius 20).
- `HudFrame`, `EyebrowBadge` como estilo (cantos HUD, chips).
- `powerReadout`, `SEQ 001 / 169`, `SISTEMA // DIAGNÓSTICO` (telemetria falsa).
- Tela de loading com barra.
- `Button`, `Placeholder`, `VideoMedia` (hover-play), `ScrollRevealText`, `SectionLabel`: não entram no passe 1; ficam no repositório da base, não copiados.
- Pasta `intelligence/` (processo da base): não copiada; o processo deste projeto está em `docs/`.

---

## 9. Setup do projeto novo

- `app/` recebe cópia de `new-3d-landbase/` **sem** `.git`, `.next`, `node_modules`, `intelligence/`.
- `npm ci` novo em `app/` (lockfile da base, versões idênticas).
- Porta de dev: `3030` (3000, 3010 e 3012 estão em uso por outros projetos).
- `new-3d-landbase/` fica no projeto como referência de auditoria, intocada.
- **Git:** o projeto ainda não tem `.git` próprio. Comandos `git` rodados aqui caem no git acidental de `/Users/tiagolima`. Nenhum commit foi feito. Iniciar o histórico novo só com ordem do Tiago.
