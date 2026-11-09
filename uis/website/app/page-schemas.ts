export const indexStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "/#organization",
      "name": "TrackFlow",
      "url": "/",
      "logo": "/assets/trackflow-logo.svg",
      "foundingDate": "2009",
      "description": "Empresa de logística de última milla y gestión de almacenes para marcas e-commerce con operaciones en Estados Unidos y España.",
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": 130
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "Spain"
        }
      ],
      "location": [
        {
          "@type": "Place",
          "name": "Los Ángeles",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Los Ángeles",
            "addressRegion": "CA",
            "addressCountry": "US"
          }
        },
        {
          "@type": "Place",
          "name": "Zaragoza",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Zaragoza",
            "addressCountry": "ES"
          }
        }
      ],
      "knowsAbout": [
        "last-mile logistics",
        "warehouse management",
        "fulfillment",
        "carrier management",
        "reverse logistics",
        "e-commerce operations"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "/#website",
      "name": "TrackFlow",
      "url": "/",
      "inLanguage": "es",
      "publisher": {
        "@id": "/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "/#webpage",
      "url": "/",
      "name": "TrackFlow | Logística de última milla para e-commerce",
      "description": "TrackFlow coordina inventario, preparación de pedidos, transportistas y devoluciones para marcas e-commerce que necesitan operar entre Estados Unidos y España.",
      "isPartOf": {
        "@id": "/#website"
      },
      "about": {
        "@id": "/#organization"
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "/assets/trackflow-hero.png"
      },
      "inLanguage": "es",
      "mainEntity": {
        "@id": "/#faqs"
      }
    },
    {
      "@type": "Service",
      "@id": "/#logistics-service",
      "name": "Logística de última milla y gestión de almacenes para e-commerce",
      "provider": {
        "@id": "/#organization"
      },
      "serviceType": "Logistics, fulfillment and reverse logistics",
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "Spain"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicios operativos TrackFlow",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Almacenamiento de inventario"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Preparación y embalaje"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Última milla"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Seguimiento e incidencias"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Logística inversa"
            }
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "@id": "/#faqs",
      "url": "/#faqs",
      "name": "Preguntas frecuentes sobre TrackFlow",
      "inLanguage": "es",
      "about": {
        "@id": "/#logistics-service"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Qué es TrackFlow?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TrackFlow es una empresa de logística de última milla y gestión de almacenes para marcas e-commerce. Fue fundada en 2009 en Los Ángeles y opera con equipos y almacenes en Estados Unidos y España."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué servicios logísticos ofrece TrackFlow?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TrackFlow ofrece almacenamiento de inventario, preparación y embalaje de pedidos, coordinación de última milla, seguimiento de entregas, gestión de incidencias, logística inversa y soporte operativo para marcas y destinatarios."
          }
        },
        {
          "@type": "Question",
          "name": "¿En qué países opera TrackFlow?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TrackFlow opera en Estados Unidos y España, con almacenes en Los Ángeles y Zaragoza y equipos distribuidos entre ambos mercados."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué tipo de empresas trabajan con TrackFlow?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TrackFlow trabaja con marcas e-commerce que necesitan externalizar o mejorar su operación logística, desde el almacenamiento del inventario hasta la entrega y gestión de devoluciones."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cómo gestiona TrackFlow la última milla y los transportistas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TrackFlow coordina envíos con una red de 8 transportistas en Estados Unidos y España y gestiona incidencias como entregas fallidas, paquetes perdidos o direcciones incorrectas."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cómo gestiona TrackFlow las devoluciones?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TrackFlow gestiona devoluciones que pueden representar entre el 18% y el 25% del volumen operativo según cliente y país. El proceso incluye revisión de casos y decisiones sobre recogida, reacondicionamiento o descarte."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "/#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "/"
        }
      ]
    }
  ]
} as const;

export const applicationStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "/#organization",
      "name": "TrackFlow",
      "url": "/",
      "logo": "/assets/trackflow-logo.svg",
      "foundingDate": "2009",
      "description": "Empresa de logística de última milla y gestión de almacenes para marcas e-commerce con operaciones en Estados Unidos y España.",
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "Spain"
        }
      ],
      "location": [
        {
          "@type": "Place",
          "name": "Los Ángeles",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Los Ángeles",
            "addressRegion": "CA",
            "addressCountry": "US"
          }
        },
        {
          "@type": "Place",
          "name": "Zaragoza",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Zaragoza",
            "addressCountry": "ES"
          }
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "/#website",
      "name": "TrackFlow",
      "url": "/",
      "inLanguage": "es",
      "publisher": {
        "@id": "/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "/application/#webpage",
      "url": "/application/",
      "name": "Hablemos de tu operación | TrackFlow",
      "description": "Formulario de contacto TrackFlow para marcas e-commerce que necesitan revisar su operación logística, última milla o devoluciones.",
      "isPartOf": {
        "@id": "/#website"
      },
      "about": {
        "@id": "/#organization"
      },
      "inLanguage": "es",
      "potentialAction": {
        "@type": "CommunicateAction",
        "name": "Enviar consulta operativa",
        "target": "/application/#applicationForm"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "/application/#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Hablemos de tu operación",
          "item": "/application/"
        }
      ]
    }
  ]
} as const;

export const pageClasses = {
  index: "bg-[var(--tf-bg)] text-[var(--tf-text)] antialiased",
  application: "bg-[var(--tf-bg)] text-[var(--tf-text)] antialiased md:overflow-x-hidden"
} as const;
