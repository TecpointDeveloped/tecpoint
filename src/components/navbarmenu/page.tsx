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

export default function NavbarMenu() {
  const router = useRouter();
  const { cart } = useCartStore();
  const { mainWhatsApp } = useSiteConfig();
  const [search, setSearch] = useState("");
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

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
          <Link href="/mayoreo">Mayoreo</Link>
          <Link href="/categories">Categorías</Link>
          <Link href="/#ubicaciones">Ubicaciones</Link>
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
                <Link href="/mayoreo">Mayoreo</Link>
                <Link href="/categories">Categorías</Link>
                <Link href="/#ubicaciones">Ubicaciones</Link>
                <Link href="/cart">Mi carrito</Link>
                <Link href="/my-account">Mi cuenta</Link>
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
