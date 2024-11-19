"use client"

import Image from "next/image";
import { Search } from "lucide-react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function NavbarMenu() {
  return (
    <nav className="flex flex-col h-fit items-center justify-between bg-[#1b1b1b] backdrop-blur text-white w-full py-4 m-auto z-[999]">
      <section className="flex items-center justify-between w-full 2x top-0 left-0 l:w-[1900px] md:px-28">
        <div className="flex items-center justify-center gap-8">
          <Image priority alt="Tecpoint Logo" src="/logo.png" width={180} height={80} className="aspect-[180-80]" />
        </div>

        <div className="flex items-center justify-center gap-12">
          <Link href="/" className="text-[14px] font-[500] font-[Poppins]">Inicio</Link>
          <Link href="/" className="text-[14px] font-[500] font-[Poppins]">Categorias</Link>
          <Link href="/shop" className="text-[14px] font-[500] font-[Poppins]">Productos</Link>
        </div>

        <div className="flex items-center justify-center gap-x-8">
          <span className="flex items-center justify-center gap-x-6">

            <Dialog>
              <DialogTrigger asChild className="cursor-pointer">
                <Search color="white" strokeWidth={1.8} />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] md:max-w-[850px] h-auto">
                <DialogHeader>
                  <DialogTitle className="sm:text-[18px] md:text-[24px]">Empieza a Buscar Productos!</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
                <div className="flex items-center justify-center gap-x-2">
                  <Input
                    id="name"
                    defaultValue=""
                    className="flex-1 py-2 px-6 md:h-12 rounded-full"
                    placeholder="Buscar Productos"
                  />
                  <button type="submit" name="submit" id="submit" className="bg-black p-2 rounded-full border size-12 grid place-content-center active:bg-[#f30] transition-colors">
                    <Search color="#fff" strokeWidth={1.8} />
                  </button>
                </div>

                <DialogFooter className="h-[250px] w-full bg-gray-200">

                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </SheetTrigger>

              <SheetContent className="w-[1800px]">
                <SheetHeader>
                  <SheetTitle>Are you absolutely sure?</SheetTitle>


                </SheetHeader>
              </SheetContent>
            </Sheet>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </span>

        </div>
      </section>
    </nav>
  )
}
export default NavbarMenu