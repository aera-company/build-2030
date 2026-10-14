# GAVEA · BUILD 2030 · MOTION PROOF V3 (00:00–00:31) · GATE
**Data:** 13/10/2026 · **Arquivo:** `out/GAVEA_BUILD2030_MOTION_PROOF_V3_00-31.mp4` (1920×1080, 30 fps, 31.0 s, −14.0 LUFS, pico −1.1 dB)
**Fonte da verdade:** Proposal Master V3 + Storyboard V3 (travados). B01 a B07 completos; B08 começa (o eixo cria as três camadas) e a prova corta em 31.0.

## O que foi construído
- **Uma linha só, do primeiro ao último quadro.** Nasce registrada sobre a costa acesa (traçada sobre a imagem), se retifica, pivota, vira a base da marca, desce e escreve BUILD 2030, sobe varrendo o título e para exatamente no horizonte do mar (y 447), fecha a imagem sobre si, vira régua, é a linha de base das cinco palavras, vira a base do mosaico, recebe os tiles dobrados, vira cinco nós, converge num ponto, inverte o campo, pivota e vira o I de DIRECTION, solta os dois ramos e cria os trilhos do B08.
- **Cada transição tem causa:** a marca sobe de trás da linha; o título é apagado pela linha que sobe; o mar abre abaixo dela e o céu a partir dela; cada palavra nasce da régua e volta para dentro dela; o mosaico é um recuo de câmera a partir do último plano (cada tile é o quadro exato em que aquele plano terminou); a inversão sai do ponto.
- **Cinco comportamentos diferentes no B05, um sistema:** janela que sobe da régua (MARCA), painel lateral com o aéreo continuando a deslizar (PRESENÇA), comporta que abre do centro com recuo de câmera (OPORTUNIDADES), imagem nascendo dentro das letras e crescendo a partir delas (CONEXÃO), cortina de cima com o campo de dados assentando (INTELIGÊNCIA). `MAIS` e o contador `01 / 05` fixos; durações 57, 53, 50, 48, 47 frames (acumulação).
- **Grade comum:** gradient map navy → aço → branco frio em todas as imagens (real e IA), grão por cima. A cor plena fica guardada para o B14.
- **Som dirigindo o corte:** cada evento gráfico tem um som (tick por letra, slam por palavra, packet na dobra, node por nó, invert no ponto, pivot no I). Bed grave sintetizado; pulso entra com a régua e acumula; **silêncio real (−91 dB) de 24.6 a 25.0 s** antes da inversão.
- **Arquitetura:** `src/motion/{timing,easing,design,geometry}.ts` (todo número de tempo e de layout num lugar só), primitivos em `src/primitives/` (Line, Grade, Media, Type, WrittenTitle), filme em `src/film/V3Film.tsx`, som em `src/film/V3Audio.tsx`, bed em `scripts/make-bed-v3.py`, render em `scripts/render-v3.sh`.

## Avaliação (honesta)
| Critério | Alvo | Nota | Por quê |
|---|---|---|---|
| Motion craft | ≥ 9 | 8.5 | curvas e registros precisos; falta motion blur nos movimentos rápidos (pivô, convergência, palavras) |
| Continuidade | ≥ 9 | 9.5 | a linha nunca some nem reaparece; cada beat cria o primeiro elemento do seguinte |
| Integração imagem-tipo | ≥ 9 | 8.5 | B05 e CONEXÃO são uma composição só; as frases N2 (B03, B04, B06) ainda são blocos no canto |
| Cadência | ≥ 9 | 8.5 | B05 acumula bem e o silêncio funciona; B04 é calmo demais sem voz |
| Gramática AERA | ≥ 9 | 9 | imagem vira linha, linha escreve, eixo na letra, inversão, uma palavra por imagem, mosaico |
| Premium | ≥ 9 | 8.5 | o duotone unifica; o campo de dados (INTELIGÊNCIA) é o plano mais fraco; contêiner com lettering gerado |
| Clareza | ≥ 9.5 | 9.5 | DIRECTION + duas frentes leem em ~3 s |
| Risco institucional | ≤ 1 | 1 | |
| Sensação de slide | ≤ 1 | 1.5 | B04 (frase sobre navy vazio) é o momento mais próximo de slide |

**Veredito:** passa em continuidade, gramática, clareza e risco. Ainda não passa em craft, integração, cadência e premium (8.5 contra 9).

## Próximas correções (antes do B08–B16)
1. Motion blur direcional (amostragem temporal) só no pivô do B01, na convergência do B06, no pivô do B07 e na entrada das palavras.
2. B04 sem cara de slide: a frase entra apoiada na própria régua (sobe da linha, como as palavras), não no canto.
3. Locução (chave ElevenLabs): a voz preenche o B04 e o B06 e muda a cadência.
4. INTELIGÊNCIA: parallax em duas camadas no campo de dados ou trocar pelo frame nítido do GAVEA ONE (decisão sua; o storyboard trava o asset atual).
