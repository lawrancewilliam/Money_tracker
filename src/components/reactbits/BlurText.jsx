import React, { useState, useEffect, useRef, useCallback } from "react";

export default function BlurText({
  text = "",
  delay = 0,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  onAnimationComplete,
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches ?? false;

  const dirMultiplier = direction === "top" ? -1 : 1;
  const defaultFrom = {
    opacity: 0,
    filter: "blur(8px)",
    transform: `translateY(${20 * dirMultiplier}px)`,
  };
  const defaultTo = {
    opacity: 1,
    filter: "blur(0px)",
    transform: "translateY(0px)",
  };

  const from = { ...defaultFrom, ...animationFrom };
  const to = { ...defaultTo, ...animationTo };

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  const items = animateBy === "letters" ? text.split("") : text.split(" ");

  const totalDuration = items.length * delay + 500;

  useEffect(() => {
    if (visible && !prefersReduced) {
      const t = setTimeout(() => onAnimationComplete?.(), totalDuration);
      return () => clearTimeout(t);
    }
    if (visible && prefersReduced) {
      onAnimationComplete?.();
    }
  }, [visible, prefersReduced, totalDuration, onAnimationComplete]);

  if (prefersReduced || !visible) {
    return (
      <span ref={ref} className={className}>
        {prefersReduced || !visible ? text : null}
      </span>
    );
  }

  return (
    <span ref={ref} className={className} style={{ display: "inline" }}>
      {items.map((item, i) => {
        const itemStyle = {
          display: "inline-block",
          opacity: from.opacity,
          filter: from.filter,
          transform: from.transform,
          transition: `all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${i * delay}ms`,
        };
        return (
          <span key={i} style={itemStyle} ref={el => {
            if (el) {
              requestAnimationFrame(() => {
                el.style.opacity = to.opacity;
                el.style.filter = to.filter;
                el.style.transform = to.transform;
              });
            }
          }}>
            {item}
            {animateBy === "words" && i < items.length - 1 ? "\u00A0" : null}
          </span>
        );
      })}
    </span>
  );
}
