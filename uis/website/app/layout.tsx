import type { Metadata } from "next";
import "./legacy-content.css";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/assets/trackflow-logo.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="scroll-smooth [scroll-padding-top:var(--header-anchor-offset,4.5rem)] motion-reduce:scroll-auto tf-motion-ready tf-application-motion-ready"
    >
      <body className="min-h-screen bg-[var(--tf-bg)] text-[var(--tf-text)] antialiased md:overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
