# GAVEA / BUILD 2030
## ZIRKA RESET V1
### Keep the engine. Discard the art direction. Space first.

**Data:** 11/10/2026
**Onde roda:** `app/` · `npm run dev` · http://localhost:3030 · debug `/?debug=1` · abrir num ponto da jornada `/?at=0.6`
**Frames de revisão:** `docs/review-frames/frame-000 … 100.jpg` + `contact-sheet.jpg` (capturados a 1440×900 pelo painel do app; o painel entrega 800×500. A exportação headless do Chrome com WebGL por software ficou em branco e foi descartada.)
**Créditos gastos:** 0.

---

## O que foi rejeitado

A direção do passe 1 (11/10, manhã): tipo gigante como mundo. `BUILD 2030` com footage dentro das letras, `DIRECTION` maior que a viewport atravessada pela câmera, janelas de material, trajetória SVG 2D, palavras como elementos flutuantes. Motivo: continua perto da linguagem atual da GAVEA (imagem dentro de palavra, composição editorial de tela cheia, troca de cena tipográfica). É motion gráfico 2D, não um mundo.

Removido do app, não apagado: `app/archive/v1-typographic/` (camadas Hero, Field, Direction, Tease; primitivos `MotionType`, `MediaWindow`, `FrameSequence`; `Trajectory` + `trajectory-path`). Fora do `tsconfig` e do ESLint. Os 96 frames do hero antigo seguem em `app/public/media/hero/` sem uso.

## O que foi preservado

- O loop único de scroll (`src/motion/scroll-store.ts`, agora com `setLive` para vida autônoma), o palco fixo + spacer, a jornada em viewports (`journey.ts`), os tokens de motion e as funções `seg` / `pulse`.
- `EditorialLabel`, `BrandMark` (marca oficial, intacta), `TopBar`, `DebugPanel`.
- Os derivados reais da P-35 (`app/public/media/clips/`), agora usados só como prova física.
- Cores oficiais (navy `#081E2F`, teal `#006B90`), Mona Sans, Geist Mono.

## O motor: por que o frame-sequence não serve e o que entrou no lugar

O motor da base percorre frames pré-renderizados num canvas. A câmera é a do footage. Ele não dá: caminho de câmera próprio, profundidade com oclusão entre objetos, revelação por luz, várias camadas interagindo, objeto que aparece atrás de outro. Compor isso com planos CSS 3D daria perspectiva, mas sem luz, sombra, névoa nem oclusão real entre volumes. Limitação documentada; conforme a regra 16, entrou **Three.js** (`three@0.170`, sem React Three Fiber, uma só dependência): cena, câmera em spline, névoa exponencial, luz-chave com sombra, materiais grafite/aço, tubo de luz para a trajetória, textura de vídeo para os painéis de prova. Tudo dirigido pelo mesmo tick do loop único (`src/experience/layers/WorldLayer.tsx` → `src/world/World.ts`). O canvas da base foi arquivado, não reescrito.

## Novo princípio espacial

**Ambiente → câmera → objeto → descoberta → informação.** Um só mundo, nunca inteiro à vista. A névoa e a luz-chave abrem com o scroll (`atmosphereAt` em `src/world/camera-path.ts`). As quatro áreas aparecem uma a uma porque a câmera chega nelas. A trajetória de luz cresce ao ritmo das descobertas. Tipografia é anotação presa ao espaço (labels projetados de âncoras 3D, escurecem quando um volume os oculta: raycast em `World.anchors()`); a única headline é `Não é sobre substituir. É sobre conectar.`; `DIRECTION` entra como nome da camada, a 4,4vw (cerca de 5% da área da tela).

## Caminho de câmera (`src/world/camera-path.ts`)

| P | Momento | Câmera |
|---|---|---|
| 0.00 | Escuro. Horizonte, grade do cais, quase nada. `AERA apresenta` entra e some. | Longe e baixa, (6, 3, 150), olhando o centro. Névoa densa. |
| 0.16 | Marca oficial, pequena/média, sem teatro. | Deriva mínima. |
| 0.28 | A câmera começa; a estrutura aparece. `GAVEA / BUILD 2030` como label. | Desce e aproxima pela esquerda, (-46, 8.5, 62). |
| 0.40 | `01 / Marketing`: painéis em leque sobre um plinto, arestas teal acendem, luz própria. | Orbita curta a (-56, 6.5, 38). |
| 0.46 | Passa entre as áreas. | (-18, 5.5, 34), oclusão pelos volumes. |
| 0.53 | `02 / Comercial`: blocos de terminal. A trajetória chega. Um painel do modelo mostra por instantes a entrada do dique (footage real). | (50, 11, 44). |
| 0.63 | `03 / Tecnologia`: a câmera sobe e passa por dentro do pórtico. Um painel mostra a equipe com cabos. | (-30, 15, -2). |
| 0.73 | `04 / Inteligência`: nós sobre hastes, anel, ligações. | (26, 11, -10). |
| 0.86 | Recua e sobe: o sistema inteiro, o casco, o horizonte. As áreas giram para um vetor só e passam a respirar no mesmo ritmo. `DIRECTION`. | (2, 46, 90). |
| 1.00 | A trajetória bifurca: `MARKETING DIRECTION` sobe, `AI & INTELLIGENCE` segue pelo mar. Fim. | (-6, 42, 100). |

Respiração contínua da câmera (seno de baixa amplitude) para nunca estar morta. Pré-roll: sem scroll, o tempo leva a entrada até o fim da marca (j ≈ 1.75 de 8); `max(j, jAuto)` garante que o scroll assume sem salto.

## Mundo central: O SISTEMA GAVEA (greybox, `src/world/World.ts`)

Modelo de arquitetura, não digital twin. Nada aqui afirma ser uma instalação real.

- **Cais / deck** 380×280 em grafite, grade fina, aresta de luz na borda do mar.
- **Mar** e **horizonte** (uma linha de luz fora da névoa).
- **Casco abstrato** com casaria, mastro e lança: silhueta, a -106 em z.
- **Marketing** (-40, 0, 20): cinco painéis em leque sobre um plinto (comunicação, marca, campanhas).
- **Comercial** (30, 0, 8): nove blocos de terminal de alturas diferentes (volume, relações, mercado).
- **Tecnologia** (-12, 0, -30): pórtico de quatro pernas, vigas, diagonais e uma carga suspensa (estrutura, método).
- **Inteligência** (44, 0, -38): treze nós sobre hastes, anel no chão, ligações finas (conhecimento, dados).
- **Trajetória**: tubo de luz (Catmull-Rom) de -82 a 74 em x passando pelas quatro áreas; ponto-guia branco com luz teal; depois de completa, um pulso lento percorre o caminho.
- **Bifurcação**: dois tubos a partir do fim da trajetória.
- **Painéis de prova**: duas superfícies do modelo com textura de vídeo (`porto`, `operacao`), opacidade em pulso quando a câmera passa. Nunca fotomontagem, nunca dentro de palavra.

Metáfora de DIRECTION: antes, cada área tem a sua orientação (`rotY` próprio), o seu balanço (seno com fase própria) e a sua luz. Entre P 0.79 e 0.90 as quatro giram para `SHARED_ROT_Y`, passam a balançar com a mesma fase, as luzes próprias baixam e a luz de preenchimento teal sobe: um vetor, um ritmo, uma lógica. Sente-se antes de ler.

## Hierarquia de informação

1. Objeto / ambiente (geometria, luz, névoa).
2. Câmera / luz (o scroll é a câmera).
3. Labels: `01 / Marketing` … `04 / Inteligência`, `GAVEA / BUILD 2030`, `O sistema · modelo conceitual`, `AERA / DIRECTION`, `04 / Marketing`, `05 / Inteligência`. Sem números falsos, sem telemetria, sem coordenadas.
4. Headlines (raras): `Não é sobre substituir. É sobre conectar.` (2,3vw), `DIRECTION` (4,4vw), `Planejar. Priorizar. Conectar. Acompanhar.` (1,25vw), nomes das duas frentes (1,6vw).

Nenhuma palavra passa de ~5% da área da tela.

## Assets temporários (zero crédito)

| Elemento | Hoje | Natureza |
|---|---|---|
| Toda a geometria | caixas, extrusões, cilindros, toro, tubos (three.js) | greybox |
| Materiais | `MeshStandardMaterial` grafite / aço, arestas teal | greybox |
| Luz | ambiente + hemisfério + chave com sombra PCF + preenchimento teal + luzes pontuais por área | definitivo em princípio, afinável |
| Painéis de prova | `clips/porto.mp4`, `clips/operacao.mp4` (848 px ampliados) | real, baixa resolução |
| Marca | `brand/gavea-group-hor-branco.png` | oficial, definitivo |

## O que será atualizado quando o Magnific voltar (ou com material real)

1. **Originais do drone da P-35 em 4K** para os painéis de prova (troca de arquivo no manifesto).
2. **Texturas de material** (aço, concreto do cais, água) para os volumes do greybox: um passe de materiais, sem mexer na câmera.
3. **Casco e pórtico** como modelos um pouco mais ricos (ainda abstratos), ou altura/relevo do cais, se a direção quiser mais presença maritima.
4. **Um movimento gerado** só se houver um ponto onde o footage real não dá: a entrada no mundo (P 0.0–0.2) como passagem de material real para o modelo.
5. Sombras suaves de contato e um leve bloom no teal, só depois de validar a composição.

Nada disso muda a câmera, a jornada, os momentos ou as anotações.

---

## Gate (seção 27)

| Critério | Nota | Por quê |
|---|---|---|
| ZIRKA SPATIAL PRINCIPLE | 8.5 | Ambiente escuro, objeto central, câmera em caminho, labels no espaço, um objeto que vira sistema: sim. Falta a revelação por luz como evento (hoje é rampa de névoa e chave) e detalhe de objeto. |
| DEPTH | 9.0 | Profundidade real: oclusão, sombra, névoa, passagem por dentro do pórtico, labels que escurecem atrás de volumes. |
| CAMERA | 8.5 | Aproxima, orbita um pouco, passa entre e por dentro, recua para o sistema. Sem mudança de foco; a passagem "por trás" das áreas ainda é tímida. |
| IMMERSION | 8.0 | É greybox: sem textura, sem grão de material. Os dois painéis de prova seguram o lado físico. |
| DISCOVERY | 8.5 | Quatro revelações, a conexão que cresce, o vetor único, a bifurcação. Falta um objeto surpresa (algo que só se vê no recuo). |
| GAVEA OWNERSHIP | 7.5 | Navy, teal, marca oficial, cais, casco, footage real. Mas um greybox é genérico por natureza até ganhar material. |
| NEWNESS VS CURRENT GAVEA | 9.5 | Nenhuma tela poderia pertencer à linguagem rejeitada (ver `docs/review-frames/contact-sheet.jpg`). |
| STRATEGIC CLARITY | 8.5 | Quatro frentes → conexão → direção → duas frentes comerciais. A metáfora do vetor único é sutil demais no recuo; vale um evento mais legível. |
| TYPE DOMINANCE | 2.0 | Maior palavra ≈ 5% da tela. |
| CURRENT-GAVEA-LANGUAGE RISK | 1.0 | Zero imagem-em-tipo, zero tela de palavra. |

**Resultado: não passa** (alvo 9.5 em princípio espacial, câmera, imersão e descoberta; 9 em ownership). Pela regra: não continuar para o resto antes de subir estes quatro. O que sobe cada um:

- **Princípio espacial / descoberta:** luz como evento (um feixe que varre e revela a área antes do label; a trajetória acendendo a área por onde passa), e um objeto que só aparece no recuo (o casco entrando no quadro).
- **Câmera:** dois beats de oclusão deliberados (passar atrás dos painéis de Marketing; atravessar entre dois blocos de Comercial) e uma mudança de foco (profundidade de campo leve) no recuo.
- **Imersão:** materiais (passe de texturas) e grão de material nos volumes; água com movimento.
- **Ownership:** o casco e o pórtico mais GAVEA (proporções reais do cais, a defensa e o stacker como objetos do modelo), e os painéis de prova em 4K.

## Comparação com a direção rejeitada

Pergunta da regra 19: "esta tela poderia pertencer à mesma linguagem?" Para os oito frames, não. A rejeitada era tipo gigante com imagem dentro, composição 2D editorial. Esta é um modelo escuro visto por uma câmera, com três labels e uma linha de luz.

## Avisos

- O projeto continua sem `.git` próprio. Nada commitado. Iniciar histórico só com ordem do Tiago.
- `three` entrou como dependência (29 MB em `node_modules`). Disco: ~3,9 GB livres.
- 1920×1080 não verificado visualmente (o painel não emula). Mobile não revisado.
- O build de produção passa.
