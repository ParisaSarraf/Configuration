import { useEffect, useRef } from "react";

/** Canvas background inspired by SatoriUI's Kinetic Grid; no extra dependencies. */
export default function KineticGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let points = [];
    let ripples = [];
    let frame = 0;
    let previousTime = 0;
    const pointer = { x: -1000, y: -1000, active: false };

    const render = (time = performance.now()) => {
      const step = Math.min((time - (previousTime || time - 16.67)) / 16.67, 2);
      previousTime = time;
      context.clearRect(0, 0, width, height);
      ripples = ripples.filter((ripple) => time - ripple.time < 1800);
      const radius = Math.min(260, width * 0.6);

      points.forEach((point) => {
        let targetX = point.originX;
        let targetY = point.originY;
        let glow = 0;
        if (!reducedMotion && pointer.active) {
          const dx = pointer.x - point.originX;
          const dy = pointer.y - point.originY;
          const distance = Math.hypot(dx, dy);
          if (distance < radius) {
            const influence = (1 - distance / radius) ** 2;
            targetX += dx * influence * 0.3;
            targetY += dy * influence * 0.3;
            glow = influence;
          }
        }
        if (!reducedMotion) {
          ripples.forEach((ripple) => {
            const dx = point.originX - ripple.x;
            const dy = point.originY - ripple.y;
            const distance = Math.hypot(dx, dy);
            const age = (time - ripple.time) / 1000;
            const wave = Math.exp(-(((distance - age * 380) / 65) ** 2));
            const amplitude = wave * Math.exp(-age * 1.7);
            targetX += (dx / (distance || 1)) * amplitude * 25;
            targetY += (dy / (distance || 1)) * amplitude * 25;
            glow = Math.min(1, glow + amplitude);
          });
          point.x += (targetX - point.x) * (1 - 0.85 ** step);
          point.y += (targetY - point.y) * (1 - 0.85 ** step);
        } else {
          point.x = point.originX;
          point.y = point.originY;
        }
        point.glow = glow;
      });

      // Draw connected edges first so the glowing nodes sit above them.
      context.lineWidth = 1;
      points.forEach((point, index) => {
        const neighbors = [];
        if (index % columns < columns - 1) neighbors.push(points[index + 1]);
        if (index + columns < points.length) neighbors.push(points[index + columns]);
        neighbors.forEach((neighbor) => {
          const glow = (point.glow + neighbor.glow) / 2;
          context.strokeStyle = glow > 0.03
            ? `rgba(0, 168, 144, ${0.1 + glow * 0.5})`
            : "rgba(0, 168, 144, 0.14)";
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(neighbor.x, neighbor.y);
          context.stroke();
        });
      });
      points.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 1.7 + point.glow * 2, 0, Math.PI * 2);
        context.fillStyle = point.glow > 0.03
          ? `rgba(0, 168, 144, ${0.4 + point.glow * 0.6})`
          : "rgba(0, 168, 144, 0.38)";
        context.fill();
        if (point.glow > 0.15) {
          context.beginPath();
          context.arc(point.x, point.y, 7 + point.glow * 4, 0, Math.PI * 2);
          context.fillStyle = `rgba(0, 168, 144, ${point.glow * 0.075})`;
          context.fill();
        }
      });
    };

    const animate = (time) => {
      render(time);
      frame = window.requestAnimationFrame(animate);
    };
    const start = () => {
      window.cancelAnimationFrame(frame);
      previousTime = 0;
      if (reducedMotion || document.hidden) render();
      else frame = window.requestAnimationFrame(animate);
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const spacing = width < 600 ? 48 : 64;
      columns = Math.ceil(width / spacing) + 2;
      rows = Math.ceil(height / spacing) + 2;
      points = Array.from({ length: columns * rows }, (_, index) => {
        const x = (index % columns) * spacing - spacing / 2;
        const y = Math.floor(index / columns) * spacing - spacing / 2;
        return { originX: x, originY: y, x, y, glow: 0 };
      });
      render();
    };
    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
    };
    const leave = () => { pointer.active = false; };
    const ripple = (event) => {
      if (reducedMotion || event.target.closest?.("input, button, a, label, .signin-card")) return;
      move(event);
      if (pointer.active) {
        ripples.push({ x: pointer.x, y: pointer.y, time: performance.now() });
        ripples = ripples.slice(-8);
      }
    };
    const updateMotion = () => {
      reducedMotion = motionQuery.matches;
      ripples = [];
      start();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", ripple, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", start);
    motionQuery.addEventListener("change", updateMotion);
    resize();
    start();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", ripple);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", start);
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  return <canvas ref={canvasRef} className="signin-grid" aria-hidden="true" />;
}
