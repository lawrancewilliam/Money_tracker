import React, { useRef, useEffect, useState, useMemo } from "react";

const ANIM_ID = `eborder-${Math.random().toString(36).slice(2, 8)}`;

export default function ElectricBorder({
  children,
  radius = 12,
  glowColor = "#6C4BFF",
  className = "",
}) {
  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  return (
    <>
      <style>{`
        @keyframes ${ANIM_ID} {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .${ANIM_ID}-wrapper {
          position: relative;
          border-radius: ${radius}px;
          padding: 2px;
          background: linear-gradient(135deg, ${glowColor}, ${glowColor}44, ${glowColor}, ${glowColor}44);
          background-size: 300% 300%;
          ${prefersReduced ? "" : `animation: ${ANIM_ID} 3s ease infinite;`}
        }
        .${ANIM_ID}-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: ${radius}px;
          padding: 2px;
          background: linear-gradient(135deg, ${glowColor}, ${glowColor}44, ${glowColor}, ${glowColor}44);
          background-size: 300% 300%;
          ${prefersReduced ? "" : `animation: ${ANIM_ID} 3s ease infinite;`}
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          filter: blur(8px);
          opacity: 0.6;
          pointer-events: none;
        }
        .${ANIM_ID}-inner {
          position: relative;
          border-radius: ${radius - 2}px;
          overflow: hidden;
        }
      `}</style>
      <div className={`${ANIM_ID}-wrapper ${className}`}>
        <div className={`${ANIM_ID}-inner`}>
          {children}
        </div>
      </div>
    </>
  );
}
