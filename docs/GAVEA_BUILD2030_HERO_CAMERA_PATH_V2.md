# GAVEA GROUP / BUILD 2030
## HERO CAMERA PATH V2
### Uma travessia horizontal, duas aproximações, um recuo

**Implementação:** `app/src/world/camera-path.ts`. Posição e alvo em Catmull-Rom; easing cinemático entre keyframes, linear nos trechos de travessia (ritmo constante). Respiração permanente de baixa amplitude. Nunca corta.
**Coordenadas:** x ao longo do cais (0 → 1 100 m, a travessia), y para cima, z para a água (+) e para a retroárea (−). Linha do cais em z = 0. A câmera vive sobre a água (z > 0) e olha para −z, de lado.

| P | Beat | Posição (x, y, z) | Alvo | fov | Névoa | Velocidade | O que acontece |
|---|---|---|---|---|---|---|---|
| 0.00 | 01 | (20, 190, 430) | (660, 0, −120) | 52° | 0.00062 | respirando | chegada: o berço STS em primeiro plano à esquerda, o cais fugindo para a direita (composição do Asset C) |
| 0.14 | 01→02 | (90, 58, 250) | (270, 14, −60) | 52→42° | 0.0011 | lenta | a câmera desce; a marca some; o navio cresce |
| 0.22 | 02 | (80, 27, 100) | (240, 20, −40) | 42° | 0.0011 | média | rente ao navio, sob a lança do STS 1: o guindaste passa por cima do quadro |
| 0.30 | 02→03 | (200, 22, 110) | (370, 12, −80) | 42° | 0.0011 | média | sai do berço, o pátio abre |
| 0.38 | 03 | (310, 16, 10) | (480, 10, −130) | 42° | 0.0013 | média | cruza a via do cais e entra no pátio |
| 0.44 | 03 | (385, 12.5, −132) | (560, 9, −132) | 42° | 0.0013 | média, constante | dentro da via do meio, entre as pilhas (oclusão) |
| 0.50 | 03→04 | (545, 13, −132) | (700, 12, −118) | 42° | 0.0012 | média, constante | fim da via; galpões adiante |
| 0.56 | 04 | (645, 32, 60) | (810, 12, −60) | 42° | 0.0009 | média | sobe e volta para sobre a água: graneleiro e guindastes móveis |
| 0.66 | 04 | (805, 34, 160) | (965, 12, −70) | 42° | 0.0009 | média | galpões, torre, tanques, campo solar |
| 0.78 | 05 | (985, 42, 200) | (860, 10, −120) | 42° | 0.0009 | média | fim do cais; as rotas acendem atrás; começa a virar |
| 0.90 | 06 | (560, 130, 430) | (660, 4, −130) | 42→52° | 0.0007 | lenta | sobe e recua sobre a água, o terminal inteiro com as rotas |
| 1.00 | 07 | (100, 150, 340) | (660, 0, −120) | 52° | 0.00058 | lenta, longa | de volta ao enquadramento diagonal do Asset C, mais perto que na chegada; lockup |

**Onde a câmera aproxima:** 0.22 (navio e STS, 27 m: a lança, o trolley e o contêiner pendurado passam por cima do quadro) e 0.44–0.50 (via do meio do pátio, 12,5 m, pilhas de quatro alturas dos dois lados). São os dois beats em que o mundo fica entre a câmera e o mundo.

**Onde a câmera recua:** 0.78 → 1.00, subindo de 42 m a 150 m e voltando pela água até a ponta esquerda do cais, num único movimento lento. É a primeira vez desde 0.14 que o terminal cabe no quadro inteiro, agora com as rotas acesas. A chegada (0.00) e o lockup (1.00) são o mesmo enquadramento diagonal, o segundo mais perto: o visitante sai de dentro.

**Como o lockup é revelado:** o lockup só entra quando a câmera já está parada no enquadramento final (0.93), sobre o mundo ainda vivo. Não há cartela: a marca oficial e `BUILD 2030` sobem 3% da altura da tela com fade, no canto superior esquerdo, deixando 95% do quadro para o mundo.

**Luz e névoa (`atmosphereAt`, `fovAt`):** o sol não muda (baixo, atrás da serra, à direita, 0.62/0.09/−0.8); a névoa sobe de 0.00062 a 0.0013 na travessia (o pátio fecha o mundo) e volta a 0.00058 no recuo (o terminal inteiro); o preenchimento teal entra de 0.64 a 0.74 (a camada de sistema muda a cor da luz sem mudar a hora do dia); a exposição sobe 4% no lockup; o campo de visão é 52° nos planos gerais e 42° na travessia.

**Regras:**
- Nenhum keyframe coincide com uma entrada de texto: os labels entram enquanto a câmera se move.
- Entre 0.30 e 0.78 a velocidade em x é quase constante (travessia): o scroll "anda" pelo terminal.
- A câmera nunca olha de cima como um mapa (pitch máximo 24°, nos planos gerais): sempre de lado, sempre de sobre a água.
