import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { db } from "../../database/Config";
import { collection, getDocs } from "firebase/firestore";
import { Product } from "../../types/ProductTypes";
import { useState, useEffect, forwardRef } from "react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { useAuth } from "@/context/useAuth";
import { useCartStore } from "@/lib/cartStore";
import Avvvatars from 'avvvatars-react';
import { Separator } from "@radix-ui/react-separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ImageData { img: string; }

function NavbarMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const route = useRouter();
  const { currentUser } = useAuth();
  const { cart, removeFromCart } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string));
        const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(all);
        setFilteredProducts(all);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchTerm(v);
    if (!v) { setFilteredProducts(products); return; }
    setFilteredProducts(products.filter((p) =>
      p.sku?.toLowerCase().includes(v.toLowerCase()) ||
      p.producto?.toLowerCase().includes(v.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(v.toLowerCase())
    ));
  };

  const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + (i.precio || 0) * i.quantity, 0).toFixed(2);

  const isActive = (href: string) =>
    href === "/" ? route.pathname === "/" : route.pathname.startsWith(href.split("?")[0]);

  return (
    <header className="sticky top-0 z-50 flex flex-col w-full">

      {/* Barra superior de anuncio */}
      {showBanner && (
        <div className="bg-[#CCFD03] text-black text-xs font-semibold flex items-center justify-center px-4 py-2 relative">
          <p className="text-center">
            🚚 Envío gratis en compras mayores a Lps. 1,500 &nbsp;·&nbsp;
            <Link href="/shop?page=1&brand=&search=" className="underline underline-offset-2">
              Ver productos
            </Link>
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Navbar principal */}
      <nav className="bg-[#0a0a0a] border-b border-white/[0.06] w-full">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-16 grid grid-cols-3 items-center">

          {/* Izquierda: links de navegación (desktop) / hamburguesa (mobile) */}
          <div className="flex items-center gap-1">
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { href: "/", label: "Inicio" },
                { href: "/shop?page=1&brand=&search=", label: "Tienda" },
                { href: "/categories", label: "Categorías" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    isActive(link.href)
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white hover:bg-white/8"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile: hamburguesa */}
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 -ml-2 rounded-xl hover:bg-white/8 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#0a0a0a] text-white border-white/10 z-[999] w-[280px] p-0">
                  <div className="p-5 border-b border-white/10">
                    <Image src="/logo.png" alt="Tecpoint" width={110} height={34} className="h-7 w-auto object-contain" priority />
                  </div>
                  <nav className="p-4 flex flex-col gap-1">
                    {[
                      { href: "/", label: "Inicio" },
                      { href: "/shop?page=1&brand=&search=", label: "Tienda" },
                      { href: "/categories", label: "Categorías" },
                      { href: "/my-account", label: "Mi cuenta" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? "bg-white/10 text-white"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}

                    <Accordion type="single" collapsible>
                      <AccordionItem value="cats" className="border-transparent">
                        <AccordionTrigger className="px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-xl hover:no-underline transition-colors [&[data-state=open]]:text-white">
                          Explorar
                        </AccordionTrigger>
                        <AccordionContent className="pb-0">
                          <ul className="flex flex-col gap-0.5 pl-2">
                            {[
                              { href: "/shop?page=1&brand=&search=auriculares", label: "Auriculares" },
                              { href: "/shop?page=1&brand=&search=audifonos", label: "Audífonos BT" },
                              { href: "/shop?page=1&brand=&search=cable", label: "Cables" },
                              { href: "/shop?page=1&brand=&search=cargador", label: "Cargadores" },
                              { href: "/shop?page=1&brand=&search=cobertor", label: "Cobertores" },
                              { href: "/shop?page=1&brand=&search=power+bank", label: "Power Banks" },
                            ].map((cat) => (
                              <li key={cat.href}>
                                <Link href={cat.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                                  <span className="size-1 rounded-full bg-[#CCFD03] shrink-0" />
                                  {cat.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Centro: Logo */}
          <div className="flex justify-center">
            <Link href="/">
              <Image
                quality={100}
                priority
                alt="Tecpoint Logo"
                src="/logo.png"
                width={130}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Derecha: iconos */}
          <div className="flex items-center justify-end gap-1">

            {/* Búsqueda */}
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <button className="p-2 rounded-full hover:bg-white/8 transition-colors group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-white/50 group-hover:text-white transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle className="sr-only">Buscar</DialogTitle>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full h-11 pl-9 pr-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                      placeholder="Buscar productos, SKU..."
                      autoFocus
                    />
                  </div>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <p className="text-center text-sm text-gray-400 py-8">Cargando...</p>
                  ) : searchTerm && filteredProducts.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-sm font-semibold text-gray-800">Sin resultados</p>
                      <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
                    </div>
                  ) : searchTerm ? (
                    <ul className="p-2">
                      {filteredProducts.slice(0, 7).map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/shop/${product.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                          >
                            <div className="size-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                              <Image
                                src={(product.imagenes as { imagen_01?: ImageData })?.imagen_01?.img || "/default-product.png"}
                                alt={product.producto || "Producto"}
                                width={48}
                                height={48}
                                className="object-contain size-full p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold line-clamp-1 text-gray-900">{product.producto}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{product.sku}</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-gray-200 group-hover/item:text-gray-400 transition-colors shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-8 px-4 text-center">
                      <p className="text-sm text-gray-400">Escribe para buscar productos</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Carrito */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-white/8 transition-colors group">
                  {totalQuantity > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#CCFD03] text-black text-[9px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                      {totalQuantity > 9 ? "9+" : totalQuantity}
                    </span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-white/50 group-hover:text-white transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:w-[380px] bg-white text-black border-transparent z-[999] flex flex-col p-0">
                <SheetHeader className="px-5 pt-5 pb-4 border-b">
                  <SheetTitle className="text-base font-bold flex items-center gap-2">
                    Mi carrito
                    {totalQuantity > 0 && (
                      <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalQuantity}</span>
                    )}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {cart.length > 0 ? (
                    <ul className="flex flex-col gap-3">
                      {cart.map((item) => (
                        <li key={item.id} className="flex gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/50">
                          <div className="size-[68px] rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                            <Image
                              src={typeof item.imagenes === 'string' ? item.imagenes : (item.imagenes as unknown as { imagen_01?: ImageData }).imagen_01?.img || "/default-product.png"}
                              alt={item.producto || "Producto"}
                              width={60}
                              height={60}
                              quality={90}
                              className="object-contain size-full p-1.5"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-snug line-clamp-2 text-gray-900">{item.producto}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.sku}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">Cant. <b className="text-gray-700">{item.quantity}</b></span>
                              <span className="text-sm font-bold text-gray-900">L. {item.precio?.toFixed(2)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="self-start p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-300 hover:text-gray-600 mt-0.5 shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-16">
                      <div className="size-16 rounded-full bg-gray-100 grid place-content-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-gray-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Carrito vacío</p>
                        <p className="text-xs text-gray-400 mt-1">Agrega productos para ordenar</p>
                      </div>
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <SheetFooter className="px-5 pb-6 pt-4 border-t">
                    <div className="w-full flex flex-col gap-3">
                      <div className="flex items-end justify-between">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-black tracking-tight">Lps. {totalPrice}</p>
                      </div>
                      <Separator className="border" />
                      <button
                        onClick={() => route.push("/cart")}
                        className="w-full py-3.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-900 transition-colors"
                      >
                        Realizar pedido
                      </button>
                      <button
                        onClick={() => route.push("/shop")}
                        className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
                      >
                        Seguir comprando
                      </button>
                    </div>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>

            {/* Usuario */}
            <Link
              href="/my-account"
              className="p-2 rounded-full hover:bg-white/8 transition-colors group"
            >
              {currentUser?.photoURL ? (
                <Image
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "Usuario"}
                  width={20}
                  height={20}
                  className="rounded-full object-cover size-5"
                />
              ) : currentUser ? (
                <Avvvatars value={currentUser.email || "user"} size={20} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-white/50 group-hover:text-white transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default NavbarMenu;

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
