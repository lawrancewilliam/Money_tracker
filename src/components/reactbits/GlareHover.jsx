import React, { useRef, useCallback, useMemo } from "react";

export default function GlareHover({
  children,
  className = "",
  borderRadius = "12px",
}) {
  const ref = useRef(null);

  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (prefersReduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const glare = ref.current.querySelector(".glare-effect");
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.25) 0%, transparent 50%)`;
        glare.style.opacity = "1";
      }
    },
    [prefersReduced]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    const glare = ref.current.querySelector(".glare-effect");
    if (glare) glare.style.opacity = "0";
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius,
      }}
    >
      {children}
      <div
        className="glare-effect"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.3s ease",
          borderRadius,
        }}
      />
    </div>
  );
}
