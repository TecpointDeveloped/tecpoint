import styles from "./styles.module.css";

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
          <path d="M29 31 17 22 6 24M27 37 13 34 3 40M27 43 14 48 7 58M29 48 20 59 19 70" />
          <path d="m43 31 12-9 11 2M45 37l14-3 10 6M45 43l13 5 7 10M43 48l9 11 1 11" />
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

export default function HalloweenDecor() {
  return (
    <div className={styles.season} aria-hidden="true">
      <span className={styles.frame} />
      <Cobweb position="left" />
      <Cobweb position="right" />
      <Spider />
    </div>
  );
}
