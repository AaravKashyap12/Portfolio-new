"use client";

import { useEffect } from "react";
import gsap from "gsap";
import MouseFollower from "mouse-follower";

MouseFollower.registerGSAP(gsap);

const DESKTOP_QUERY = "(min-width: 768px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

export default function MouseFollowerCursor() {
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const motion = window.matchMedia(MOTION_QUERY);
    let cursor: MouseFollower | null = null;

    const shouldRun = () => desktop.matches && motion.matches;

    const destroyCursor = () => {
      cursor?.destroy();
      cursor = null;
      document.body.classList.remove("has-mouse-follower");
    };

    const createCursor = () => {
      if (!shouldRun() || cursor) return;

      document.body.classList.add("has-mouse-follower");
      cursor = new MouseFollower({
        container: document.body,
        dataAttr: "cursor",
        stateDetection: {
          "-pointer": "a,button,[role='button'],.proj-card,.pm-diagram-button,.contact-action",
          "-hidden": "input,textarea,select,iframe,[data-cursor='-hidden']",
        },
        speed: 0.42,
        ease: "expo.out",
        skewing: 1.15,
        skewingText: 0.8,
        skewingDelta: 0.0014,
        skewingDeltaMax: 0.12,
        stickDelta: 0.12,
        showTimeout: 30,
        hideOnLeave: true,
        hideTimeout: 220,
      });
    };

    const syncCursor = () => {
      if (shouldRun()) {
        createCursor();
      } else {
        destroyCursor();
      }
    };

    syncCursor();
    desktop.addEventListener("change", syncCursor);
    motion.addEventListener("change", syncCursor);

    return () => {
      desktop.removeEventListener("change", syncCursor);
      motion.removeEventListener("change", syncCursor);
      destroyCursor();
    };
  }, []);

  return null;
}
