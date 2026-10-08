import { useEffect, useRef } from "react";

const STAR_COLORS = ["#ffffff", "#e5eeff", "#fff6e7", "#d4e4ff", "#fffdf7"];

function createRandom(seed = 48271) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function HeroStarfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    const random = createRandom();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let stars = [];
    let animationFrame = 0;
    let lastFrame = 0;
    let nextMeteorAt = 2600;
    let meteor = null;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const buildStars = () => {
      const count = Math.min(720, Math.max(260, Math.round((width * height) / 3200)));
      stars = Array.from({ length: count }, () => {
        const brightnessRoll = random();
        const radius =
          brightnessRoll > 0.985
            ? 2.1 + random() * 1.4
            : brightnessRoll > 0.9
              ? 1.05 + random() * 0.9
              : 0.35 + random() * 0.75;

        return {
          x: random(),
          y: random(),
          radius,
          alpha: 0.25 + random() * 0.72,
          phase: random() * Math.PI * 2,
          speed: 0.00035 + random() * 0.0011,
          depth: 0.2 + random() * 0.8,
          color: STAR_COLORS[Math.floor(random() * STAR_COLORS.length)],
        };
      });
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      buildStars();
    };

    const drawStar = (star, time) => {
      const x = star.x * width + pointer.x * star.depth * 16;
      const y = star.y * height + pointer.y * star.depth * 10;
      const twinkle = reducedMotion ? 1 : 0.82 + Math.sin(time * star.speed + star.phase) * 0.18;
      const alpha = Math.max(0.12, star.alpha * twinkle);

      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = star.color;

      if (star.radius > 1.8) {
        context.shadowColor = star.color;
        context.shadowBlur = star.radius * 5;
      }

      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();

      if (star.radius > 2.15) {
        context.globalAlpha = alpha * 0.55;
        context.lineWidth = 0.55;
        context.strokeStyle = star.color;
        context.beginPath();
        context.moveTo(x - star.radius * 4, y);
        context.lineTo(x + star.radius * 4, y);
        context.moveTo(x, y - star.radius * 4);
        context.lineTo(x, y + star.radius * 4);
        context.stroke();
      }
      context.restore();
    };

    const drawMeteor = (time) => {
      if (!meteor && time > nextMeteorAt && !reducedMotion) {
        meteor = {
          startedAt: time,
          startX: width * (0.55 + random() * 0.4),
          startY: height * (0.06 + random() * 0.26),
          duration: 900 + random() * 450,
        };
        nextMeteorAt = time + 7000 + random() * 8000;
      }

      if (!meteor) return;
      const progress = (time - meteor.startedAt) / meteor.duration;
      if (progress >= 1) {
        meteor = null;
        return;
      }

      const eased = 1 - Math.pow(1 - progress, 2);
      const x = meteor.startX - eased * width * 0.5;
      const y = meteor.startY + eased * height * 0.28;
      const tailX = x + 130 + progress * 110;
      const tailY = y - 72 - progress * 54;
      const gradient = context.createLinearGradient(x, y, tailX, tailY);
      gradient.addColorStop(0, "rgba(255,255,255,0.95)");
      gradient.addColorStop(0.15, "rgba(205,226,255,0.7)");
      gradient.addColorStop(1, "rgba(205,226,255,0)");

      context.save();
      context.globalAlpha = Math.sin(progress * Math.PI);
      context.strokeStyle = gradient;
      context.lineWidth = 1.4;
      context.shadowColor = "#d8e9ff";
      context.shadowBlur = 8;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(tailX, tailY);
      context.stroke();
      context.restore();
    };

    const render = (time = 0) => {
      if (!reducedMotion && time - lastFrame < 1000 / 45) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }
      lastFrame = time;
      pointer.x += (pointer.targetX - pointer.x) * 0.025;
      pointer.y += (pointer.targetY - pointer.y) * 0.025;
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => drawStar(star, time));
      drawMeteor(time);

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (event) => {
      pointer.targetX = event.clientX / window.innerWidth - 0.5;
      pointer.targetY = event.clientY / window.innerHeight - 0.5;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    resize();
    render();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="hero-starfield">
      <div className="hero-starfield__nebula hero-starfield__nebula--violet" />
      <div className="hero-starfield__nebula hero-starfield__nebula--teal" />
      <div className="hero-starfield__milky-way" />
      <canvas className="hero-starfield__canvas" ref={canvasRef} />
      <div className="hero-starfield__vignette" />
    </div>
  );
}

export default HeroStarfield;
