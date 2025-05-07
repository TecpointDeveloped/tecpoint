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
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { useAuth } from "@/context/useAuth";
import { useCartStore } from "@/lib/cartStore";
import Avvvatars from 'avvvatars-react';
import { Separator } from "@radix-ui/react-separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ImageData {
  img: string;
}

function NavbarMenu({ bgColor }: { bgColor?: "black" | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [color, setcolor] = useState("transparent");
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

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 490) {
      setcolor("#010101");
    } else {
      setcolor("transparent");
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="bg-[#000] flex top-0 flex-col h-fit items-center justify-between text-white w-full px-4 md:px-2 md:py-2 m-auto z-50">
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
          <Link href="/" className="text-[14px] font-[500] font-[Poppins] hover:underline ">
            Inicio
          </Link>
          <Link href="/shop" className="text-[14px] font-[500] font-[Poppins] hover:underline ">
            Tienda
          </Link>
          <Link href="/scan" className="text-[14px] font-[500] font-[Poppins] hover:underline hover:text-[#ffe607]">
            Sorteo
          </Link>
          {/* <NavigationMenu>
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
          </NavigationMenu> */}
          <Link href="/categories" className="text-[14px] font-[500] font-[Poppins] hover:underline ">
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
                <Link href="/" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                  </svg>
                  Inicio
                </Link>
                <Link href="/shop" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
                    <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clipRule="evenodd" />
                  </svg>
                  Tienda
                </Link>
                <Link href="/scan" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="size-6" viewBox="0 0 24 24">
                    <path d="M5 4h3v2.708A2.5 2.5 0 0 0 4.708 10H2V7a3 3 0 0 1 3-3ZM2 14.5v-3h4.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 12.56v4.94H5a3 3 0 0 1-3-3Zm7.5 3h7a3 3 0 0 0 3-3v-3h-8.94l1.72 1.72a.75.75 0 1 1-1.06 1.06L9.5 12.56v4.94Zm3.292-7.5H19.5V7a3 3 0 0 0-3-3h-7v2.708A2.5 2.5 0 0 1 12.792 10ZM10.5 10h-1V9a1 1 0 1 1 1 1ZM7 10h1V8.992A1 1 0 1 0 7 10Zm.5 10c-1.11 0-2.08-.603-2.599-1.5H16.5a4 4 0 0 0 4-4V6.901A2.999 2.999 0 0 1 22 9.5v5a5.5 5.5 0 0 1-5.5 5.5h-9Z" />
                  </svg>
                  Gran Sorteo Tecpoint
                </Link>
                <Accordion type="single" collapsible>
                  <AccordionItem value="categories" className="border-transparent">
                    <AccordionTrigger className="text-[14px] font-[500] font-[Poppins] p-0 flex-none items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M1.5 7.125c0-1.036.84-1.875 1.875-1.875h6c1.036 0 1.875.84 1.875 1.875v3.75c0 1.036-.84 1.875-1.875 1.875h-6A1.875 1.875 0 0 1 1.5 10.875v-3.75Zm12 1.5c0-1.036.84-1.875 1.875-1.875h5.25c1.035 0 1.875.84 1.875 1.875v8.25c0 1.035-.84 1.875-1.875 1.875h-5.25a1.875 1.875 0 0 1-1.875-1.875v-8.25ZM3 16.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875v2.25c0 1.035-.84 1.875-1.875 1.875h-5.25A1.875 1.875 0 0 1 3 18.375v-2.25Z" clipRule="evenodd" />
                      </svg>
                      Categorías
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-2 ml-4 pt-4">
                        <li>
                          <Link href="/shop?page=1&brand=&category=all&search=audifonos" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="size-6" viewBox="0 0 24 24">
                              <path d="M3.5 12a8.5 8.5 0 0 1 17 0v2h-2.25a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75H19a3 3 0 0 0 3-3v-7c0-5.523-4.477-10-10-10S2 6.477 2 12v7a3 3 0 0 0 3 3h.75a.75.75 0 0 0 .75-.75v-6.5a.75.75 0 0 0-.75-.75H3.5v-2Zm9.25-.25a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0v-10.5Zm-4 2.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm7.25.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z" />
                            </svg>
                            Audífonos
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=auriculares&search=" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              fill="currentColor"
                              className="bi bi-earbuds"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.825 4.138c.596 2.141-.36 3.593-2.389 4.117a4.432 4.432 0 0 1-2.018.054c-.048-.01.9 2.778 1.522 4.61l.41 1.205a.52.52 0 0 1-.346.659l-.593.19a.548.548 0 0 1-.69-.34L.184 6.99c-.696-2.137.662-4.309 2.564-4.8 2.029-.523 3.402 0 4.076 1.948zm-.868 2.221c.43-.112.561-.993.292-1.969-.269-.975-.836-1.675-1.266-1.563-.43.112-.561.994-.292 1.969.269.975.836 1.675 1.266 1.563zm3.218-2.221c-.596 2.141.36 3.593 2.389 4.117a4.434 4.434 0 0 0 2.018.054c.048-.01-.9 2.778-1.522 4.61l-.41 1.205a.52.52 0 0 0 .346.659l.593.19c.289.092.6-.06.69-.34l2.536-7.643c.696-2.137-.662-4.309-2.564-4.8-2.029-.523-3.402 0-4.076 1.948zm.868 2.221c-.43-.112-.561-.993-.292-1.969.269-.975.836-1.675 1.266-1.563.43.112.561.994.292 1.969-.269.975-.836 1.675-1.266 1.563z"
                              />
                            </svg>
                            Auriculares
                          </Link>
                        </li>
                        <li>
                          <Link href="shop?page=1&brand=&category=cable&search" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288" fill="currentColor" className="size-6">
                              <path d="m122 25 15-21c4-5 10-5 14 0l16 22c4 5 2 10-5 10h-12v118c0 3 3 3 5 1l25-25c4-4 6-10 6-16V90c-7 0-12-5-12-12V66c0-6 5-12 12-12h12c7 0 12 5 12 12v12c0 7-5 12-12 12v24c0 10-3 18-10 25l-31 31c-4 4-7 6-7 16v49c12 3 21 13 21 26 0 15-12 27-27 27s-27-12-27-27c0-13 9-23 21-26v-13c0-10-3-13-7-17l-31-31c-6-6-10-14-10-24v-25c-7-2-12-9-12-17 0-10 8-18 18-18s18 8 18 18c0 8-5 15-12 17v25c0 7 3 12 7 16l25 25c2 2 4 2 4-1V36h-12c-7 0-9-5-4-11z" />
                            </svg>
                            Cables
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=cargadores&search" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="size-6" viewBox="0 0 24 24">
                              <path d="M10.75 6H17a3 3 0 0 1 2.995 2.824L20 9v1l1 .018a1 1 0 0 1 .993.879l.008.12v2a1 1 0 0 1-.866.992l-.134.009L20 14v1a3 3 0 0 1-2.824 2.995L17 18H7.995a.75.75 0 0 1-.743-.648l-.007-.102v-4.5a.75.75 0 0 1 .649-.743L7.995 12h.628c.716 0 1.304-.546 1.37-1.245l.007-.132V6.75a.75.75 0 0 1 .648-.743L10.75 6H17h-6.25ZM6.645 4.007 6.747 4a.75.75 0 0 1 .743.648l.007.102L7.496 6h.758a.75.75 0 0 1 .75.75v2.499a1.75 1.75 0 0 1-1.75 1.75l-1.003-.001v6.245a.75.75 0 0 1-.647.743l-.102.007a.75.75 0 0 1-.743-.648l-.007-.102v-6.245H3.75A1.75 1.75 0 0 1 2 9.249V6.75A.75.75 0 0 1 2.75 6h.751V4.75a.75.75 0 0 1 .648-.743L4.251 4a.75.75 0 0 1 .743.648l.007.102V6h.995V4.75a.75.75 0 0 1 .65-.743l.1-.007-.1.007Z" />
                            </svg>
                            Cargadores
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=cobertor&search" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="size-6" viewBox="0 0 24 24">
                              <path d="M8.25 2A2.25 2.25 0 0 0 6 4.25v13a2.25 2.25 0 0 0 2.25 2.25h5.5A2.25 2.25 0 0 0 16 17.25v-13A2.25 2.25 0 0 0 13.75 2h-5.5ZM9 16.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75ZM10.75 22a2.25 2.25 0 0 1-2.122-1.5h5.622A2.75 2.75 0 0 0 17 17.75V4.628a2.25 2.25 0 0 1 1.5 2.122v11A4.25 4.25 0 0 1 14.25 22h-3.5Z" />
                            </svg>
                            Cobertores
                          </Link>
                        </li>
                        <li>
                          <Link href="/shop?page=1&brand=&category=sonido&search" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" className="size-6" viewBox="0 0 24 24">
                              <path d="M19.842 12.102c.265.319.742.317 1.035.024.293-.293.29-.765.032-1.09a6.473 6.473 0 0 1-1.405-4.037c0-1.525.525-2.928 1.405-4.036.257-.325.261-.797-.032-1.09-.293-.293-.77-.295-1.035.024a7.967 7.967 0 0 0-1.838 5.102c0 1.94.69 3.718 1.838 5.103Zm2.138-8.07c.246-.334.726-.33 1.019-.038.293.293.284.765.06 1.113A3.484 3.484 0 0 0 22.504 7c0 .697.204 1.347.555 1.893.224.348.233.82-.06 1.113-.293.292-.773.295-1.02-.038a4.978 4.978 0 0 1-.975-2.968c0-1.11.362-2.137.976-2.967ZM3.1 11.036c-.258.325-.262.797.031 1.09.293.293.77.295 1.035-.024A7.967 7.967 0 0 0 6.004 7c0-1.94-.69-3.717-1.838-5.102-.264-.32-.742-.317-1.035-.024-.293.293-.289.765-.031 1.09A6.472 6.472 0 0 1 4.504 7 6.472 6.472 0 0 1 3.1 11.036Zm-2.09-1.031c.293.293.773.296 1.019-.038.613-.83.975-1.856.975-2.967a4.978 4.978 0 0 0-.975-2.967c-.246-.334-.726-.33-1.02-.038-.292.293-.284.765-.06 1.113.352.546.555 1.195.555 1.892 0 .697-.203 1.347-.555 1.892-.224.348-.232.82.06 1.113ZM17.754 14a2.249 2.249 0 0 1 2.25 2.25v.918a2.75 2.75 0 0 1-.513 1.598c-1.546 2.164-4.07 3.235-7.49 3.235-3.422 0-5.945-1.072-7.487-3.236a2.75 2.75 0 0 1-.51-1.596v-.92A2.249 2.249 0 0 1 6.253 14h11.502ZM12 2.005a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
                            </svg>
                            Sonido
                          </Link>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Link href="/cart" className="text-[14px] font-[500] font-[Poppins] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                  </svg>
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
              className="w-full md:w-[34%] bg-[#ffffff] text-black border-transparent z-[999] "
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