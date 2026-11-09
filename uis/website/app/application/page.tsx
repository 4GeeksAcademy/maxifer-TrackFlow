import type { Metadata } from "next";
import ApplicationContent from "../application-content";
import PageRuntime from "../page-runtime";
import { applicationStructuredData, pageClasses } from "../page-schemas";

export const metadata: Metadata = {
  title: "Hablemos de tu operación | TrackFlow",
  description:
    "Formulario de contacto TrackFlow para marcas e-commerce que necesitan revisar su operación logística, última milla o devoluciones.",
  alternates: {
    canonical: "/application/"
  },
  robots: "index,follow",
  keywords:
    "contacto logística e-commerce, TrackFlow, última milla, fulfillment, devoluciones, transportistas",
  other: {
    "geo.region": "US-CA; ES-AR",
    "geo.placename": "Los Ángeles; Zaragoza"
  },
  openGraph: {
    type: "website",
    siteName: "TrackFlow",
    title: "Hablemos de tu operación | TrackFlow",
    description:
      "Completa el formulario y el equipo de TrackFlow revisará tu contexto operativo antes de coordinar una conversación.",
    locale: "es_ES"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hablemos de tu operación | TrackFlow",
    description:
      "Completa el formulario y el equipo de TrackFlow revisará tu contexto operativo antes de coordinar una conversación."
  }
};

export default function ApplicationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationStructuredData) }}
      />
      <PageRuntime page="application" bodyClass={pageClasses.application}>
        <ApplicationContent />
      </PageRuntime>
    </>
  );
}
