import NavbarMenu from '@/components/navbarmenu/page'
import giftData from '@/data/gifts.json'
import { useState } from 'react'
import Image from 'next/image'
import Confetti from "react-confetti";
import { useAuth } from '@/context/useAuth';

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

  return (
    <>
      <NavbarMenu bgColor="black" />

      <main className="flex mt-[70px] flex-col relative h-fit sm:mt-[60px] lg:flex-row items-center justify-center md:h-screen bg-gray-100 md:fixed top-0 w-full md:-z-10">
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
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement;
              const upcCode = input.value;

              const gift = giftData.find((gift: Gift) => gift.upc === upcCode);

              if (gift) {
                setImage(gift.ImageGift);
                setName(gift.NameGift);
                setLocation(gift.location);
                setError(null);
                setShowConfetti(true); // Mostrar confeti
                setTimeout(() => setShowConfetti(false), 20000); // Ocultar confeti después de 20 segundos
              } else {
                setError('Upss.. Gracias por Participar Intenta nuevamente.');
                setImage(null);
                setName(null);
                setLocation(null);
                setShowConfetti(false); // Asegurarse de que el confeti no se muestre
              }
            }}
            className="flex flex-col items-center justify-center gap-4 w-full"
          >
            <input
              type="text"
              minLength={12}
              maxLength={12}
              className="py-3 px-6 rounded-xl text-xl w-full lg:w-[200px] h-fit mt-8 text-center border-2 border-gray-300"
              placeholder="092947182633"
              required
              pattern="\d{12}"
              disabled={!currentUser} // Deshabilitar el input si no hay usuario actual
            />

            {currentUser ? (
              <button type="submit" className="py-3 px-6 bg-blue-500 text-white rounded-xl w-full lg:w-auto">
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
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-center">Tu Premio es :</h2>

          {image ? (
            <Image
              src={image || ''}
              width={380}
              height={380}
              alt="Gift"
              className="rounded-xl border-2"
            />
          ) : (
            <div id="result" className="w-[380px] h-[380px] bg-gray-100 rounded-xl flex items-center justify-center"></div>
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