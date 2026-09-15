import React, { useMemo } from "react";

const ANIM_ID = `aurora-${Math.random().toString(36).slice(2, 8)}`;

export default function Aurora({
  colorStops = [
    { color: "#6C4BFF", opacity: 0.75 },
    { color: "#00C9FF", opacity: 0.5 },
    { color: "#FF6BC1", opacity: 0.6 },
  ],
  amplitude = 50,
  blur = 80,
  speed = 2,
  className = "",
}) {
  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  const keyframes = colorStops
    .map((_, i) => {
      const r1 = amplitude;
      const r2 = -amplitude;
      return `
        @keyframes ${ANIM_ID}-blob-${i} {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(${r1 * (i + 1) * 0.4}px, ${r2 * (i + 1) * 0.3}px); }
          50% { transform: translate(${r2 * (i + 1) * 0.3}px, ${r1 * (i + 1) * 0.5}px); }
          75% { transform: translate(${r1 * (i + 1) * 0.5}px, ${r1 * (i + 1) * 0.2}px); }
        }
      `;
    })
    .join("\n");

  const dur = prefersReduced ? "0s" : `${speed * 3}s`;

  return (
    <>
      <style>{keyframes}</style>
      <div
        className={className}
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        {colorStops.map((stop, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: `radial-gradient(circle, ${stop.color} 0%, transparent 70%)`,
              opacity: stop.opacity,
              filter: `blur(${blur}px)`,
              animation: prefersReduced
                ? "none"
                : `${ANIM_ID}-blob-${i} ${speed * (2 + i)}s ease-in-out infinite`,
              transform: prefersReduced ? "none" : undefined,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
    </>
  );
}
