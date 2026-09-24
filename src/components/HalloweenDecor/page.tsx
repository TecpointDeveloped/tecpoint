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
      <span className={styles.spider}>
        <i className={styles.body} />
        <i className={styles.legs} />
      </span>
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
