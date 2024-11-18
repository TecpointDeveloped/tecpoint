"use client";

import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

function NavbarMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex flex-col h-fit items-center justify-between bg-[#1b1b1b] backdrop-blur text-white w-full py-4 m-auto z-[999]">
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
          <Link href="/" className="text-[14px] font-[500] font-[Poppins]">
            Categorias
          </Link>
          <Link href="/shop" className="text-[14px] font-[500] font-[Poppins]">
            Productos
          </Link>
        </div>

        {/* Iconos de acción */}
        <div className="flex items-center justify-center gap-x-8">
          <span className="flex items-center justify-center gap-x-6">
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
          </span>

          {/* Menú hamburguesa */}
          <button
            className="block md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu color="white" strokeWidth={1.8} />
          </button>
        </div>
      </section>

      {/* Menú hamburguesa en pantalla completa */}
      {menuOpen && (
        <div
          className={`fixed top-0 right-0 z-[1000] h-screen w-screen bg-[#1b1b1b] text-white transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            {/* Cerrar menú */}
            <button onClick={() => setMenuOpen(false)}>
              <X color="white" strokeWidth={1.8} className="h-8 w-8" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <Link
              href="/"
              className="text-[18px] font-[500] font-[Poppins]"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/"
              className="text-[18px] font-[500] font-[Poppins]"
              onClick={() => setMenuOpen(false)}
            >
              Categorias
            </Link>
            <Link
              href="/shop"
              className="text-[18px] font-[500] font-[Poppins]"
              onClick={() => setMenuOpen(false)}
            >
              Productos
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavbarMenu;
