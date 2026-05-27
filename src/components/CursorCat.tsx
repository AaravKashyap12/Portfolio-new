"use client";

import { useEffect, useRef } from "react";

const SPRITE_URL = "/sprites/oneko/oneko.gif";
const FRAME_SIZE = 32;
const NEKO_SPEED = 10;
const FRAME_INTERVAL_MS = 100;
const CLOSE_DISTANCE = 48;

const spriteSets = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [0, 0],
    [0, -1],
  ],
  scratchWallS: [
    [-7, -1],
    [-6, -2],
  ],
  scratchWallE: [
    [-2, -2],
    [-2, -3],
  ],
  scratchWallW: [
    [-4, 0],
    [-4, -1],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
} as const;

type SpriteName = keyof typeof spriteSets;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function setSprite(element: HTMLDivElement, name: SpriteName, frame: number) {
  const sprite = spriteSets[name][frame % spriteSets[name].length];
  element.style.backgroundPosition = `${sprite[0] * FRAME_SIZE}px ${sprite[1] * FRAME_SIZE}px`;
}

export default function CursorCat() {
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = catRef.current;
    if (!cat) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hiddenViewport = window.matchMedia("(max-width: 767px)");

    let rafId = 0;
    let lastFrameTimestamp = 0;
    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation: SpriteName | null = null;
    let idleAnimationFrame = 0;
    let nekoPosX = 32;
    let nekoPosY = Math.max(32, window.innerHeight - 88);
    let mousePosX = window.innerWidth / 2;
    let mousePosY = window.innerHeight / 2;

    const applyPosition = () => {
      const maxX = Math.max(16, window.innerWidth - 16);
      const maxY = Math.max(16, window.innerHeight - 16);
      nekoPosX = clamp(nekoPosX, 16, maxX);
      nekoPosY = clamp(nekoPosY, 16, maxY);
      cat.style.transform = `translate3d(${nekoPosX - 16}px, ${nekoPosY - 16}px, 0)`;
      cat.style.opacity = "1";
    };

    const resetIdleAnimation = () => {
      idleAnimation = null;
      idleAnimationFrame = 0;
    };

    const idle = () => {
      idleTime += 1;

      if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
        const availableIdleAnimations: SpriteName[] = ["sleeping", "scratchSelf"];
        if (nekoPosX < 32) availableIdleAnimations.push("scratchWallW");
        if (nekoPosY < 32) availableIdleAnimations.push("scratchWallN");
        if (nekoPosX > window.innerWidth - 32) availableIdleAnimations.push("scratchWallE");
        if (nekoPosY > window.innerHeight - 32) availableIdleAnimations.push("scratchWallS");
        idleAnimation = availableIdleAnimations[Math.floor(Math.random() * availableIdleAnimations.length)];
      }

      switch (idleAnimation) {
        case "sleeping":
          if (idleAnimationFrame < 8) {
            setSprite(cat, "tired", 0);
            break;
          }
          setSprite(cat, "sleeping", Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdleAnimation();
          break;
        case "scratchWallN":
        case "scratchWallS":
        case "scratchWallE":
        case "scratchWallW":
        case "scratchSelf":
          setSprite(cat, idleAnimation, idleAnimationFrame);
          if (idleAnimationFrame > 9) resetIdleAnimation();
          break;
        default:
          setSprite(cat, "idle", 0);
          return;
      }

      idleAnimationFrame += 1;
    };

    const frame = () => {
      frameCount += 1;

      if (hiddenViewport.matches) return;

      const diffX = nekoPosX - mousePosX;
      const diffY = nekoPosY - mousePosY;
      const distance = Math.hypot(diffX, diffY);

      if (distance < NEKO_SPEED || distance < CLOSE_DISTANCE) {
        idle();
        return;
      }

      resetIdleAnimation();

      if (idleTime > 1) {
        setSprite(cat, "alert", 0);
        idleTime = Math.min(idleTime, 7) - 1;
        return;
      }

      let direction = "";
      direction += diffY / distance > 0.5 ? "N" : "";
      direction += diffY / distance < -0.5 ? "S" : "";
      direction += diffX / distance > 0.5 ? "W" : "";
      direction += diffX / distance < -0.5 ? "E" : "";

      setSprite(cat, (direction || "idle") as SpriteName, frameCount);

      nekoPosX -= (diffX / distance) * NEKO_SPEED;
      nekoPosY -= (diffY / distance) * NEKO_SPEED;
      applyPosition();
    };

    const onAnimationFrame = (timestamp: number) => {
      if (!cat.isConnected) return;

      if (!lastFrameTimestamp) {
        lastFrameTimestamp = timestamp;
      }

      if (timestamp - lastFrameTimestamp > FRAME_INTERVAL_MS) {
        lastFrameTimestamp = timestamp;
        frame();
      }

      rafId = window.requestAnimationFrame(onAnimationFrame);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    };

    const handleResize = () => {
      applyPosition();
    };

    if (reducedMotion.matches) {
      setSprite(cat, "idle", 0);
      applyPosition();
      return;
    }

    setSprite(cat, "idle", 0);
    applyPosition();
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    rafId = window.requestAnimationFrame(onAnimationFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={catRef}
      className="cursor-cat"
      aria-hidden="true"
      style={{ backgroundImage: `url(${SPRITE_URL})` }}
    />
  );
}
