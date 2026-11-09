import type { Metadata } from "next";
import IndexContent from "./index-content";
import PageRuntime from "./page-runtime";
import { indexStructuredData, pageClasses } from "./page-schemas";

export const metadata: Metadata = {
  title: "TrackFlow | Logística de última milla para e-commerce",
  description:
    "TrackFlow coordina inventario, preparación de pedidos, transportistas y devoluciones para marcas e-commerce que operan entre Estados Unidos y España.",
  alternates: {
    canonical: "/"
  },
  robots: "index,follow",
  keywords:
    "TrackFlow, logística de última milla, gestión de almacenes, e-commerce, fulfillment, devoluciones, Estados Unidos, España",
  other: {
    "geo.region": "US-CA; ES-AR",
    "geo.placename": "Los Ángeles; Zaragoza"
  },
  openGraph: {
    type: "website",
    siteName: "TrackFlow",
    title: "TrackFlow | Logística de última milla para e-commerce",
    description:
      "TrackFlow coordina inventario, preparación de pedidos, transportistas y devoluciones para marcas e-commerce que operan entre Estados Unidos y España.",
    locale: "es_ES"
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackFlow | Logística de última milla para e-commerce",
    description:
      "Inventario, preparación de pedidos, transportistas y devoluciones para operaciones e-commerce en crecimiento."
  }
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(indexStructuredData) }}
      />
      <PageRuntime page="index" bodyClass={pageClasses.index}>
        <IndexContent />
      </PageRuntime>
    </>
  );
}
