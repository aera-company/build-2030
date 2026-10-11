import { forwardRef, type CSSProperties } from "react";
import { BRAND } from "@/lib/media";

/**
 * Marca oficial GAVEA GROUP. Entra intacta: asset original, proporção nativa,
 * sem filtro, sem brilho, sem recorte. Só o wrapper se move.
 */
type Props = {
  /** Largura em px (altura segue a proporção do asset). */
  width: number;
  className?: string;
  style?: CSSProperties;
};

export const BrandMark = forwardRef<HTMLDivElement, Props>(function BrandMark(
  { width, className, style },
  ref,
) {
  const b = BRAND.groupHorizontalWhite;
  const height = (width * b.height) / b.width;
  return (
    <div
      ref={ref}
      className={`pointer-events-none select-none ${className ?? ""}`}
      style={{ width, height, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.src}
        alt={b.alt}
        width={b.width}
        height={b.height}
        draggable={false}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
});
