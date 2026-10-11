import type { ScrollState } from "@/motion/scroll-store";

/** Toda camada do palco expõe um `tick` chamado pelo loop único. */
export type LayerHandle = {
  tick: (s: ScrollState) => void;
  /** Dados para o painel de debug. */
  debug?: () => Record<string, string | number>;
};
