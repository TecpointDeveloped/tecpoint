"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { db } from "../../database/Config";
import { collection, getDocs } from "firebase/firestore";
import { Product } from "../../types/ProductTypes";
import { useState, useEffect, forwardRef } from "react";

interface ImageData {
  img: string;
}

interface CartItem {
  id: string;
  quantity: number;
  sku?: string;
  imagenes?: { imagen_01?: ImageData; imagen_02?: ImageData };
  precio?: number;
  producto?: string;
}

function NavbarMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Products"));
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

  useEffect(() => {
    const storedCart: CartItem[] = JSON.parse(localStorage.getItem("cart_tecpoint") || "[]");

    const updatedCart = storedCart.map((item: CartItem) => ({
      ...item,
      imagenes: item.imagenes || {},
    }));

    setCart(updatedCart);
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
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.precio || 0) * item.quantity, 0).toFixed(2);

  return (
    <nav className="flex flex-col h-fit items-center px-2 justify-between bg-[#1b1b1b] backdrop-blur text-white w-full py-4 m-auto z-[999]">
      <section className="flex items-center justify-between w-full l:w-[1900px] md:px-28">
        <div className="flex items-center justify-center gap-8">
          <Link href="/">
            <Image
              priority
              alt="Tecpoint Logo"
              src="/logo.png"
              width={160}
              height={60}
              className="aspect-[160-60]"
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
        <div className="flex items-center justify-center gap-x-8">
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
              <DialogFooter className="h-auto w-full bg-gray-200">
                {loading ? (
                  <p className="text-center text-gray-500">Cargando...</p>
                ) : filteredProducts.length > 0 ? (
                  <ul className="flex gap-x-1 p-1">
                    {filteredProducts.map((product) => (
                      <li
                        key={product.id}
                        className="p-2 w-[230px] cursor-pointer flex flex-col gap-y-3 border rounded-md bg-white text-black hover:bg-gray-100"
                      >
                        <Link href={`/shop/${product.slug}`}>
                          <Image
                            src={product.imagenes?.imagen_01?.img || "/default-product.png"}
                            alt={product.producto || "Producto"}
                            width={160}
                            height={160}
                            quality={100}
                            className="w-[160px] h-[160px] m-auto hover:scale-105 transition-transform"
                          />
                          <div className="flex flex-col gap-y-2">
                            <p className="font-semibold text-[15px] leading-5 tracking-[-0.4px]">{product.producto}</p>
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
              <button className="block">
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
              className="w-full md:w-[34%] bg-[#ffffff] text-black border-transparent"
            >
              <SheetHeader>
                <SheetTitle className="text-center text-lg font-semibold">
                  Tu Carrito ({totalQuantity} productos)
                </SheetTitle>
              </SheetHeader>
              <div className="p-4">
                {cart.length > 0 ? (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 border-b pb-4">
                        <Image
                          src={item.imagenes?.imagen_01?.img || "/default-product.png"}  // Accedemos correctamente al objeto de imágenes
                          alt={item.producto || "Producto"}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover"
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
                  <p className="text-right text-lg font-semibold">
                    Total: L. {totalPrice}
                  </p>

                  <div className="flex gap-x-2">
                    <button
                      className="w-full mt-2 bg-black text-white py-3 rounded-md hover:bg-red-600"
                      onClick={() => window.location.href = "/cart"}
                    >
                      Proceder al pago
                    </button>

                    <button
                      className="w-full mt-2 bg-black text-white py-3 rounded-md hover:bg-transparent border-[1.7px] border-black hover:text-black"
                      onClick={() => window.location.href = "/shop"}
                    >
                      comprar mas
                    </button>
                  </div>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </section>
    </nav>
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