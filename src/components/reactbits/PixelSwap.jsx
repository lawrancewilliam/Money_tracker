import { useState, useRef, useMemo, useCallback, useEffect } from "react";

const STYLES = `
  .ps-container {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }
  .ps-container.ps-disabled {
    cursor: default;
    pointer-events: none;
  }
  .ps-img-base {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ps-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    pointer-events: none;
  }
  .ps-tile {
    overflow: hidden;
    will-change: transform, opacity;
    transition: transform var(--ps-px-dur) var(--ps-px-timing) var(--ps-delay, 0s),
                opacity var(--ps-px-dur) var(--ps-px-timing) var(--ps-delay, 0s);
    transform: scale(1);
    opacity: 0;
  }
  .ps-container:not(.ps-active) .ps-tile,
  .ps-container.ps-reduced .ps-tile {
    transform: scale(0);
    opacity: 0;
  }
  .ps-container.ps-active .ps-tile,
  .ps-container.ps-reduced .ps-tile.ps-reduced-in {
    transform: scale(1);
    opacity: 1;
  }
  .ps-tile-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  .ps-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 12px;
    background: linear-gradient(transparent, rgba(0,0,0,0.55));
    color: #fff;
    font-size: 14px;
    line-height: 1.3;
    text-align: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 5;
  }
  .ps-container.ps-active .ps-label {
    opacity: 1;
  }
`;

function getPatternIndices(cols, rows, pattern) {
  const indices = [];
  const total = cols * rows;
  for (let i = 0; i < total; i++) indices.push(i);

  switch (pattern) {
    case "columns":
      return indices;
    case "rows":
      return indices.sort((a, b) => {
        const ra = Math.floor(a / cols), rb = Math.floor(b / cols);
        return ra - rb || a - b;
      });
    case "diagonal":
      return indices.sort((a, b) => {
        const da = Math.floor(a / cols) + (a % cols);
        const db = Math.floor(b / cols) + (b % cols);
        return da - db;
      });
    case "cross": {
      const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
      return indices.sort((a, b) => {
        const ax = a % cols, ay = Math.floor(a / cols);
        const bx = b % cols, by = Math.floor(b / cols);
        return (Math.abs(ax - cx) + Math.abs(ay - cy)) - (Math.abs(bx - cx) + Math.abs(by - cy));
      });
    }
    case "circle": {
      const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
      return indices.sort((a, b) => {
        const ax = a % cols - cx, ay = Math.floor(a / cols) - cy;
        const bx = b % cols - cx, by = Math.floor(b / cols) - cy;
        return (ax * ax + ay * ay) - (bx * bx + by * by);
      });
    }
    case "squares": {
      const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
      return indices.sort((a, b) => {
        const ax = Math.abs((a % cols) - cx);
        const ay = Math.abs(Math.floor(a / cols) - cy);
        const ma = Math.max(ax, ay);
        const bx = Math.abs((b % cols) - cx);
        const by = Math.abs(Math.floor(b / cols) - cy);
        const mb = Math.max(bx, by);
        return ma - mb;
      });
    }
    case "diagonal-rows":
      return indices.sort((a, b) => {
        const da = Math.floor(a / cols) + (a % cols) * 1.5;
        const db = Math.floor(b / cols) + (b % cols) * 1.5;
        return da - db;
      });
    case "diagonal-cross": {
      const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
      return indices.sort((a, b) => {
        const ax = Math.abs((a % cols) - cx), ay = Math.abs(Math.floor(a / cols) - cy);
        const bx = Math.abs((b % cols) - cx), by = Math.abs(Math.floor(b / cols) - cy);
        return (ax + ay) - (bx + by);
      });
    }
    case "table":
      return indices.sort((a, b) => {
        const colA = a % cols, colB = b % cols;
        return colA - colB;
      });
    case "cross-2": {
      const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
      return indices.sort((a, b) => {
        const ax = (a % cols) - cx, ay = Math.floor(a / cols) - cy;
        const bx = (b % cols) - cx, by = Math.floor(b / cols) - cy;
        return (ax * ax + ay * ay + Math.abs(ax * ay) * 0.5) - (bx * bx + by * by + Math.abs(bx * by) * 0.5);
      });
    }
    default:
      return indices.sort(() => Math.random() - 0.5);
  }
}

export default function PixelSwap({
  text,
  imgSrc1,
  imgSrc2,
  width = 400,
  height = 300,
  pixelSize = 50,
  animationDuration = 1200,
  pixelDuration = 450,
  transitionTimingFunction = "ease",
  pixelAnimationTimingFunction = "ease-out",
  firstImgAlt = "",
  secondImgAlt = "",
  className = "",
  disabled = false,
  pattern = "default",
}) {
  const [active, setActive] = useState(false);
  const containerRef = useRef(null);
  const timersRef = useRef([]);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);
  const orderedIndices = useMemo(() => getPatternIndices(cols, rows, pattern), [cols, rows, pattern]);

  const maxStagger = animationDuration - pixelDuration;

  const activate = useCallback(() => {
    if (disabled) return;
    if (prefersReduced) {
      setActive(true);
      return;
    }
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActive(false);
    requestAnimationFrame(() => {
      setActive(true);
      const tiles = containerRef.current?.querySelectorAll(".ps-tile");
      if (!tiles) return;
      const total = tiles.length;
      orderedIndices.forEach((flatIdx, orderIdx) => {
        const delay = (orderIdx / Math.max(total - 1, 1)) * maxStagger;
        const t = setTimeout(() => {
          if (tiles[flatIdx]) {
            tiles[flatIdx].style.setProperty("--ps-delay", "0s");
          }
        }, delay);
        timersRef.current.push(t);
      });
    });
  }, [disabled, prefersReduced, orderedIndices, maxStagger]);

  const deactivate = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActive(false);
  }, []);

  const gridTemplate = `repeat(${cols}, ${pixelSize}px) / repeat(${rows}, ${pixelSize}px)`;

  return (
    <>
      <style>{STYLES}</style>
      <div
        ref={containerRef}
        className={[
          "ps-container",
          active && "ps-active",
          disabled && "ps-disabled",
          prefersReduced && "ps-reduced",
          className,
        ].filter(Boolean).join(" ")}
        style={{
          width,
          height,
          "--ps-px-dur": `${pixelDuration}ms`,
          "--ps-px-timing": pixelAnimationTimingFunction,
        }}
        onMouseEnter={activate}
        onMouseLeave={deactivate}
        onClick={activate}
        role="img"
        aria-label={text || secondImgAlt || firstImgAlt}
      >
        <img
          className="ps-img-base"
          src={imgSrc1}
          alt={firstImgAlt}
          draggable={false}
        />
        <div
          className="ps-overlay"
          style={{ gridTemplate }}
        >
          {Array.from({ length: cols * rows }, (_, flatIdx) => {
            const col = flatIdx % cols;
            const row = Math.floor(flatIdx / cols);
            const orderPos = orderedIndices.indexOf(flatIdx);
            const delay = (orderPos / Math.max(cols * rows - 1, 1)) * maxStagger;
            return (
              <div
                key={flatIdx}
                className="ps-tile"
                style={{
                  "--ps-delay": `${delay}ms`,
                }}
              >
                <img
                  className="ps-tile-img"
                  src={imgSrc2}
                  alt=""
                  draggable={false}
                  style={{
                    width: cols * pixelSize,
                    height: rows * pixelSize,
                    objectFit: "cover",
                    marginLeft: -(col * pixelSize),
                    marginTop: -(row * pixelSize),
                  }}
                />
              </div>
            );
          })}
        </div>
        {text && <div className="ps-label">{text}</div>}
      </div>
    </>
  );
}
