"use client";

import Image from "next/image";
import { Search, Menu } from "lucide-react";
import Link from "next/link";

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

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

function NavbarMenu() {
  return (
    <nav className="flex flex-col h-fit items-center px-2 justify-between bg-[#1b1b1b] backdrop-blur text-white w-full py-4 m-auto z-[999]">
      <section className="flex items-center justify-between w-full l:w-[1900px] md:px-28">
        {/* Logo */}
        <div className="flex items-center justify-center gap-8">
          <Image
            priority
            alt="Tecpoint Logo"
            src="/logo.png"
            width={180}
            height={80}
            className="aspect-[180-80]"
          />
        </div>

        {/* Menu en pantallas grandes */}
        <div className="hidden md:flex items-center justify-center gap-12">
          <Link href="/" className="text-[14px] font-[500] font-[Poppins]">
            Inicio
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categorias</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            shadcn/ui
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Beautifully designed components built with Radix UI and
                            Tailwind CSS.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="Introduction">
                      Re-usable components built using Radix UI and Tailwind CSS.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Installation">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem href="/docs/primitives/typography" title="Typography">
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/" className="text-[14px] font-[500] font-[Poppins]">
            Blog
          </Link>
          <Link href="/shop" className="text-[14px] font-[500] font-[Poppins]">
            Tienda
          </Link>
        </div>

        {/* Iconos de acción */}
        <div className="flex items-center justify-center gap-x-8">
          {/* Buscador */}
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
                  id="name"
                  defaultValue=""
                  className="flex-1 py-2 px-6 md:h-12 rounded-full"
                  placeholder="Buscar Productos"
                />
                <button
                  type="submit"
                  name="submit"
                  id="submit"
                  className="bg-black p-2 rounded-full border size-12 grid place-content-center active:bg-[#f30] transition-colors"
                >
                  <Search color="#fff" strokeWidth={1.8} />
                </button>
              </div>
              <DialogFooter className="h-[250px] w-full bg-gray-200"></DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Carrito: Mostrar solo en pantallas grandes */}
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
              className="w-full md:w-[44%] bg-[#ffffff] text-blac border-transparent"
            >
              <SheetHeader>
                <SheetTitle className="text-center text-lg font-semibold">
                  Tu Carrito
                </SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <p className="text-center text-sm text-black/80">
                  Tu carrito está vacío.
                </p>
              </div>
            </SheetContent>

            <SheetFooter>
              <button className=""></button>
            </SheetFooter>
          </Sheet>

          {/* Menú hamburguesa con Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="block md:hidden">
                <Menu color="white" strokeWidth={1.8} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full h-full bg-[#ffffff] text-black border-transparent"
            >
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <Link
                  href="/"
                  className="text-[20px] font-[500] font-[Poppins] hover:text-gray-300"
                >
                  Inicio
                </Link>
                <Link
                  href="/"
                  className="text-[20px] font-[500] font-[Poppins] hover:text-gray-300"
                >
                  Categorías
                </Link>
                <Link
                  href="/shop"
                  className="text-[20px] font-[500] font-[Poppins] hover:text-gray-300"
                >
                  Productos
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </section>
    </nav>
  );
}

export default NavbarMenu;

const ListItem = React.forwardRef<
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
  )
})
ListItem.displayName = "ListItem"