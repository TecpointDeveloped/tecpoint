import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Tracking from "@/components/analytics/Tracking";
import AppIntro from "@/components/AppIntro/page";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppIntro />
      <Tracking />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
