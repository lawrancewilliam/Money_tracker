import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

function parseNumericValue(val) {
  if (typeof val === "number") return val;
  const str = String(val).replace(/[^0-9.\-]/g, "");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatNumber(num, { decimals, separator }) {
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decPart !== undefined ? `${withSep}.${decPart}` : withSep;
}

export default function CountUp({
  end,
  start = 0,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className = "",
  onFinish,
  startOnView = true,
}) {
  const parsedEnd = useMemo(() => parseNumericValue(end), [end]);
  const parsedStart = useMemo(() => parseNumericValue(start), [start]);
  const [current, setCurrent] = useState(parsedStart);
  const ref = useRef(null);
  const rafRef = useRef(null);
  const doneRef = useRef(false);

  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches ?? false;

  const runAnimation = useCallback(() => {
    if (prefersReduced) {
      setCurrent(parsedEnd);
      onFinish?.();
      return;
    }
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const value = parsedStart + (parsedEnd - parsedStart) * eased;
      setCurrent(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else if (!doneRef.current) {
        doneRef.current = true;
        onFinish?.();
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [parsedStart, parsedEnd, duration, prefersReduced, onFinish]);

  useEffect(() => {
    if (!startOnView) {
      const t = setTimeout(runAnimation, delay);
      return () => clearTimeout(t);
    }
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(runAnimation, delay);
          obs.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [startOnView, delay, runAnimation]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const formatted = formatNumber(current, { decimals, separator });

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
