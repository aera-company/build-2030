# GAVEA GROUP / BUILD 2030
## HERO DIRECTION V2
### Um mundo GAVEA vivo, atravessado pela câmera

**Data:** 11/10/2026 (noite)
**Responde a:** HERO EXPERIENCE REDIRECTION V2
**Escopo:** só o hero. Nenhuma seção seguinte.
**Referência máxima:** https://www.emons.de/en
**Assets:** A `public/selected-assets/Porto inteligente_ logística conectada em ação.png` · B `public/selected-assets/ref 3d clip.png` · C `public/selected-assets/Terminal Portuário Futurista ao Entardecer.png`
**Créditos gastos:** 0. Nada gerado. Tudo construído em código sobre a base atual.

---

## 1. O conceito

O hero é **um terminal GAVEA ao entardecer, visto de sobre a água, atravessado por uma câmera que viaja ao longo do cais.**

O visitante não assiste a um vídeo nem lê um deck. Ele entra num lugar que já está em operação: guindastes STS descarregando um navio, RTGs correndo sobre as pilhas de contêineres, caminhões circulando, um rebocador cruzando a bacia, um graneleiro atracado no segundo berço, galpões acesos, a ponte ao fundo com faróis passando. Conforme ele rola, a câmera desce e percorre o terminal da esquerda para a direita. Cada trecho do scroll revela uma zona nova, aproxima uma operação, acende uma rota.

A segunda metade da travessia muda a natureza do mundo sem mudar o mundo: uma camada de sinais teal nasce no chão, liga as zonas, pulsa pelas rotas. O terminal passa de "muitas coisas acontecendo" para "um sistema". No fim a câmera sobe e recua para a vista inteira, e só então entra o lockup: marca oficial GAVEA GROUP, `BUILD 2030`, `Construir. Escalar. Liderar.`

Uma frase: **o visitante atravessa o mundo GAVEA e, ao sair, entende que BUILD 2030 é a camada que o organiza.**

## 2. Como a Emons vira este hero

O que a Emons faz (verificado hoje no site, 1440×900): um hero fixo de uma viewport com uma animação 3D isométrica de 46 s em loop, um mundo logístico em miniatura (docas, caminhões, galpão, árvores, pessoas) atravessado por uma câmera lenta, e o copy num card leve por cima. O resto da página é convencional. Toda a sensação de "estar dentro de um ecossistema vivo" vem desse único mundo em movimento contínuo.

O que absorvemos e o que mudamos:

| Princípio Emons | Tradução no hero GAVEA |
|---|---|
| Um mundo só, em miniatura, já vivo antes de qualquer texto | Um terminal só, construído em three.js, com operações rodando desde o primeiro frame |
| A câmera viaja, o visitante é levado | A câmera percorre o cais na horizontal; o scroll vertical controla a posição da câmera, não a troca de telas |
| Lógica horizontal: o mundo é largo, não alto | O terminal tem 1 100 m de cais (x) e 380 m de profundidade (z); a travessia é em x |
| Descoberta por movimento | Zonas, operações e labels só aparecem quando a câmera chega perto; nada entra "por tempo" |
| Continuidade absoluta | Um caminho Catmull-Rom, sem cortes, sem seções fixas; cada intervalo de scroll move a câmera e dispara algo no mundo |
| Copy mínimo sobre o mundo | Quatro momentos de texto em toda a travessia, nenhum deles acima de ~12% da tela, exceto o lockup final |
| Vídeo pré-renderizado em loop | Mundo em tempo real: o scroll pode parar, voltar, acelerar, e o mundo continua respirando |

O que não copiamos: a estética isométrica branca e vermelha, o card de copy do canto, a miniatura "de brinquedo". O terminal GAVEA é visto de uma câmera cinematográfica baixa e larga, em luz de fim de tarde, não de uma isometria.

## 3. Como nasce a sensação de "estar dentro do estaleiro"

1. **Câmera sobre a água, não sobre o mapa.** A câmera nunca olha de cima como um diagrama. Ela fica onde um rebocador estaria: baixa (18 a 45 m) na maior parte da travessia, olhando o cais de lado. Os guindastes passam por cima da linha do horizonte; os cascos ocupam o quadro.
2. **Escala por oclusão.** Em dois momentos a câmera passa por trás de um STS e por dentro de uma rua do pátio: o mundo está entre a câmera e o resto do mundo.
3. **Operação permanente.** Trolleys dos STS correndo na lança e descendo o spreader, RTGs transladando sobre os blocos, catorze caminhões em três vias, um rebocador com esteira, o navio balançando, luzes de obstrução piscando. Nada congela quando o scroll para.
4. **Luz que pertence ao lugar.** Entardecer: sol baixo e quente vindo da direita, céu que vai do navy ao âmbar, lâmpadas de pátio quentes, janelas dos galpões acesas, reflexos na água. Nenhum neon. O teal só existe como sinal da camada de sistema.
5. **Som visual de profundidade.** Névoa leve, ponte e cidade ao fundo, montanhas em silhueta: o terminal tem um atrás.
6. **Informação presa ao mundo.** Os labels de capacidade são âncoras 3D projetadas (com oclusão), não um HUD.

## 4. Como os três assets são usados

**Asset A (terminal 3D limpo, zenital).** É o benchmark de qualidade e o plano do terminal. Dele vêm: a ordem das zonas da esquerda para a direita (berço STS com navio porta-contêiner → pátio com RTGs e vias → galpões e portaria → segundo berço com graneleiro e guindastes móveis → galpões grandes e área técnica), as rotas teal no chão que ligam as zonas, o rebocador na bacia e a ilha/ponte ao fundo. Também o acabamento: superfícies limpas, poucas cores, contêineres em paleta contida.

**Asset B (explicativo, Rio Brasil Terminal).** Só lógica de organização: cais de 340 m com o navio paralelo ao cais, STS sobre trilhos ao longo do cais, blocos de contêineres perpendiculares ao cais com RTG por bloco, pátio de carga geral (bobinas, tubos) entre o pátio e o berço do graneleiro, retroárea com galpões e ferrovia. Nada do estilo entra: nem as cores saturadas, nem os labels em caixa, nem a tipografia.

**Asset C (GAVEA GROUP / BUILD 2030 ao entardecer).** É o alvo de atmosfera e o alvo do frame final. Dele vêm: a hora do dia e a direção do sol, a relação marca/mundo (lockup pequeno no canto superior esquerdo, 5% do quadro, 95% mundo), as luzes quentes dos galpões e postes com reflexo na água, o rebocador em primeiro plano, a ponte e a cidade ao fundo. A câmera do Beat 07 recua exatamente para esse enquadramento. O logo que aparece dentro do Asset C é uma reinterpretação e não é usado: entra a marca oficial, intacta, do arquivo `public/brand/`.

Os três ficam em `public/selected-assets/` como referência; nenhum pixel deles entra no hero. O mundo é todo geométrico e iluminado em tempo real, o que mantém a liberdade de câmera e o zero de geração.

## 5. Equilíbrio de marca

80% mundo e operação · 15% sistema visual (paleta navy/teal/âmbar, névoa, labels editoriais, rotas) · 5% marca explícita (marca oficial na abertura, na barra e no lockup final).

Sem logo nos contêineres, sem logo nos guindastes, sem nome em cada objeto. A GAVEA está na cor da luz, no teal do sinal, na organização do lugar e no lockup.

## 6. Técnica

Base mantida: Next 16 + three.js (já no projeto), palco fixo + spacer, loop único de scroll, câmera em spline, anotações HTML presas a âncoras 3D com oclusão por raycast, script de captura. O que muda é o conteúdo do mundo, o caminho da câmera e os momentos.

Novo no motor para este hero: contêineres instanciados (≈ 3 000 num draw call), veículos em caminhos cíclicos (18 caminhões, 3 empilhadeiras, 44 carros no viaduto, 2 rebocadores), cinemática dos guindastes (4 STS com ciclo de descarga, 8 RTGs com translação e trolley, 2 móveis girando), céu em shader de entardecer com domo que segue a câmera, água com ondulação e reflexo das luzes, sombras do sol que seguem o alvo da câmera, bloom leve só nas luzes (UnrealBloomPass), rotas do sistema como tubos com desenho progressivo, fov variável (52° nos planos gerais, 42° na travessia). 2.5D não foi necessário: o mundo roda a 55–60 fps a 1440×900 (DPR 1.5) no Mac do Tiago, e o build de produção passa.

Jornada: 9 viewports de scroll (≈ 30 s num scroll calmo). Pré-roll pelo tempo cobre a abertura sem scroll.

## 7. Critérios de sucesso (seção 14 do brief) e como são medidos

- Inspirado na Emons na lógica da experiência: um mundo, câmera viajando, descoberta por movimento. Verificável nos 8 frames: nenhum deles é uma tela.
- Dentro do estaleiro: câmera baixa, oclusão, operação contínua.
- Não parece deck tipográfico: nenhum texto acima de ~12% da tela antes do lockup.
- Não parece vídeo institucional: o scroll controla, o mundo responde, pode parar e voltar.
- Uso dos 3 assets: zoneamento (A, B), atmosfera e frame final (C), documentado acima.
- Premium e espacial: luz de entardecer, profundidade, bloom contido, paleta de 6 famílias.

Frames de revisão em `review-frames-hero-v2/` (8 PNG a 1440×900 nos P 0, 0.14, 0.30, 0.44, 0.56, 0.70, 0.86, 1.00 e `scroll.mp4` com a travessia inteira), capturados por `app/scripts/capture.mjs`.
- BUILD 2030 como próxima fase: só nomeado depois que a camada teal organizou o mundo.
