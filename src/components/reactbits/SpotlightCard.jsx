import { useRef, useCallback } from "react";

const STYLES = `
  .sc-card {
    position: relative;
    overflow: hidden;
  }
  .sc-spotlight {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }
  .sc-card:hover .sc-spotlight {
    opacity: 1;
  }
  .sc-content {
    position: relative;
    z-index: 2;
  }
`;

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(0,0,0,0.08)",
  classNameSpotlight = "",
  borderRadius = 16,
}) {
  const cardRef = useRef(null);

  const onMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--sc-x", `${x}px`);
    card.style.setProperty("--sc-y", `${y}px`);
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div
        ref={cardRef}
        className={`sc-card ${className}`}
        style={{ borderRadius }}
        onMouseMove={onMouseMove}
      >
        <div
          className={`sc-spotlight ${classNameSpotlight}`}
          style={{
            background: `radial-gradient(circle 200px at var(--sc-x, 50%) var(--sc-y, 50%), ${spotlightColor}, transparent)`,
          }}
        />
        <div className="sc-content">
          {children}
        </div>
      </div>
    </>
  );
}
