import React, { useState, useEffect, useRef } from "react";

export default function FadeContent({
  children,
  blur = 0,
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  easing = "ease-out",
  startOnView = true,
  className = "",
}) {
  const [visible, setVisible] = useState(!startOnView);
  const ref = useRef(null);

  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches ?? false;

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [startOnView, threshold]);

  const show = prefersReduced || visible;

  const style = {
    opacity: show ? 1 : initialOpacity,
    filter: show ? "blur(0px)" : `blur(${blur}px)`,
    transform: show ? "translateY(0px)" : "translateY(20px)",
    transition: `opacity ${duration}s ${easing} ${delay}s, filter ${duration}s ${easing} ${delay}s, transform ${duration}s ${easing} ${delay}s`,
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
