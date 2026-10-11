import { forwardRef, type CSSProperties, type ReactNode } from "react";

/**
 * Label editorial: mono pequeno, caixa alta, tracking largo. Um por imagem.
 * Opcionalmente com índice (`01 / Mar`) e um traço curto à esquerda.
 */
type Props = {
  index?: string;
  children?: ReactNode;
  tick?: boolean;
  tone?: "muted" | "signal" | "white";
  className?: string;
  style?: CSSProperties;
};

export const EditorialLabel = forwardRef<HTMLSpanElement, Props>(
  function EditorialLabel(
    { index, children, tick, tone = "muted", className, style },
    ref,
  ) {
    const color =
      tone === "signal"
        ? "text-[var(--teal-signal)]"
        : tone === "white"
          ? "text-[var(--white)]"
          : "text-[var(--muted)]";
    return (
      <span
        ref={ref}
        className={`label inline-flex items-center gap-2 whitespace-nowrap ${color} ${className ?? ""}`}
        style={style}
      >
        {tick ? (
          <span aria-hidden className="inline-block h-px w-5 bg-current opacity-60" />
        ) : null}
        {index ? <span className="opacity-70">{index}</span> : null}
        {index && children ? <span className="opacity-40">/</span> : null}
        {children ? <span>{children}</span> : null}
      </span>
    );
  },
);
