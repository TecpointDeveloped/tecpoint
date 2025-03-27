import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import { db } from "../../database/Config";
import { collection, getDocs } from "firebase/firestore";
import { Product } from "../../types/ProductTypes";
import { useState, useEffect, forwardRef } from "react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { useAuth } from "@/context/useAuth";
import { useCartStore } from "@/lib/cartStore";
import Avvvatars from 'avvvatars-react';
import { Separator } from "@radix-ui/react-separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ImageData {
  img: string;
}

function NavbarMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const route = useRouter();

  const { currentUser } = useAuth();
  const { cart, removeFromCart } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.sku?.toLowerCase().includes(value.toLowerCase()) ||
        product.producto?.toLowerCase().includes(value.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredProducts(filtered);
  };

  const handleRemoveFromCart = (id: string) => {
    removeFromCart(id);
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.precio || 0) * item.quantity, 0).toFixed(2);

  return (
    <nav className="flex flex-col h-fit items-center justify-between bg-[#010101] backdrop-blur text-white w-full px-4 md:px-2 md:py-2 m-auto z-10">
      <section className="flex items-center justify-between w-full l:w-[1900px] md:px-28">
        <div className="flex items-center justify-center gap-8">
          <Link href="/">
            <Image
              quality={100}
              priority
              alt="Tecpoint Logo"
              src="/logo.png"
              width={160}
              height={60}
              className="aspect-[160/60] object-contain"
            />
          </Link>
        </div>
        <div className="hidden md:flex items-center justify-center gap-12">
          <Link href="/" className="text-[14px] font-[500] font-[Poppins]">
            Inicio
          </Link>
          <Link href="/shop" className="text-[14px] font-[500] font-[Poppins]">
            Tienda
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Blog</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <ListItem href="/blog" title="Noticias">
                      Descubre las últimas noticias de tecnología.
                    </ListItem>
                    <ListItem href="/blog" title="Guías">
                      Explora nuestras guías de compra y tips útiles.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Link href="/categories" className="text-[14px] font-[500] font-[Poppins]">
            Categorías
          </Link>
        </div>

        <div className="flex items-center justify-center gap-x-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="block relative">
                {cart.length > 0 && (
                  <div className="absolute top-0 -right-1 border-black border-2 size-3 bg-green-300 rounded-full"></div>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full md:w-[34%] bg-[#ffffff] text-black border-transparent z-[999]"
            >
              <SheetHeader>
                <SheetTitle className="text-center text-lg font-semibold">
                  Tu Carrito ({totalQuantity} productos)
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 overflow-hidden overflow-y-scroll md:max-h-[78%]">
                {cart.length > 0 ? (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 border-b pb-4">
                        <Image
                          src={typeof item.imagenes === 'string' ? item.imagenes : (item.imagenes as unknown as { imagen_01?: ImageData }).imagen_01?.img || "/default-product.png"}
                          alt={item.producto || "Producto"}
                          width={80}
                          height={80}
                          quality={90}
                          className="object-cover aspect-square"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold">{item.producto}</h3>
                          <p className="text-gray-600 text-sm font-bold">{item.sku}</p>
                          <p className="text-gray-800 text-sm">Cantidad: {item.quantity}</p>
                          <p className="text-gray-800 text-sm">Precio: L. {item.precio?.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-sm text-black/80">
                    Tu carrito está vacío.
                  </p>
                )}
              </div>

              <SheetFooter className="absolute w-full bottom-0 left-0">
                <div className="p-4 mt-4 w-full">
                  <span className="w-full flex justify-between">
                    <p className="text-right text-lg font-semibold">Total</p>
                    <p className="text-right text-lg font-semibold">Lps. {totalPrice}</p>
                  </span>
                  <Separator className="m-2 border" />

                  <div className="flex gap-x-2">
                    <button
                      className="w-full mt-2 bg-black text-white py-3 hover:bg-red-600"
                      onClick={() => route.push("/cart")}
                    >
                      Realizar Pedido
                    </button>

                    <button
                      className="w-full mt-2 bg-black text-white py-3 hover:bg-transparent border-[1.7px] border-black hover:text-black"
                      onClick={() => route.push("/shop")}
                    >
                      comprar mas
                    </button>
                  </div>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <button className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full bg-[#010101] text-white border-transparent z-[999]">
              <SheetHeader className="flex items-center justify-between relative">
                <Image height={600} width={1600} className="w-full h-[80px] aspect-auto object-contain object-center rounded-xl" priority quality={100} src="/images/og_image.png" alt="descuentos de verano 2025 en tecpoint" />
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-4">
                <Link href="/" className="text-[14px] font-[500] font-[Poppins]">
                  Inicio
                </Link>
                <Link href="/shop" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
                    <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clipRule="evenodd" />
                  </svg>
                  Tienda
                </Link>
                <Link href="/blog" className="text-[14px] font-[500] font-[Poppins]">
                  Blog
                </Link>
                <Accordion type="single" collapsible>
                  <AccordionItem value="categories" className="border-transparent">
                    <AccordionTrigger className="text-[14px] font-[500] font-[Poppins] p-0">
                      Categorías
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-2 ml-4 pt-4">
                        <li>
                          <Link href="/shop?page=1&brand=&category=all&search=audifonos" className="text-[14px] font-[500] font-[Poppins]">
                            Audífonos
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=auriculares&search=" className="text-[14px] font-[500] font-[Poppins]">
                            Auriculares
                          </Link>
                        </li>
                        <li>
                          <Link href="shop?page=1&brand=&category=cable&search" className="text-[14px] font-[500] font-[Poppins]">
                            Cables
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=cargadores&search" className="text-[14px] font-[500] font-[Poppins]">
                            Cargadores
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=cobertor&search" className="text-[14px] font-[500] font-[Poppins]">
                            Cobertores
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=sonido&search" className="text-[14px] font-[500] font-[Poppins]">
                            Sonido
                          </Link>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Link href="/cart" className="text-[14px] font-[500] font-[Poppins]">
                  Mi Carrito
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:flex items-center justify-center gap-x-8">
          {/* Búsqueda */}
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer">
              <Search color="white" strokeWidth={1.8} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[850px] h-auto">
              <DialogHeader>
                <DialogTitle className="sm:text-[18px] md:text-[24px]">
                  Empieza a Buscar Productos!
                </DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Busca tus productos favoritos aquí.
              </DialogDescription>
              <div className="flex items-center justify-center gap-x-2">
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="flex-1 py-2 px-6 md:h-12 rounded-full"
                  placeholder="Buscar por SKU, Producto o Descripción"
                />
              </div>
              <DialogFooter className="max-h-[300px] w-full overflow-hidden overflow-y-scroll">
                {loading ? (
                  <p className="text-center text-gray-500">Cargando...</p>
                ) : filteredProducts.length > 0 ? (
                  <ul className="flex flex-col gap-y-2 p-2">
                    {filteredProducts.map((product) => (
                      <li
                        key={product.id}
                        className="p-2 w-full cursor-pointer gap-y-3 border rounded-md bg-white text-black hover:bg-gray-100"
                      >
                        <Link href={`/shop/${product.slug}`} className="flex items-center gap-8 p-4">
                          <Image
                            src={(product.imagenes as { imagen_01?: ImageData })?.imagen_01?.img || "/default-product.png"}
                            alt={product.producto || "Producto"}
                            width={120}
                            height={120}
                            quality={100}
                            className="w-[120px] h-[120px] hover:scale-105 transition-transform"
                          />
                          <div className="flex flex-col gap-y-2 w-[60%]">
                            <p className="font-semibold text-[18px] leading-5 tracking-[-0.4px]">{product.producto}</p>
                            <p className="text-gray-600 font-bold">{product.sku}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500">
                    No se encontraron productos.
                  </p>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Carrito */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="block relative">
                {cart.length > 0 && (
                  <div className="absolute top-0 -right-1 border-black border-2 size-3 bg-green-300 rounded-full"></div>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full md:w-[34%] bg-[#ffffff] text-black border-transparent z-[999]"
            >
              <SheetHeader>
                <SheetTitle className="text-center text-lg font-semibold">
                  Tu Carrito ({totalQuantity} productos)
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 overflow-hidden overflow-y-scroll h-[78%]">
                {cart.length > 0 ? (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 border-b pb-4">
                        <Image
                          src={typeof item.imagenes === 'string' ? item.imagenes : (item.imagenes as unknown as { imagen_01?: ImageData }).imagen_01?.img || "/default-product.png"}
                          alt={item.producto || "Producto"}
                          width={80}
                          height={80}
                          quality={90}
                          className="object-cover aspect-square"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold">{item.producto}</h3>
                          <p className="text-gray-600 text-sm font-bold">{item.sku}</p>
                          <p className="text-gray-800 text-sm">Cantidad: {item.quantity}</p>
                          <p className="text-gray-800 text-sm">Precio: L. {item.precio?.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-sm text-black/80">
                    Tu carrito está vacío.
                  </p>
                )}
              </div>

              <SheetFooter className="absolute w-full bottom-0 left-0">
                <div className="p-4 mt-4 w-full">
                  <span className="w-full flex justify-between">
                    <p className="text-right text-lg font-semibold">Total</p>
                    <p className="text-right text-lg font-semibold">Lps. {totalPrice}</p>
                  </span>
                  <Separator className="m-2 border" />

                  <div className="flex gap-x-2">
                    <button
                      className="w-full mt-2 bg-black text-white py-3 hover:bg-red-600"
                      onClick={() => route.push("/cart")}
                    >
                      Realizar Pedido
                    </button>

                    <button
                      className="w-full mt-2 bg-black text-white py-3 hover:bg-transparent border-[1.7px] border-black hover:text-black"
                      onClick={() => route.push("/shop")}
                    >
                      comprar mas
                    </button>
                  </div>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {currentUser ? (
            <Link href="/my-account" className="size-[36px] rounded-full overflow-hidden grid place-content-center hover:bg-[#ffffff2a] transition-colors">
              {currentUser.photoURL ? (
                <Image
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "Usuario tecpoint distribucion"}
                  quality={100}
                  priority={true}
                  width={26}
                  height={26}
                  className="cursor-pointer aspect-square rounded-full"
                />
              ) : (
                <Avvvatars value={currentUser.email || "user"} />
              )}
            </Link>
          ) : (
            <Link href="/my-account" className="size-[36px] cursor-pointer rounded-full overflow-hidden grid place-content-center hover:bg-[#ffffff2a] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-[26px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Link>
          )}
        </div>
      </section>
    </nav >
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
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";