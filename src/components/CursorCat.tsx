"use client";

import { useEffect, useRef } from "react";

const FRAME_SIZE = 32;
const COLUMNS = 11;
const INTRO_ENABLED = true;
const INTRO_ATTENTION_MS = 1800;
const REALIZE_DURATION_MS = 1800;
const REALIZE_DISTANCE = 80;
const REALIZE_COOLDOWN_MS = 5000;
const SCALE = 2;
const FOLLOW_DISTANCE = 28;
const CLOSE_DISTANCE = 32;
const FAR_DISTANCE = 260;
const BASE_SPEED = 0.018;
const FAR_SPEED = 0.032;
const INTRO_SPEED = 0.055;
const MAX_STEP = 3.2;
const INTRO_MAX_STEP = 4.8;
const DIRECTION_SWITCH_THRESHOLD = 12;
const IDLE_DELAY_MS = 3000;
const SLEEP_DELAY_MS = 10000;
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
  hindLegs: { row: 52, frames: 4, fps: 5 },
} as const;

type CatAnimationName = keyof typeof CAT_ANIMS;
type CatState =
  | "introWalkToName"
  | "introAttention"
  | "idle"
  | "realize"
  | "follow"
  | "idleActivity"
  | "sleep"
  | "paw";

const IDLE_ANIMS: CatAnimationName[] = ["meowSit", "washSit", "yawnSit", "eatDown"];
const ATTENTION_ANIMS: CatAnimationName[] = ["meowSit", "hindLegs", "yawnSit", "washSit"];

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

function pickAttentionAnimation() {
  return ATTENTION_ANIMS[Math.floor(Math.random() * ATTENTION_ANIMS.length)];
}

function chooseMovementAnimation(dx: number, dy: number, currentDirection: CatAnimationName): CatAnimationName {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX > absY + DIRECTION_SWITCH_THRESHOLD) {
    return dx > 0 ? "walkRight" : "walkLeft";
  }

  if (absY > absX + DIRECTION_SWITCH_THRESHOLD) {
    return dy > 0 ? "walkDown" : "walkUp";
  }

  if (currentDirection.startsWith("walk")) {
    return currentDirection;
  }

  return absX >= absY ? (dx > 0 ? "walkRight" : "walkLeft") : dy > 0 ? "walkDown" : "walkUp";
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
  return lerp(BASE_SPEED, FAR_SPEED, t);
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
    let currentDirection: CatAnimationName = "walkRight";
    let idleAnimation: CatAnimationName = pickIdleAnimation();
    let attentionAnimation: CatAnimationName = pickAttentionAnimation();
    let nextIdleSwap = performance.now() + IDLE_SWAP_MS;
    let lastPointerMove = performance.now();
    let state: CatState = INTRO_ENABLED ? "introWalkToName" : "idle";
    let previousState: CatState = "idle";
    let stateUntil = 0;
    let introFinished = !INTRO_ENABLED;
    let visibleInViewport = true;
    let pointerInsideHero = false;
    let lastRealizeAt = -REALIZE_COOLDOWN_MS;
    let lastRealizeTarget = { x: REST_X, y: 0 };
    const pendingCursorTarget = { x: REST_X, y: 0 };

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

    const getNameTargetPosition = () => {
      const rect = getHeroRect();
      const name = hero.querySelector<HTMLElement>('[data-cat-target="name"]');
      if (!name) return getRestPosition();

      const nameRect = name.getBoundingClientRect();
      return {
        x: nameRect.left - rect.left + nameRect.width * 0.18 - catSize() / 2,
        y: nameRect.bottom - rect.top + 8,
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

    const setState = (nextState: CatState, timestamp: number, duration = 0) => {
      if (state === nextState) return;
      previousState = state;
      state = nextState;
      stateUntil = duration > 0 ? timestamp + duration : 0;

      if (nextState === "introAttention") {
        attentionAnimation = pickAttentionAnimation();
      }

      if (nextState === "idleActivity") {
        idleAnimation = pickIdleAnimation();
        nextIdleSwap = timestamp + IDLE_SWAP_MS;
      }
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
      if (INTRO_ENABLED && !introFinished) {
        const rest = getRestPosition();
        catPosition.x = rest.x;
        catPosition.y = rest.y;
      }
      applyTransform();
      cat.style.opacity = "1";
      setSpriteFrame(cat, "meowSit", 0);
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = getHeroRect();
      pointerInsideHero = true;
      const now = performance.now();
      lastPointerMove = now;

      pendingCursorTarget.x = event.clientX - rect.left - catSize() / 2 + FOLLOW_DISTANCE;
      pendingCursorTarget.y = event.clientY - rect.top - catSize() / 2 + FOLLOW_DISTANCE;
      clampToHero(pendingCursorTarget);

      const movedFromRealizeTarget = Math.hypot(
        pendingCursorTarget.x - lastRealizeTarget.x,
        pendingCursorTarget.y - lastRealizeTarget.y
      );
      const canRealize =
        introFinished &&
        visibleInViewport &&
        movedFromRealizeTarget >= REALIZE_DISTANCE &&
        now - lastRealizeAt >= REALIZE_COOLDOWN_MS &&
        (state === "idle" || state === "idleActivity" || state === "sleep");

      if (canRealize) {
        lastRealizeAt = now;
        lastRealizeTarget = { ...pendingCursorTarget };
        setState("realize", now, REALIZE_DURATION_MS);
        setAnimation(pickAttentionAnimation());
        return;
      }

      if (introFinished && state === "follow") {
        targetPosition.x = pendingCursorTarget.x;
        targetPosition.y = pendingCursorTarget.y;
      }
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
        const now = performance.now();
        setAnimation(getPawAnimation(dx, dy));
        setState("paw", now, PAW_DURATION_MS);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleInViewport = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const tick = (timestamp: number) => {
      const delta = Math.min(48, timestamp - lastTimestamp);
      lastTimestamp = timestamp;

      if (hiddenViewport.matches) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (!visibleInViewport) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (!pointerInsideHero && introFinished && state !== "paw") {
        moveTargetToRest();
      }

      if (state === "introWalkToName") {
        const nameTarget = getNameTargetPosition();
        targetPosition.x = nameTarget.x;
        targetPosition.y = nameTarget.y;
        clampToHero(targetPosition);
      }

      let dx = targetPosition.x - catPosition.x;
      let dy = targetPosition.y - catPosition.y;
      let distance = Math.hypot(dx, dy);

      const canMove =
        state === "introWalkToName" ||
        state === "follow" ||
        (!pointerInsideHero && (state === "idle" || state === "idleActivity" || state === "sleep"));
      const ease = state === "introWalkToName" ? INTRO_SPEED : getFollowEase(distance) * (pointerInsideHero ? 1 : 0.42);
      const step = Math.min(state === "introWalkToName" ? INTRO_MAX_STEP : MAX_STEP, distance * ease * (delta / 16.67));

      if (canMove && distance > CLOSE_DISTANCE && step > 0) {
        catPosition.x += (dx / distance) * step;
        catPosition.y += (dy / distance) * step;
        clampToHero(catPosition);
      } else if (distance <= CLOSE_DISTANCE) {
        catPosition.x = targetPosition.x;
        catPosition.y = targetPosition.y;
      }

      applyTransform();

      dx = targetPosition.x - catPosition.x;
      dy = targetPosition.y - catPosition.y;
      distance = Math.hypot(dx, dy);

      switch (state) {
        case "introWalkToName": {
          currentDirection = chooseMovementAnimation(dx, dy, currentDirection);
          setAnimation(currentDirection);
          if (distance <= CLOSE_DISTANCE) {
            currentDirection = chooseMovementAnimation(-dx || -1, dy, currentDirection);
            setAnimation(currentDirection);
            setState("introAttention", timestamp, INTRO_ATTENTION_MS);
          }
          break;
        }
        case "introAttention":
          setAnimation(attentionAnimation);
          if (timestamp >= stateUntil) {
            introFinished = true;
            lastPointerMove = timestamp;
            lastRealizeAt = timestamp - REALIZE_COOLDOWN_MS + 800;
            moveTargetToRest();
            setState("idle", timestamp);
          }
          break;
        case "realize":
          if (timestamp >= stateUntil) {
            targetPosition.x = pendingCursorTarget.x;
            targetPosition.y = pendingCursorTarget.y;
            clampToHero(targetPosition);
            setState("follow", timestamp);
          }
          break;
        case "paw":
          if (stateUntil && timestamp >= stateUntil) {
            const canReturnToFollow =
              previousState === "follow" &&
              pointerInsideHero &&
              Math.hypot(targetPosition.x - catPosition.x, targetPosition.y - catPosition.y) > CLOSE_DISTANCE;
            const nextState = canReturnToFollow ? "follow" : "idle";
            setState(nextState, timestamp);
          }
          break;
        case "follow":
          if (distance > CLOSE_DISTANCE) {
            currentDirection = chooseMovementAnimation(dx, dy, currentDirection);
            setAnimation(currentDirection);
          } else {
            setState("idle", timestamp);
          }
          break;
        case "idle":
        case "idleActivity":
        case "sleep": {
          const idleTime = timestamp - lastPointerMove;
          if (!pointerInsideHero && distance > CLOSE_DISTANCE) {
            currentDirection = chooseMovementAnimation(dx, dy, currentDirection);
            setAnimation(currentDirection);
            break;
          }

          if (distance > CLOSE_DISTANCE * 1.35 && pointerInsideHero) {
            setState("follow", timestamp);
            break;
          }

          if (idleTime >= SLEEP_DELAY_MS) {
            setState("sleep", timestamp);
            setAnimation("sleep");
          } else if (idleTime >= IDLE_DELAY_MS) {
            if (state !== "idleActivity") {
              setState("idleActivity", timestamp);
            }
            if (timestamp >= nextIdleSwap) {
              idleAnimation = pickIdleAnimation();
              nextIdleSwap = timestamp + IDLE_SWAP_MS;
            }
            setAnimation(idleAnimation);
          } else {
            setAnimation("meowSit");
          }
          break;
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
    observer.observe(hero);
    hero.addEventListener("mousemove", handlePointerMove, { passive: true });
    hero.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    hero.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("resize", resetPosition, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
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
