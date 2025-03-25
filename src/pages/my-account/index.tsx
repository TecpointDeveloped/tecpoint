import { useAuth } from "@/context/useAuth";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NavbarMenu from "@/components/navbarmenu/page";
import Avvvatars from 'avvvatars-react';

export async function getServerSideProps() {
  return {
    props: {
      title: 'Inicio de Sesion | Tecpoint',
      description: 'Inicia sesion en tu cuenta de Tecpoint',
      keywords: 'inicio, sesion, cuenta, tecpoint, distribucion',
      robots: 'index, follow'
    }
  }
}

function My_Acoount({ title, description, keywords, robots }: { title: string, description: string, keywords: string, robots: string }) {
  const { signInWithGoogle, signInWithEmailAndPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const route = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    setError(null);

    try {
      await signInWithEmailAndPassword(email, password);
      setLoading(true);
      route.push("/")
    } catch (error) {
      // Tipar el error como FirebaseError
      const firebaseError = error as { code: string };
      setLoading(false);

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
    <main>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robots} />
        <meta name="author" content="Tecpoint Distribucion" />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tecpoint.ws/my-account" />
        <meta property="og:description" content={description} />
      </Head>

      {currentUser ? (
        <div className="w-full h-full flex flex-col">
          <NavbarMenu />

          <section className="p-4 md:w-[1200px] mx-auto">
            <article className="border rounded-3xl p-4 flex justify-between items-center gap-4">
              <div className="flex gap-4 items-center">
                {currentUser.photoURL ? (
                  <Image
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "Usuario tecpoint distribucion"}
                    quality={100}
                    priority={true}
                    width={70}
                    height={70}
                    className="cursor-pointer aspect-square rounded-full"
                  />
                ) : (
                  <Avvvatars size={70} value={currentUser.email || "user"} />
                )}

                <span className="flex flex-col">
                  <h1 className="md:text-[22px] font-black tracking-[-0.8px]">{currentUser.displayName || ""}</h1>
                  <h2>{currentUser.email || ""}</h2>
                </span>

              </div>

              <button className=" bg-black text-white py-2 px-6 rounded-full size-fit">salir</button>
            </article>

            <h2>creacion de la cuenta : {currentUser.metadata.creationTime}</h2>
            <h3>ultimo inicio de sesion : {currentUser.metadata.lastSignInTime}</h3>
            <h3>{currentUser.phoneNumber}</h3>

          </section>
        </div>
      ) :
        (
          <div className="bg-[#f7f7f7] h-screen p-4 flex justify-between items-start gap-4">
            <div className="bg-gray-200 h-full md:w-[60%] rounded-2xl"></div>

            <section className="flex-1 grid place-items-center h-full bg-white rounded-2xl">
              <Tabs defaultValue="account" className="w-[400px] h-fit flex flex-col items-center">
                <TabsList className="bg-[#eeeeee] w-fit h-fit">
                  <TabsTrigger className="py-[10px] px-12" value="account">Iniciar sesion</TabsTrigger>
                  <TabsTrigger className="py-[10px] px-12" value="password">Eres Mayorista?</TabsTrigger>
                </TabsList>

                <TabsContent className="pt-4" value="account">
                  <section className="flex flex-col items-center justify-center gap-8">

                    <div className="flex flex-col justify-center items-center">
                      <h1 className="font-[Poppins] font-[600] text-3xl text-center tracking-[-1.1px]">Bienvenido de Nuevo!</h1>
                      <h2 className="text-[15px]">Iniciar sesión con los siguientes proveedores</h2>
                    </div>

                    <div className="flex flex-col gap-y-2 w-full items-center">
                      <button
                        onClick={signInWithGoogle}
                        className="hover:bg-gray-200 border-gray-200 border-2 transition-colors text-black font-[Poppins] w-[290px] h-12 rounded-[8px] bg-white flex items-center justify-center gap-2 px-8"
                      >
                        <Image alt="google icons" src="/google.svg" height={20} width={20} />
                        Iniciar con Google
                      </button>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col p-4 gap-y-3 items-center justify-center w-full">
                      <input
                        className={`text-[15px] border-gray-150 border-2 px-4 py-2 w-[290px] h-12 rounded-[8px] text-black ${emailError ? 'border border-red-500' : ''}`}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Ingrese su Correo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <input
                        className={`text-[15px] border-gray-150 border-2 px-4 py-2 w-[290px] h-12 rounded-[8px] text-black ${passwordError ? 'border border-red-500' : ''}`}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Ingrese su Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />

                      <button className="bg-black text-white relative px-4 py-2 w-[290px] h-12 rounded-[8px] flex items-center justify-center gap-x-4">

                        {loading && (
                          <div role="status" className="absolute left-14">
                            <svg aria-hidden="true" className="w-5 h-5 text-[#4e4e4e] animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                          </div>
                        )}

                        Iniciar Sesión
                      </button>
                    </form>

                    <span className="h-6">
                      {error && <div className="text-red-500">{error}</div>}
                    </span>
                  </section>
                </TabsContent>

                <TabsContent className="pt-4" value="password">
                  <section className="flex flex-col gap-8 items-center">

                    <div className="flex flex-col gap-y-4">
                      <h1 className="font-[Poppins] font-[600] md:text-3xl 2xl:text-3xl text-center tracking-[-1.1px]">Cuentas Mayoristas tecpoint</h1>

                      <form onSubmit={handleLogin} className="flex flex-col p-4 gap-y-3 items-center justify-center w-full">
                        <input
                          className={`text-[15px] px-4 py-2 w-[290px] h-12 rounded-[8px] text-black ${emailError ? 'border border-red-500' : ''}`}
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Ingrese su correo mayorista"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                          className={`text-[15px] px-4 py-2 w-[290px] h-12 rounded-[8px] text-black ${passwordError ? 'border border-red-500' : ''}`}
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Ingrese su contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />

                        <button className="bg-black text-white relative px-4 py-2 w-[290px] h-12 rounded-[8px] flex items-center justify-center gap-x-4">

                          <div role="status" className="absolute left-14">
                            <svg aria-hidden="true" className="w-5 h-5 text-[#4e4e4e] animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                          </div>

                          Iniciar Sesión
                        </button>
                      </form>
                    </div>
                  </section>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        )
      }

    </main>
  );
}

export default My_Acoount;