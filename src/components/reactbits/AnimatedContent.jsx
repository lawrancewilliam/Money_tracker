import React, { useState, useEffect, useRef, useMemo } from "react";

export default function AnimatedContent({
  children,
  distance = 100,
  direction = "vertical",
  reverse = false,
  config = {},
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  startOnView = true,
  delay = 0,
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
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [startOnView]);

  const d = reverse ? -distance : distance;
  const translateX = direction === "horizontal" ? d : 0;
  const translateY = direction === "vertical" ? d : 0;

  const {
    transitionProperty = "all",
    transitionDuration = "0.6s",
    transitionTimingFunction = "ease-out",
    transitionDelay = `${delay}ms`,
    ...restTransition
  } = config;

  const hiddenStyle = {
    opacity: initialOpacity,
    transform: `translate(${direction === "horizontal" ? -translateX : 0}px, ${direction === "vertical" ? -translateY : 0}px) scale(${scale})`,
    transition: `${transitionProperty} ${transitionDuration} ${transitionTimingFunction} ${transitionDelay}`,
    ...restTransition,
  };

  const visibleStyle = {
    opacity: animateOpacity ? 1 : initialOpacity,
    transform: "translate(0px, 0px) scale(1)",
    transition: `${transitionProperty} ${transitionDuration} ${transitionTimingFunction} ${transitionDelay}`,
    ...restTransition,
  };

  const finalStyle = prefersReduced ? visibleStyle : (visible ? visibleStyle : hiddenStyle);

  return (
    <div ref={ref} style={finalStyle}>
      {children}
    </div>
  );
}
