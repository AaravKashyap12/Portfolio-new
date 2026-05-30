"use client";

import { useEffect, useRef } from "react";

const SPRITE_URL = "/sprites/oneko/oneko.gif";
const FRAME_SIZE = 32;
const NEKO_SPEED = 10;
const FRAME_INTERVAL_MS = 100;
const CLOSE_DISTANCE = 48;
const HOME_PERCH_Y_OFFSET = 3;

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
    let heroVisible = true;
    let unlocked = false;

    const getHomeCenter = () => {
      const home = document.querySelector<HTMLElement>("[data-oneko-home]");
      if (!home) {
        return {
          x: 32,
          y: Math.max(32, window.innerHeight - 88),
        };
      }

      const rect = home.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2 + HOME_PERCH_Y_OFFSET,
      };
    };

    const applyPosition = () => {
      const maxX = Math.max(16, window.innerWidth - 16);
      const maxY = Math.max(16, window.innerHeight - 16);
      nekoPosX = clamp(nekoPosX, 16, maxX);
      nekoPosY = clamp(nekoPosY, 16, maxY);
      cat.style.transform = `translate3d(${nekoPosX - 16}px, ${nekoPosY - 16}px, 0)`;
      cat.style.opacity = heroVisible && !hiddenViewport.matches ? "1" : "0";
    };

    const resetIdleAnimation = () => {
      idleAnimation = null;
      idleAnimationFrame = 0;
    };

    const announceState = (ping = false) => {
      window.dispatchEvent(new CustomEvent("oneko:state", { detail: { awake: unlocked, ping } }));
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

      if (hiddenViewport.matches || !heroVisible) return;

      const home = getHomeCenter();
      const targetX = unlocked ? mousePosX : home.x;
      const targetY = unlocked ? mousePosY : home.y;
      const diffX = nekoPosX - targetX;
      const diffY = nekoPosY - targetY;
      const distance = Math.hypot(diffX, diffY);

      if (distance < NEKO_SPEED || distance < CLOSE_DISTANCE) {
        idle();
        return;
      }

      resetIdleAnimation();

      if (unlocked && idleTime > 1) {
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
      if (!heroVisible) return;
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    };

    const handleResize = () => {
      const home = getHomeCenter();
      if (Math.hypot(nekoPosX - mousePosX, nekoPosY - mousePosY) < CLOSE_DISTANCE) {
        nekoPosX = home.x;
        nekoPosY = home.y;
        mousePosX = home.x;
        mousePosY = home.y;
      }
      applyPosition();
    };

    const returnHome = () => {
      unlocked = false;
      const home = getHomeCenter();
      nekoPosX = home.x;
      nekoPosY = home.y;
      mousePosX = home.x;
      mousePosY = home.y;
      idleTime = 0;
      resetIdleAnimation();
      setSprite(cat, "idle", 0);
      applyPosition();
      announceState(false);
    };

    const toggleHome = () => {
      if (unlocked) {
        returnHome();
        return;
      }

      unlocked = true;
      idleTime = 7;
      resetIdleAnimation();
      setSprite(cat, "alert", 0);
      announceState(true);
    };

    const syncHeroVisibility = () => {
      const heroRect = document.querySelector("#hero")?.getBoundingClientRect();
      heroVisible = Boolean(heroRect && heroRect.bottom > 80 && heroRect.top < window.innerHeight - 80);
      applyPosition();
    };

    const hero = document.querySelector("#hero");
    const observer = hero
      ? new IntersectionObserver(
          ([entry]) => {
            heroVisible = Boolean(entry?.isIntersecting);
            if (heroVisible) {
              const home = getHomeCenter();
              if (Math.hypot(nekoPosX - home.x, nekoPosY - home.y) < CLOSE_DISTANCE * 2) {
                nekoPosX = home.x;
                nekoPosY = home.y;
                mousePosX = home.x;
                mousePosY = home.y;
              }
            }
            applyPosition();
          },
          { threshold: 0.04 }
        )
      : null;

    if (reducedMotion.matches) {
      setSprite(cat, "idle", 0);
      applyPosition();
      return;
    }

    const home = getHomeCenter();
    nekoPosX = home.x;
    nekoPosY = home.y;
    mousePosX = home.x;
    mousePosY = home.y;
    unlocked = false;

    setSprite(cat, "idle", 0);
    applyPosition();
    announceState(false);
    observer?.observe(hero as Element);
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", syncHeroVisibility, { passive: true });
    window.addEventListener("oneko:return-home", returnHome);
    window.addEventListener("oneko:toggle-home", toggleHome);
    rafId = window.requestAnimationFrame(onAnimationFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", syncHeroVisibility);
      window.removeEventListener("oneko:return-home", returnHome);
      window.removeEventListener("oneko:toggle-home", toggleHome);
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
