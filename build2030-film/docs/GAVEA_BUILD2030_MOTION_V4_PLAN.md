# GAVEA · BUILD 2030 · MOTION V4 · PLANO
**Data:** 14/10/2026 · **Fonte da verdade:** Proposal Master V3 + filme V3.1 · **Alvo:** 68–76 s (30 fps)

Nada de conceito novo, imagem nova, UI nova, serviço novo ou texto novo. A V4 retira explicação e devolve tempo à imagem.

---

## 0. Voz (passo 2 do workflow)

Auditoria de `~/Desktop/AERA_BRAND_FILM_01` (`scripts/gen-vo.mjs`, `src/data/voTiming.json`, `docs/V1_RELATORIO.md` §7):

| Item | Teaser AERA | V4 |
|---|---|---|
| Voz | "AERA Narradora F1", `SjR6urfwxmM7UisfZHpj` (Voice Design, escolhida pelo Tiago entre 6) | igual |
| Modelo | `eleven_v3`, `language_code: pt` | igual |
| Settings | stability 0.55 · similarity 0.8 · style 0.15 · speaker boost · speed 0.95 | igual |
| Direção | cues `[calm]` / `[confident]` | `[calm]` em tudo, `[confident]` em "Transformando…" e nos verbos |
| Tomadas | uma linha por arquivo; blocos regravados em tomada única por causa de deriva para pt-PT | **uma tomada por bloco**, cortada por frase no envelope real |
| Pré-rolo | 0,22 s (o P de "Precisa" era comido) | 0,12 s antes do ataque medido |
| Processamento | nenhum na voz; trilha 0.40 → 0.22 sob a fala; master −14 LUFS / −1 dBTP | nenhum na voz; ganho estático por tomada (−18 LUFS); bed −5 dB sob a fala |

Tomadas usadas: t1_b, t2, t3, t4, t5, t6, t7_d. Quatro tomadas originais saíram com a última palavra cortada pelo v3 ("crescimento", "Liderar"); foram refeitas e a tag `[pause]` no fim resolveu. Scripts: `scripts/gen-vo-v4.mjs` → `scripts/fit-vo-v4.py` → `src/data/voV4.json`.

**Para o Tiago ouvir antes de aprovar:** pronúncia de "Build 2030" e o sotaque (pt-BR) em todas as frases. A chave não tem permissão de speech-to-text, então a checagem automática foi só de energia, cortes e duração.

---

## 1. Retiming (passo 1)

| Tempo | Ato | Voz | O que muda em relação à V3.1 |
|---|---|---|---|
| 00:00–12:4 | **Abertura** | "A GAVEA cresceu." (2,4 s) · "E novas possibilidades vieram com esse crescimento." (4,6 s) | Costa respira 3 s antes de qualquer palavra. Sem "Um novo ciclo…", sem "02 · A necessidade", sem "A próxima fase pede mais". Marca, BUILD 2030 escrito, horizonte e régua com o dobro de tempo. |
| 12:4–22:0 | **Marca · presença · oportunidades** | três frases, cada palavra-chave cai no corte | 3 planos em vez de 5, 3,3 s cada (eram 1,7). Sem "Mais", sem contador 01/05. |
| 22:0–32:4 | **Conhecimento · processos · inteligência** | três frases | O real vira informação: o quadro congela, um recorte é extraído e vira nó na régua. Tipografia pequena, presa à linha (o oposto do ato anterior). O plano da inteligência fecha sobre a régua; os três nós sobem e convergem num ponto. 0,5 s de silêncio. |
| 32:4–48:5 | **AERA · direção · sistema** | "É nesse encontro…" · "Transformando estratégia em sistema." · "E sistema em movimento." | O ponto inverte o campo. MARCA, NEGÓCIO e TECNOLOGIA nascem como três campos; a linha teal atravessa os três e AERA aparece na interseção. A cruz vira eixo e camada AERA. Fragmentos soltos se organizam no sistema em "sistema"; o fluxo direção → execução → validação roda em "movimento". Sem DIRECTION gigante, sem as duas frases explicativas. |
| 48:5–60:5 | **Novas tecnologias e IA** | sem voz | Volta ao navy. A régua mostra a função (conhecimento · processos · sistemas · IA · decisão); o real vira informação; GAVEA Trade e GAVEA ONE entram como prova, com o mesmo tempo de tela da V3.1. Split sem frases. |
| 60:5–75:0 | **Convergência · BUILD 2030 · verbos** | "Build 2030." · "Construir." "Escalar." "Liderar." | As duas trilhas convergem na linha d'água; a linha escreve BUILD 2030 com o mesmo gesto da abertura (conclusão, não título). Cada verbo 2,2 s com imagem, som e pausa próprios. Assinatura sem "Vamos construir?". |

Tempo de voz: 41 s em 75 s. A V3.1 tinha 47 s em 60 s.

---

## 2. Mapa de som (passo 3)

Três camadas, uma gramática.

**Bed** (`scripts/make-bed-v4.py`, sintetizado): grave controlado (corte abaixo de 32 Hz), textura de ruído filtrado que abre e fecha devagar, pulso só onde há avanço (marca, sistema em movimento, tecnologia, verbos). Cores por ato: navy grave → informação granular → claro aberto → tecnologia com relógio → cor no panorama.

**Mundo** (ElevenLabs Sound Effects, quase só sentido, sempre ao fundo):

| Textura | Onde |
|---|---|
| água no cais | costa, panorama, ESCALAR |
| porto distante | horizonte, marca/presença/oportunidades, panorama |
| aço, rangido grave | oportunidades, CONSTRUIR |
| sala de máquinas, zumbido elétrico | conhecimento/processos, tecnologia |
| motor de casco | processos, decisão, LIDERAR |

**Eventos do sistema** (a mesma família de síntese do filme da AERA):

| Gesto visual | Som | Plano |
|---|---|---|
| linha desenha | `line_draw` | meio |
| nó nasce | `node_1..3` | meio |
| trava (recorte, check, encaixe) | `tick_hi` | frente, curto |
| tick de régua / label | `tick` | fundo |
| pivô | `pivot` | meio |
| inversão de campo | `invert` | frente |
| pacote correndo | `packet_1..4` | meio |
| impacto (palavra, corte de plano, verbo) | `slam_1..5` / `thud` | frente |
| janela abre | `open_cell` | meio |

Profundidade: cada som existe em três versões (frente seca; meio com passa-baixa e reflexão curta; fundo mais escuro e mais longe), escolhidas por cue.

**Silêncios** (redução real, não só menos som): antes da inversão (AERA), antes da volta ao navy (tecnologia), antes de "Build 2030", antes da assinatura.

**Ducking dinâmico:** o bed abaixa 5 dB só enquanto há fala, com rampa de 8 frames; o mundo abaixa 3 dB. Os efeitos leem a energia real da voz, palavra a palavra: ticks e travas que caem nos respiros tocam; os que caem sobre sílaba saem; impactos ficam 3 dB abaixo. Master: −14 LUFS integrado, pico abaixo de −1 dBTP.

---

## 3. Mapa de motion (passo 4)

| Momento | Causa → efeito |
|---|---|
| Costa → linha → marca → título | igual à V3.1, com tempo de leitura |
| Título → horizonte → régua | a linha varre o título, abre o mar, fecha sobre si e desce |
| Régua → MARCA / PRESENÇA / OPORTUNIDADES | cada imagem com o seu gesto (janela da régua, painel, comporta) |
| OPORTUNIDADES → CONHECIMENTO | o quadro congela; um recorte é desenhado nele; o recorte cresce e vira a janela da próxima imagem |
| conhecimento / processos → nós | congela, recorte com etiqueta, o recorte encolhe num nó e cai na régua com o nome dito |
| inteligência → ponto | a imagem fecha sobre a régua (imagem vira geometria); a régua sobe e contrai; os nós convergem |
| ponto → campo claro | inversão a partir do ponto |
| MARCA · NEGÓCIO · TECNOLOGIA → AERA | três campos nascem com as palavras; a linha cruza os três; AERA na interseção; "atuar" abre a cruz |
| cruz → sistema | a cruz desliza para o eixo; em "estratégia" peças soltas aparecem fora de ordem; em "sistema" travam na camada AERA e as camadas se estendem |
| sistema → movimento | pacotes saem do eixo; peças descem (execução), viram imagem, a AERA conecta, sobem com check (validação) |
| último check → navy | inversão a partir do check |
| régua → GAVEA Trade → barra → GAVEA ONE → split | igual à V3.1 |
| split → trilhas → linha d'água | a costura deita, se divide em duas frentes, as duas sobem e se fundem |
| linha d'água → BUILD 2030 → verbos → assinatura | a linha desce e escreve BUILD 2030 (o gesto da abertura); os verbos sobem da régua; o mundo colapsa num ponto que redesenha a assinatura |

---

## 4. Renders (passos 5–8)

1. `out/GAVEA_BUILD2030_MOTION_V4_00-35.mp4`
2. `out/GAVEA_BUILD2030_MOTION_V4_35-END.mp4`
3. revisão da emenda
4. `out/GAVEA_BUILD2030_MOTION_V4_1080p.mp4`
