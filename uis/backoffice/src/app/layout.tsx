import type {
  Metadata
} from "next";


import Link from "next/link";

import { AuthGuard } from "@/components/AuthGuard";
import { AuthHeaderActions } from "@/components/AuthHeaderActions";
import "./globals.css";


export const metadata: Metadata = {

  title:
    "TrackFlow Backoffice",

  description:
    (
      "Panel interno "
      + "de TrackFlow"
    ),

};


export default function RootLayout({

  children,

}: Readonly<{

  children:
    React.ReactNode;

}>) {

  return (

    <html lang="es">

      <body>

        <nav className="navbar">

          <div className="navContent">

            <Link
              href="/"
              className="logo"
            >
              TRACKFLOW
            </Link>


            <div className="navLinks">

              <Link href="/">
                Inicio
              </Link>

              <Link href="/incidents">
                Incidencias
              </Link>

              <Link href="/suppliers">
                Proveedores
              </Link>

              <Link href="/account/profile">
                Mi perfil
              </Link>

              <AuthHeaderActions />

            </div>

          </div>

        </nav>

        <AuthGuard>
          {children}
        </AuthGuard>

      </body>

    </html>

  );

}
