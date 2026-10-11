# GAVEA / BUILD 2030
## FIRST IMPLEMENTATION REPORT V1
### Hero → Conectar → Direction → tease. Zero crédito pago.

**Data:** 11/10/2026
**Onde roda:** `app/` · `npm run dev` · http://localhost:3030 · debug em `/?debug=1`
**Viewport de revisão:** 1440×900 (verificado no browser). 1920×1080 só por unidades relativas (vw/vh); o painel do app não emula 1920 com fidelidade.
**Build de produção:** passa (`next build`, página estática).
**Créditos gastos:** 0.

---

## O que foi construído

Um palco fixo e uma jornada de 10,4 viewports:

| Bloco | j | O que acontece |
|---|---|---|
| 01 Entrada | 0–3.2 | Navy, zenital real da P-35 respirando. `AERA apresenta` entra sozinho; em ~4 s o logo oficial aparece sem scroll (pré-roll); o scroll continua dali. Logo vai ao canto; a trajetória deixa o logo e vira horizonte; quatro janelas de material (Mar, Aço, Porto, Operação) entram e saem; `BUILD` chega de perto demais e assenta com o cais dentro das letras; `2030` chega com o mar dentro; o tipo recua e vira título; `direção · marketing · negócio · inteligência` viajam na trajetória e assentam na frase; a frase fica legível; a câmera entra no material e tudo vira navy. |
| 02 Conectar | 3.2–5.8 | Oito frentes (Marketing, Comercial, Agência, Time interno, Parceiros, Tecnologia, IA, Projetos) habitam o espaço em três profundidades e derivam. `Não é sobre substituir.` A trajetória vira arco; as frentes encontram o arco, um tique liga cada uma à linha. `É sobre conectar.` |
| 03 Direction | 5.8–8.8 | O arco fecha em órbita; as frentes orbitam (com o scroll e, devagar, com o tempo). `DIRECTION` é maior que a viewport: a câmera atravessa as letras com a entrada do dique dentro delas, recua, e a palavra vira título. `Planejar. Priorizar. Conectar. Acompanhar.` `AERA / DIRECTION` nasce na origem da órbita. As frentes fluem para a origem. |
| 04 Tease | 8.8–10.4 | A órbita desenrola num arco; o arco bifurca: `MARKETING DIRECTION` sobe, `AI & INTELLIGENCE` desce. `Protótipo 01`. Fim. |

Decisão de arquitetura (documentada na auditoria): a base usava uma seção sticky por bloco. Para "uma jornada contínua" isso cria 100vh de slide entre blocos (A congela e sobe, B entra de baixo). O motor de canvas/cover-fit/rAF por ref da base foi mantido; a seção sticky virou um palco fixo com jornada global. Sem WebGL, sem GSAP, sem Remotion.

---

## Gate (seção 50 do prompt)

| Critério | Nota | Por quê não é mais alto |
|---|---|---|
| MOTION LANGUAGE | 8.5 | A transformação contínua existe (linha → horizonte → baseline → caminho → arco → órbita → bifurcação; palavras viajam; tipo vira ambiente). Mas as janelas entram por scaleY + opacidade e `2030` por escala simples: ainda "entrada", não "transformação". |
| CONTINUITY | 9.0 | Palco único, nada desliza, a linha e as oito frentes persistem fisicamente entre blocos. Falta um elemento do hero chegar vivo em Conectar (as palavras da frase somem no mergulho). |
| PREMIUM | 8.0 | Tipo, labels e navy certos. A fonte de 848 px amolece os momentos full-bleed e as quatro janelas ainda lembram grade. |
| GAVEA OWNERSHIP | 8.5 | P-35 real, GAVEA LOGÍSTICA real, marca oficial, navy e teal da marca. A trajetória é derivada da ideia de órbita, mas ainda não é inconfundivelmente GAVEA. |
| STRATEGIC CLARITY | 9.5 | Hero → conectar → direção lê na ordem certa, com poucas palavras. |
| CEO READABILITY | 9.5 | Frases curtas, grandes. Risco: a travessia de `DIRECTION` dura ~160vh só de tipo. |
| DIRECTION REVEAL | 8.5 | Tipo como espaço funciona; a órbita lê como orquestração. `AERA / DIRECTION` é pequeno e pode passar batido. |
| USE OF REAL MATERIAL | 8.0 | 100% real, zero IA. Resolução limita. |
| ZIRKA PRINCIPLE TRANSLATION | 8.5 | Pin, câmera, labels, "produto depois sistema": sim. Densidade de informação menor que a referência (escolha). |
| HUMAN ATTITUDE | 7.5 | Só uma imagem com pessoas (Operação). Faltam flashes rápidos de imagem e gente real nas frentes. |
| INSTITUTIONAL RISK | 1.5 | A frase completa no hold e a linha de verbos leem "institucional" por um segundo. Sem pôr do sol, sem operário olhando o horizonte, sem piano. |
| SAAS RISK | 0.5 | Sem card, botão, glass, ícone, métrica. |
| AI-AESTHETIC RISK | 0.5 | Nenhum pixel gerado. |

**Resultado do gate: não passa** (alvo 9.5 em motion, continuidade, premium, ownership e direction reveal). Conforme a regra: **não construir o resto; melhorar a base**. O que melhora está listado abaixo. A linguagem funciona; o que falta é craft de evento e material.

---

## O que funciona

- O pré-roll: `AERA apresenta` → logo sem scroll, com o material respirando atrás. A primeira interação já encontra um mundo em movimento.
- `BUILD 2030` com o cais e o mar dentro das letras, recuando para virar título. É o momento "que porra é essa" do protótipo.
- As quatro palavras viajando na trajetória e assentando na frase: a frase é construída, não exibida.
- Conectar: as frentes em profundidade encontrando o arco. A ideia lê antes da frase.
- `DIRECTION` maior que a viewport com footage dentro, e a órbita das frentes ao redor.
- A bifurcação final: duas linhas, dois nomes, nada mais.
- Marca oficial intacta do centro ao canto, assumida pela barra sem salto.

## O que ainda parece genérico

- Entrada das janelas (scaleY + opacidade). Deveriam nascer da linha (crop que abre a partir do horizonte) e sair virando outra coisa.
- A composição das quatro janelas em quatro quadrantes.
- `2030` entrando por escala simples. Pedia uma transformação (os números como baseline da linha, ou revelados por máscara).
- O final: a página termina em navy vazio com um label.

## O que ainda parece corporativo

- O hold da frase completa (0.78–0.93 do hero): 3 linhas de texto num fundo escuro. Vale encurtar o hold e deixar material visível ao lado.
- `Planejar. Priorizar. Conectar. Acompanhar.` como uma linha de tagline. Pedia virar quatro eventos (uma palavra por ponto da órbita).
- A barra superior com três labels: pode perder `BUILD 2030` (já está no título).

## Onde a experiência perde energia

1. Hero 0.86–1.0 (≈45vh): mergulho para navy sem evento. Um flash de material (aço macro, 2 frames) no meio resolveria.
2. Direction 0.03–0.56 (≈160vh): travessia de tipo com um só evento. Faltam 2–3 cortes de material dentro das letras (troca de clipe por letra) e um label por "estação".
3. Tease 0.75–1.0: só os nomes. Precisa de um hold final (marca oficial + `BUILD 2030`) mesmo no protótipo.
4. Conectar 0.22–0.46: hold da headline com as frentes só derivando. Um flash de gente real atrás resolveria o lado humano também.

## Os 3–5 assets que mais mudam o resultado amanhã

| # | Asset | Onde entra | Por que vale desproporcionalmente |
|---|---|---|---|
| 1 | **Originais do drone da P-35 em 4K** (o mesmo material de `VIDEO-2026-06-11`, sem marca d'água) | Sequência do hero (96 frames) e as 7 janelas, 1:1 | Toda a parte "premium" que falta é resolução. Troca sem mexer em motion: só o manifesto. |
| 2 | **Macro de aço, cabo e água no cais** (celular em 4K, 6–10 s, luz natural) | Abertura (material respirando), dentro de `BUILD`, flash no mergulho | O hero abre em material, não em cena; hoje o zenital faz esse papel de longe. |
| 3 | **Equipe real trabalhando**, 3–4 clipes de 4–8 s (planejamento, chamada, pátio, terminal) | Janela Operação, flashes em Conectar, fundo de `É sobre conectar.` | Único jeito de subir "humano" de 7.5 para 9+; sem IA. |
| 4 | **Equipamento GAVEA em operação** (stacker, içamento, portão do terminal) em 4K | Janelas Porto e Equipamento, dentro de `DIRECTION` | Marca real em metal real: o que torna a experiência inconfundivelmente GAVEA. |
| 5 | (só se 2 não existir) **Um único movimento gerado**: câmera lenta entrando em aço e saindo na água, 4 s, sem texto | Hand-off do hero | É o único ponto onde geração paga cria valor que footage real não dá: a transição física entre mundos. |

Não pedir mais nada por enquanto.

---

## Pendências e avisos

- `docs/GAVEA_BUILD2030_VISUAL_SYSTEM_V1.md` e `docs/GAVEA_BUILD2030_ASSET_MAP_V1.md` **não existem** no projeto. As decisões visuais vieram do brief, das cores amostradas da marca e dos materiais encontrados. Se esses dois documentos existem em outro lugar, vale reconciliar.
- O projeto **não tem `.git` próprio**. Qualquer `git` rodado aqui cai no git acidental de `/Users/tiagolima`. Nada foi commitado. Iniciar o histórico novo só com ordem do Tiago.
- Disco da máquina: ~3,6 GB livres. `app/node_modules` (≈400 MB) e `app/.next` (≈75 MB) foram criados; `new-3d-landbase/node_modules` continua no projeto como referência e pode ser apagado se faltar espaço.
- Mobile e tablet: não revisados (desktop first). O palco é fixo e usa `innerHeight`, então não quebra; só não foi afinado.
- Fonte Mona Sans entrou como display por decisão de projeto (variável, largura 75–125). Se a identidade GAVEA definir outra família, troca em `layout.tsx`.
