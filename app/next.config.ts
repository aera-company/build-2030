import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace neste projeto. Sem isso, um package-lock.json
  // em algum diretório acima (ex.: a HOME) faz o Turbopack inferir a raiz
  // errada: CSS defasado no dev e, com o tempo, fork storm (spawn EAGAIN).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
