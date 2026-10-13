# GAVEA GROUP / BUILD 2030 · 60S MOTION
## MOTION MAP V1
**Data:** 13/10/2026 · **Fonte de feeling:** `AERA_BF01_V2_preview` (cadência, confiança, precisão, densidade, transformação contínua) · **Fonte de mecânica:** `AERA_BRAND_FILM_01/src`

## 1. Princípio
> Nada entra do nada. Matéria real vira mundo; mundo vira rotas; rotas viram uma linha; a linha escreve a palavra; a palavra gera a estrutura; a estrutura abre janelas reais; as janelas convergem na marca.

Regras de execução herdadas da AERA V2 e mantidas aqui:
- toda entrada nasce de um elemento que já está em cena (linha, nó, haste, rota);
- tipografia como vetor: as palavras-sistema são contornos reais da Mona Sans (`src/data/glyphs.json`), escritas pela linha; as frases em sentence case entram por máscara da esquerda, uma linha por vez;
- máscara de janela no máximo duas famílias (borda e eixo); nunca círculo, nunca blur;
- uma câmera por cena, profundidade só nas plates 3D (já têm câmera real);
- som acompanha a transformação, não o corte.

## 2. Ritmo (seção 16 do brief)
| Tipo | Duração | Onde |
|---|---|---|
| punch | 0.4–0.6 s | B01 (8×), B04 (2×), B14 (3×) |
| fragmento | 0.8–1.5 s | labels de B03/B04, janelas de B09/B11 |
| statement hold | 1.5–2.5 s | marca (B02), síntese (B05), DIRECTION (B07), convergência (B13), close (B14) |
Variância obrigatória: nunca três eventos seguidos com a mesma duração.

## 3. Timing da prova (frames a 30 fps)
| Frame | s | Evento | Mecanismo | Som |
|---|---|---|---|---|
| 0 | 0.00 | preto; tensão | — | riser baixo |
| 8 | 0.27 | fragmento 1 (água no casco) | corte seco, plano cheio, grão | stone_crack curto |
| 20 | 0.67 | `AERA apresenta` | micro por máscara | tick |
| 22/36/50/62/74/88/100 | | fragmentos 2–8 | cortes 0.4–0.6 s, variância | slam curto alternado com thud |
| 100 | 3.33 | último fragmento escurece 60% | opacidade 1→0.4 em 10 f | pulso para |
| 104 | 3.47 | marca GAVEA GROUP | fade + 2% de escala assentando (settle, 14 f) | land |
| 122 | 4.07 | `BUILD 2030` pequeno | máscara da esquerda | tick_hi |
| 150 | 5.00 | plate "chegada" entra por trás da marca; a marca sobe para o canto | crossfade 12 f + translate | port_ambience começa baixo |
| 165/180/195 | | `Operação` `Logística` `Terminais` | Micro ancorado + régua vertical de 24 px crescendo | tick ×3 |
| 210 | 7.00 | punch real (equipe no cais) 0.5 s | plano cheio | slam_2 |
| 225/240/255 | | `Trade` `Green` `Tecnologia` | idem | tick ×3 |
| 270 | 9.00 | punch real (stacker) 0.5 s | plano cheio | slam_3 |
| 285 | 9.50 | plate "sistema" (rotas acendendo) | corte na continuidade do mundo | node ×3 escalonados |
| 330 | 11.00 | `Uma GAVEA.` | máscara, 3.2vw | pivot |
| 348 | 11.60 | `Múltiplas capacidades.` | máscara | pivot |
| 372 | 12.40 | `ONE STOP SHOP` micro | tick_hi | |
| 420 | 14.00 | invert: o mundo escurece para navy; rotas se recolhem numa linha | opacidade do plate 1→0.08 em 14 f; linha horizontal cresce do centro (Rule, 18 f) | invert + line_draw |
| 438 | 14.60 | `E se essa mesma lógica de integração` | máscara da esquerda, 2.4vw | — |
| 462 | 15.40 | `orientasse a próxima fase?` | idem | — |
| 570 | 19.00 | frase sai | sobe 30 px e some (leave) | — |
| 600 | 20.00 | a linha escreve DIRECTION | Written (contorno 45 f, cabeça de luz, preenchimento) | trace contínuo + tick por letra |
| 612 | 20.40 | `DIRETORIA` acima | micro + régua vertical | tick |
| 640–700 | | `AGÊNCIA` `TIME INTERNO` `COMERCIAL` `PARCEIROS` `TECNOLOGIA` abaixo | micro escalonados 12 f, cada um com nó na linha | node_1..3 |
| 720/735/750/765 | 24–25.5 | `Planejar.` `Priorizar.` `Conectar.` `Acompanhar.` | quatro hastes curtas saem da palavra (Rule v 36 px) e o verbo entra por máscara | thud ×4 |
| 750 | 25.0 | corte: `BRAND & MARKETING DIRECTION` começa a escrever e o índice tica | Written + index | cut |

## 4. Mecanismos AERA reutilizados (e o que muda)
| AERA | Aqui |
|---|---|
| `Written` (linha escreve a palavra) | DIRECTION, BRAND & MARKETING DIRECTION, NEW TECHNOLOGIES & AI; fonte Mona Sans 600 wdth 110 |
| `Shot` / `Window` (máscara por borda ou eixo) | janelas reais de B09 e B11; punches entram sem máscara (corte seco) |
| `Rule` / `Node` / `Micro` (Field) | labels do mundo, hastes dos verbos, as cinco frentes |
| `Grain` | 0.06, screen, sobre tudo |
| `Slam` | só B09 e B14, com escala 1.12→1 (menor que a AERA: 1.25) |
| `settle` / `glide` / `leave` | iguais; nada de spring |
| Campo preto `#0a0a0a` / off-white | navy-deep `#050f1a` / branco quente `#f3f1ec`; teal `#1b8fb5` só nas rotas e na linha |

## 5. Relação imagem e tipo
- Fragmentos reais sempre em plano cheio ou janela; nunca dentro de letra.
- Tipografia nunca acima de 12% da altura antes do close; DIRECTION é 9vw de largura, não de altura.
- O 3D não ocupa mais de 14 s do filme (B03–B05 e B14).
- A agência aparece sempre acesa e sempre presente nas estruturas (B07, B10): é a regra política virando imagem.

## 6. Som
Paleta: `riser`, `stone_crack`, `slam_1..5`, `thud`, `land`, `tick`, `tick_hi`, `node_1..3`, `packet_1..4`, `pivot`, `invert`, `line_draw`, `trace`, `open_cell`, `port_ambience`, `cut`. Sem whoosh longo, sem trailer boom. Pulso: drone grave sintetizado (numpy), 52 Hz, com batida a cada 0.5 s do B03 ao B05; para no invert; volta no B09.
