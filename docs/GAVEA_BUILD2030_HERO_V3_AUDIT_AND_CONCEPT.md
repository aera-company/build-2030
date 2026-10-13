# GAVEA GROUP / BUILD 2030
## HERO V3 · AUDITORIA DO HERO ATUAL E CONCEITO REVISADO
**Data:** 13/10/2026 · **Responde a:** brief "senior creative technologist" (hero-first, Emons como UX, integração antes de BUILD 2030)
**Base:** hero V2 + passe de realismo 1 (`00eb7b1`, https://build-2030.vercel.app)

---

## 1. Auditoria: o que já está alinhado e o que não está

### Alinhado
- **Mundo primeiro.** O hero abre num terminal vivo, em 3D, visto de sobre a água, ao entardecer; nada de cartela, nada de tipografia gigante, nada de footage em letra.
- **Travessia.** A câmera percorre o cais na horizontal (x), em spline contínua, presa ao scroll, com dois beats de aproximação (sob a lança do STS; dentro da via do pátio). É a tradução da Emons.
- **Operação.** Trolleys, RTGs, caminhões, rebocadores, luzes de obstrução: tudo se move desde o primeiro frame e nunca para.
- **Capacidades.** Os seis labels (Operação, Logística, Terminais, Trade, Tecnologia, Green) são âncoras 3D com oclusão, reveladas uma a uma conforme a câmera chega.
- **Marca.** Logo oficial intacto (abertura, barra, lockup). Paleta: navy, teal só como sinal, âmbar só nas luzes do mundo.
- **Técnica.** Palco fixo, loop único, estados em `moments.ts`, câmera em `camera-path.ts`, captura headless. Nada a resetar.

### Não alinhado (específico)
1. **BUILD 2030 aparecia cedo demais.** Na abertura, depois do logo, entrava um `BUILD 2030` pequeno (P 0.09–0.135). O brief é explícito: BUILD 2030 só depois de operação e integração. Removido.
2. **Faltava o beat de síntese.** O hero ia de "capacidades" para "rotas teal" e daí para quatro linhas ("mais presença", "mais conexão", "mais oportunidades", "mais inteligência") e para o lockup. As quatro linhas soavam a promessa de marketing e chegavam antes de o visitante ter formulado "isto é um sistema só". Substituídas pela síntese do brief: `Uma GAVEA.` → `Múltiplas capacidades.` → `One stop shop` (pequeno, como conclusão).
3. **Integração sentida, mas não nomeada no momento certo.** As rotas (Ato 04) acendiam enquanto a câmera ainda avançava e os labels sumiam; o visitante via linhas, não uma ideia. Agora a síntese entra enquanto a câmera sobe e recua sobre o terminal inteiro com as rotas acesas: o texto chega quando a imagem já diz "um sistema".
4. **BUILD 2030 sem ponte conceitual.** O lockup era marca + BUILD 2030 + `Construir. Escalar. Liderar.` e parava aí. Faltava a frase que liga a integração da operação à integração do futuro. Entra a linha secundária `A próxima fase começa com integração.`, pequena, depois do lockup.
5. **Ritmo.** A travessia (0.30–0.78) é linear e uniforme; não há "hold". Mantido neste passe (muda só a parte final); o próximo ajuste de ritmo é um breve hold no meio do pátio e outro na torre.
6. **Forma dos objetos.** Guindastes de caixa, navio sem detalhe, serra em recorte. É o passe de modelos, já planejado; luz, água e materiais já receberam o passe 1.
7. **Índice da barra** dizia "06 / Direção". Agora "06 / Integração".

## 2. Conceito revisado: cinco atos no mesmo mundo

| Ato | P | O que o visitante sente | Texto |
|---|---|---|---|
| 01 Chegada | 0.00–0.14 | "isto já existe e está vivo" | `AERA apresenta` (crédito mínimo) · marca oficial |
| 02 Entrada no sistema | 0.14–0.50 | escala, direção, "estou dentro" | nenhum; barra entra |
| 03 Capacidades | 0.31–0.64 | "não é um porto, é um ecossistema" | Operação · Logística · Terminais · Trade · Tecnologia · Green (um a um, presos ao mundo) |
| 04 Integração | 0.64–0.915 | rotas acendem, nós ligam, a câmera sobe e mostra tudo; "é um sistema só" | `Uma GAVEA.` (0.80) · `Múltiplas capacidades.` (0.835) · `One stop shop` (0.875, label pequeno); somem em 0.915 |
| 05 BUILD 2030 | 0.93–1.00 | "a mesma lógica, aplicada ao futuro" | marca oficial · `BUILD 2030` · `Construir. Escalar. Liderar.` · `A próxima fase começa com integração.` (0.955) |

Regra que organiza tudo: **mostrar, depois nomear.** Operação antes de "capacidades"; rotas antes de "uma GAVEA"; "uma GAVEA" antes de BUILD 2030. AERA só como crédito; a proposta da AERA fica para as seções seguintes.

## 3. O que mudou no código
- `moments.ts`: sai `buildIn` e `LINES`; entram `SYNTH` e `M.synth` (0.80 / 0.835 / 0.875 / out 0.915) e `LOCKUP.line` com `M.lockupLine` (0.955).
- `AnnotationLayer.tsx`: sai o `BUILD 2030` da abertura e as quatro linhas ancoradas; entra o bloco de síntese (fixo, canto inferior esquerdo, 3vw) e a linha secundária do lockup.
- `routes.ts`: cinco pulsos em vez de três (mais energia no Ato 04).
- `journey.ts`: índice "06 / Integração".
- Câmera, mundo, luz e captura: inalterados neste passe.

Frames: `review-frames-hero-v3/` (8 PNG, `scroll.mp4`, `contact-sheet.jpg`).
