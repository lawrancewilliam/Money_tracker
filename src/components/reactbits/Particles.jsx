import React, { useRef, useEffect, useCallback } from "react";

export default function Particles({
  particleColors = ["#ffffff"],
  particleCount = 50,
  particleSpread = 10,
  speed = 0.5,
  particleBaseSize = 2,
  moveParticlesOnHover = false,
  alphaParticles = true,
  disableRotation = false,
  className = "",
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const rafRef = useRef(null);

  const prefersReduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches ?? false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize);

    const cssW = canvas.offsetWidth;
    const cssH = canvas.offsetHeight;

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * cssW,
      y: Math.random() * cssH,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: particleBaseSize + Math.random() * particleSpread,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      opacity: alphaParticles ? 0.2 + Math.random() * 0.6 : 1,
      rotation: disableRotation ? 0 : Math.random() * Math.PI * 2,
      rotationSpeed: disableRotation ? 0 : (Math.random() - 0.5) * 0.02,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current.forEach((p) => {
        if (moveParticlesOnHover && mouseRef.current.x !== null) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            p.vx += dx * 0.0003;
            p.vy += dy * 0.0003;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    if (prefersReduced) {
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    } else {
      draw();
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [particleColors, particleCount, particleSpread, speed, particleBaseSize, moveParticlesOnHover, alphaParticles, disableRotation, prefersReduced]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!moveParticlesOnHover || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [moveParticlesOnHover]
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: null, y: null };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
