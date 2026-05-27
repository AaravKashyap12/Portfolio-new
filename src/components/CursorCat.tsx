"use client";

import { useEffect, useRef } from "react";

const FRAME_SIZE = 32;
const COLUMNS = 11;
const SCALE = 2;
const SPRITE_URL = "/sprites/cat/cat.png";

const CAT_TUNING = {
  baseFollow: 0.055,
  distanceFollow: 0.00042,
  maxFollow: 0.2,
  animationFpsMultiplier: 1,
  cursorOffsetX: 18,
  cursorOffsetY: 22,
  idleDelayMs: 3_000,
  sleepDelayMs: 10_000,
  idleSwapMs: 4_500,
  clickDistance: 92,
  pawDurationMs: 850,
  observeDistance: 96,
};

const CAT_ANIMS = {
  walkDown: { row: 4, frames: 4, fps: 8 },
  walkUp: { row: 5, frames: 4, fps: 8 },
  walkRight: { row: 6, frames: 8, fps: 10 },
  walkLeft: { row: 7, frames: 8, fps: 10 },
  sleep: { row: 12, frames: 2, fps: 2 },
  eatDown: { row: 20, frames: 8, fps: 7 },
  meowSit: { row: 28, frames: 3, fps: 4 },
  yawnSit: { row: 32, frames: 8, fps: 6 },
  washSit: { row: 36, frames: 8, fps: 6 },
  scratchLeft: { row: 39, frames: 11, fps: 10 },
  scratchRight: { row: 40, frames: 11, fps: 10 },
  pawDown: { row: 44, frames: 8, fps: 10 },
  pawUp: { row: 45, frames: 5, fps: 10 },
  pawLeft: { row: 46, frames: 8, fps: 10 },
  pawRight: { row: 47, frames: 8, fps: 10 },
  hindLegs: { row: 52, frames: 4, fps: 5 },
} as const;

type CatAnimationName = keyof typeof CAT_ANIMS;

const IDLE_ANIMS: CatAnimationName[] = ["meowSit", "yawnSit", "washSit", "sleep"];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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

function isNearSocialLink(event: MouseEvent) {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest(".social-icon, .contact-links a, .footer-links a, .contact-action")) {
    return true;
  }

  const links = Array.from(document.querySelectorAll(".social-icon"));
  return links.some((link) => {
    const rect = link.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.hypot(event.clientX - centerX, event.clientY - centerY) <= CAT_TUNING.observeDistance;
  });
}

export default function CursorCat() {
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = catRef.current;
    if (!cat) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hiddenViewport = window.matchMedia("(max-width: 767px)");

    let rafId = 0;
    let lastTimestamp = performance.now();
    let frameTimer = 0;
    let frameIndex = 0;
    let currentAnimation: CatAnimationName = "sleep";
    let idleAnimation: CatAnimationName = pickIdleAnimation();
    let nextIdleSwap = performance.now() + CAT_TUNING.idleSwapMs;
    let forcedAnimation: CatAnimationName | null = null;
    let forcedUntil = 0;
    let observeUntil = 0;
    let lastMouseMove = performance.now();

    const catPosition = {
      x: 24,
      y: Math.max(80, window.innerHeight - FRAME_SIZE * SCALE - 96),
    };
    const targetPosition = {
      x: window.innerWidth * 0.32,
      y: window.innerHeight * 0.72,
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

    const handleMouseMove = (event: MouseEvent) => {
      targetPosition.x = event.clientX + CAT_TUNING.cursorOffsetX;
      targetPosition.y = event.clientY + CAT_TUNING.cursorOffsetY;
      lastMouseMove = performance.now();

      if (isNearSocialLink(event)) {
        observeUntil = lastMouseMove + 1_300;
      }
    };

    const handleClick = (event: MouseEvent) => {
      const catCenterX = catPosition.x + (FRAME_SIZE * SCALE) / 2;
      const catCenterY = catPosition.y + (FRAME_SIZE * SCALE) / 2;
      const distance = Math.hypot(event.clientX - catCenterX, event.clientY - catCenterY);

      if (distance <= CAT_TUNING.clickDistance) {
        forcedAnimation = "pawDown";
        forcedUntil = performance.now() + CAT_TUNING.pawDurationMs;
      }
    };

    const syncStaticFrame = () => {
      catPosition.x = 24;
      catPosition.y = Math.max(80, window.innerHeight - FRAME_SIZE * SCALE - 96);
      applyTransform();
      setSpriteFrame(cat, "sleep", 0);
    };

    const tick = (timestamp: number) => {
      const delta = Math.min(48, timestamp - lastTimestamp);
      lastTimestamp = timestamp;

      if (hiddenViewport.matches) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      const dx = targetPosition.x - catPosition.x;
      const dy = targetPosition.y - catPosition.y;
      const distance = Math.hypot(dx, dy);
      const idleTime = timestamp - lastMouseMove;
      const shouldWalk = distance > 5 && idleTime < CAT_TUNING.idleDelayMs;

      if (shouldWalk) {
        const follow = clamp(
          CAT_TUNING.baseFollow + distance * CAT_TUNING.distanceFollow,
          CAT_TUNING.baseFollow,
          CAT_TUNING.maxFollow
        );
        catPosition.x += dx * follow * (delta / 16.67);
        catPosition.y += dy * follow * (delta / 16.67);
      }

      catPosition.x = clamp(catPosition.x, 8, window.innerWidth - FRAME_SIZE * SCALE - 8);
      catPosition.y = clamp(catPosition.y, 8, window.innerHeight - FRAME_SIZE * SCALE - 8);
      applyTransform();

      if (forcedAnimation && timestamp < forcedUntil) {
        setAnimation(forcedAnimation);
      } else {
        forcedAnimation = null;

        if (timestamp < observeUntil && !shouldWalk) {
          setAnimation("hindLegs");
        } else if (shouldWalk) {
          if (Math.abs(dx) >= Math.abs(dy)) {
            setAnimation(dx > 0 ? "walkRight" : "walkLeft");
          } else {
            setAnimation(dy > 0 ? "walkDown" : "walkUp");
          }
        } else if (idleTime >= CAT_TUNING.sleepDelayMs) {
          setAnimation("sleep");
        } else if (idleTime >= CAT_TUNING.idleDelayMs) {
          if (timestamp >= nextIdleSwap) {
            idleAnimation = pickIdleAnimation();
            nextIdleSwap = timestamp + CAT_TUNING.idleSwapMs;
          }
          setAnimation(idleAnimation);
        } else {
          setAnimation("meowSit");
        }
      }

      const animation = CAT_ANIMS[currentAnimation];
      const frameDuration = 1000 / (animation.fps * CAT_TUNING.animationFpsMultiplier);
      frameTimer += delta;
      if (frameTimer >= frameDuration) {
        frameIndex = (frameIndex + Math.floor(frameTimer / frameDuration)) % animation.frames;
        frameTimer %= frameDuration;
      }
      setSpriteFrame(cat, currentAnimation, frameIndex);

      rafId = window.requestAnimationFrame(tick);
    };

    if (reducedMotion.matches) {
      syncStaticFrame();
    } else {
      applyTransform();
      setSpriteFrame(cat, "meowSit", 0);
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("click", handleClick, { passive: true });
      window.addEventListener("resize", syncStaticFrame, { passive: true });
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", syncStaticFrame);
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
