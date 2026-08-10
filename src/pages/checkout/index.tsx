import Head from "next/head";
import Link from "next/link";
import NavbarMenu from "@/components/navbarmenu/page";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";

export default function CheckoutPage() {
  const { mainWhatsApp } = useSiteConfig();
  return (
    <>
      <Head>
        <title>Finalizar compra | TECPOINT</title>
        <meta
          name="description"
          content="Finalice su pedido TECPOINT con la orientación de un asesor."
        />
        <meta name="robots" content="noindex,follow" />
      </Head>

      <NavbarMenu />

      <main className="min-h-[75vh] bg-[#f4f6f7] px-5 pb-16 pt-28">
        <section className="mx-auto max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(19,24,23,.10)]">
          <div className="h-2 bg-[#cf2c28]" />
          <div className="p-8 md:p-12">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#cf2c28]">
              Compra segura
            </p>
            <h1 className="max-w-xl text-4xl font-bold tracking-[-0.04em] text-[#131817] md:text-5xl">
              Finalice su pedido con un asesor TECPOINT.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5a6260]">
              Por ahora confirmamos disponibilidad, compatibilidad, entrega y
              método de pago directamente por WhatsApp. No solicitamos datos de
              tarjeta dentro de esta página.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/cart"
                className="rounded-full bg-[#cf2c28] px-6 py-4 text-center font-bold text-white transition hover:bg-[#a7192f]"
              >
                Revisar mi carrito
              </Link>
              <a
                href={whatsappLink(mainWhatsApp, "Hola TECPOINT, quiero finalizar mi compra.")}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#131817] px-6 py-4 text-center font-bold text-[#131817] transition hover:bg-[#131817] hover:text-white"
              >
                Hablar con un asesor
              </a>
            </div>

            <p className="mt-8 border-t border-[#e2e6e7] pt-6 text-sm leading-6 text-[#737b79]">
              El pago en línea se habilitará únicamente después de completar la
              configuración segura del proveedor y validar el flujo de compra.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
