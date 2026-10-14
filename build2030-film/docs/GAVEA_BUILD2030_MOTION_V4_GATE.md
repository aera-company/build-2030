# GAVEA · BUILD 2030 · MOTION V4 · GATE
**Data:** 14/10/2026 · **Arquivo:** `out/GAVEA_BUILD2030_MOTION_V4_1080p.mp4` (1920×1080, 30 fps, 76,0 s)
**Plano:** `docs/GAVEA_BUILD2030_MOTION_V4_PLAN.md` (retiming, mapa de som, mapa de motion) · **Código da V3.1:** `archive/v3_1-src/`

## Voz
A voz do teaser da AERA, com o mesmo tratamento: "AERA Narradora F1" (`SjR6urfwxmM7UisfZHpj`), `eleven_v3`, stability 0.55, similarity 0.8, style 0.15, speaker boost, speed 0.95, cues `[calm]`/`[confident]`, sem processamento na voz. Uma tomada por bloco, cortada por frase no envelope real; nenhuma frase foi acelerada (a V3.1 precisou de até 1,1×). 41 s de fala em 76 s de filme.

**Precisa do ouvido do Tiago:** "Build 2030" (inglês ou "dois mil e trinta") e o sotaque pt-BR em todas as frases. A chave não tem speech-to-text; a checagem automática cobriu cortes, energia e fins de palavra (quatro tomadas com a última palavra cortada pelo v3 foram refeitas).

## O que mudou
| | V3.1 | V4 |
|---|---|---|
| Duração | 60 s | 76 s |
| Planos de marca | 5 × 1,7 s | 3 × 3,3 s |
| Frases na tela | 9 | 0 (só palavras, rótulos e a marca) |
| Locução sobre agência, aprovação, Trade, Portal | sim | não (só na imagem) |
| Passagem marca → conhecimento | corte de capítulo | o porto congela, um recorte na ponte vira a janela do escritório |
| Conhecimento / processos | palavras gigantes | recorte etiquetado → nó → régua, tipografia pequena |
| Centro conceitual | DIRECTION | MARCA · NEGÓCIO · TECNOLOGIA; a linha cruza os três; AERA na interseção |
| "Estratégia em sistema" | — | peças soltas e giradas travam no sistema na palavra "sistema" |
| "Sistema em movimento" | — | direção → execução → validação começa na palavra "movimento" |
| Tecnologia | três palavras gigantes + produtos | régua da função (conhecimento, processos, sistemas, IA, decisão); Trade e GAVEA ONE como prova |
| BUILD 2030 no fim | título da assinatura | a linha escreve BUILD 2030 sobre o panorama (o gesto da abertura) |
| Verbos | 1,3 / 0,9 / 1,4 s | 2,1 s cada, imagem, impacto e textura próprios |
| Final | + "Vamos construir?" | marca, BUILD 2030, as duas frentes, AERA |
| Som | bed + efeitos | bed em 5 cores, mundo real ao fundo, família de efeitos em 3 planos, 5 silêncios digitais |

## Medições
- Loudness integrada −14,2 LUFS · pico real −1,3 dBTP · 2280 quadros, 76,0 s.
- Silêncios em 31,9 s · 48,2 s · 52,1 s · 63,2 s · 73,0 s: silêncio digital (nada de cauda).
- Voz sobre o resto da mixagem, por frase: 10 a 15 dB nas frases, 7 a 9 dB nos verbos (que caem sobre os impactos). Antes do ajuste final era 12 a 18: o bed e o mundo subiram 3 dB para a voz sentar dentro.
- Emenda das metades em 35,0 s: diferença entre quadros vizinhos contínua (0,34 → 0,11), sem salto; áudio contínuo de um único master.

## Avaliação (honesta)
| Critério | V3.1 | V4 |
|---|---|---|
| Menos apressado | 6 | 9 |
| Menos explicativo | 6 | 9 |
| Cinema (causa entre planos) | 8 | 9 |
| Autoral | 8 | 9 |
| Perto da AERA em motion | 8.5 | 9 |
| Clareza do papel da AERA | 9 | 9 |
| Risco institucional | 1 | 1 (agência não é falada; aparece só como camada de execução) |

## Pontos em aberto
1. Ouvir a voz (pronúncia de "Build 2030" e sotaque). Regerar uma frase: `node scripts/gen-vo-v4.mjs --only t6` → `python3 scripts/fit-vo-v4.py` → `zsh scripts/render-v4.sh audio` → `zsh scripts/render-v4.sh join …` (o vídeo não muda se o tempo da frase não mudar muito).
2. O navio de OPORTUNIDADES e o de LIDERAR são o mesmo barco em dois planos. Funciona como eco (a oportunidade vira liderança), mas, se incomodar, troco o plano de LIDERAR por outro já aprovado.
3. Corte 9:16, se for usar fora da sala.
