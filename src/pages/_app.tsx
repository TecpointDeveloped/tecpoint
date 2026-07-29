import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Tracking from "@/components/analytics/Tracking";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Tracking />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
