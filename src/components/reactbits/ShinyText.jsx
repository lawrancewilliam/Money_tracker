import React, { useMemo } from "react";

const ANIM_ID = `shiny-${Math.random().toString(36).slice(2, 8)}`;

export default function ShinyText({
  text = "",
  disabled = false,
  speed = 2000,
  className = "",
}) {
  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  const active = disabled || prefersReduced;

  const style = {
    display: "inline-block",
    position: "relative",
    backgroundImage: "linear-gradient(90deg, #fff 0%, #fff 40%, #000 50%, #fff 60%, #fff 100%)",
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    ...(active
      ? { backgroundPosition: "0% 0%" }
      : { animation: `${ANIM_ID} ${speed}ms linear infinite` }),
  };

  return (
    <>
      {!active && (
        <style>{`
          @keyframes ${ANIM_ID} {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}</style>
      )}
      <span className={className} style={style}>
        {text}
      </span>
    </>
  );
}
