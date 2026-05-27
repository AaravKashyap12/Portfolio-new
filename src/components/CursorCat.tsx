"use client";

import { useEffect, useRef } from "react";

const FRAME_SIZE = 32;
const COLUMNS = 11;
const SCALE = 2;
const SPRITE_URL = "/sprites/cat/cat.png";

const CAT_TUNING = {
  walkSpeedPxPerSecond: 120,
  introSpeedPxPerSecond: 135,
  escapeSpeedPxPerSecond: 150,
  animationFpsMultiplier: 1,
  cursorOffsetX: 18,
  cursorOffsetY: 22,
  mouseFollowDelayMs: 850,
  introArrivalDistance: 18,
  idleDelayMs: 3_000,
  sleepDelayMs: 10_000,
  idleSwapMs: 4_500,
  clickDistance: 92,
  pawDurationMs: 850,
  observeDistance: 96,
  obstructionPadding: 12,
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

const IDLE_ANIMS: CatAnimationName[] = [
  "meowSit",
  "yawnSit",
  "washSit",
  "eatDown",
  "scratchLeft",
  "scratchRight",
  "hindLegs",
];

const OBSTRUCTION_SELECTORS = [
  "a",
  "button",
  ".custom-tweet",
  ".hero-stats",
  ".proj-card",
  ".pm-diagram",
  ".expertise-band",
  ".service-card",
  ".contact-action",
  ".github-graph-panel",
].join(",");

type MouseSample = {
  x: number;
  y: number;
  timestamp: number;
};

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

function rectsOverlap(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function makeCatRect(x: number, y: number) {
  const size = FRAME_SIZE * SCALE;
  return new DOMRect(x, y, size, size);
}

function findObstruction(cat: HTMLDivElement, catRect: DOMRect) {
  const elements = Array.from(document.querySelectorAll(OBSTRUCTION_SELECTORS));

  return elements.find((element) => {
    if (element === cat || element.contains(cat)) return false;

    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    const style = window.getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) return false;

    return rectsOverlap(catRect, rect);
  });
}

function moveToward(
  position: { x: number; y: number },
  target: { x: number; y: number },
  speedPxPerSecond: number,
  deltaMs: number
) {
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= 0.01) return { dx, dy, distance };

  const step = Math.min(distance, speedPxPerSecond * (deltaMs / 1000));
  position.x += (dx / distance) * step;
  position.y += (dy / distance) * step;

  return { dx, dy, distance };
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
    let escapeUntil = 0;
    let escapeDirection: "up" | "down" = "down";
    let lastMouseMove = performance.now();
    let introComplete = false;
    let hasMouseInput = false;
    const mouseSamples: MouseSample[] = [];

    const catPosition = {
      x: 24,
      y: Math.max(80, window.innerHeight - FRAME_SIZE * SCALE - 96),
    };
    const targetPosition = {
      x: 80,
      y: 72,
    };

    const getIntroTarget = () => {
      const brand = document.querySelector(".nav-brand");
      if (brand) {
        const rect = brand.getBoundingClientRect();
        return {
          x: rect.left + 8,
          y: rect.bottom + 14,
        };
      }

      return { x: 80, y: 72 };
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
      const now = performance.now();
      mouseSamples.push({
        x: event.clientX + CAT_TUNING.cursorOffsetX,
        y: event.clientY + CAT_TUNING.cursorOffsetY,
        timestamp: now,
      });
      hasMouseInput = true;
      if (mouseSamples.length > 40) {
        mouseSamples.splice(0, mouseSamples.length - 40);
      }
      lastMouseMove = now;

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
      const introTarget = getIntroTarget();
      targetPosition.x = introTarget.x;
      targetPosition.y = introTarget.y;
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

      if (!introComplete) {
        const introTarget = getIntroTarget();
        targetPosition.x = introTarget.x;
        targetPosition.y = introTarget.y;
      } else {
        let maturedSampleIndex = -1;
        for (let i = mouseSamples.length - 1; i >= 0; i -= 1) {
          if (timestamp - mouseSamples[i].timestamp >= CAT_TUNING.mouseFollowDelayMs) {
            maturedSampleIndex = i;
            break;
          }
        }

        if (maturedSampleIndex >= 0) {
          const sample = mouseSamples[maturedSampleIndex];
          targetPosition.x = sample.x;
          targetPosition.y = sample.y;
          mouseSamples.splice(0, maturedSampleIndex + 1);
        }
      }

      let dx = targetPosition.x - catPosition.x;
      let dy = targetPosition.y - catPosition.y;
      let distance = Math.hypot(dx, dy);
      const idleTime = timestamp - lastMouseMove;
      let shouldEscape = false;

      if (introComplete) {
        const obstruction = findObstruction(cat, makeCatRect(catPosition.x, catPosition.y));
        if (obstruction) {
          const rect = obstruction.getBoundingClientRect();
          const catCenterY = catPosition.y + (FRAME_SIZE * SCALE) / 2;
          const objectCenterY = rect.top + rect.height / 2;
          escapeDirection = catCenterY < objectCenterY ? "up" : "down";
          targetPosition.x = catPosition.x;
          targetPosition.y =
            escapeDirection === "up"
              ? rect.top - FRAME_SIZE * SCALE - CAT_TUNING.obstructionPadding
              : rect.bottom + CAT_TUNING.obstructionPadding;
          escapeUntil = timestamp + 450;
        }

        shouldEscape = timestamp < escapeUntil;
        targetPosition.y = clamp(targetPosition.y, 8, window.innerHeight - FRAME_SIZE * SCALE - 8);
        dx = targetPosition.x - catPosition.x;
        dy = targetPosition.y - catPosition.y;
        distance = Math.hypot(dx, dy);
      }

      const shouldWalkToIntro = !introComplete && distance > CAT_TUNING.introArrivalDistance;
      const shouldWalkToMouse =
        introComplete && !shouldEscape && hasMouseInput && distance > 5 && idleTime < CAT_TUNING.idleDelayMs;
      const shouldWalk = shouldWalkToIntro || shouldWalkToMouse || shouldEscape;

      if (shouldWalk) {
        const speed = shouldEscape
          ? CAT_TUNING.escapeSpeedPxPerSecond
          : shouldWalkToIntro
            ? CAT_TUNING.introSpeedPxPerSecond
            : CAT_TUNING.walkSpeedPxPerSecond;
        moveToward(catPosition, targetPosition, speed, delta);
      }

      catPosition.x = clamp(catPosition.x, 8, window.innerWidth - FRAME_SIZE * SCALE - 8);
      catPosition.y = clamp(catPosition.y, 8, window.innerHeight - FRAME_SIZE * SCALE - 8);
      applyTransform();

      if (!introComplete && distance <= CAT_TUNING.introArrivalDistance) {
        introComplete = true;
        lastMouseMove = timestamp - CAT_TUNING.idleDelayMs;
      }

      if (forcedAnimation && timestamp < forcedUntil) {
        setAnimation(forcedAnimation);
      } else {
        forcedAnimation = null;

        if (shouldEscape) {
          setAnimation(escapeDirection === "up" ? "walkUp" : "walkDown");
        } else if (timestamp < observeUntil && !shouldWalk) {
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
