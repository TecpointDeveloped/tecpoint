import { useAuth } from "@/context/useAuth";
import NavbarMenu from "@/components/navbarmenu/page";
import styles from "@/styles/account2026.module.css";
import Avvvatars from "avvvatars-react";
import { ArrowUpRight, Check, Eye, EyeOff, LockKeyhole } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";

export async function getServerSideProps() {
  return {
    props: {
      title: "Iniciar sesión | TECPOINT",
      description: "Acceda a su cuenta TECPOINT o solicite atención para compras al mayoreo.",
      keywords: "iniciar sesión, cuenta, tecpoint, mayoreo, tecnología honduras",
      robots: "index, follow",
    },
  };
}

type Props = { title: string; description: string; keywords: string; robots: string };

export default function MyAccount({ title, description, keywords, robots }: Props) {
  const { wholesaleWhatsApp } = useSiteConfig();
  const { currentUser, signInWithGoogle, signInWithEmailAndPassword, signOut } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"customer" | "wholesale">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => {
    setError(null);
    setEmailError(false);
    setPasswordError(false);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(email, password);
      await router.push("/");
    } catch (caught) {
      const firebaseError = caught as { code?: string };
      if (firebaseError.code === "auth/user-not-found") {
        setEmailError(true);
        setError("No encontramos una cuenta con este correo.");
      } else if (firebaseError.code === "auth/wrong-password") {
        setPasswordError(true);
        setError("La contraseña no coincide. Intente nuevamente.");
      } else if (firebaseError.code === "auth/invalid-email") {
        setEmailError(true);
        setError("Revise el formato del correo electrónico.");
      } else if (firebaseError.code === "auth/invalid-credential") {
        setEmailError(true);
        setPasswordError(true);
        setError("Revise su correo y contraseña.");
      } else {
        setError("No pudimos iniciar sesión. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearFeedback();
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("No pudimos conectar con Google. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robots} />
        <meta name="author" content="TECPOINT Distribución" />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tecpoint.ws/my-account" />
        <meta property="og:description" content={description} />
      </Head>

      {currentUser ? (
        <div className="w-full h-full flex flex-col">
          <NavbarMenu />
          <section className="p-4 lg:w-[1200px] mx-auto">
            <article className="border rounded-3xl p-4 flex justify-between items-center gap-4">
              <div className="flex gap-4 items-center">
                {currentUser.photoURL ? (
                  <Image src={currentUser.photoURL} alt={currentUser.displayName || "Usuario TECPOINT"} quality={80} priority width={70} height={70} className="aspect-square rounded-full" />
                ) : (
                  <Avvvatars size={70} value={currentUser.email || "user"} />
                )}
                <span className="flex flex-col">
                  <h1 className="md:text-[22px] font-black tracking-[-0.8px]">{currentUser.displayName || "Mi cuenta"}</h1>
                  <h2>{currentUser.email || ""}</h2>
                </span>
              </div>
              <button onClick={signOut} className="bg-black text-white py-2 px-6 rounded-full size-fit">Salir</button>
            </article>
          </section>
        </div>
      ) : (
        <div className={styles.accountPage}>
          <section className={styles.visual} aria-label="Experiencia TECPOINT">
            <Image src="/images/campaign-next-generation-devices.webp" alt="Dispositivos móviles premium de nueva generación" fill priority sizes="(max-width: 860px) 0vw, 52vw" />
            <div className={styles.visualOverlay} />
            <Link className={styles.brand} href="/" aria-label="Volver a TECPOINT">
              <Image src="/brand/isologo.svg" alt="" width={42} height={42} />
              <span>TECPOINT</span>
            </Link>
            <div className={styles.visualCopy}>
              <span>TECNOLOGÍA QUE SE SIENTE</span>
              <h1>Su tecnología,<br />en un solo punto.</h1>
              <p>Acceda con calma. Sus productos, pedidos y atención estarán cada vez más cerca.</p>
            </div>
          </section>

          <section className={styles.accessPanel}>
            <div className={styles.accessCard}>
              <Link className={styles.mobileBrand} href="/" aria-label="Volver a TECPOINT">
                <Image src="/brand/isologo.svg" alt="" width={38} height={38} />
                <strong>TECPOINT</strong>
              </Link>

              <div className={styles.switcher} role="tablist" aria-label="Tipo de cuenta">
                <button type="button" role="tab" aria-selected={mode === "customer"} className={mode === "customer" ? styles.active : ""} onClick={() => { setMode("customer"); clearFeedback(); }}>Mi cuenta</button>
                <button type="button" role="tab" aria-selected={mode === "wholesale"} className={mode === "wholesale" ? styles.active : ""} onClick={() => { setMode("wholesale"); clearFeedback(); }}>Soy mayorista</button>
              </div>

              <div className={styles.heading}>
                <span>{mode === "customer" ? "ACCESO PERSONAL" : "CANAL MAYORISTA"}</span>
                <h2>{mode === "customer" ? "Qué gusto tenerle aquí." : "Compras para hacer crecer su negocio."}</h2>
                <p>{mode === "customer" ? "Ingrese a su cuenta de forma segura." : "Si ya tiene credenciales, ingrese aquí. Si desea abrir una cuenta, nuestro equipo le asesora por WhatsApp."}</p>
              </div>

              {mode === "customer" && (
                <button type="button" className={styles.googleButton} onClick={handleGoogleLogin} disabled={loading}>
                  <Image alt="Google" src="/google.svg" height={20} width={20} />
                  Continuar con Google
                </button>
              )}

              {mode === "customer" && <div className={styles.divider}><span>o use su correo</span></div>}

              <form onSubmit={handleLogin} className={styles.form} noValidate>
                <label htmlFor="account-email">Correo electrónico</label>
                <input id="account-email" name="email" type="email" autoComplete="email" placeholder={mode === "wholesale" ? "Correo de su cuenta mayorista" : "nombre@correo.com"} value={email} onChange={(event) => setEmail(event.target.value)} className={emailError ? styles.invalid : ""} required />
                <label htmlFor="account-password">Contraseña</label>
                <div className={`${styles.passwordField} ${passwordError ? styles.invalid : ""}`}>
                  <input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Ingrese su contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {error && <div className={styles.error} role="alert" aria-live="polite">{error}</div>}
                <button className={styles.loginButton} disabled={loading}>
                  {loading ? <span className={styles.spinner} aria-hidden="true" /> : <LockKeyhole size={17} />}
                  {loading ? "Ingresando…" : "Iniciar sesión"}
                </button>
              </form>

              {mode === "wholesale" && (
                <div className={styles.wholesaleHelp}>
                  <div><Check size={16} /><span>Atención personalizada</span></div>
                  <div><Check size={16} /><span>Pedidos y disponibilidad</span></div>
                  <a href={whatsappLink(wholesaleWhatsApp, "Hola, deseo solicitar una cuenta mayorista TECPOINT.")} target="_blank" rel="noreferrer">Solicitar cuenta mayorista <ArrowUpRight size={17} /></a>
                </div>
              )}

              <p className={styles.security}>Conexión segura · TECPOINT Honduras</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
