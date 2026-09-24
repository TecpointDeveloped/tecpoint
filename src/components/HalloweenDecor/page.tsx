import styles from "./styles.module.css";
import type { CSSProperties } from "react";

const BATS = [
  { size: 27, top: 10, delay: 3.8, flight: "flightA", wings: "wingsFast" },
  { size: 19, top: 32, delay: 4.35, flight: "flightB", wings: "wingsSlow" },
  { size: 23, top: 18, delay: 4.8, flight: "flightC", wings: "wingsMedium" },
  { size: 16, top: 42, delay: 5.15, flight: "flightB", wings: "wingsFast" },
  { size: 21, top: 6, delay: 5.55, flight: "flightA", wings: "wingsMedium" },
] as const;

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

export default function HalloweenDecor() {
  return (
    <div className={styles.season} aria-hidden="true">
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
