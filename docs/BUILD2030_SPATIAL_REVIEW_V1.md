# GAVEA / BUILD 2030
## SPATIAL REVIEW V1
### Revisão do protótipo da história em 8 estados (Creative Reset V2)

**Data:** 11/10/2026 (noite)
**Onde roda:** `app/` · `npm run dev` · http://localhost:3030 · `?debug=1` · `?at=0.6` · `?support=b`
**Frames:** `docs/review-frames-v2/frame-000 … 100.png` (1440×900, Chrome headless via puppeteer-core, WebGL por software)
**Gravação:** `docs/review-frames-v2/scroll.mp4` (scroll completo de 36 s mais entrada e saída, 45 s, 1440×900). Reproduzir com `node app/scripts/capture.mjs` com o dev server no ar.
**Story e câmera:** `BUILD2030_SPATIAL_STORY_V1.md`, `BUILD2030_CAMERA_PATH_V1.md`.
**Créditos gastos:** 0.

---

## As seis perguntas

### Tem um objeto central?
**Sim.** O SISTEMA GAVEA: um núcleo (plataforma circular + bloco) e onze partes ao redor, quatro delas janelas com operação real. Tudo o que acontece, acontece a ele: as partes giram para ele, as conexões nascem nele, a trajetória o atravessa, a câmera o olha do início ao fim. Ressalva: o núcleo ainda é um bloco. Tem presença, não tem identidade.

### Parece um só mundo?
**Sim.** Um cais, uma névoa, uma luz. Nada "começa": as partes já existem na névoa antes de serem descobertas; a lâmina atravessa tudo; os ramos saem do núcleo; o recuo final mostra o mesmo lugar visto de cima. Os oito frames são oito momentos do mesmo lugar.

### A câmera conta a história?
**Em grande parte.** Longe → aproxima → rente a uma janela → por trás do pórtico → atrás do sistema → vira para a lâmina → órbita constante → aproxima do núcleo → olha um ramo, vira para o outro → recua. Falta um beat: um movimento de câmera que seja ele mesmo o "ganhar direção" (hoje a câmera muda de ritmo, mas não muda de natureza).

### Sentimos Direction antes de ler?
**Sim, mas com força média.** A lâmina atravessando, as partes girando para o núcleo, as linhas convergindo, as luzes mudando de frio para teal, tudo acontece 0.10 de jornada antes do label. O que enfraquece: o giro das partes é sutil de longe; a sincronização de ritmo é lenta demais para ser percebida numa passada.

### Está claro o que a AERA propõe?
**Quase.** `AERA / DIRECTION` aparece preso à trajetória que passa por Tecnologia, Comercial, Agência, Time interno e Parceiros antes do núcleo; a headline `Não é sobre substituir. É sobre conectar.` chega em seguida; as duas frentes têm nome e peças. O que falta para 10: a relação "AERA = a camada" ainda depende de ler o label; a trajetória precisa de uma presença visual própria (espessura, luz) que a distinga das conexões.

### Parece diferente da comunicação atual da GAVEA?
**Sim.** Nenhum frame tem tipo gigante, imagem em palavra ou composição editorial. É um modelo escuro visto por uma câmera, com labels. Ver `docs/review-frames-v2`.

---

## Gate (seção 35)

| Critério | Nota | Alvo | Por quê |
|---|---|---|---|
| CENTRAL IDEA | 9.0 | 10 | Há um objeto e tudo gira em torno dele. O núcleo em si é genérico. |
| STORY | 9.0 | 10 | Os oito estados existem na ordem certa. O Estado 03 ("correntes diferentes") lê pouco: o movimento independente é discreto demais. |
| SPATIAL CONTINUITY | 9.5 | ≥ 9.5 | Um mundo, um caminho. |
| CAMERA | 8.5 | ≥ 9 | O caminho funciona e tem dois beats de oclusão. Falta o beat em que a própria câmera ganha direção. |
| DISCOVERY | 9.0 | ≥ 9.5 | Partes uma a uma, lâmina, ramos, recuo. Falta um objeto que só exista no recuo. |
| GAVEA OWNERSHIP | 8.0 | ≥ 9 | Marca oficial, teal, cais, casco, quatro janelas com operação real. O resto é greybox. |
| NEW VISUAL TERRITORY | 9.5 | ≥ 9.5 | Nada aqui pertence à linguagem anterior. |
| DIRECTION CLARITY | 9.0 | 10 | Sente-se antes de ler. A rotação das partes e a sincronia precisam ser mais legíveis de longe. |
| AERA ROLE CLARITY | 8.5 | 10 | A camada passa pelas cinco partes e tem nome. Depende do label. |
| GIANT-TYPE DEPENDENCE | 1.0 | ≤ 1 | Só o final, por regra. |
| CURRENT-GAVEA-LANGUAGE RISK | 1.0 | ≤ 1 | Zero. |

**Resultado: não passa** (ideia central, história, direção e papel da AERA abaixo de 10; câmera, descoberta e ownership abaixo do alvo). Pela regra: **parar, não adicionar design.** O que sobe cada nota sem adicionar seções:

1. **Núcleo com identidade:** em vez de um bloco, o núcleo formado por material GAVEA (uma janela central com o cais real, ou a plataforma como a forma do símbolo da marca sem redesenhar o logo). Sobe ideia central e ownership.
2. **Estado 03 mais legível:** amplitude do movimento próprio ×2, luzes de cores ligeiramente diferentes por parte, e uma parte que gira na contramão. Sobe história e direção.
3. **Alinhamento visível:** quando a lâmina passa, cada parte dá um giro curto e claro (0.4 s) e acende; depois assenta. Hoje o giro é longo e suave demais. Sobe direção.
4. **Câmera que ganha direção:** entre 0.56 e 0.74 a câmera trava numa órbita perfeita, com o núcleo exatamente no centro do quadro. Hoje orbita, mas não "trava". Sobe câmera.
5. **Trajetória da AERA com presença própria:** mais espessa, mais clara, com um segundo pulso, e uma pequena aresta de luz onde ela toca cada parte. Sobe papel da AERA.
6. **Objeto do recuo:** o casco só entra no quadro no Estado 08. Sobe descoberta.

Nada disso muda a história, a jornada ou os momentos. É afinação do mesmo mundo.

## Linha de apoio do final

A (`DIRECTION / MARKETING / INTELLIGENCE`) explica o plano; B (`BUILD / SCALE / LEAD`) promete. Para a apresentação ao CEO, A: diz o que acabou de ser visto. B fica para o fechamento quando ele existir. Capturar B: `node app/scripts/capture.mjs http://localhost:3030 ../docs/review-frames-v2-b b`.

## Avisos

- Commits só com ordem do Tiago: o trabalho desta noite está no disco, não no repo `aera-company/build-2030`.
- `puppeteer-core` entrou como dependência de desenvolvimento (usa o Chrome instalado; sem download).
- Mobile e 1920×1080 não revisados. O build de produção passa.
