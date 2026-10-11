# GAVEA / BUILD 2030
## CAMERA PATH V1
### Um caminho, não oito animações

**Implementação:** `app/src/world/camera-path.ts`. Posição e alvo passam por Catmull-Rom (caminho espacial contínuo, sem quina); o tempo entre keyframes usa easing cinemático (chega, segura, parte). Respiração permanente de baixa amplitude. A câmera nunca para e nunca corta.

Sistema de coordenadas: núcleo na origem; x para a direita, y para cima, z para o visitante (o cais vai de z = −110 a z = +150). As partes ficam num anel de raio 46–64 ao redor do núcleo.

| P | Estado | Posição | Alvo | Profundidade / névoa | Velocidade | Transição |
|---|---|---|---|---|---|---|
| 0.00 | 01 | (0, 3, 170) | (0, 6, 0) | névoa 0.030: só o núcleo como vulto | parada, respirando | pré-roll pelo tempo até 0.17 |
| 0.17 | 01→02 | (10, 4, 150) | (0, 6, 0) | 0.030 → 0.016 | começa a mover, lenta | a marca some, a câmera assume |
| 0.26 | 02 | (34, 9, 96) | (26, 5, 30) | 0.016 | média | passa a olhar o lado direito |
| 0.34 | 03 | (58, 7, 38) | (44, 6, 10) | 0.013 | média, rente | a janela de Operação enche o quadro |
| 0.40 | 03 | (74, 11, 50) | (10, 7, 4) | 0.013 | média | por trás do pórtico, olhando o núcleo através dele (oclusão) |
| 0.46 | 03→04 | (-10, 14, -84) | (0, 6, 0) | 0.013 | média | atrás do sistema, vira para a lâmina |
| 0.54 | 04 | (-60, 18, -20) | (0, 8, 0) | 0.011 | lenta | acompanha a lâmina atravessando |
| 0.64 | 05 | (-70, 22, 60) | (0, 8, 0) | 0.011 | órbita constante | nada acelera: um ritmo |
| 0.74 | 06 | (-36, 12, 64) | (0, 9, 0) | 0.010 | lenta | aproxima do núcleo para os labels |
| 0.82 | 07 | (-12, 11, 4) | (-62, 4, -36) | 0.010 | média | do lado do núcleo, olha ao longo do ramo A |
| 0.90 | 07 | (14, 11, 2) | (62, 4, -38) | 0.010 | média | vira: olha ao longo do ramo B |
| 1.00 | 08 | (0, 70, 150) | (0, 6, -10) | 0.006 | lenta, longa | recuo: o sistema inteiro |

Regras do caminho:
- Entre 0.30 e 0.46 a câmera passa **rente** a uma janela e **por trás** de uma estrutura: os dois beats de oclusão.
- A partir de 0.56 a velocidade angular é constante até 0.74: a câmera também "ganha direção".
- Nenhum keyframe coincide com um corte de informação: os labels entram enquanto a câmera ainda se move.
- O recuo final é o único movimento longo e lento; é a primeira vez que o sistema cabe no quadro.

Luz e névoa (`atmosphereAt`): a chave sobe de 0.25 para 2.6 entre 0.19 e 0.29 (a estrutura aparece), para 3.9 até 0.5; o preenchimento teal só existe depois de 0.56; o núcleo tem luz própria que acende quando a lâmina o atravessa (≈0.50).
