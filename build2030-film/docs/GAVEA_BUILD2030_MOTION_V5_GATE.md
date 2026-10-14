# GAVEA · BUILD 2030 · MOTION V5 · GATE
**Data:** 14/10/2026 · **Arquivo:** `out/GAVEA_BUILD2030_MOTION_V5_1080p.mp4` (1920×1080, 30 fps, 66,0 s)
**Base:** V4 (código em `archive/v4-src/`). Nada de conceito, cena ou imagem nova.

## Voz
A mesma do teaser da AERA: "AERA Narradora F1" (`SjR6urfwxmM7UisfZHpj`), `eleven_v3`, stability 0.55, similarity 0.8, style 0.15, speaker boost, speed 0.95, sem processamento.
- **Pronúncia:** no texto de geração GAVEA vira "Gávia" e IA vira "I.A."; na tela nada muda.
- **Fluxo:** cada bloco é uma tomada só, com pausas internas comprimidas (fim de frase 240 ms, dois-pontos 220 ms, vírgula até 180 ms), sem mudar o andamento das palavras (`scripts/fit-vo-v5.py`).
- **Pausas entre blocos:** 0,5 a 0,9 s. Restam três respiros musicais (4,3 s nos planos de marca, 3,5 s em Trade/ONE, 3,0 s na chegada de AERA), cada um com a música carregando o acento.
- Três tomadas vieram com a última sílaba cortada pelo v3 e foram refeitas.

## Música
A chave do ElevenLabs não tem `music_generation`, e o Magnific tem 22 créditos. A trilha foi composta em código (`scripts/make-music-v5.py`):
- 90 BPM, Ré maior; pad quente, motivo dedilhado discreto, shaker, rim, wood, pulso curto, arpejo só na tecnologia e no movimento.
- Grade de 20 frames por batida, a mesma do filme: MARCA, PRESENÇA e OPORTUNIDADES em tempos fortes; respiro sem bateria no encontro; sino em AERA; CONSTRUIR, ESCALAR e LIDERAR em Ré, Sol e Lá; pouso em Ré maj9 no "2030".
- Se a permissão de música for liberada, a trilha pode ser trocada sem mexer no filme (o mapa de tempo é o mesmo).

## Grave
| | V4 | V5 |
|---|---|---|
| 40–90 Hz contra médios (mediana) | −5 dB | −24 dB |
| pior trecho | +16 dB (o drone) | −18 dB |

O grave agora só existe nos acentos. Texturas de mundo com passa-alta em 140 Hz; a sala de máquinas saiu.

## O que mudou na imagem
| Momento | V4 | V5 |
|---|---|---|
| Abertura | costa 5,6 s, logo aos 5,6 s | AERA apresenta → GAVEA GROUP → BUILD 2030 em 4 s, com a voz |
| MARCA · PRESENÇA · OPORTUNIDADES | 3,3 s cada | três tempos fortes; o porto fecha sobre a régua |
| Frente 01 | sistema de camadas (liderança/agência) | a régua vira a estrutura da AERA: quatro molduras, cada serviço falado preenche a sua com material real; rotas ligam tudo a comunicação, conexão comercial e oportunidades |
| Frente 02 | régua + Trade e ONE | necessidade (operação real) → oportunidade (recorte vira nó) → IA (campo de dados) → sistema (nós se ligam) → cada item falado entra na régua → Trade (implementação) → ONE (evolução) |
| Encontro (benchmark) | linha atravessa da esquerda | duas frentes, uma de cada lado, chegam juntas ao ponto; os três campos; AERA menor na interseção |
| Estratégia em sistema | quatro peças | os 14 serviços das duas frentes aparecem soltos e travam em duas réguas ligadas pelo eixo da AERA |
| Sistema em movimento | peças descem e sobem | pacotes correm, as frentes se ligam por arcos, imagens viajam; uma sai do centro e vira o CONSTRUIR |
| Verbos | 2,1 s, navio repetido | 1,33 s cada, na música; LIDERAR sobre o panorama (o navio não se repete) |
| Final | marca + BUILD 2030 | igual, com a voz "Gávia Build 2030" e o pouso musical |

## Oferta visível (sem lista)
- **Frente 01:** posicionamento, design system, planejamento, direção criativa, comunicação, conexão comercial, oportunidades.
- **Frente 02:** sistemas de IA, automações, conhecimento, processos, ferramentas internas, apoio à decisão, novas tecnologias.

Todos aparecem duas vezes: na frente de cada um e no sistema único.

## Duração
66 s, abaixo da faixa de 74–82 s. Com a voz quase contínua (51 s de fala) e as pausas no limite do brief, chegar a 74 s exigiria devolver silêncios longos entre blocos, o problema que este passe resolve. Se preferir mais tempo, o lugar certo é alongar os três respiros musicais (cerca de +1 compasso, 2,7 s cada).

## Pontos para o Tiago
1. Ouvir "Gávia" (duas vezes), "I.A." e "Build 2030".
2. Ouvir a trilha: foi composta em código; se não tiver o acabamento desejado, liberar `music_generation` na chave do ElevenLabs.
3. Duração (66 s) contra o alvo de 74–82 s.

---

# PASSE FINAL · `out/GAVEA_BUILD2030_FINAL_MASTER_1080p.mp4`
**1920×1080, 30 fps, 72,0 s (2160 quadros), −14,0 LUFS, pico −1,7 dBTP.** Mesma estrutura da V5.

| Item | O que foi feito |
|---|---|
| 01 · AERA aos 48 s | O texto virou o logo oficial da AERA. O arquivo enviado é branco e some no creme, então usei a versão oficial escura do mesmo logo (`GAVEA-TRADE-APP/public/brand/aera.png`), só o wordmark, sem redesenho, recolor, brilho ou 3D; 300 px de largura. Duas luzes correm pela linha, uma de cada lado, e chegam à interseção no tempo do logo; o logo nasce da linha por máscara. Fica 2,3 s legível antes de os fragmentos entrarem e segue como centro do sistema. |
| 02 · a agência segue | "A AERA estrutura a direção. A agência segue na execução, com planejamento, critérios e uma visão comum." O sistema sobe um pouco, "AERA · Direção" acende no centro, o eixo desce até a linha "Agência · Execução", a direção corre por ele e se espalha na execução, e três marcas acendem com as palavras (Planejamento, Critérios, Visão comum). 7,4 s, sem parar o filme. |
| 03 · "Gávia Build 2030" no fim | Não foi gerado de novo: é o mesmo áudio da abertura, recortado de "AERA apresenta. Gávia Build 2030." (verificado bit a bit). |
| 05 · fluxo da voz | Pausas entre falas: 0,37 · 0,43 · 0,57 · 0,57 · 0,60 s. Ficam três respiros musicais (4,4 s nos planos de marca, 3,8 s em Trade/ONE, 2,5 s no logo). Os respiros dentro das falas agora são o próprio ar da gravação, não silêncio digital. |
| 06 · música | Mesma cadência; o respiro do encontro mantém o shaker (sem queda de ambiência); ar de porto contínuo e muito baixo por baixo de tudo. O mix nunca cai abaixo de −37 dB depois do 1º segundo. |
| 07 · som | Ticks mais baixos; os cortes dos verbos não duplicam os acentos da música; um único som novo (a descida do eixo até a agência). Grave 40–90 Hz: 24 dB abaixo dos médios. |
| 11 · verbos | 2 s cada, nos acentos (Ré, Sol, Lá); a música reduz depois de LIDERAR. |
| 12 · final | Marca oficial, BUILD 2030, as duas frentes e o wordmark oficial da AERA em pequeno (antes era texto). 1,33 s depois da última sílaba, corte seco. |

**Duração:** 72 s (era 66). A frase da agência tem 7,4 s ditos em ritmo natural; o brief pedia 4–6 s para esse momento, e chegar lá exigiria acelerar a voz.
