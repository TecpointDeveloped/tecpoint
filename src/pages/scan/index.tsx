import NavbarMenu from '@/components/navbarmenu/page'
import { useState } from 'react'
import Image from 'next/image'
import Confetti from "react-confetti";
import { useAuth } from '@/context/useAuth';
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@/components/ui/input-otp"
import Head from 'next/head';
import { getFirestore, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { app } from "../../database/Config";
import Link from 'next/link';
import Footer from '@/components/Footer/page';

type Gift = {
  ImageGift: string;
  NameGift: string;
  location: string;
  upc: string;
};

function Page() {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const { currentUser } = useAuth();
  const { signInWithGoogle } = useAuth();

  async function OnSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement;
    const upcCode = input.value.trim();
    const db = getFirestore(app);

    const q = query(collection(db, "regalos_tecpoint"), where("upc", "==", upcCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const gift = doc.data() as Gift;

      setImage(gift.ImageGift);
      setName(gift.NameGift);
      setLocation(gift.location);
      setError(null);
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
        alert('Gracias por Participar, envia el comprobante al whatsapp para reclamar tu premio!!.');
      }, 10000);

      try {
        const res = await fetch('/api/send-email/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser?.email,
            name: currentUser?.displayName,
            gift: gift.NameGift,
            location: gift.location,
          }),
        });
        if (!res.ok) console.warn('Error enviando email');
        if(upcCode !== "8392746153082") {
          await deleteDoc(doc.ref);
        }
      } catch (err) {
        console.error('Error enviando email:', err);
      }
    } else {
      setError('Ups... El código ingresado ya fue utilizado.');
      setImage(null);
      setName(null);
      setLocation(null);
      setShowConfetti(false);
    }
  }

  return (
    <>
      <Head>
        <title>Escanea Código QR | Tecpoint Sorteo Honduras</title>
        <meta name="description" content="Escanea el código QR en tus compras Tecpoint para participar en nuestro sorteo y ganar premios. ¡Suerte!" />
        <meta name="keywords" content="escanear QR, sorteo Tecpoint, código QR, premios, Honduras" />
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Tecpoint Distribucion" />
        <meta name="language" content="es-HN" />

        <meta property="og:title" content="Participa en Nuestro Sorteo | Tecpoint" />
        <meta property="og:description" content="Escanea el código QR en tu compra y participa para ganar premios." />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/og_scan_and_win.webp?alt=media&token=35a959d1-f004-4dba-a565-9eb3ef9f04fa" />
        <meta property="og:url" content="https://tecpoint.ws/scan" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Participa en el Sorteo Tecpoint" />
        <meta name="twitter:description" content="Escanea QR y gana premios en Tecpoint" />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/og_scan_and_win.webp?alt=media&token=35a959d1-f004-4dba-a565-9eb3ef9f04fa" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://tecpoint.ws/scan" />
      </Head>

      <NavbarMenu />

      <main className="flex w-full h-fit flex-col relative lg:h-[90vh] lg:flex-row items-center justify-center bg-gray-100">
        <div className="w-full h-fit lg:w-1/2 flex items-center justify-center flex-col ">

          {currentUser && (
            <section className="flex items-center justify-center gap-3 size-fit bg-white rounded-2xl py-3 px-4 shadow-lg md:mb-6">
              <Image src={currentUser?.photoURL || ''} alt="User" width={40} height={40} className="rounded-full" />
              <span className='flex flex-col'>
                <h2 className="text-2xl md:text-lg font-bold text-start">{currentUser?.displayName ?? ""}</h2>
                <h2 className='leading-3'>{currentUser?.email ?? ""}</h2>
              </span>
            </section>
          )}

          <h1 className="text-2xl lg:text-4xl font-bold mt-10 sm:mt-10 md:mb-4 md:mt-0 text-center tracking-[-1.2px]">
            Ingresa el Codigo del <br /> Volante
          </h1>
          <form
            onSubmit={OnSubmitForm}
            className="flex flex-col items-center justify-center gap-4 w-full"
          >

            <InputOTP maxLength={13} minLength={12} disabled={!currentUser}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={8} />
                <InputOTPSlot index={9} />
                <InputOTPSlot index={10} />
                <InputOTPSlot index={11} />
                <InputOTPSlot index={12} />
              </InputOTPGroup>
            </InputOTP>

            {currentUser ? (
              <span className='flex flex-col items-center justify-center gap-4 w-full mt-4'>
                <button type="submit" className="inline-flex gap-2 h-12 animate-background-shine items-center justify-center rounded-full border border-gray-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-gray-300 hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M11.25 3v4.046a3 3 0 0 0-4.277 4.204H1.5v-6A2.25 2.25 0 0 1 3.75 3h7.5ZM12.75 3v4.011a3 3 0 0 1 4.239 4.239H22.5v-6A2.25 2.25 0 0 0 20.25 3h-7.5ZM22.5 12.75h-8.983a4.125 4.125 0 0 0 4.108 3.75.75.75 0 0 1 0 1.5 5.623 5.623 0 0 1-4.875-2.817V21h7.5a2.25 2.25 0 0 0 2.25-2.25v-6ZM11.25 21v-5.817A5.623 5.623 0 0 1 6.375 18a.75.75 0 0 1 0-1.5 4.126 4.126 0 0 0 4.108-3.75H1.5v6A2.25 2.25 0 0 0 3.75 21h7.5Z" />
                    <path d="M11.085 10.354c.03.297.038.575.036.805a7.484 7.484 0 0 1-.805-.036c-.833-.084-1.677-.325-2.195-.843a1.5 1.5 0 0 1 2.122-2.12c.517.517.759 1.36.842 2.194ZM12.877 10.354c-.03.297-.038.575-.036.805.23.002.508-.006.805-.036.833-.084 1.677-.325 2.195-.843A1.5 1.5 0 0 0 13.72 8.16c-.518.518-.76 1.362-.843 2.194Z" />
                  </svg>

                  Probar Suerte
                </button>

                {name && image && (
                  <Link
                    href={`https://wa.me/50497157784?text=${encodeURIComponent(
                      `Hola Tecpoint soy ${currentUser.displayName}, acabo de participar en Escanea y Gana y mi premio fue \n *${name}* con el código *${(document.querySelector('input') as HTMLInputElement)?.value || '[código]'}* y el correo: *${currentUser.email}*.`
                    )}`}
                    className="h-12 bg-green-500 text-white px-6 rounded-full flex items-center justify-center gap-2 leading-4"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image src="/images/social/whatsapp.svg" alt="Send Icon" width={24} height={24} />
                    Enviar comprobante
                  </Link>
                )}
              </span>
            ) : (
              <div className="flex flex-col gap-y-2 w-full items-center">
                <button
                  onClick={signInWithGoogle}
                  className="hover:bg-gray-200 border-gray-200 border-2 transition-colors text-black font-[Poppins] w-full lg:w-[290px] h-12 rounded-[8px] bg-white flex items-center justify-center gap-2 px-8"
                >
                  <Image alt="google icons" src="/google.svg" height={20} width={20} />
                  Empezar a Participar
                </button>
              </div>
            )}
          </form>

          <div id="result" className="mt-8 text-center">
            {error && (
              <p className="text-red-500">
                {error}
                {setTimeout(() => setError(null), 3600) && null}
              </p>
            )}
          </div>
        </div>

        <div className="lg:w-1/2 h-[90vh] w-full md:h-full flex items-center justify-center flex-col bg-white px-4 overflow-hidden relative">
          <Image
            src="/scan/scanbg.svg"
            alt="Scan Gift"
            width={400}
            height={400}
            className='object-cover absolute w-full h-full select-none'
          />
          <h2 className="text-white text-2xl lg:text-4xl font-bold mb-4 text-center tracking-[-1.2px] z-10">Tu Premio es :</h2>

          {image ? (
            <Image
              src={image || ''}
              quality={90}
              width={380}
              height={380}
              alt="Gift"
              className="rounded-xl z-10 shadow-xl border-1 border-[#ff2e2e] shadow-black/10 select-none"
            />
          ) : (
            <div
              id="result"
              className="w-[380px] h-[380px] bg-white rounded-xl flex items-center justify-center z-10 "
            >
            </div>
          )}

          <div className="mt-10 flex flex-col items-center z-10">
            {name && <span className="text-base text-[22px] text-center mb-4 lg:text-lg font-medium text-white">{name}</span>}
            {
              location && <span className="text-md text-white mt-1 flex items-center gap-2 flex-wrap justify-center text-center">
                <span className='bg-gray-200 py-1 px-3 rounded-full text-gray-600 font-semibold text-nowrap'>Válido en :</span>
                {location}
              </span>
            }
          </div>
        </div>
      </main>

      {showConfetti && <Confetti className="fixed top-0 size-full" gravity={0.1} />}

      <Footer />
    </>
  );
}

export default Page;