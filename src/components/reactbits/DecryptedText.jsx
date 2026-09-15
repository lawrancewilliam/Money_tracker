import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

function getChar(ch, chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function scramble(text, chars, useOriginal) {
  let pool = useOriginal
    ? [...new Set(text.replace(/\s/g, "").split(""))]
    : chars.split("");
  if (pool.length === 0) pool = [...new Set(text.replace(/\s/g, "").split(""))];
  return text
    .split("")
    .map((ch) => (ch === " " ? " " : getChar(ch, pool)))
    .join("");
}

export default function DecryptedText({
  text = "",
  speed = 40,
  maxIterations = 10,
  sequential = false,
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
  className = "",
  animated = true,
  parentClassName = "",
  encryptedClassName = "",
}) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);
  const [display, setDisplay] = useState(animated ? scramble(text, characters, useOriginalCharsOnly) : text);

  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches ?? false;

  useEffect(() => {
    if (!ref.current || !animated) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animated]);

  useEffect(() => {
    if (!revealed || !animated || prefersReduced) {
      if (prefersReduced && animated) setDisplay(text);
      return;
    }

    if (sequential) {
      let currentText = scramble(text, characters, useOriginalCharsOnly);
      let resolved = text.split("");
      let index = 0;

      const interval = setInterval(() => {
        if (index >= resolved.length) {
          setDisplay(text);
          clearInterval(interval);
          return;
        }
        currentText = currentText
          .split("")
          .map((ch, i) => {
            if (i < index) return resolved[i];
            if (resolved[i] === " ") return " ";
            return getChar(resolved[i], useOriginalCharsOnly
              ? [...new Set(text.replace(/\s/g, "").split(""))]
              : characters.split(""));
          })
          .join("");
        setDisplay(currentText);
        index++;
      }, speed);

      return () => clearInterval(interval);
    } else {
      let iterations = 0;
      const interval = setInterval(() => {
        iterations++;
        setDisplay(scramble(text, characters, useOriginalCharsOnly));
        if (iterations >= maxIterations) {
          setDisplay(text);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [revealed, text, speed, maxIterations, sequential, useOriginalCharsOnly, characters, animated, prefersReduced]);

  const finalDisplay = !animated || prefersReduced ? text : display;

  return (
    <span ref={ref} className={`${parentClassName} ${className}`} style={{ display: "inline-block" }}>
      {finalDisplay.split("").map((ch, i) => {
        const isDecrypted = revealed && !prefersReduced
          ? (sequential ? i < display.length && display[i] === text[i] : display === text)
          : !animated;
        return (
          <span key={i} className={isDecrypted ? className : encryptedClassName}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
