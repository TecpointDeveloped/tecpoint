import styles from "./styles.module.css";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const BATS = [
  { size: 27, top: 10, delay: 3.8, flight: "flightA", wings: "wingsFast" },
  { size: 19, top: 32, delay: 4.35, flight: "flightB", wings: "wingsSlow" },
  { size: 23, top: 18, delay: 4.8, flight: "flightC", wings: "wingsMedium" },
  { size: 16, top: 42, delay: 5.15, flight: "flightB", wings: "wingsFast" },
  { size: 21, top: 6, delay: 5.55, flight: "flightA", wings: "wingsMedium" },
] as const;

type GhostVisit = {
  id: number;
  x: number;
  y: number;
  direction: number;
  size: number;
};

function Cobweb({ position }: { position: "left" | "right" }) {
  return (
    <svg
      className={`${styles.web} ${styles[position]}`}
      viewBox="0 0 180 180"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M4 4h172M4 4v172M4 4l172 172M4 4l84 172M4 4l172 86" />
        <path d="M35 4c0 17-14 31-31 31M70 4C70 41 41 70 4 70M108 4C108 62 62 108 4 108M146 4c0 78-64 142-142 142" />
      </g>
    </svg>
  );
}

function Spider() {
  return (
    <div className={styles.spiderTrack} aria-hidden="true">
      <span className={styles.thread} />
      <svg className={styles.spider} viewBox="0 0 72 76">
        <g className={styles.spiderLegs} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path className={styles.legA} d="M29 31 17 22 6 24M27 43 14 48 7 58" />
          <path className={styles.legB} d="M27 37 13 34 3 40M29 48 20 59 19 70" />
          <path className={styles.legB} d="m43 31 12-9 11 2M45 43l13 5 7 10" />
          <path className={styles.legA} d="m45 37 14-3 10 6M43 48l9 11 1 11" />
        </g>
        <ellipse className={styles.spiderAbdomen} cx="36" cy="45" rx="13" ry="18" />
        <circle className={styles.spiderHead} cx="36" cy="26" r="9" />
        <path className={styles.spiderMark} d="m31 42 5-6 5 6-5 8z" />
        <circle className={styles.spiderEye} cx="33" cy="24" r="1.4" />
        <circle className={styles.spiderEye} cx="39" cy="24" r="1.4" />
      </svg>
    </div>
  );
}

function Bat({
  bat,
  index,
}: {
  bat: (typeof BATS)[number];
  index: number;
}) {
  return (
    <span
      className={`${styles.batFlight} ${styles[bat.flight]} ${index > 1 ? styles.desktopBat : ""}`}
      style={
        {
          "--bat-size": `${bat.size}px`,
          "--bat-top": `${bat.top}px`,
          "--bat-delay": `${bat.delay}s`,
        } as CSSProperties
      }
    >
      <svg className={styles.bat} viewBox="0 0 84 40">
        <path className={`${styles.wing} ${styles.wingLeft} ${styles[bat.wings]}`} d="M39 19C28 5 12 3 1 8c8 4 10 10 9 17 7-4 13-2 18 5 1-7 5-10 11-11Z" />
        <path className={`${styles.wing} ${styles.wingRight} ${styles[bat.wings]}`} d="M45 19C56 5 72 3 83 8c-8 4-10 10-9 17-7-4-13-2-18 5-1-7-5-10-11-11Z" />
        <ellipse className={styles.batBody} cx="42" cy="22" rx="6" ry="12" />
        <path className={styles.batEars} d="m37 13 1-8 5 6 4-6 1 8Z" />
      </svg>
    </span>
  );
}

function GhostSurprises() {
  const [ghosts, setGhosts] = useState<GhostVisit[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const interactiveSelector = "button, summary, select, [role='button'], [aria-expanded], a[href]";

    const revealGhost = (event: PointerEvent) => {
      if (reducedMotion.matches || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      if (!target) return;

      const id = nextId.current++;
      const rect = target.getBoundingClientRect();
      const x = Math.min(window.innerWidth - 38, Math.max(38, event.clientX || rect.left + rect.width / 2));
      const y = Math.min(window.innerHeight - 50, Math.max(58, event.clientY || rect.top + rect.height / 2));
      const ghost = {
        id,
        x,
        y,
        direction: id % 2 ? 1 : -1,
        size: 34 + (id % 3) * 5,
      };

      setGhosts((current) => [...current.slice(-3), ghost]);
      window.setTimeout(() => {
        setGhosts((current) => current.filter((item) => item.id !== id));
      }, 1250);
    };

    document.addEventListener("pointerdown", revealGhost, true);
    return () => document.removeEventListener("pointerdown", revealGhost, true);
  }, []);

  return (
    <div className={styles.ghostLayer}>
      {ghosts.map((ghost) => (
        <span
          className={styles.ghostPop}
          key={ghost.id}
          style={
            {
              "--ghost-x": `${ghost.x}px`,
              "--ghost-y": `${ghost.y}px`,
              "--ghost-size": `${ghost.size}px`,
              "--ghost-nudge": `${ghost.direction * 4}px`,
              "--ghost-counter": `${ghost.direction * -3}px`,
              "--ghost-drift": `${ghost.direction * 12}px`,
              "--ghost-tilt-start": `${ghost.direction * -7}deg`,
              "--ghost-tilt-mid": `${ghost.direction * 3}deg`,
              "--ghost-tilt-counter": `${ghost.direction * -2}deg`,
              "--ghost-tilt-end": `${ghost.direction * 7}deg`,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 64 76">
            <path className={styles.ghostBody} d="M9 65V31C9 15 19 5 32 5s23 10 23 26v34l-8-6-7 8-8-8-8 8-7-8-8 6Z" />
            <ellipse className={styles.ghostEye} cx="25" cy="30" rx="3.2" ry="5" />
            <ellipse className={styles.ghostEye} cx="40" cy="30" rx="3.2" ry="5" />
            <ellipse className={styles.ghostMouth} cx="33" cy="43" rx="4.5" ry="6" />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default function HalloweenDecor() {
  return (
    <div className={styles.season} aria-hidden="true">
      <span className={styles.vignette} />
      <span className={`${styles.fog} ${styles.fogBack}`} />
      <span className={`${styles.fog} ${styles.fogFront}`} />
      <span className={`${styles.eyes} ${styles.eyesLeft}`}><i /><i /></span>
      <span className={`${styles.eyes} ${styles.eyesRight}`}><i /><i /></span>
      <span className={styles.lightning} />
      <GhostSurprises />
      <span className={styles.frame} />
      <Cobweb position="left" />
      <Cobweb position="right" />
      <div className={styles.batFlock}>
        {BATS.map((bat, index) => <Bat key={index} bat={bat} index={index} />)}
      </div>
      <Spider />
    </div>
  );
}
