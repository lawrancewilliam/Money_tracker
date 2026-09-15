import React, { useMemo } from "react";

const ANIM_ID = `grad-anim-${Math.random().toString(36).slice(2, 8)}`;

export default function GradientText({
  children,
  className = "",
  colors = ["#ffaa40", "#ff6b6b", "#ee5a24", "#ffaa40"],
  animate = false,
  animationDuration = 3,
  animationDirection = "right",
  showApplyOnHoverStamp = false,
}) {
  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  const direction = animationDirection === "left" ? "200% 0%" : "0% 0%";
  const directionTo = animationDirection === "left" ? "0% 0%" : "200% 0%";

  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;

  const style = {
    background: gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "inline-block",
    ...(animate && !prefersReduced
      ? {
          backgroundSize: "200% auto",
          animation: `${ANIM_ID} ${animationDuration}s linear infinite`,
        }
      : { backgroundSize: "200% auto" }),
  };

  return (
    <>
      {animate && !prefersReduced && (
        <style>{`
          @keyframes ${ANIM_ID} {
            0% { background-position: ${direction}; }
            100% { background-position: ${directionTo}; }
          }
        `}</style>
      )}
      <span className={className} style={style}>
        {children}
      </span>
    </>
  );
}
