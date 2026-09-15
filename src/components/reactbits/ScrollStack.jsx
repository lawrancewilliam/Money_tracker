import { useRef, useEffect, useState, useCallback } from "react";

const STYLES = `
  .ss-wrapper {
    position: relative;
    width: 100%;
  }
  .ss-spacer {
    width: 100%;
    pointer-events: none;
  }
  .ss-item {
    position: sticky;
    top: 0;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s ease;
    will-change: transform, opacity;
    transform-origin: top center;
    z-index: 1;
  }
  .ss-item.ss-stacked {
    transform: scale(0.96) translateY(0);
    opacity: 0.7;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  .ss-item.ss-top {
    transform: scale(1) translateY(0);
    opacity: 1;
    box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    z-index: 10;
  }
  .ss-reduced .ss-item {
    transition: none;
  }
`;

export default function ScrollStack({
  children,
  className = "",
  itemHeight = 400,
  style = {},
}) {
  const wrapperRef = useRef(null);
  const [stacked, setStacked] = useState(new Set());
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const items = wrapper.querySelectorAll(":scope > .ss-item");
    const wrapperRect = wrapper.getBoundingClientRect();
    const newStacked = new Set();

    items.forEach((item, i) => {
      if (i === items.length - 1) return;
      const rect = item.getBoundingClientRect();
      const itemBottom = rect.bottom - wrapperRect.top;
      if (itemBottom < itemHeight * 0.85) {
        newStacked.add(i);
      }
    });

    setStacked(prev => {
      if (prev.size === newStacked.size &&
          [...prev].every(v => newStacked.has(v))) return prev;
      return newStacked;
    });
  }, [itemHeight]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const onScroll = () => requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const items = Array.isArray(children) ? children : [children];
  const totalHeight = itemHeight + (items.length - 1) * 48;

  return (
    <>
      <style>{STYLES}</style>
      <div
        ref={wrapperRef}
        className={`ss-wrapper ${prefersReduced ? "ss-reduced" : ""} ${className}`}
        style={{ height: totalHeight, ...style }}
      >
        {items.map((child, i) => {
          const isStacked = stacked.has(i);
          const isTop = !isStacked && (i === items.length - 1 || !stacked.has(i));
          return (
            <div
              key={i}
              className={`ss-item ${isStacked ? "ss-stacked" : ""} ${isTop ? "ss-top" : ""}`}
              style={{
                top: isStacked ? 0 : 0,
                zIndex: isTop ? 10 : i + 1,
                marginTop: i === 0 ? 0 : 0,
              }}
            >
              {child}
            </div>
          );
        })}
      </div>
    </>
  );
}
