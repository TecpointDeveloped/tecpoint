import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "@/styles/marketingContent.module.css";

export type MarketingAsset = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  mediaType?: "image" | "video";
  videoUrl?: string;
  mobileVideoUrl?: string;
  posterUrl?: string;
  linkUrl?: string;
  cta?: string;
  alt?: string;
  artworkOnly?: boolean;
};

function localBannerWebp(url?: string) {
  if (url?.includes("banner_dia_del_nino_1920x688_ajuste_slider")) return "/images/banners-current/dia-del-nino-desktop.webp";
  if (url?.includes("banner_dia_del_nino_1080x1350_final_v3")) return "/images/banners-current/dia-del-nino-mobile.webp";
  if (!url?.startsWith("/images/banners-current/")) return "";
  return url.replace(/\.(png|jpe?g)$/i, ".webp");
}

function ResponsiveArtwork({ asset, priority = false }: { asset: MarketingAsset; priority?: boolean }) {
  if (asset.mediaType === "video" && asset.videoUrl) {
    return (
      <video
        className={styles.artwork}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? "metadata" : "none"}
        poster={asset.posterUrl || asset.imageUrl}
        aria-label={asset.alt || asset.title}
      >
        {asset.mobileVideoUrl && <source media="(max-width: 680px)" src={asset.mobileVideoUrl} />}
        <source src={asset.videoUrl} />
      </video>
    );
  }
  if (!asset.imageUrl) return null;
  const desktopWebp = localBannerWebp(asset.imageUrl);
  const mobileWebp = localBannerWebp(asset.mobileImageUrl);
  return (
    <picture>
      {mobileWebp && <source media="(max-width: 680px)" srcSet={mobileWebp} type="image/webp" />}
      {asset.mobileImageUrl && <source media="(max-width: 680px)" srcSet={asset.mobileImageUrl} />}
      {desktopWebp && <source srcSet={desktopWebp} type="image/webp" />}
      <Image
        src={desktopWebp || asset.imageUrl}
        alt={asset.alt || asset.title}
        fill
        priority={priority}
        sizes="100vw"
        className={styles.artwork}
      />
    </picture>
  );
}

export function HomepageBanner({ asset }: { asset?: MarketingAsset | null }) {
  if (!asset || (!asset.imageUrl && !asset.videoUrl)) return null;
  const content = (
    <>
      <ResponsiveArtwork asset={asset} priority />
      <span className={styles.bannerShade} />
      <span className={styles.bannerCopy}>
        <small>TECPOINT</small>
        <strong>{asset.title}</strong>
        {asset.subtitle && <span>{asset.subtitle}</span>}
        {asset.cta && <b>{asset.cta} →</b>}
      </span>
    </>
  );
  return asset.linkUrl ? (
    <Link className={styles.banner} href={asset.linkUrl}>{content}</Link>
  ) : (
    <section className={styles.banner}>{content}</section>
  );
}

export function HomepageBannerCarousel({ assets }: { assets: MarketingAsset[] }) {
  const validAssets = assets.filter((asset) => Boolean(asset.imageUrl || asset.videoUrl));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (validAssets.length < 2 || paused) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % validAssets.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [paused, validAssets.length]);

  if (!validAssets.length) return null;
  const asset = validAssets[active] || validAssets[0];
  const previous = () => setActive((active - 1 + validAssets.length) % validAssets.length);
  const next = () => setActive((active + 1) % validAssets.length);
  const artwork = (
    <span key={asset.id} className={styles.bannerScene}>
      <ResponsiveArtwork key={asset.id} asset={asset} priority={active === 0} />
      {!asset.artworkOnly && <span className={styles.bannerShade} />}
      {!asset.artworkOnly && (
        <span className={styles.bannerCopy}>
          <small>TECPOINT</small>
          <strong>{asset.title}</strong>
          {asset.subtitle && <span>{asset.subtitle}</span>}
          {asset.cta && <b>{asset.cta} →</b>}
        </span>
      )}
    </span>
  );

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carrusel"
      aria-label="Campañas TECPOINT"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {asset.linkUrl ? (
        <Link
          className={`${styles.banner} ${asset.artworkOnly ? styles.artworkOnly : ""}`}
          href={asset.linkUrl}
          aria-label={`${asset.title}. ${asset.cta || "Ver campaña"}`}
        >
          {artwork}
        </Link>
      ) : (
        <div className={`${styles.banner} ${asset.artworkOnly ? styles.artworkOnly : ""}`}>
          {artwork}
        </div>
      )}
      {validAssets.length > 1 && (
        <>
          <button className={`${styles.arrow} ${styles.previous}`} onClick={previous} aria-label="Banner anterior"><ChevronLeft aria-hidden="true" /></button>
          <button className={`${styles.arrow} ${styles.next}`} onClick={next} aria-label="Banner siguiente"><ChevronRight aria-hidden="true" /></button>
          <div className={styles.dots} aria-label={`Banner ${active + 1} de ${validAssets.length}`}>
            {validAssets.map((item, index) => (
              <button
                key={item.id}
                className={index === active ? styles.activeDot : ""}
                onClick={() => setActive(index)}
                aria-label={`Mostrar banner ${index + 1}: ${item.title}`}
                aria-current={index === active ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function LiveMarketingContent({ initialBanners, initialPromotion }: { initialBanners: MarketingAsset[]; initialPromotion?: MarketingAsset | null }) {
  const [banners, setBanners] = useState(initialBanners);
  const [promotion, setPromotion] = useState(initialPromotion || null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/marketing", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setBanners(data.banners || []); setPromotion(data.promotion || null); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <><HomepageBannerCarousel assets={banners}/><FlashPromotion asset={promotion}/></>;
}

export function FlashPromotion({ asset }: { asset?: MarketingAsset | null }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if ((!asset?.imageUrl && !asset?.videoUrl) || sessionStorage.getItem(`tecpoint-promo:${asset.id}`)) return;
    const timer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, [asset]);
  if ((!asset?.imageUrl && !asset?.videoUrl) || !open) return null;
  const close = () => {
    sessionStorage.setItem(`tecpoint-promo:${asset.id}`, "seen");
    setOpen(false);
  };
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="flash-title">
      <div className={styles.modal}>
        <button className={styles.close} onClick={close} aria-label="Cerrar promoción">×</button>
        <div className={styles.modalArtwork}><ResponsiveArtwork asset={asset} /></div>
        <div className={styles.modalCopy}>
          <small>PROMOCIÓN TECPOINT</small>
          <h2 id="flash-title">{asset.title}</h2>
          {asset.subtitle && <p>{asset.subtitle}</p>}
          {asset.linkUrl ? <Link href={asset.linkUrl} onClick={close}>{asset.cta || "Ver promoción"}</Link> : <button onClick={close}>Continuar</button>}
        </div>
      </div>
    </div>
  );
}
