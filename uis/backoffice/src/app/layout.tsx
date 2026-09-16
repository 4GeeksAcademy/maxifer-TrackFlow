import type { Metadata } from "next";
import { AuthGuard } from "@/components/AuthGuard";
import { BackofficeNav } from "@/components/BackofficeNav";
import "./globals.css";
import "./theme.css";
import "./supplier-design.css";
import "./incident-design.css";
import "./dark-theme.css";

export const metadata: Metadata = {
  title: "TrackFlow Backoffice",
  description: "Panel interno de TrackFlow",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('backoffice-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}" }} /></head><body><BackofficeNav /><AuthGuard>{children}</AuthGuard></body></html>;
}
