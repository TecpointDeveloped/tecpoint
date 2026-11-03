import type { CSSProperties } from "react";
import styles from "./styles.module.css";

const SNOWFLAKES = [
  [3, 9, 17, 13, -24, 0.68], [8, 4, 21, 9, 18, 0.46], [14, 13, 18, 12, 26, 0.7],
  [21, 2, 23, 8, -18, 0.42], [28, 10, 19, 11, 30, 0.66], [36, 6, 25, 8, -28, 0.4],
  [44, 15, 20, 13, 22, 0.72], [52, 1, 24, 9, -20, 0.48], [61, 11, 18, 12, 32, 0.7],
  [69, 5, 22, 8, -26, 0.4], [77, 14, 26, 11, 20, 0.68], [84, 7, 19, 9, -18, 0.5],
  [91, 3, 23, 13, 24, 0.72], [97, 12, 20, 8, -22, 0.46], [6, 17, 24, 7, 30, 0.36],
  [18, 8, 28, 7, -30, 0.34], [33, 18, 26, 7, 20, 0.34], [57, 16, 27, 7, -24, 0.36],
  [73, 19, 29, 7, 28, 0.34], [88, 17, 25, 7, -20, 0.36],
] as const;

const LIGHTS = ["warm", "red", "warm", "gold", "red", "warm", "gold", "red", "warm", "gold", "red", "warm"] as const;

export default function BlackNovemberDecor() {
  return (
    <div className={styles.season} aria-hidden="true">
      <div className={styles.edgeGlow} />
      <div className={`${styles.lightString} ${styles.lightStringLeft}`}>
        {LIGHTS.map((tone, index) => <i className={styles[tone]} key={`left-${index}`} />)}
      </div>
      <div className={`${styles.lightString} ${styles.lightStringRight}`}>
        {LIGHTS.map((tone, index) => <i className={styles[tone]} key={`right-${index}`} />)}
      </div>
      <div className={styles.snow}>
        {SNOWFLAKES.map(([left, delay, duration, size, drift, opacity], index) => (
          <span
            className={index > 11 ? styles.desktopSnow : ""}
            key={`${left}-${delay}`}
            style={{
              "--snow-left": `${left}%`,
              "--snow-delay": `-${delay}s`,
              "--snow-duration": `${duration}s`,
              "--snow-size": `${size}px`,
              "--snow-drift": `${drift}px`,
              "--snow-drift-back": `${Math.round(drift * -0.6)}px`,
              "--snow-opacity": opacity,
            } as CSSProperties}
          >
            ❄
          </span>
        ))}
      </div>
      <div className={styles.cornerStar}>✦</div>
      <div className={styles.cornerStarAlt}>✦</div>
    </div>
  );
}
