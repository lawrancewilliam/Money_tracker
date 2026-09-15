import { useRef, useEffect, useState, useCallback } from "react";

const STYLES = `
  .pb-container {
    width: 100%;
    position: relative;
  }
  .pb-track {
    width: 100%;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }
  .pb-fill {
    height: 100%;
    border-radius: 999px;
    width: 0%;
    transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: width;
    position: relative;
    overflow: hidden;
  }
  .pb-fill.pb-animated {
    /* width set via inline style */
  }
  .pb-fill::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.15) 50%,
      transparent 100%
    );
    animation: pb-shimmer 2s infinite;
  }
  .pb-reduced .pb-fill {
    transition: none;
  }
  .pb-reduced .pb-fill::after {
    animation: none;
  }
  .pb-label {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    color: inherit;
    text-align: right;
  }
  @keyframes pb-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export default function ProgressBar({
  progress = 0,
  className = "",
  color = "#22c55e",
  height = 12,
  showLabel = false,
  label,
  animated = true,
  backgroundColor = "#e5e7eb",
}) {
  const fillRef = useRef(null);
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!animated || prefersReduced) {
      setInView(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animated, prefersReduced]);

  const clampedProgress = Math.max(0, Math.min(100, progress));

  const displayLabel = label != null
    ? label
    : `${Math.round(clampedProgress)}%`;

  return (
    <>
      <style>{STYLES}</style>
      <div
        ref={containerRef}
        className={`pb-container ${prefersReduced ? "pb-reduced" : ""} ${className}`}
      >
        <div
          className="pb-track"
          style={{
            height,
            backgroundColor,
          }}
        >
          <div
            ref={fillRef}
            className={`pb-fill ${inView ? "pb-animated" : ""}`}
            style={{
              width: inView ? `${clampedProgress}%` : "0%",
              backgroundColor: color,
              transitionDuration: prefersReduced ? "0s" : "1.2s",
            }}
          />
        </div>
        {showLabel && (
          <div className="pb-label" style={{ color }}>
            {displayLabel}
          </div>
        )}
      </div>
    </>
  );
}
