# GAVEA GROUP / BUILD 2030 · 60S MOTION
## ASSET AUDIT V1
**Data:** 13/10/2026 · **Pastas auditadas:** `~/Desktop/GAVEA PLAN27/`, `~/Desktop/GAVEA_BUILD2030_DIRECTION/`, `~/Desktop/AERA_BRAND_FILM_01/`, `~/Desktop/GAVEA-TRADE-APP/`, `~/Desktop/` (episódio em 1080p)
**Regra:** material real primeiro; 3D já construído segundo; GAVEA Trade terceiro; imagens IA já aprovadas só como MAYBE; nada novo gerado para a prova.

## USE

| Asset | Onde | O que é | Uso no filme |
|---|---|---|---|
| Episódio "Conhecendo quem faz acontecer EP 03 · Gávea Group, do porto ao descomissionamento" | `~/Desktop/YTDown…_1080p.mp4` (1920×1080, 7 min 46 s) | Footage real: aéreas da baía e da ponte, P-35 no cais e no estaleiro, equipes no convés e no cais (coletes GAVEA), stacker GAVEA Logística, garra de carga, bobinas no guindaste, ro-ro, escritório com telas, rebocadores. Marca d'água Portal ComexRio no canto superior esquerdo e GAVEA GROUP no superior direito em alguns planos | 30 trechos de 3.2 s já extraídos em `public/media/yt/` com corte do topo (crop 1920×960 a partir de y 120, reescalado): a faixa das marcas d'água sai. Entrevistas (Guilherme Lassance, Diogo Salomão, apresentadora) **não** entram: só b-roll |
| P-35 drone (fonte 848 px, 135 s) | `GAVEA PLAN27/APRESENTAÇÃO G A V E A/video_gavea-demo-ver-final/VIDEO-2026-06-11-19-34-44.mp4`; recortes sem marca d'água e ampliados em `app/public/media/clips/` (mar, aço, porto, cais, operação, equipamento, equipe, baía) | Casco, água, rebocador, equipe com defensa GAVEA LOGÍSTICA, stacker em macro | Copiados para `public/media/p35/`. Só em janelas pequenas ou planos de 0.4–0.8 s (resolução) |
| Mundo 3D do hero (terminal ao entardecer) | `app/` (three.js), render determinístico via `app/scripts/plates.mjs` | Plates em 1920×1080, 30 fps: `chegada` (0.00–0.14, 5 s), `patio` (0.40–0.50, 4 s), `sistema` (0.64–0.92, 8 s, rotas teal acendendo) | `public/plates/` · mundo, transição e metáfora de integração (blocos 02, 03, 08) |
| Telas do GAVEA Trade | `GAVEA-TRADE-APP/.local-demo/telas/01–10.png` | Login, painel, propostas, proposta, nova proposta, base de preços, follow-ups, histórico, configurações, usuários (dados de demonstração) | `public/media/trade/` · bloco 06 (prova real de tecnologia aplicada). Legenda discreta `demo` se os dados forem fictícios |
| Marcas oficiais | `GAVEA PLAN27/GAVEA_MOTION/assets/brand/` | GAVEA GROUP horizontal e vertical branco, símbolo, Trade, Logística, Terminals, Green (recortes dos originais oficiais) | `public/brand/` · só o arquivo, nunca redesenhado |
| Mona Sans variável · Geist Mono | `assets/brand/MonaSans-var.woff2`, AERA `GeistMono-wght.woff2` | Tipografia do sistema GAVEA do hero | `public/fonts/` |
| Biblioteca de sons AERA | `AERA_BRAND_FILM_01/public/audio/sfx/` (34 wav sintetizados e orgânicos) | tick, node, packet, slam, thud, pivot, invert, line_draw, riser, open_cell, cut, port_ambience | `public/audio/sfx/` · são sons de sistema, não identidade AERA |
| Mecanismos de motion AERA | `src/film/motion.ts`, `components/{Window,Field,Grain,Shot,Written,GlyphWord}` | ramp/settle/glide, janelas por máscara, régua e nó, grão, palavra escrita pela linha | copiados e adaptados; glifos reextraídos da Mona Sans (`scripts/build-glyphs.py`) |

## MAYBE

| Asset | Onde | Por quê |
|---|---|---|
| Demo 48 s (`video-gavea-final.mp4`, `video-gavea-hero.mp4`, `GAVEA_footage_graded-B.mp4`) | PLAN27 | Planos IA (Magnific/Kling) ao entardecer já aprovados antes; dois ou três frames (contêiner GAVEA GROUP no guindaste, equipe no deck ao pôr do sol) podem servir de punch se faltar real. Frames com helideck BR (marca de cliente) não |
| Prova V6 (20.8 s) e seus clipes | `GAVEA_MOTION/output/motion/v6/` | Gramática já validada em parte (fragmentos físicos → título por remoção); material misto real + IA; serve de referência de ritmo, não de fonte |
| `operacao.mp4`, `integracoes.jpg`, `pipeline.jpg`, `warroom.jpg` | AERA film `public/media/gavea/` | Material GAVEA usado no filme da AERA (GAVEA ONE); checar se são UI de protótipo antes de usar como "prova" |
| `gavea-guindaste.mp4`, `ipad-gavea-one.mp4` | PLAN27 GAVEA_TEASER | 720p/1080p, guindaste real e iPad com GAVEA ONE; úteis em janela pequena |
| Assets A/B/C do hero | `public/selected-assets/` | Referência de atmosfera; o C tem logo reinterpretado (não entra) |

## DO NOT USE

| Asset | Por quê |
|---|---|
| Entrevistas do episódio (talking heads) | Pessoas identificadas falando; não é o filme; risco político |
| Trechos do episódio com o explicativo 3D do Rio Brasil Terminal e "CAIS 340 m" | Material de terceiros |
| Frames com casco PETROBRAS, helideck BR, Pão de Açúcar em primeiro plano | Marca de cliente; regra do Pão de Açúcar só pequeno e distante; Cristo nunca |
| Planos IA com pessoas em close | Regra de humanidade real; o V6 já apontou |
| `review-frames-*/scroll.mp4` do hero | Screencast comprimido a 1440×900; substituído pelas plates determinísticas |
| Logo dentro de imagem gerada (Asset C) | Logo só do arquivo oficial |
| Música "inspiracional", whoosh pack, cyber FX | Seção 15 do brief |

## Gaps (para depois da prova)
- Drone original da P-35 em 1080p/4K (RM-6 do projeto anterior): substituiria os recortes de 848 px 1:1.
- Uma imagem real do time interno de marketing/comercial da GAVEA (bloco 05) se o escritório do episódio não bastar.
- Captura em vídeo do GAVEA Trade em uso (hoje só PNG).
