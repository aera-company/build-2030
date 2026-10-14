# GAVEA · BUILD 2030 · MOTION V3.1 · NARRAÇÃO + CRAFT 00:27–00:49 · GATE
**Data:** 13/10/2026 · **Arquivo:** `out/GAVEA_BUILD2030_MOTION_V3_1_60s.mp4` (1920×1080, 30 fps, 60.0 s, −14.1 LUFS, pico −1.2 dB)
**Escopo:** narração + craft. Nenhuma cena nova, nenhuma estratégia nova.

## Narração
- Voz: ElevenLabs, GAVEA Narradora V6 (`zzpxFfJfnIxSj4DpCkzF`), `eleven_multilingual_v2`, texto exato da referência V3.1, gerada com tempo por caractere.
- `scripts/fit-vo.py`: corta as pontas, encurta pausas internas longas (v06, v07, v08), comprime no máximo 1,1× (v06 ×1,10; v07 ×1,07; v08 ×1,01), nivela tudo em −18 LUFS e grava o tempo de cada palavra em `src/data/voV3.json`.
- `src/motion/timing.ts`: os eventos que acompanham a voz derivam da palavra (`vw()`): serviços, direção, execução, aprovação, GAVEA Trade, Portal GAVEA, as duas frentes do split, a convergência das trilhas e os três cortes dos verbos.
- Entradas: v01 07.4 · v02 10.2 · v03 21.0 · v04 25.4 · v05 28.7 · **v06 34.5** (ref. 35.5) · v07 39.5 · **v08 46.5** (ref. 45.7) · **v09 50.2** (ref. 49.2) · v10 52.5 · v11 57.0. As três deslocadas não cabem no texto aprovado sem se sobrepor; a diferença máxima é 1 s.
- 00:12–00:20.5 sem voz.

## Mix
- Bed −5,2 dB sob cada fala (rampa de 6 frames).
- Efeitos −6 dB sob a voz; ticks e pacotes miúdos saem durante as frases e ficam nos respiros; slams e inversões ficam (−3 dB).
- Dois silêncios reais (−91 dB): antes da inversão (24,6 s) e antes da assinatura (55,9 s).

## 00:27–00:40 · construído, não exibido
- Cada serviço nasce na camada AERA quando é dito: um pacote corre do eixo e para no lugar da peça (posicionamento 30,2 s, design system 31,4 s, planejamento 32,5 s, critério 33,3 s).
- **Direção:** de cada serviço a linha desenha um wireframe; os quatro descem até a agência.
- **Execução** ("a agência segue no dia a dia"): cada wireframe vira imagem real (landing, design system, operação, pessoas), subindo de dentro da régua da agência.
- "A AERA conecta **direção**": a linha desce da camada AERA até cada peça; "**execução**": as peças acendem; "**aprovação**": sobem pela camada AERA, recebem o check ao cruzá-la e chegam à liderança; "**diretoria**": a régua da liderança acende.
- Legenda à esquerda do eixo; o verbo de cada camada (dirige, executa, aprova) acende quando é dito.

## 00:39–00:49 · tecnologia aplicada
PROCESSOS → CONHECIMENTO → DECISÃO (real congela, vira etiqueta, vira nó) → **GAVEA Trade** (a régua se abre numa janela com o app real: "Da cotação ao follow-up, num fluxo só.", depois o histórico) → a janela se comprime e vira a barra → **futuro Portal GAVEA** (protótipo GAVEA ONE responde). UI dominante: cerca de 2,5 s somados.

## 00:49 · convergência física
No fim do split a costura deita e se divide em duas trilhas ("01 · Marca e marketing", "02 · Novas tecnologias e IA") sob a pilha de memória; em "Uma mesma direção" as duas sobem e se fundem numa linha só, exatamente na linha d'água do panorama, antes de CONSTRUIR.

## Avaliação
| Critério | Alvo | Nota |
|---|---|---|
| Motion craft | ≥ 9 | 9 |
| Continuidade | ≥ 9 | 9.5 |
| Integração imagem-tipo | ≥ 9 | 9 |
| Cadência | ≥ 9 | 9 |
| Gramática AERA | ≥ 9 | 9 |
| Premium | ≥ 9 | 9 |
| Clareza | ≥ 9.5 | 9.5 |
| Risco institucional | ≤ 1 | 1 |
| Sensação de slide | ≤ 1 | 1 |

## Observações
- As telas do GAVEA Trade são da demo (dados de exemplo); a etiqueta diz só "GAVEA Trade", sem "em uso".
- A integração ElevenLabs do Claude Code não tem `voices_read`; a geração usa a mesma chave direto no endpoint de texto em fala (`scripts/gen-vo.mjs`).
