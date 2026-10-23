import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "@/styles/wholesaleCatalogIntro.module.css";

const INTRO_SESSION_KEY = "tecpoint_wholesale_intro_seen_v1";
const INTRO_DURATION_MS = 2250;
const REDUCED_MOTION_DURATION_MS = 350;

const sessionBootstrap = `
(function () {
  var key = "${INTRO_SESSION_KEY}";
  try {
    if (window.sessionStorage.getItem(key)) {
      document.documentElement.dataset.wholesaleIntro = "skip";
      return;
    }
    window.sessionStorage.setItem(key, "1");
    document.documentElement.dataset.wholesaleIntro = "show";
  } catch (error) {
    document.documentElement.dataset.wholesaleIntro = "show";
  }
})();`;

export function WholesaleCatalogIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    let shouldShow = root.dataset.wholesaleIntro === "show";

    if (!root.dataset.wholesaleIntro) {
      try {
        shouldShow = !window.sessionStorage.getItem(INTRO_SESSION_KEY);
        if (shouldShow) {
          window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
        }
      } catch {
        shouldShow = root.dataset.wholesaleIntro !== "done";
      }

      root.dataset.wholesaleIntro = shouldShow ? "show" : "skip";
    }

    if (!shouldShow) {
      setVisible(false);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(() => {
      root.dataset.wholesaleIntro = "done";
      setVisible(false);
    }, reducedMotion ? REDUCED_MOTION_DURATION_MS : INTRO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <script
          id="tecpoint-wholesale-intro-session"
          dangerouslySetInnerHTML={{ __html: sessionBootstrap }}
        />
      </Head>
      {visible && (
        <div className={styles.intro} aria-hidden="true">
          <div className={styles.glow} />
          <div className={styles.content}>
            <Image
              className={styles.logo}
              src="/brand/logo-reserva.svg"
              alt=""
              width={2048}
              height={332}
              priority
            />
            <span className={styles.label}>Mayoreo</span>
          </div>
        </div>
      )}
    </>
  );
}
