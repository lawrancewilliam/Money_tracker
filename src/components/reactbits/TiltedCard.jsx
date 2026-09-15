import React, { useRef, useCallback, useMemo } from "react";

export default function TiltedCard({
  children,
  className = "",
  tiltMaxAngleX = 3,
  tiltMaxAngleY = 3,
  disableTilt = false,
}) {
  const ref = useRef(null);

  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  const disabled = disableTilt || prefersReduced;

  const handleMouseMove = useCallback(
    (e) => {
      if (disabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      const rotY = nx * tiltMaxAngleY;
      const rotX = -ny * tiltMaxAngleX;
      ref.current.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      const glare = ref.current.querySelector(".glare-overlay");
      if (glare) {
        glare.style.opacity = "0.15";
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, transparent 60%)`;
      }
    },
    [disabled, tiltMaxAngleX, tiltMaxAngleY]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
    ref.current.style.transition = "transform 0.4s ease-out";
    const glare = ref.current.querySelector(".glare-overlay");
    if (glare) glare.style.opacity = "0";
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = "none";
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.4s ease-out",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
      <div
        className="glare-overlay"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.3s ease",
          borderRadius: "inherit",
        }}
      />
    </div>
  );
}
