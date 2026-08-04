import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";

export default function AppIntro() {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hasPlayed = window.sessionStorage.getItem("tecpoint-intro-played");
    if (hasPlayed) {
      setVisible(false);
      return;
    }

    window.sessionStorage.setItem("tecpoint-intro-played", "true");
    const leaveTimer = window.setTimeout(() => setLeaving(true), 650);
    const removeTimer = window.setTimeout(() => setVisible(false), 980);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`${styles.intro} ${leaving ? styles.leaving : ""}`}
      role="status"
      aria-label="Cargando TECPOINT"
    >
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.signal} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.logo}>
        <Image
          src="/brand/isologo.svg"
          alt="TECPOINT"
          width={132}
          height={132}
          priority
        />
      </div>
      <p>EL PUNTO DE LA TECNOLOGÍA</p>
      <div className={styles.progress} aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
