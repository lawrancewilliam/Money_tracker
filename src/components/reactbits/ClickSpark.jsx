import React, { useRef, useCallback } from "react";

export default function ClickSpark({
  children,
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraSparkProps = {},
  className = "",
}) {
  const containerRef = useRef(null);

  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches ?? false;

  const handleClick = useCallback(
    (e) => {
      if (prefersReduced || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < sparkCount; i++) {
        const angle = (360 / sparkCount) * i;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * sparkRadius;
        const ty = Math.sin(rad) * sparkRadius;

        const spark = document.createElement("span");
        spark.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${sparkSize}px;
          height: ${sparkSize}px;
          border-radius: 50%;
          background: ${sparkColor};
          pointer-events: none;
          transform: translate(-50%, -50%);
          opacity: 1;
          z-index: 9999;
          transition: all ${duration}ms ${easing};
        `;
        Object.entries(extraSparkProps).forEach(([k, v]) => {
          spark.style[k] = v;
        });

        containerRef.current.appendChild(spark);

        requestAnimationFrame(() => {
          spark.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
          spark.style.opacity = "0";
        });

        setTimeout(() => spark.remove(), duration);
      }
    },
    [prefersReduced, sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraSparkProps]
  );

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={handleClick}
      style={{ position: "relative", overflow: "hidden", display: "inline-block" }}
    >
      {children}
    </div>
  );
}
