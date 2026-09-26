import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";
import styles from "./styles.module.css";

const SESSION_KEY = "tecpoint-octubre-de-miedo-seen";

export default function SeasonalPromo() {
  const { mainWhatsApp } = useSiteConfig();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    window.sessionStorage.setItem(SESSION_KEY, "true");
    setOpen(false);
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [close, open]);

  if (!open) return null;

  const contactUrl = whatsappLink(
    mainWhatsApp,
    "Hola TECPOINT, vi la promoción Octubre de Miedo y quiero conocer los productos disponibles."
  );

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Promoción Octubre de Miedo"
      onClick={(event) => event.currentTarget === event.target && close()}
    >
      <div className={styles.card}>
        <button className={styles.close} type="button" onClick={close} aria-label="Cerrar promoción">
          ×
        </button>
        <a
          className={styles.promoLink}
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          aria-label="Consultar la promoción Octubre de Miedo por WhatsApp"
        >
          <Image
            className={styles.artwork}
            src="/images/promotions/octubre-de-miedo.webp"
            alt="Octubre de Miedo: promociones TECPOINT en cobertores, audio, envío gratis y descuento con Optimus Card"
            width={900}
            height={1125}
            priority
            sizes="(max-width: 640px) 94vw, 560px"
          />
          <span className={styles.hint}>Toque la imagen para consultar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
