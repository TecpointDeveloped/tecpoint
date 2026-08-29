import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const PUBLIC_REVEALS = [
  "main > header",
  "main > section",
  "main article",
  "footer > div",
].join(",");

export default function MotionSystem() {
  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const start = () => setNavigating(true);
    const finish = () => setNavigating(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", finish);
    router.events.on("routeChangeError", finish);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", finish);
      router.events.off("routeChangeError", finish);
    };
  }, [router.events]);

  useEffect(() => {
    if (router.pathname.startsWith("/admin")) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = [...document.querySelectorAll<HTMLElement>(PUBLIC_REVEALS)]
      .filter((element) => !element.closest('[role="dialog"]'));

    observer.current?.disconnect();
    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("tp-motion-visible"));
      return;
    }

    elements.forEach((element, index) => {
      element.classList.add("tp-motion-reveal");
      element.style.setProperty("--tp-motion-delay", `${Math.min(index % 7, 6) * 45}ms`);
    });
    observer.current = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("tp-motion-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    elements.forEach((element) => observer.current?.observe(element));
    return () => observer.current?.disconnect();
  }, [router.asPath, router.pathname]);

  return <div className={`tp-route-progress ${navigating ? "is-active" : ""}`} aria-hidden="true" />;
}
