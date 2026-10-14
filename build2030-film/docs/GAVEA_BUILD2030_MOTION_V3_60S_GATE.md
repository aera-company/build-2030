# GAVEA · BUILD 2030 · MOTION V3 · 60 S · GATE
**Data:** 13/10/2026 · **Arquivo:** `out/GAVEA_BUILD2030_MOTION_V3_60s.mp4` (1920×1080, 30 fps, 60.0 s, −14.0 LUFS, pico −0.9 dB)
**Fonte da verdade:** Proposal Master V3 + Storyboard V3 (travados). B01 a B16 completos.

## As 4 correções da prova
| # | Correção | Como ficou |
|---|---|---|
| 1 | Motion blur | Linha com obturador temporal (duas amostras de meio frame por baixo do traço, em todos os beats); blur direcional proporcional à velocidade nas palavras N1, nas frases que sobem da linha, nos conteúdos que travam no grid e nos cartões da pilha |
| 2 | B04 sem cara de slide | "A próxima fase pede mais." sobe de dentro da régua (mesma mecânica das palavras) e volta para ela antes do MARCA. |
| 3 | Locução | **Bloqueada pela chave.** A integração ElevenLabs responde 401 (falta `voices_read`) e não há chave no ambiente. Pronto para rodar: `scripts/gen-vo.mjs` com as 11 falas da V3; a trilha de voz liga sozinha (manifesto `src/data/voV3.json`) e o bed abaixa 18% quando há voz. Todas as falas foram medidas com voz-guia e cabem nas janelas |
| 4 | INTELIGÊNCIA | Profundidade em duas camadas da mesma imagem: fundo empurra devagar, os pontos de luz andam mais rápido e deslizam (asset do storyboard mantido) |

## B08–B16 (a linha continua a mesma)
- **B08** o eixo cria as três camadas; os seis serviços ticam dentro da faixa AERA.
- **B09** as três camadas viram o grid (o eixo vira a borda, a régua AERA vira a linha do meio); seis conteúdos entram soltos e travam: marca oficial, arquitetura das marcas do grupo (arquivos oficiais), landing, operação real, design system, pessoas.
- **B10** o grid volta a ser camadas; três conteúdos viram cartões na régua da agência, sobem, recebem o check na camada AERA e chegam à liderança. Sem setas.
- **B11** o último check inverte o campo de volta ao navy; a régua AERA desce e vira a base do real: PROCESSOS. CONHECIMENTO. DECISÃO., cada plano congela, ganha etiqueta, e a etiqueta vira nó que vai para o ponto da pergunta.
- **B12** a régua sobe e vira a barra de pergunta; "Quero entender o status da P-35"; a janela do GAVEA ONE (protótipo real) abre da barra e a câmera vai até o Resumo da IA; menos de 2 s de UI dominante.
- **B13** a barra volta a ser linha, pivota e costura o split: marca (claro) e operação (real).
- **B14** o split e as imagens do filme viram pilha; o panorama chega por cima, **primeira cor do filme**, e abre até a tela inteira; a linha pousa na linha d'água.
- **B15** CONSTRUIR. ESCALAR. LIDERAR. em cor, cortes secos na régua; silêncio de 0,4 s antes da assinatura.
- **B16** o mundo colapsa num ponto; o ponto traça a régua; marca oficial, BUILD 2030, as duas frentes, "Vamos construir?", AERA. Corte seco em 60,0.

## Avaliação (honesta)
| Critério | Alvo | Nota |
|---|---|---|
| Motion craft | ≥ 9 | 9 |
| Continuidade | ≥ 9 | 9.5 |
| Integração imagem-tipo | ≥ 9 | 9 |
| Cadência | ≥ 9 | 8.5 (sem voz; com a locução sobe) |
| Gramática AERA | ≥ 9 | 9 |
| Premium | ≥ 9 | 9 |
| Clareza | ≥ 9.5 | 9.5 |
| Risco institucional | ≤ 1 | 1 |
| Sensação de slide | ≤ 1 | 1 |

## Pendências
1. Locução (sua chave ElevenLabs). Depois: `ELEVENLABS_API_KEY=... node scripts/gen-vo.mjs` e `zsh scripts/render-v3.sh GAVEA-V3-FILM out/GAVEA_BUILD2030_MOTION_V3_60s.mp4 1799`.
2. Pico −0.9 dB (alvo −1.0): a codificação AAC passa 0,1 dB do limitador; ajusto o teto na próxima renderização.
3. Corte 9:16, se for usar fora da sala.
