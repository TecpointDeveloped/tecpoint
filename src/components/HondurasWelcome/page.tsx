import styles from "./styles.module.css";
import type { CSSProperties } from "react";

const STARS = Array.from({ length: 18 }, (_, index) => ({
  left: (index * 37 + 7) % 100,
  delay: (index % 7) * 0.18,
  duration: 2.8 + (index % 5) * 0.28,
  size: 10 + (index % 4) * 4,
}));

export default function HondurasWelcome() {
  return <>
    <div className={styles.stars} aria-hidden="true">
      {STARS.map((star, index) => <span key={index} style={{ "--left": `${star.left}%`, "--delay": `${star.delay}s`, "--duration": `${star.duration}s`, "--size": `${star.size}px` } as CSSProperties}>★</span>)}
    </div>
    <div className={styles.flag} aria-label="TECPOINT, orgullosamente hondureño" title="Orgullosamente hondureños">
      <span aria-hidden="true">🇭🇳</span><b>HN</b>
    </div>
  </>;
}
