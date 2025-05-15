import NavbarMenu from '@/components/navbarmenu/page'
import giftData from '@/data/gifts.json'
import { useState } from 'react'
import Image from 'next/image'
import Confetti from "react-confetti";
import { useAuth } from '@/context/useAuth';
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@/components/ui/input-otp"
import Head from 'next/head';

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
    const upcCode = input.value;

    const gift = giftData.find((gift: Gift) => gift.upc === upcCode);

    if (gift) {
      setImage(gift.ImageGift);
      setName(gift.NameGift);
      setLocation(gift.location);
      setError(null);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false)
        alert('Gracias por Participar, revisa tu correo y sigue los pasos para reclamar tu premio!!.');
      }, 10000);

      try {
        const response = await fetch('/api/send-email/route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: currentUser?.email,
            name: currentUser?.displayName,
            gift: gift.NameGift,
            location: gift.location,
          }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            console.log('Failed to send email: ' + (errorData.message || response.statusText));
          } catch {
            console.warn('Failed to send email: Unexpected response format');
          }
        } else {
          console.log('Email sent successfully!');
        }
      } catch (error) {
        console.error('Error sending email:' + error);
      }
    } else {
      setError('Upss.. Gracias por Participar Intenta nuevamente.');
      setImage(null);
      setName(null);
      setLocation(null);
      setShowConfetti(false);
    }
  }

  return (
    <>
      <Head>
        <title>Raspa y Gana con Tecpoint</title>
        <meta name="description" content="Scan page for gifts" />
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Scan Page" />
        <meta property="og:description" content="Scan page for gifts" />
        <meta property="og:image" content="/images/og-image.png" />
        <meta property="og:url" content="https://tecpoint.ws/scan" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tecpoint Distribucion" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Scan Page" />
        <meta name="twitter:description" content="Scan page for gifts" />
        <meta name="twitter:image" content="/images/og-image.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://tecpoint.ws/scan" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="description" content="Scan page for gifts" />
        <meta name="keywords" content="scan, gifts, prizes" />
        <meta name="author" content="Your Name" />
        <meta name="language" content="en" />
      </Head>

      <NavbarMenu />

      <main className="flex flex-col relative h-fit lg:flex-row items-center justify-center md:h-screen bg-gray-100 md:fixed top-0 w-full md:-z-10">
        <div className="w-full lg:w-1/2 h-full flex items-center justify-center flex-col px-4 lg:px-0 p-6">

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

            <InputOTP maxLength={12} minLength={12} disabled={!currentUser}>
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
              </InputOTPGroup>
            </InputOTP>

            {currentUser ? (
              <button type="submit" className="py-3 px-6 bg-black text-white rounded-xl w-full lg:w-auto">
                Probar Suerte !!!
              </button>
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
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-full flex items-center justify-center flex-col bg-white px-4 lg:px-0">
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-center tracking-[-1.2px]">Tu Premio es :</h2>

          {image ? (
            <Image
              src={image || ''}
              width={380}
              height={380}
              alt="Gift"
              className="rounded-xl border-2"
            />
          ) : (
            <div
              id="result"
              className="w-[380px] h-[380px] bg-gray-100 rounded-xl flex items-center justify-center animate-pulse"
            >
            </div>
          )}

          <div className='mt-4 flex flex-col items-center justify-center'>
            {name && <p className="text-lg lg:text-xl font-bold text-center">{name}</p>}
            {location && <p className="text-lg lg:text-xl font-bold text-center">Valido: {location}</p>}
          </div>
        </div>
      </main>

      {showConfetti && <Confetti className="fixed top-0 size-full" gravity={0.1} />}
    </>
  );
}

export default Page;