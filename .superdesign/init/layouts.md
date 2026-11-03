# Shared layouts

## Storefront navigation
Source: `src/components/navbarmenu/page.tsx`. Global retail header and navigation.

```tsx
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/cartStore";
import { OFFICIAL_CATEGORIES } from "@/lib/catalog";
import styles from "@/styles/navigation2026.module.css";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";
import { trackSearch } from "@/lib/tracking";
import { useAuth } from "@/context/useAuth";
import { isAdminEmail } from "@/lib/adminAccess";

const CRUD_URL = "https://crud-tecpoint.vercel.app/";

export default function NavbarMenu() {
  const router = useRouter();
  const { cart } = useCartStore();
  const { mainWhatsApp } = useSiteConfig();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const canManage = isAdminEmail(currentUser?.email);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = search.trim();
    trackSearch(value);
    router.push(`/shop?page=1&category=all&search=${encodeURIComponent(value)}`);
  }

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.logo} aria-label="TECPOINT, inicio">
          <Image
            src="/brand/logo-principal.svg"
            alt="TECPOINT"
            width={190}
            height={42}
            priority
          />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegación principal">
          <Link href="/">Inicio</Link>
          <Link href="/shop">Tienda</Link>
          <Link href="/categories">Categorías</Link>
          <Link href="/#ubicaciones">Ubicaciones</Link>
          {canManage && <a className={styles.adminLink} href={CRUD_URL}>Administrar</a>}
          <a
            className={styles.orderLink}
            href={whatsappLink(mainWhatsApp, "Hola TECPOINT, quiero hacer un pedido.")}
            target="_blank"
            rel="noreferrer"
          >
            Hacer pedido
          </a>
        </nav>

        <div className={styles.actions}>
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Buscar productos">
                <Search size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="top" className={styles.searchPanel}>
              <SheetHeader>
                <SheetTitle>¿Qué tecnología está buscando?</SheetTitle>
              </SheetHeader>
              <form onSubmit={submitSearch} className={styles.searchForm}>
                <input
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Producto, marca, compatibilidad o SKU"
                />
                <button type="submit">Buscar</button>
              </form>
              <div className={styles.quickCategories}>
                {OFFICIAL_CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/my-account" aria-label="Mi cuenta o iniciar sesión">
            <UserRound size={20} />
          </Link>

          <Link href="/cart" aria-label={`Carrito con ${totalQuantity} productos`} className={styles.cart}>
            <ShoppingBag size={21} />
            {totalQuantity > 0 && <span>{totalQuantity}</span>}
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button className={styles.mobileTrigger} aria-label="Abrir menú">
                <Menu size={23} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className={styles.mobilePanel}>
              <SheetHeader>
                <SheetTitle>
                  <Image src="/brand/logo-principal.svg" alt="TECPOINT" width={170} height={38} />
                </SheetTitle>
              </SheetHeader>
              <nav>
                <Link href="/">Inicio</Link>
                <Link href="/shop">Tienda</Link>
                <Link href="/categories">Categorías</Link>
                <Link href="/#ubicaciones">Ubicaciones</Link>
                <Link href="/cart">Mi carrito</Link>
                <Link href="/my-account">Mi cuenta</Link>
                {canManage && <a href={CRUD_URL}>Administrar TECPOINT</a>}
                <a
                  href={whatsappLink(mainWhatsApp, "Hola TECPOINT, quiero hacer un pedido.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Hacer pedido por WhatsApp
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


```

## Footer
Source: `src/components/Footer/page.tsx`. Global storefront footer.

```tsx
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/footer2026.module.css";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";

type FooterProps = {
  hideWholesaleLocation?: boolean;
};

export default function Footer({ hideWholesaleLocation = false }: FooterProps) {
  const { locations: orderPoints, mainWhatsApp } = useSiteConfig();
  const visibleOrderPoints = hideWholesaleLocation
    ? orderPoints.filter((point) => !point.name.toLowerCase().includes("mayoreo"))
    : orderPoints;
  return (
    <footer className={styles.footer}>
      <section className={styles.top}>
        <div>
          <Image
            src="/brand/logo-reserva.svg"
            alt="TECPOINT"
            width={205}
            height={46}
            style={{ width: "205px", height: "auto" }}
          />
          <p>Tecnología seleccionada y atención cercana en Honduras.</p>
        </div>
        <a
          className={styles.mainOrder}
          href={whatsappLink(mainWhatsApp, "Hola TECPOINT, quiero hacer un pedido.")}
          target="_blank"
          rel="noreferrer"
        >
          Hacer un pedido
        </a>
      </section>

      <section className={styles.locations}>
        {visibleOrderPoints.map((point) => (
          <article key={point.name}>
            <small>{point.city}</small>
            <strong>{point.name}</strong>
            <p>{point.detail}</p>
            <a
              href={whatsappLink(point.phone, `Hola TECPOINT, quiero hacer un pedido con ${point.name}.`)}
              target="_blank"
              rel="noreferrer"
            >
              Pedir aquí →
            </a>
          </article>
        ))}
      </section>

      <section className={styles.bottom}>
        <nav>
          <Link href="/shop">Tienda</Link>
          <Link href="/categories">Categorías</Link>
          <Link href="/garantia">Garantía</Link>
          <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link href="/terminos-y-condiciones">Términos</Link>
          <Link href="/politica-privacidad">Privacidad</Link>
        </nav>
        <div className={styles.social}>
          <a href="https://www.instagram.com/tecpoint_distribucion/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/Tecpoint.Distribucion/" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://www.tiktok.com/@tecpoint.ws" target="_blank" rel="noreferrer">TikTok</a>
        </div>
        <p>© {new Date().getFullYear()} TECPOINT. Todos los derechos reservados.</p>
      </section>
    </footer>
  );
}


```

## Application shell
Source: `src/pages/_app.tsx`. Auth, site config, tracking, motion and seasonal decoration shell.

```tsx
import "@/styles/wholesale-ui/base.css";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { SiteConfigProvider, useSiteConfig } from "@/lib/siteConfig";
import Head from "next/head";
import { useRouter } from "next/router";

const Tracking = dynamic(() => import("@/components/analytics/Tracking"), {
  ssr: false,
});
const MotionSystem = dynamic(() => import("@/components/MotionSystem/page"), {
  ssr: false,
});
const HalloweenDecor = dynamic(() => import("@/components/HalloweenDecor/page"), {
  ssr: false,
});

function DynamicSiteMeta() {
  const { googleSiteVerification } = useSiteConfig();
  return <Head><meta name="google-site-verification" content={googleSiteVerification} /></Head>;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const showStorefrontDecor = !router.pathname.startsWith("/admin") && !router.pathname.startsWith("/mayoreo");
  const showStorefrontMotion = !router.pathname.startsWith("/admin") && !router.pathname.startsWith("/mayoreo");

  return (
    <AuthProvider>
      <SiteConfigProvider>
        <DynamicSiteMeta />
        <Tracking />
        {showStorefrontMotion && <MotionSystem />}
        {showStorefrontDecor && <HalloweenDecor />}
        <Component {...pageProps} />
      </SiteConfigProvider>
    </AuthProvider>
  );
}


```

