import React, { useRef, useCallback, useMemo } from "react";

export default function Magnet({
  children,
  disabled = false,
  magnetStrength = 30,
  activeStrength,
  childrenStrengthModifier = 1,
  className = "",
}) {
  const ref = useRef(null);
  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  const strength = disabled || prefersReduced ? 0 : (activeStrength ?? magnetStrength);

  const handleMouseMove = useCallback(
    (e) => {
      if (strength === 0 || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxDist = Math.max(rect.width, rect.height);
      const normX = (dx / maxDist) * strength * childrenStrengthModifier;
      const normY = (dy / maxDist) * strength * childrenStrengthModifier;
      ref.current.style.transform = `translate(${normX}px, ${normY}px)`;
    },
    [strength, childrenStrengthModifier]
  );

  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = "translate(0px, 0px)";
      ref.current.style.transition = "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)";
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      ref.current.style.transition = "none";
    }
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ display: "inline-block", transition: "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)" }}
    >
      {children}
    </div>
  );
}
