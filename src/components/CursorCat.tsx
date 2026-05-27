"use client";

import { useEffect, useRef } from "react";

const FRAME_SIZE = 32;
const COLUMNS = 11;
const SCALE = 2;
const FOLLOW_DISTANCE = 18;
const IDLE_DELAY_MS = 3000;
const SLEEP_DELAY_MS = 10000;
const CLOSE_DISTANCE = 24;
const FAR_DISTANCE = 220;
const WALK_FPS = 8;
const IDLE_FPS = 4;
const SPRITE_URL = "/sprites/cat/cat.png";

const REST_X = 30;
const REST_Y_RATIO = 0.82;
const IDLE_SWAP_MS = 4200;
const PAW_DISTANCE = 92;
const PAW_DURATION_MS = 820;

const CAT_ANIMS = {
  walkDown: { row: 4, frames: 4, fps: WALK_FPS },
  walkUp: { row: 5, frames: 4, fps: WALK_FPS },
  walkRight: { row: 6, frames: 8, fps: 10 },
  walkLeft: { row: 7, frames: 8, fps: 10 },
  sleep: { row: 12, frames: 2, fps: 2 },
  eatDown: { row: 20, frames: 8, fps: 7 },
  meowSit: { row: 28, frames: 3, fps: IDLE_FPS },
  yawnSit: { row: 32, frames: 8, fps: 6 },
  washSit: { row: 36, frames: 8, fps: 6 },
  pawDown: { row: 44, frames: 8, fps: 10 },
  pawUp: { row: 45, frames: 5, fps: 10 },
  pawLeft: { row: 46, frames: 8, fps: 10 },
  pawRight: { row: 47, frames: 8, fps: 10 },
} as const;

type CatAnimationName = keyof typeof CAT_ANIMS;

const IDLE_ANIMS: CatAnimationName[] = ["meowSit", "washSit", "yawnSit", "eatDown"];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function setSpriteFrame(element: HTMLDivElement, animationName: CatAnimationName, frameIndex: number) {
  const animation = CAT_ANIMS[animationName];
  const frame = frameIndex % animation.frames;
  const frameX = frame * FRAME_SIZE;
  const frameY = animation.row * FRAME_SIZE;
  element.style.backgroundPosition = `-${frameX}px -${frameY}px`;
}

function pickIdleAnimation() {
  return IDLE_ANIMS[Math.floor(Math.random() * IDLE_ANIMS.length)];
}

function getMovementAnimation(dx: number, dy: number): CatAnimationName {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "walkRight" : "walkLeft";
  }

  return dy > 0 ? "walkDown" : "walkUp";
}

function getPawAnimation(dx: number, dy: number): CatAnimationName {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "pawRight" : "pawLeft";
  }

  return dy > 0 ? "pawDown" : "pawUp";
}

function getFollowEase(distance: number) {
  if (distance <= CLOSE_DISTANCE) return 0;

  const t = clamp((distance - CLOSE_DISTANCE) / (FAR_DISTANCE - CLOSE_DISTANCE), 0, 1);
  return lerp(0.035, 0.105, t);
}

export default function CursorCat() {
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = catRef.current;
    const hero = cat?.parentElement;
    if (!cat || !hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hiddenViewport = window.matchMedia("(max-width: 767px)");

    let rafId = 0;
    let lastTimestamp = performance.now();
    let frameTimer = 0;
    let frameIndex = 0;
    let currentAnimation: CatAnimationName = "meowSit";
    let idleAnimation: CatAnimationName = pickIdleAnimation();
    let nextIdleSwap = performance.now() + IDLE_SWAP_MS;
    let forcedAnimation: CatAnimationName | null = null;
    let forcedUntil = 0;
    let lastPointerMove = performance.now();
    let pointerInsideHero = false;

    const catPosition = { x: REST_X, y: 0 };
    const targetPosition = { x: REST_X, y: 0 };

    const getHeroRect = () => hero.getBoundingClientRect();
    const catSize = () => FRAME_SIZE * SCALE;

    const getRestPosition = () => {
      const rect = getHeroRect();
      return {
        x: REST_X,
        y: rect.height * REST_Y_RATIO,
      };
    };

    const clampToHero = (point: { x: number; y: number }) => {
      const rect = getHeroRect();
      const size = catSize();
      point.x = clamp(point.x, 8, Math.max(8, rect.width - size - 8));
      point.y = clamp(point.y, 8, Math.max(8, rect.height - size - 8));
    };

    const applyTransform = () => {
      cat.style.transform = `translate3d(${catPosition.x}px, ${catPosition.y}px, 0) scale(${SCALE})`;
    };

    const setAnimation = (nextAnimation: CatAnimationName) => {
      if (nextAnimation === currentAnimation) return;
      currentAnimation = nextAnimation;
      frameIndex = 0;
      frameTimer = 0;
    };

    const moveTargetToRest = () => {
      const rest = getRestPosition();
      targetPosition.x = rest.x;
      targetPosition.y = rest.y;
      clampToHero(targetPosition);
    };

    const resetPosition = () => {
      moveTargetToRest();
      catPosition.x = targetPosition.x;
      catPosition.y = targetPosition.y;
      applyTransform();
      cat.style.opacity = "1";
      setSpriteFrame(cat, "meowSit", 0);
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = getHeroRect();
      pointerInsideHero = true;
      lastPointerMove = performance.now();

      targetPosition.x = event.clientX - rect.left - catSize() / 2 + FOLLOW_DISTANCE;
      targetPosition.y = event.clientY - rect.top - catSize() / 2 + FOLLOW_DISTANCE;
      clampToHero(targetPosition);
    };

    const handlePointerLeave = () => {
      pointerInsideHero = false;
      moveTargetToRest();
    };

    const handleClick = (event: MouseEvent) => {
      const rect = getHeroRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const catCenterX = catPosition.x + catSize() / 2;
      const catCenterY = catPosition.y + catSize() / 2;
      const dx = clickX - catCenterX;
      const dy = clickY - catCenterY;

      if (Math.hypot(dx, dy) <= PAW_DISTANCE) {
        forcedAnimation = getPawAnimation(dx, dy);
        forcedUntil = performance.now() + PAW_DURATION_MS;
      }
    };

    const tick = (timestamp: number) => {
      const delta = Math.min(48, timestamp - lastTimestamp);
      lastTimestamp = timestamp;

      if (hiddenViewport.matches) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (!pointerInsideHero) {
        moveTargetToRest();
      }

      let dx = targetPosition.x - catPosition.x;
      let dy = targetPosition.y - catPosition.y;
      let distance = Math.hypot(dx, dy);

      const forceCanBeInterrupted =
        forcedAnimation && timestamp < forcedUntil && pointerInsideHero && distance > FAR_DISTANCE * 1.25;

      if (forceCanBeInterrupted) {
        forcedAnimation = null;
        forcedUntil = 0;
      }

      const ease = getFollowEase(distance) * (pointerInsideHero ? 1 : 0.55) * (delta / 16.67);

      if (ease > 0 && (!forcedAnimation || timestamp >= forcedUntil || forceCanBeInterrupted)) {
        catPosition.x += dx * ease;
        catPosition.y += dy * ease;
        clampToHero(catPosition);
      } else if (distance <= CLOSE_DISTANCE) {
        catPosition.x = targetPosition.x;
        catPosition.y = targetPosition.y;
      }

      applyTransform();

      dx = targetPosition.x - catPosition.x;
      dy = targetPosition.y - catPosition.y;
      distance = Math.hypot(dx, dy);

      if (forcedAnimation && timestamp < forcedUntil) {
        setAnimation(forcedAnimation);
      } else {
        forcedAnimation = null;
        const idleTime = timestamp - lastPointerMove;

        if (distance > CLOSE_DISTANCE && (pointerInsideHero || distance > CLOSE_DISTANCE * 1.5)) {
          setAnimation(getMovementAnimation(dx, dy));
        } else if (idleTime >= SLEEP_DELAY_MS) {
          setAnimation("sleep");
        } else if (idleTime >= IDLE_DELAY_MS) {
          if (timestamp >= nextIdleSwap) {
            idleAnimation = pickIdleAnimation();
            nextIdleSwap = timestamp + IDLE_SWAP_MS;
          }
          setAnimation(idleAnimation);
        } else {
          setAnimation("meowSit");
        }
      }

      const animation = CAT_ANIMS[currentAnimation];
      const frameDuration = 1000 / animation.fps;
      frameTimer += delta;
      if (frameTimer >= frameDuration) {
        frameIndex = (frameIndex + Math.floor(frameTimer / frameDuration)) % animation.frames;
        frameTimer %= frameDuration;
      }
      setSpriteFrame(cat, currentAnimation, frameIndex);

      rafId = window.requestAnimationFrame(tick);
    };

    if (reducedMotion.matches) {
      resetPosition();
      setSpriteFrame(cat, "meowSit", 0);
      return;
    }

    resetPosition();
    hero.addEventListener("mousemove", handlePointerMove, { passive: true });
    hero.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    hero.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("resize", resetPosition, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      hero.removeEventListener("mousemove", handlePointerMove);
      hero.removeEventListener("mouseleave", handlePointerLeave);
      hero.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resetPosition);
    };
  }, []);

  return (
    <div
      ref={catRef}
      className="cursor-cat"
      aria-hidden="true"
      style={{
        backgroundImage: `url(${SPRITE_URL})`,
        backgroundSize: `${COLUMNS * FRAME_SIZE}px auto`,
      }}
    />
  );
}
