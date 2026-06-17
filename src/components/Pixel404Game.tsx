"use client";

import { useEffect, useRef, useState } from "react";

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: "link" | "folder" | "block";
};

type Cloud = {
  x: number;
  y: number;
  speed: number;
  width: number;
};

type GameState = {
  width: number;
  height: number;
  dpr: number;
  running: boolean;
  gameOver: boolean;
  started: boolean;
  catX: number;
  catY: number;
  velocityY: number;
  groundY: number;
  speed: number;
  score: number;
  best: number;
  lastTime: number;
  frame: number;
  nextObstacle: number;
  obstacles: Obstacle[];
  clouds: Cloud[];
};

const BASE_WIDTH = 760;
const BASE_HEIGHT = 300;
const CAT_SIZE = 32;
const GRAVITY = 0.0019;
const JUMP_POWER = -0.72;
const START_SPEED = 0.28;
const MAX_SPEED = 0.58;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawPixelCat(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const s = 3;
  const bob = frame % 18 < 9 ? 0 : 1;
  const px = (col: number, row: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x + col * s), Math.round(y + row * s + bob), w * s, h * s);
  };
  const step = Math.floor(frame / 7) % 2;
  const fur = "#f4f0e7";
  const shade = "rgba(244, 240, 231, 0.48)";
  const ink = "#070706";
  const blush = "#c8d68c";

  ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
  ctx.fillRect(Math.round(x + 2 * s), Math.round(y + 13 * s + 1), 11 * s, 1 * s);

  px(3, 2, 2, 2, fur);
  px(9, 2, 2, 2, fur);
  px(4, 1, 1, 1, fur);
  px(10, 1, 1, 1, fur);
  px(4, 3, 7, 1, shade);
  px(3, 4, 9, 6, fur);
  px(4, 5, 7, 1, "#fffaf0");
  px(5, 6, 1, 1, ink);
  px(9, 6, 1, 1, ink);
  px(7, 7, 1, 1, ink);
  px(6, 8, 3, 1, ink);
  px(2, 7, 1, 1, shade);
  px(12, 7, 1, 1, shade);
  px(4, 8, 1, 1, blush);
  px(10, 8, 1, 1, blush);

  px(4, 10, 7, 3, fur);
  px(3, 11, 2, 2, fur);
  px(10, 11, 2, 2, fur);
  px(step === 0 ? 4 : 5, 13, 2, 1, fur);
  px(step === 0 ? 9 : 8, 13, 2, 1, fur);
  px(12, 10, 1, 2, fur);
  px(13, 9, 1, 1, fur);
  px(1, 10, 2, 1, fur);
  px(0, 9, 1, 1, fur);
}

function drawPixelCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, frame: number) {
  const unit = Math.max(3, Math.round(cloud.width / 15));
  const x = Math.round(cloud.x);
  const y = Math.round(cloud.y + Math.sin((frame + cloud.x) * 0.012) * 1.5);
  const fill = "rgba(244, 240, 231, 0.09)";
  const edge = "rgba(244, 240, 231, 0.18)";

  ctx.fillStyle = fill;
  ctx.fillRect(x + unit * 2, y + unit * 2, unit * 10, unit * 2);
  ctx.fillRect(x + unit * 4, y + unit, unit * 4, unit);
  ctx.fillRect(x + unit * 8, y + unit, unit * 3, unit);
  ctx.fillRect(x + unit, y + unit * 3, unit * 13, unit);

  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + unit * 2 + 0.5, y + unit * 2 + 0.5, unit * 10, unit * 2);
}

function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  ctx.strokeStyle = "rgba(244, 240, 231, 0.58)";
  ctx.fillStyle = "rgba(244, 240, 231, 0.08)";
  ctx.lineWidth = 2;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  ctx.strokeRect(obstacle.x + 0.5, obstacle.y + 0.5, obstacle.width, obstacle.height);

  ctx.fillStyle = "rgba(244, 240, 231, 0.78)";
  ctx.font = "700 12px Geist Mono, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (obstacle.kind === "link") {
    ctx.fillText("404", obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
    return;
  }

  if (obstacle.kind === "folder") {
    ctx.fillRect(obstacle.x + 7, obstacle.y + 8, 16, 4);
    ctx.strokeRect(obstacle.x + 7, obstacle.y + 12, 28, 18);
    return;
  }

  ctx.fillText("X", obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
}

function drawScene(ctx: CanvasRenderingContext2D, state: GameState) {
  const { width, height, groundY } = state;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(244, 240, 231, 0.018)");
  gradient.addColorStop(1, "rgba(200, 214, 140, 0.045)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  state.clouds.forEach((cloud) => drawPixelCloud(ctx, cloud, state.frame));

  ctx.strokeStyle = "rgba(244, 240, 231, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 0.5);
  ctx.lineTo(width, groundY + 0.5);
  ctx.stroke();

  state.obstacles.forEach((obstacle) => drawObstacle(ctx, obstacle));
  drawPixelCat(ctx, state.catX, state.catY, state.frame);

}

function makeObstacle(width: number, groundY: number): Obstacle {
  const kind = (["link", "folder", "block"] as const)[Math.floor(Math.random() * 3)];
  const size = kind === "folder" ? { width: 44, height: 32 } : kind === "link" ? { width: 48, height: 28 } : { width: 30, height: 38 };
  return {
    x: width + 24,
    y: groundY - size.height,
    width: size.width,
    height: size.height,
    kind,
  };
}

export default function Pixel404Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "lost">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      const cssWidth = clamp(rect.width, 280, BASE_WIDTH);
      const cssHeight = Math.max(250, Math.min(BASE_HEIGHT, cssWidth * 0.42));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const previous = stateRef.current;
      stateRef.current = {
        width: cssWidth,
        height: cssHeight,
        dpr,
        running: previous?.running ?? false,
        gameOver: previous?.gameOver ?? false,
        started: previous?.started ?? false,
        catX: Math.max(46, cssWidth * 0.12),
        catY: cssHeight - 72,
        velocityY: previous?.velocityY ?? 0,
        groundY: cssHeight - 34,
        speed: previous?.speed ?? START_SPEED,
        score: previous?.score ?? 0,
        best: previous?.best ?? 0,
        lastTime: previous?.lastTime ?? 0,
        frame: previous?.frame ?? 0,
        nextObstacle: previous?.nextObstacle ?? 900,
        obstacles: previous?.obstacles ?? [],
        clouds:
          previous?.clouds ?? [
            { x: cssWidth * 0.18, y: 62, speed: 0.018, width: 46 },
            { x: cssWidth * 0.58, y: 96, speed: 0.014, width: 64 },
            { x: cssWidth * 0.82, y: 54, speed: 0.012, width: 38 },
          ],
      };
    };

    const reset = (start = true) => {
      const state = stateRef.current;
      if (!state) return;
      state.running = start && !reducedMotion.matches;
      state.gameOver = false;
      state.started = start;
      state.catY = state.groundY - CAT_SIZE;
      state.velocityY = 0;
      state.speed = START_SPEED;
      state.score = 0;
      state.nextObstacle = 700;
      state.obstacles = [];
      setStatus(start && !reducedMotion.matches ? "running" : "idle");
      setScore(0);
    };

    const jump = () => {
      const state = stateRef.current;
      if (!state || reducedMotion.matches) return;
      if (!state.running) {
        reset(true);
        return;
      }
      if (state.catY >= state.groundY - CAT_SIZE - 1) {
        state.velocityY = JUMP_POWER;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "Enter") {
        event.preventDefault();
        jump();
      }
    };

    const onPointerDown = () => jump();

    const tick = (time: number) => {
      if (disposed) return;
      const state = stateRef.current;
      if (!state) return;

      const delta = state.lastTime ? Math.min(34, time - state.lastTime) : 16;
      state.lastTime = time;

      if (state.running) {
        state.frame += 1;
        state.score += delta * 0.018;
        state.speed = Math.min(MAX_SPEED, START_SPEED + state.score * 0.0008);
        state.nextObstacle -= delta;

        if (state.nextObstacle <= 0) {
          state.obstacles.push(makeObstacle(state.width, state.groundY));
          state.nextObstacle = 860 + Math.random() * 620 - state.speed * 420;
        }

        state.velocityY += GRAVITY * delta;
        state.catY += state.velocityY * delta;
        if (state.catY > state.groundY - CAT_SIZE) {
          state.catY = state.groundY - CAT_SIZE;
          state.velocityY = 0;
        }

        state.obstacles = state.obstacles
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - state.speed * delta }))
          .filter((obstacle) => obstacle.x + obstacle.width > -20);

        state.clouds.forEach((cloud) => {
          cloud.x -= cloud.speed * delta;
          if (cloud.x + cloud.width < 0) {
            cloud.x = state.width + 20;
            cloud.y = 54 + Math.random() * 76;
          }
        });

        const catBox = {
          x: state.catX + 5,
          y: state.catY + 6,
          width: 25,
          height: 25,
        };

        if (state.obstacles.some((obstacle) => rectsOverlap(catBox, obstacle))) {
          state.running = false;
          state.gameOver = true;
          state.best = Math.max(state.best, Math.floor(state.score));
          setStatus("lost");
          setBest(state.best);
        }

        setScore(Math.floor(state.score));
      } else {
        state.frame += 1;
        state.clouds.forEach((cloud) => {
          cloud.x -= cloud.speed * delta * 0.4;
          if (cloud.x + cloud.width < 0) {
            cloud.x = state.width + 28;
            cloud.y = 48 + Math.random() * 70;
          }
        });
      }

      drawScene(ctx, state);
      raf = window.requestAnimationFrame(tick);
    };

    resize();
    reset(false);
    drawScene(ctx, stateRef.current as GameState);
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", onPointerDown);

    const observer = new ResizeObserver(resize);
    observer.observe(shell);
    raf = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className={`not-found-game is-${status}`} ref={shellRef}>
      <div className="not-found-game-head">
        <span>cat://lost-route</span>
        <strong>{String(score).padStart(5, "0")}</strong>
      </div>
      <div className="not-found-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="not-found-canvas"
          role="img"
          aria-label="Pixel cat runner game. Press space, enter, or tap to jump."
        />
        <div className="not-found-game-state" aria-hidden={status !== "lost"}>
          <strong>CRASHED LINK</strong>
          <span>tap / space to retry</span>
        </div>
      </div>
      <div className="not-found-game-foot">
        <span>{status === "running" ? "space / tap to jump" : status === "lost" ? "crashed link / tap to retry" : "press space to start"}</span>
        <span>BEST {String(best).padStart(5, "0")}</span>
      </div>
    </div>
  );
}
