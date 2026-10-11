# GAVEA / BUILD 2030
## ZIRKA REFERENCE TRANSLATION V1
### Princípio da referência → tradução GAVEA

**Referência:** https://www.zrk.technology (Zirka, interceptor de drones)
**Data da leitura:** 11/10/2026
**O que foi verificado no site:** página única de ~30.400 px de altura (cerca de 40 viewports), 9 seções `position: sticky`, 7 elementos fixos, 133 imagens (sequências de passos `step-1 … step-5` em `.webp`), 5 vídeos. Stack: Webflow + GSAP 3 + ScrollTrigger + Observer + Lenis 1.0.23. **Sem WebGL, sem Three.js.** A imersão é feita com seções pinadas, sequências de imagem e tipografia dirigidas por scroll. Ou seja, a mesma família técnica da nossa base (sticky + canvas + Lenis).

**O que NÃO traduzimos:** HUD militar, mira, coordenadas, laranja, "TARGET ACQUIRED", cursor de crosshair, linguagem de combate, custo por unidade, telemetria. Nada disso entra.

---

## Tabela de tradução

| # | PRINCÍPIO DA REFERÊNCIA | TRADUÇÃO GAVEA |
|---|---|---|
| **A. Imersão** | O visitante não "chega numa landing". Loader (`0 → 100%`), fundo quase preto, uma única frase enorme no canto inferior esquerdo, microlabels no topo. O mundo já está em movimento antes de qualquer explicação. | Entrada em navy profundo com material real em movimento (frame sequence da P-35) antes de qualquer texto. `AERA apresenta` minúsculo. O logo oficial entra limpo. Sem botão, sem headline + subtítulo + imagem. |
| **B. Informação embutida, não em cards** | Specs numeradas (`001 Max speed … 005 Target tracking`) são labels soltos sobre o mundo, alinhados a uma grade invisível. Não há caixa, borda, sombra. | Labels editoriais (`01 / MAR`, `02 / AÇO`, `03 / PORTO`, `04 / OPERAÇÃO`, `AERA / DIRECTION`, `BUILD 2030`) em mono pequeno, posicionados sobre o material, sem caixa. Proibido `card-surface`. |
| **C. A câmera revela** | Cada seção pinada usa o scroll como câmera: a frase do hero desce e some enquanto a cena muda atrás; as sequências `step-1 … step-5` avançam conforme o scroll. A informação nova aparece porque a câmera se moveu, não porque um bloco entrou por fade. | Hero de ~320vh com seis eventos (abertura, aceleração, transformação, revelação, hold, hand-off). `BUILD` e `2030` entram por escala e máscara, não por fade. Em DIRECTION a palavra é maior que a viewport e a câmera atravessa as letras. |
| **D. Físico + técnico coexistem** | Fotos reais de drones e destroços com legendas `//` curtas e datadas, ao lado de diagramas e listas lettered (`A … F`). O real dá credibilidade; o técnico dá hierarquia. | Footage real da P-35 (mar, casco, dique, equipe, stacker GAVEA LOGÍSTICA) em janelas e máscaras, sempre com um label pequeno ao lado. Nunca HUD por cima da foto. A informação é editorial. |
| **E. Hierarquia por escala** | Três escalas convivem: frase gigante (`Zirka is a Shahed interceptor…`), labels de 10–11 px, objetos visuais (drone, fotos) no meio. O olho sabe sempre o que ler primeiro. | Escala tripla fixa: display Mona Sans gigante (uma palavra que enche a tela), mono 10–11 px para labels, janelas de material no meio. Contraste de escala é o principal recurso de "premium" sem efeito. |
| **F. Feature vira experiência visual** | "Features" não é lista: cada item lettered chega com imagem e movimento próprio dentro da seção pinada. O leitor sente a vantagem (velocidade, guia automática) antes de ler. | `Não é sobre substituir.` → `É sobre conectar.` é uma transformação visual: oito elementos independentes em profundidades diferentes começam a alinhar-se a uma trajetória. O CEO entende "conectar" antes de ler a frase. |
| **G. Um produto, depois o sistema** | O interceptor é apresentado sozinho; só mais abaixo, "The interceptor is part of a system" (`A … F`: sensores, radar, comando, equipe). O produto ganha sentido ao virar parte de algo maior. | Primeiro a empresa (GAVEA real), depois a conexão, depois DIRECTION. DIRECTION abre em duas trajetórias (MARKETING DIRECTION / AI & INTELLIGENCE) que, num passe futuro, recombinam em BUILD 2030 → BRAND / MARKET / SYSTEM / INTELLIGENCE. |
| **H. Densidade com hierarquia** | O topo fixo carrega 4–5 microlabels permanentes (nav, status, idioma). Eles não competem com a frase principal porque são pequenos, mono e espaçados. | Uma barra superior mínima e permanente: logo oficial pequeno à esquerda (intacto), `AERA × GAVEA` e `BUILD 2030` à direita, um índice `01 / 04` que muda por bloco. Nada mais. |
| **I. Continuidade** | A página inteira é uma sequência de pins com o mesmo fundo, a mesma tipografia e os mesmos labels. Não existe "seção nova"; existe o mesmo mundo mais abaixo. | A trajetória GAVEA é um elemento persistente (SVG fixo) que muda de função a cada bloco: horizonte no hero, conexão em CONECTAR, órbita em DIRECTION, bifurcação na saída. O fundo navy e o grão não mudam. |
| **J. Performance como design** | Sequências em `.webp`, vídeos curtos, nada de WebGL. 30.000 px de scroll rodam leves porque o custo é imagem decodificada + transform. | Mesmo caminho: canvas com frames webp, vídeos de 2–5 s em 1280 px, transforms por ref, um loop de scroll. Nada de shaders, partículas ou blur animado. |
| **K. Repetição como ritmo** | O mesmo headline repete várias vezes ("Fight efficiently: destroy drones using drones") e banners de imagem se repetem no fim. Repetição vira cadência. | Palavras do sistema reaparecem com outra função: `marketing, negócio e inteligência` saem da frase do hero e viram os primeiros elementos de CONECTAR; os mesmos oito elementos de CONECTAR encontram ordem em DIRECTION. |

---

## Tradução do comportamento (referências de motion)

| Referência | Comportamento copiado | Aparência rejeitada |
|---|---|---|
| `ScreenRecording_10-08-2026 22.mov` | Nada corta: uma linha vira círculos, círculos viram um cartão, zoom contínuo, o mesmo elemento muda de função. Densidade de evento alta (0,4–1,2 s). | Verde neon, glow, estética de SaaS. |
| `Starter … Human Academy` | Logotipo enorme sobre imagem, flashes de imagem de 2–4 frames, grão, holds secos entre movimentos rápidos. | Identidade Human, tipografia da marca. |
| `Academy Pass … Human Academy` | Macro de material contra plano aberto, palavras que se empilham e trocam (`Aprenda.` → `Crie.`), humano quente contra sistema frio. | Cards de UI em perspectiva, mockups. |

---

## Regras de decisão herdadas da leitura

1. **Pin, não fade.** Toda seção do passe 1 é pinada; a mudança vem do progresso, não de reveal ao entrar.
2. **Um label por imagem.** Se precisar de dois, a imagem está dizendo pouco.
3. **Escala antes de efeito.** Antes de adicionar blur, partícula ou brilho, aumentar a palavra ou reduzir o label.
4. **O real nunca fica sozinho por mais de 1,2 s de scroll** sem um evento (label, crop, palavra, mudança de escala).
5. **Sem telemetria inventada.** Só labels que um CEO reconhece como verdade: nomes de territórios, índices de bloco, `P-35`, `AERA × GAVEA`.
6. **A marca não participa do motion.** O mundo se move; o logo oficial entra inteiro, escala para o canto e fica.
