"use client";

import { useAuth } from "@/context/useAuth";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

function My_Acoount() {
  const { signInWithGoogle, signInWithEmailAndPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const route = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    setError(null);

    try {
      await signInWithEmailAndPassword(email, password);
      route.push("/")
    } catch (error) {
      // Tipar el error como FirebaseError
      const firebaseError = error as { code: string };

      if (firebaseError.code === 'auth/user-not-found') {
        setEmailError(true);
        setError('Usuario no encontrado');
      } else if (firebaseError.code === 'auth/wrong-password') {
        setPasswordError(true);
        setError('Contraseña incorrecta');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setEmailError(true);
        setError('El formato del correo es incorrecto');
      } else if (firebaseError.code === 'auth/invalid-credential') {
        setError('Cuenta no válida. Verifique el correo y contraseña.');
      } else {
        setError('Ocurrió un error. Intente nuevamente.');
      }
    }
  };

  return (
    <main className="flex bg-[#f7f7f7] w-full h-screen">
      <Head>
        <title>Incio de Sesion | Tecpoint</title>
      </Head>

      <section className="h-full w-[35vw] p-2 flex flex-col items-center justify-center gap-8">
        <div className="2xl:p-8 flex flex-col gap-4 justify-center items-center">
          <h1 className="font-[Poppins] font-[600] md:text-3xl 2xl:text-3xl text-center tracking-[-1.1px]">Bienvenido de Nuevo!</h1>
          <h2 className="text-[15px]">Iniciar sesión con los siguientes proveedores</h2>
        </div>

        <div className="flex flex-col gap-y-2 w-full items-center">
          <button
            onClick={signInWithGoogle}
            className="text-black font-[Poppins] w-[290px] h-12 rounded-[8px] bg-white flex items-center justify-start gap-2 px-8"
          >
            <Image alt="google icons" src="/google.svg" height={20} width={20} />
            Iniciar con Google
          </button>

          <button className="text-black font-[Poppins] w-[290px] h-12 rounded-[8px] bg-white flex items-center justify-start gap-2 px-8">
            <Image alt="facebook icons" src="/facebook.svg" height={20} width={20} />
            Iniciar con Facebook
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col p-4 gap-y-3 items-center justify-center w-full">
          <input
            className={`text-[15px] px-4 py-2 w-[290px] h-12 rounded-[8px] text-black ${emailError ? 'border border-red-500' : ''}`}
            id="email"
            name="email"
            type="email"
            placeholder="Ingrese su Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={`text-[15px] px-4 py-2 w-[290px] h-12 rounded-[8px] text-black ${passwordError ? 'border border-red-500' : ''}`}
            id="password"
            name="password"
            type="password"
            placeholder="Ingrese su Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="bg-black text-white px-4 py-2 w-[290px] h-12 rounded-[8px]">Iniciar Sesión</button>
        </form>

        <span className="h-6">
          {error && <div className="text-red-500">{error}</div>}
        </span>
      </section>

      <section className="bg-[#FFF7EF] flex flex-1 items-start justify-center">
        <Image width={500} height={300} src="/banner.svg" alt="image" className="h-screen w-[65vw] object-cover" priority />
      </section>
    </main>
  );
}

export default My_Acoount;