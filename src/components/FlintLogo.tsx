import type { CSSProperties } from "react";

interface FlintLogoProps {
  /** Height of the mark in px. Wordmark scales with it. */
  size?: number;
  /** Show the "Flint" wordmark next to the mark. */
  wordmark?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Flint logo — "one confident spark."
 *
 * The mark is a single bold four-point spark with a smaller companion spark
 * flying off it: the instant flint is struck. The spark carries the accent
 * (identity is one of the few things allowed to spend the orange); the
 * wordmark stays in ink.
 */
export function FlintMark({ size = 24, className, style }: FlintLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flint"
      className={className}
      style={style}
    >
      {/* Main spark — concave four-point star, tilted for a struck, kinetic feel */}
      <path
        d="M10.5 3 Q11.4 12 20 12.6 Q11.4 13.2 10.5 22 Q9.6 13.2 1 12.6 Q9.6 12 10.5 3 Z"
        fill="var(--accent)"
      />
      {/* Companion spark — the fleck thrown off */}
      <path
        d="M19.4 3.4 Q19.8 6.7 22.6 7 Q19.8 7.3 19.4 10.2 Q19 7.3 16.4 7 Q19 6.7 19.4 3.4 Z"
        fill="var(--accent)"
        opacity="0.7"
      />
    </svg>
  );
}

export function FlintLogo({
  size = 24,
  wordmark = true,
  className,
  style,
}: FlintLogoProps) {
  if (!wordmark) {
    return <FlintMark size={size} className={className} style={style} />;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`} style={style}>
      <FlintMark size={size} />
      <span
        className="font-bold tracking-[-0.03em] text-ink leading-none"
        style={{ fontSize: size * 0.82 }}
      >
        Flint
      </span>
    </span>
  );
}
