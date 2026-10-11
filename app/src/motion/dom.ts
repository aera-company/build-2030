/* Helpers para escrever estilo direto no DOM, sem React state. */

type El = HTMLElement | SVGElement | null | undefined;

export const setOpacity = (el: El, v: number) => {
  if (!el) return;
  const s = v <= 0.001 ? "0" : v >= 0.999 ? "1" : v.toFixed(3);
  if (el.style.opacity !== s) el.style.opacity = s;
};

export const setTransform = (el: El, v: string) => {
  if (!el) return;
  if (el.style.transform !== v) el.style.transform = v;
};

export const setVisible = (el: El, on: boolean) => {
  if (!el) return;
  const v = on ? "visible" : "hidden";
  if (el.style.visibility !== v) el.style.visibility = v;
};

export const setVar = (el: El, name: string, v: string) => {
  if (!el) return;
  el.style.setProperty(name, v);
};

/** Transform composto, em px/vw conforme o chamador. */
export const tf = (opts: {
  x?: number;
  y?: number;
  scale?: number;
  unit?: "px" | "vw" | "vh" | "%";
}) => {
  const u = opts.unit ?? "px";
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;
  const s = opts.scale ?? 1;
  return `translate3d(${x.toFixed(2)}${u}, ${y.toFixed(2)}${u}, 0) scale(${s.toFixed(4)})`;
};
