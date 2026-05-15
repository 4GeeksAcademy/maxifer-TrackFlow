(function () {
  const STORAGE_KEY = "trackflow-lang";
  const SUPPORTED_LANGS = new Set(["es", "en"]);

  const SPANISH_PHRASE_FIXES = [
    ["Que ofrecemos hoy", "Qué ofrecemos hoy"],
    ["Que es TrackFlow?", "Qué es TrackFlow?"],
    ["Que servicios logisticos ofrece TrackFlow?", "Qué servicios logísticos ofrece TrackFlow?"],
    ["En que paises opera TrackFlow?", "En qué países opera TrackFlow?"],
    ["Que tipo de empresas trabajan con TrackFlow?", "Qué tipo de empresas trabajan con TrackFlow?"],
    ["Como gestiona TrackFlow la ultima milla y los transportistas?", "Cómo gestiona TrackFlow la última milla y los transportistas?"],
    ["Como gestiona TrackFlow las devoluciones?", "Cómo gestiona TrackFlow las devoluciones?"],
    ["Que necesitas resolver?", "Qué necesitas resolver?"]
  ];

  const SPANISH_WORD_FIXES = [
    ["navegacion", "navegación"],
    ["menu", "menú"],
    ["contactanos", "contáctanos"],
    ["seleccion", "selección"],
    ["logistica", "logística"],
    ["ultima", "última"],
    ["ultma", "última"],
    ["preparacion", "preparación"],
    ["espana", "españa"],
    ["almacen", "almacén"],
    ["operacion", "operación"],
    ["devolucion", "devolución"],
    ["fisica", "física"],
    ["coordinacion", "coordinación"],
    ["envios", "envíos"],
    ["resolucion", "resolución"],
    ["atencion", "atención"],
    ["paises", "países"],
    ["pais", "país"],
    ["geografica", "geográfica"],
    ["tecnologica", "tecnológica"],
    ["tecnologia", "tecnología"],
    ["segun", "según"],
    ["revision", "revisión"],
    ["gestion", "gestión"],
    ["conversacion", "conversación"],
    ["desafios", "desafíos"],
    ["autorizacion", "autorización"],
    ["valido", "válido"],
    ["revisara", "revisará"],
    ["angeles", "ángeles"],
    ["compania", "compañía"]
  ];

  const applySpanishCasing = (original, replacement) => {
    if (original === original.toUpperCase()) {
      return replacement.toUpperCase();
    }
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  };

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const normalizeSpanishText = (value) => {
    let next = value;

    SPANISH_PHRASE_FIXES.forEach(([plain, fixed]) => {
      const re = new RegExp(escapeRegex(plain), "g");
      next = next.replace(re, fixed);
    });

    SPANISH_WORD_FIXES.forEach(([plain, fixed]) => {
      const re = new RegExp(`\\b${escapeRegex(plain)}\\b`, "gi");
      next = next.replace(re, (match) => applySpanishCasing(match, fixed));
    });

    return next;
  };

  const normalizeSpanishObject = (value) => {
    if (typeof value === "string") {
      return normalizeSpanishText(value);
    }

    if (Array.isArray(value)) {
      return value.map(normalizeSpanishObject);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, normalizeSpanishObject(nestedValue)])
      );
    }

    return value;
  };

  const translations = {
    es: {
      common: {
        navAria: "Navegacion principal",
        homeAria: "TrackFlow inicio",
        logoAlt: "Logo de TrackFlow",
        menuOpen: "Abrir menu",
        menuClose: "Cerrar menu",
        contact: "Contactanos",
        backToLanding: "Volver a la landing",
        navHome: "Inicio",
        navServices: "Servicios",
        navMarkets: "Mercados",
        navFaqs: "FAQs",
        switchAria: "Seleccion de idioma",
        htmlLang: "es"
      },
      index: {
        title: "TrackFlow | Logistica de ultima milla para e-commerce",
        description:
          "TrackFlow coordina inventario, preparacion de pedidos, transportistas y devoluciones para marcas e-commerce que operan entre Estados Unidos y Espana.",
        ogTitle: "TrackFlow | Logistica de ultima milla para e-commerce",
        ogDescription:
          "TrackFlow coordina inventario, preparacion de pedidos, transportistas y devoluciones para marcas e-commerce que operan entre Estados Unidos y Espana.",
        twitterTitle: "TrackFlow | Logistica de ultima milla para e-commerce",
        twitterDescription:
          "Inventario, preparacion de pedidos, transportistas y devoluciones para operaciones e-commerce en crecimiento.",
        navServices: "Servicios",
        navMarkets: "Mercados",
        navFaqs: "FAQs",
        heroAlt: "Centro de operaciones logisticas moderno con paquetes, pantallas de seguimiento y zona de almacen",
        heroBadge: "Fundada en 2009 | Los Angeles + Zaragoza",
        heroTitle: "Logistica, ultima milla y devoluciones para operaciones e-commerce en crecimiento.",
        heroBody:
          "TrackFlow coordina inventario, preparacion de pedidos, transportistas y devoluciones para marcas e-commerce que necesitan operar entre Estados Unidos y Espana sin perder visibilidad de su logistica.",
        heroPrimaryCta: "Contactanos",
        heroSecondaryCta: "Ver operacion",
        stats: [
          "personas operando entre Estados Unidos y Espana",
          "almacenes en Los Angeles y Zaragoza para almacenamiento, picking y preparacion de pedidos",
          "transportistas coordinados diariamente para operaciones de ultima milla",
          "del volumen operativo corresponde a devoluciones segun cliente y mercado"
        ],
        offerEyebrow: "Que ofrecemos hoy",
        offerTitle: "Operacion logistica para marcas e-commerce.",
        offerBody:
          "TrackFlow gestiona la operacion desde que entra un pedido hasta que se entrega o vuelve como devolucion: inventario, preparacion, embalaje, transportistas, incidencias y logistica inversa.",
        serviceCards: [
          {
            title: "Almacenamiento de inventario",
            body: "Gestion fisica de inventario para marcas e-commerce desde almacenes ubicados en Los Angeles y Zaragoza."
          },
          {
            title: "Preparacion y embalaje",
            body: "Recepcion de pedidos, picking, preparacion de paquetes y coordinacion con el transportista asignado."
          },
          {
            title: "Ultima milla",
            body: "Coordinacion de envios y entregas con una red de transportistas en Estados Unidos y Espana."
          },
          {
            title: "Seguimiento operativo e incidencias",
            body: "Seguimiento de entregas y resolucion de incidencias entre almacenes, transportistas y clientes finales."
          },
          {
            title: "Logistica inversa",
            body: "Gestion de devoluciones, revision de casos y decisiones sobre recogida, reacondicionamiento o descarte."
          },
          {
            title: "Atencion operativa para marcas y clientes finales",
            body: "Gestion de consultas relacionadas con pedidos, entregas, incidencias y devoluciones en ambos mercados."
          }
        ],
        marketsEyebrow: "Dos mercados",
        marketsTitle: "Dos paises. Una operacion logistica conectada.",
        marketsBody:
          "Los equipos de TrackFlow operan entre Los Angeles y Zaragoza coordinando almacenes, transportistas, incidencias y devoluciones para marcas e-commerce en dos mercados distintos.",
        marketCards: [
          {
            title: "Los Angeles",
            body: "Sede ejecutiva y almacen para la operacion logistica en Estados Unidos."
          },
          {
            title: "Zaragoza",
            body: "Oficina tecnologica y almacen para la operacion logistica en Espana."
          },
          {
            title: "Cobertura operativa",
            body: "Equipos de almacen, ultima milla, logistica inversa, atencion al cliente y tecnologia trabajan distribuidos entre ambos paises."
          }
        ],
        faqEyebrow: "FAQs",
        faqTitle: "Preguntas frecuentes sobre TrackFlow.",
        faqBody:
          "Respuestas directas sobre la operacion logistica, la cobertura geografica, la ultima milla y las devoluciones para marcas e-commerce.",
        faqs: [
          {
            q: "Que es TrackFlow?",
            a: "TrackFlow es una empresa de logistica de ultima milla y gestion de almacenes para marcas e-commerce. Fue fundada en 2009 en Los Angeles y opera con equipos y almacenes en Estados Unidos y Espana."
          },
          {
            q: "Que servicios logisticos ofrece TrackFlow?",
            a: "TrackFlow ofrece almacenamiento de inventario, preparacion y embalaje de pedidos, coordinacion de ultima milla, seguimiento de entregas, gestion de incidencias, logistica inversa y soporte operativo para marcas y destinatarios."
          },
          {
            q: "En que paises opera TrackFlow?",
            a: "TrackFlow opera en Estados Unidos y Espana, con almacenes en Los Angeles y Zaragoza y equipos distribuidos entre ambos mercados."
          },
          {
            q: "Que tipo de empresas trabajan con TrackFlow?",
            a: "TrackFlow trabaja con marcas e-commerce que necesitan externalizar o mejorar su operacion logistica, desde el almacenamiento del inventario hasta la entrega y gestion de devoluciones."
          },
          {
            q: "Como gestiona TrackFlow la ultima milla y los transportistas?",
            a: "TrackFlow coordina envios con una red de 8 transportistas en Estados Unidos y Espana y gestiona incidencias como entregas fallidas, paquetes perdidos o direcciones incorrectas."
          },
          {
            q: "Como gestiona TrackFlow las devoluciones?",
            a: "TrackFlow gestiona devoluciones que pueden representar entre el 18% y el 25% del volumen operativo segun cliente y pais. El proceso incluye revision de casos y decisiones sobre recogida, reacondicionamiento o descarte."
          }
        ],
        ctaTitle: "Hablemos de tu operacion.",
        ctaBody: "Cuentanos como funciona hoy tu operacion logistica y que desafios necesitas resolver.",
        footerBody: "Logistica de ultima milla y gestion de almacenes para operaciones e-commerce.",
        footerAddress: "Los Angeles, CA, United States\nZaragoza, Espana\nOperaciones en Estados Unidos y Espana",
        footerForm: "Formulario operativo",
        footerServices: "Servicios"
      },
      application: {
        title: "Hablemos de tu operacion | TrackFlow",
        description:
          "Formulario de contacto TrackFlow para marcas e-commerce que necesitan revisar su operacion logistica, ultima milla o devoluciones.",
        ogTitle: "Hablemos de tu operacion | TrackFlow",
        ogDescription:
          "Completa el formulario y el equipo de TrackFlow revisara tu contexto operativo antes de coordinar una conversacion.",
        twitterTitle: "Hablemos de tu operacion | TrackFlow",
        twitterDescription:
          "Completa el formulario y el equipo de TrackFlow revisara tu contexto operativo antes de coordinar una conversacion.",
        eyebrow: "Contacto TrackFlow",
        heading: "Cuentanos como funciona hoy tu operacion logistica.",
        intro:
          "Completa el formulario y el equipo de TrackFlow revisara tu contexto operativo antes de coordinar una conversacion.",
        stepTitles: ["Empresa y contacto", "Operación principal", "Contexto y desafíos", "Confirmación"],
        progress: "Paso {current} de {total}",
        indicatorLabels: ["Empresa", "Operación", "Contexto", "Confirmación"],
        summaryTitle: "Resumen de tu solicitud",
        labels: {
          companyName: "Nombre de la empresa *",
          contactName: "Persona responsable *",
          email: "Email *",
          country: "Pais de operacion principal *",
          operationType: "Tipo de operación *",
          monthlyOrders: "Volumen mensual estimado *",
          urgency: "Urgencia del proyecto *",
          notes: "Que necesitas resolver? *",
          currentTools: "Stack actual (opcional)",
          consent: "Acepto que TrackFlow use estos datos para responder mi consulta. *"
        },
        operationTypeOptions: [
          "Selecciona el foco principal",
          "Fulfillment y almacén",
          "Última milla y transportistas",
          "Devoluciones y logística inversa",
          "Operación end-to-end"
        ],
        monthlyOrdersOptions: [
          "Selecciona un rango",
          "Menos de 500 pedidos",
          "500 - 2.000 pedidos",
          "2.000 - 10.000 pedidos",
          "Más de 10.000 pedidos"
        ],
        urgencyOptions: [
          "Selecciona urgencia",
          "Inmediata (0-30 días)",
          "Este trimestre",
          "Este semestre",
          "Solo exploración"
        ],
        notesPlaceholder:
          "Ej: necesitamos reducir incidencias en ultima milla, mejorar la gestion de devoluciones o centralizar el seguimiento de pedidos.",
        currentToolsPlaceholder:
          "Ej: ERP legacy + hojas de cálculo + portal transportista",
        countryOptions: ["Selecciona un pais", "Estados Unidos", "Espana", "Otro"],
        next: "Siguiente",
        previous: "Anterior",
        submit: "Enviar consulta",
        reset: "Reiniciar",
        sendAnother: "Enviar otra consulta",
        backToHome: "Volver al inicio"
      },
      validation: {
        companyName: "Indica el nombre legal o comercial de la empresa.",
        contactName: "Indica el nombre de la persona de contacto.",
        email: "Usa un email corporativo valido, por ejemplo ops@empresa.com.",
        country: "Selecciona el pais de operacion principal.",
        operationType: "Selecciona el tipo de operacion que quieres optimizar.",
        monthlyOrders: "Selecciona el volumen mensual estimado.",
        urgency: "Selecciona la urgencia de tu proyecto.",
        notes: "Cuentanos brevemente que necesitas resolver.",
        consent: "Confirma la autorizacion para responder tu consulta.",
        invalidForm: "Revisa los campos marcados antes de avanzar o enviar el formulario.",
        progress: "Paso {current} de {total}",
        success:
          "Gracias. Recibimos tu consulta y el equipo de TrackFlow revisara tu contexto operativo antes de coordinar una conversacion."
      }
    },
    en: {
      common: {
        navAria: "Main navigation",
        homeAria: "TrackFlow home",
        logoAlt: "TrackFlow logo",
        menuOpen: "Open menu",
        menuClose: "Close menu",
        contact: "Contact us",
        backToLanding: "Back to landing",
        navHome: "Home",
        navServices: "Services",
        navMarkets: "Markets",
        navFaqs: "FAQs",
        switchAria: "Language selector",
        htmlLang: "en"
      },
      index: {
        title: "TrackFlow | Last-mile logistics for e-commerce",
        description:
          "TrackFlow coordinates inventory, order preparation, carriers, and returns for e-commerce brands operating across the United States and Spain.",
        ogTitle: "TrackFlow | Last-mile logistics for e-commerce",
        ogDescription:
          "TrackFlow coordinates inventory, order preparation, carriers, and returns for e-commerce brands operating across the United States and Spain.",
        twitterTitle: "TrackFlow | Last-mile logistics for e-commerce",
        twitterDescription:
          "Inventory, order prep, carriers, and returns for scaling e-commerce operations.",
        navServices: "Services",
        navMarkets: "Markets",
        navFaqs: "FAQs",
        heroAlt: "Modern logistics operations center with parcels, tracking screens, and warehouse area",
        heroBadge: "Founded in 2009 | Los Angeles + Zaragoza",
        heroTitle: "Logistics, last-mile delivery, and returns for growing e-commerce operations.",
        heroBody:
          "TrackFlow coordinates inventory, order prep, carriers, and returns for e-commerce brands that need to operate across the United States and Spain without losing logistics visibility.",
        heroPrimaryCta: "Contact us",
        heroSecondaryCta: "See operations",
        stats: [
          "people operating across the United States and Spain",
          "warehouses in Los Angeles and Zaragoza for storage, picking, and order preparation",
          "carriers coordinated daily for last-mile operations",
          "of operational volume corresponds to returns, depending on client and market"
        ],
        offerEyebrow: "What we deliver today",
        offerTitle: "Logistics operations for e-commerce brands.",
        offerBody:
          "TrackFlow manages the operation from order intake to delivery or return: inventory, picking, packing, carriers, incidents, and reverse logistics.",
        serviceCards: [
          {
            title: "Inventory storage",
            body: "Physical inventory management for e-commerce brands from warehouses in Los Angeles and Zaragoza."
          },
          {
            title: "Picking and packing",
            body: "Order intake, picking, parcel preparation, and coordination with the assigned carrier."
          },
          {
            title: "Last-mile delivery",
            body: "Shipment and delivery coordination with a carrier network in the United States and Spain."
          },
          {
            title: "Operational tracking and incidents",
            body: "Delivery tracking and incident resolution across warehouses, carriers, and end customers."
          },
          {
            title: "Reverse logistics",
            body: "Returns management, case review, and decisions on pickup, refurbishing, or disposal."
          },
          {
            title: "Operational support for brands and end customers",
            body: "Handling order, delivery, incident, and returns inquiries across both markets."
          }
        ],
        marketsEyebrow: "Two markets",
        marketsTitle: "Two countries. One connected logistics operation.",
        marketsBody:
          "TrackFlow teams operate between Los Angeles and Zaragoza, coordinating warehouses, carriers, incidents, and returns for e-commerce brands in two different markets.",
        marketCards: [
          {
            title: "Los Angeles",
            body: "Executive headquarters and warehouse for U.S. logistics operations."
          },
          {
            title: "Zaragoza",
            body: "Technology office and warehouse for Spain logistics operations."
          },
          {
            title: "Operational coverage",
            body: "Warehouse, last-mile, reverse logistics, customer support, and technology teams operate across both countries."
          }
        ],
        faqEyebrow: "FAQs",
        faqTitle: "Frequently asked questions about TrackFlow.",
        faqBody:
          "Straight answers about logistics operations, geographic coverage, last-mile delivery, and returns for e-commerce brands.",
        faqs: [
          {
            q: "What is TrackFlow?",
            a: "TrackFlow is a last-mile logistics and warehouse management company for e-commerce brands. It was founded in 2009 in Los Angeles and operates teams and warehouses in the United States and Spain."
          },
          {
            q: "What logistics services does TrackFlow provide?",
            a: "TrackFlow provides inventory storage, order picking and packing, last-mile coordination, delivery tracking, incident management, reverse logistics, and operational support for brands and recipients."
          },
          {
            q: "Which countries does TrackFlow operate in?",
            a: "TrackFlow operates in the United States and Spain, with warehouses in Los Angeles and Zaragoza and distributed teams across both markets."
          },
          {
            q: "What kind of companies work with TrackFlow?",
            a: "TrackFlow works with e-commerce brands that need to outsource or improve their logistics operation, from inventory storage to delivery and returns management."
          },
          {
            q: "How does TrackFlow handle last mile and carriers?",
            a: "TrackFlow coordinates shipments through a network of 8 carriers in the United States and Spain and manages incidents such as failed deliveries, lost parcels, or wrong addresses."
          },
          {
            q: "How does TrackFlow handle returns?",
            a: "TrackFlow manages returns that can account for 18% to 25% of operational volume depending on the client and country. The process includes case review and decisions on pickup, refurbishing, or disposal."
          }
        ],
        ctaTitle: "Let us talk about your operation.",
        ctaBody: "Tell us how your logistics operation runs today and which challenges you need to solve.",
        footerBody: "Last-mile logistics and warehouse management for e-commerce operations.",
        footerAddress: "Los Angeles, CA, United States\nZaragoza, Spain\nOperations across the United States and Spain",
        footerForm: "Operational form",
        footerServices: "Services"
      },
      application: {
        title: "Let us talk about your operation | TrackFlow",
        description:
          "TrackFlow contact form for e-commerce brands that need to review logistics operations, last-mile performance, or returns.",
        ogTitle: "Let us talk about your operation | TrackFlow",
        ogDescription:
          "Complete the form and the TrackFlow team will review your operational context before scheduling a conversation.",
        twitterTitle: "Let us talk about your operation | TrackFlow",
        twitterDescription:
          "Complete the form and the TrackFlow team will review your operational context before scheduling a conversation.",
        eyebrow: "Contact TrackFlow",
        heading: "Tell us how your logistics operation works today.",
        intro:
          "Complete the form and the TrackFlow team will review your operational context before scheduling a conversation.",
        stepTitles: ["Company and contact", "Core operation", "Context and challenges", "Confirmation"],
        progress: "Step {current} of {total}",
        indicatorLabels: ["Company", "Operation", "Context", "Confirmation"],
        summaryTitle: "Request summary",
        labels: {
          companyName: "Company name *",
          contactName: "Main contact *",
          email: "Email *",
          country: "Primary operating country *",
          operationType: "Operation type *",
          monthlyOrders: "Estimated monthly volume *",
          urgency: "Project urgency *",
          notes: "What do you need to solve? *",
          currentTools: "Current stack (optional)",
          consent: "I agree that TrackFlow may use this data to answer my inquiry. *"
        },
        operationTypeOptions: [
          "Select the primary focus",
          "Fulfillment and warehouse",
          "Last mile and carriers",
          "Returns and reverse logistics",
          "End-to-end operation"
        ],
        monthlyOrdersOptions: [
          "Select a range",
          "Under 500 orders",
          "500 - 2,000 orders",
          "2,000 - 10,000 orders",
          "More than 10,000 orders"
        ],
        urgencyOptions: [
          "Select urgency",
          "Immediate (0-30 days)",
          "This quarter",
          "This semester",
          "Just exploring"
        ],
        notesPlaceholder:
          "Ex: we need to reduce last-mile incidents, improve returns management, or centralize order tracking.",
        currentToolsPlaceholder:
          "Ex: legacy ERP + spreadsheets + carrier portals",
        countryOptions: ["Select a country", "United States", "Spain", "Other"],
        next: "Next",
        previous: "Previous",
        submit: "Send inquiry",
        reset: "Start over",
        sendAnother: "Send another inquiry",
        backToHome: "Back to home"
      },
      validation: {
        companyName: "Please enter the company legal or trading name.",
        contactName: "Please enter the contact person's name.",
        email: "Use a valid business email, for example ops@company.com.",
        country: "Select the primary operating country.",
        operationType: "Select the operation type you want to optimize.",
        monthlyOrders: "Select the estimated monthly order volume.",
        urgency: "Select the urgency of your project.",
        notes: "Briefly explain what you need to solve.",
        consent: "Please confirm authorization so we can reply.",
        invalidForm: "Please review highlighted fields before moving forward or submitting.",
        progress: "Step {current} of {total}",
        success:
          "Thank you. We received your inquiry and the TrackFlow team will review your operational context before scheduling a conversation."
      }
    }
  };

  translations.es = normalizeSpanishObject(translations.es);

  const getPath = (obj, path) =>
    path.split(".").reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), obj);

  const getStoredLang = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const saveLang = (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors in restricted environments.
    }
  };

  const browserLang = (navigator.language || "").toLowerCase().startsWith("en") ? "en" : "es";
  let currentLang = SUPPORTED_LANGS.has(getStoredLang()) ? getStoredLang() : browserLang;

  const q = (selector, root) => (root || document).querySelector(selector);
  const qa = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  const setMeta = (selector, value) => {
    const element = q(selector);
    if (element) {
      element.setAttribute("content", value);
    }
  };

  const setText = (selector, value) => {
    qa(selector).forEach((node) => {
      node.textContent = value;
    });
  };

  const applyCommon = (lang) => {
    const common = translations[lang].common;
    document.documentElement.lang = common.htmlLang;

    const nav = q("header nav");
    if (nav) {
      nav.setAttribute("aria-label", common.navAria);
    }

    qa('a[href="#inicio"], a[href="index.html#inicio"]').forEach((link) => {
      link.setAttribute("aria-label", common.homeAria);
    });

    qa('img[src="assets/trackflow-logo.svg"]').forEach((img) => {
      img.setAttribute("alt", common.logoAlt);
    });

    const menuButton = q("[data-menu-button]");
    if (menuButton) {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      const menuLabel = isOpen ? common.menuClose : common.menuOpen;
      menuButton.setAttribute("aria-label", menuLabel);
      const srMenuLabel = menuButton.querySelector("[data-menu-label]");
      if (srMenuLabel) {
        srMenuLabel.textContent = menuLabel;
      }
    }

    setText("[data-contact-link]", common.contact);
    setText("[data-back-link]", common.backToLanding);
    setText('[data-nav-link][href="#inicio"], [data-nav-link][href="index.html#inicio"]', common.navHome);
    setText('[data-nav-link][href="#plataforma"], [data-nav-link][href="index.html#plataforma"]', common.navServices);
    setText('[data-nav-link][href="#mercados"], [data-nav-link][href="index.html#mercados"]', common.navMarkets);
    setText('[data-nav-link][href="#faqs"], [data-nav-link][href="index.html#faqs"]', common.navFaqs);

    qa("[data-language-switch]").forEach((node) => {
      node.setAttribute("aria-label", common.switchAria);
    });

    qa("[data-lang-option]").forEach((button) => {
      const buttonLang = button.getAttribute("data-lang-option");
      const active = buttonLang === lang;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("bg-[var(--tf-brand)]", active);
      button.classList.toggle("text-[var(--tf-bg)]", active);
      button.classList.toggle("text-[var(--tf-text-muted)]", !active);
      button.classList.toggle("hover:text-white", !active);
    });
  };

  const applyIndex = (lang) => {
    const content = translations[lang].index;

    document.title = content.title;
    setMeta('meta[name="description"]', content.description);
    setMeta('meta[property="og:title"]', content.ogTitle);
    setMeta('meta[property="og:description"]', content.ogDescription);
    setMeta('meta[property="og:locale"]', lang === "en" ? "en_US" : "es_ES");
    setMeta('meta[name="twitter:title"]', content.twitterTitle);
    setMeta('meta[name="twitter:description"]', content.twitterDescription);

    setText('[data-nav-link][href="#plataforma"]', content.navServices);
    setText('[data-nav-link][href="#mercados"]', content.navMarkets);
    setText('[data-nav-link][href="#faqs"]', content.navFaqs);

    const heroImage = q('img[src="assets/trackflow-hero.png"]');
    if (heroImage) {
      heroImage.setAttribute("alt", content.heroAlt);
    }

    setText("[data-hero-badge]", content.heroBadge);
    setText("[data-hero-title]", content.heroTitle);
    setText("[data-hero-body]", content.heroBody);
    setText("[data-hero-primary]", content.heroPrimaryCta);
    setText("[data-hero-secondary]", content.heroSecondaryCta);

    qa("#operacion article").forEach((article, index) => {
      const description = article.querySelector("p.mt-2");
      if (description && content.stats[index]) {
        description.textContent = content.stats[index];
      }
    });

    setText("[data-offer-eyebrow]", content.offerEyebrow);
    setText("[data-offer-title]", content.offerTitle);
    setText("[data-offer-body]", content.offerBody);

    qa("#plataforma .mt-14 article").forEach((card, index) => {
      const title = card.querySelector("h3");
      const body = card.querySelector("p");
      const value = content.serviceCards[index];
      if (!value) return;
      if (title) title.textContent = value.title;
      if (body) body.textContent = value.body;
    });

    setText("[data-markets-eyebrow]", content.marketsEyebrow);
    setText("[data-markets-title]", content.marketsTitle);
    setText("[data-markets-body]", content.marketsBody);

    qa("#mercados .grid.gap-4 article").forEach((card, index) => {
      const title = card.querySelector("h3");
      const body = card.querySelector("p");
      const value = content.marketCards[index];
      if (!value) return;
      if (title) title.textContent = value.title;
      if (body) body.textContent = value.body;
    });

    setText("[data-faq-eyebrow]", content.faqEyebrow);
    setText("[data-faq-title]", content.faqTitle);
    setText("[data-faq-body]", content.faqBody);

    qa("[data-faq-item]").forEach((item, index) => {
      const question = item.querySelector("[data-faq-trigger] span:first-child");
      const answer = item.querySelector("[data-faq-panel] p");
      const value = content.faqs[index];
      if (!value) return;
      if (question) question.textContent = value.q;
      if (answer) answer.textContent = value.a;
    });

    setText("[data-final-cta-title]", content.ctaTitle);
    setText("[data-final-cta-body]", content.ctaBody);

    setText("[data-footer-body]", content.footerBody);

    const address = q("[data-footer-address]");
    if (address) {
      address.innerHTML = content.footerAddress.split("\n").join("<br />");
    }

    setText("[data-footer-form]", content.footerForm);
    setText("[data-footer-services]", content.footerServices);
  };

  const applyApplication = (lang) => {
    const content = translations[lang].application;

    document.title = content.title;
    setMeta('meta[name="description"]', content.description);
    setMeta('meta[property="og:title"]', content.ogTitle);
    setMeta('meta[property="og:description"]', content.ogDescription);
    setMeta('meta[property="og:locale"]', lang === "en" ? "en_US" : "es_ES");
    setMeta('meta[name="twitter:title"]', content.twitterTitle);
    setMeta('meta[name="twitter:description"]', content.twitterDescription);

    setText("[data-application-eyebrow]", content.eyebrow);
    setText("[data-application-title]", content.heading);
    setText("[data-application-intro]", content.intro);
    setText("[data-application-fieldset-step1]", content.stepTitles[0]);
    setText("[data-application-fieldset-step2]", content.stepTitles[1]);
    setText("[data-application-fieldset-step3]", content.stepTitles[2]);
    setText("[data-application-fieldset-step4]", content.stepTitles[3]);
    setText("[data-application-progress-label]", content.progress.replace("{current}", "1").replace("{total}", "4"));
    setText('[data-step-label="1"]', content.indicatorLabels[0]);
    setText('[data-step-label="2"]', content.indicatorLabels[1]);
    setText('[data-step-label="3"]', content.indicatorLabels[2]);
    setText('[data-step-label="4"]', content.indicatorLabels[3]);
    setText("[data-summary-title]", content.summaryTitle);

    const labels = content.labels;
    Object.entries(labels).forEach(([field, value]) => {
      const label = q(`label[for="${field}"]`);
      if (label) {
        label.textContent = value;
      }
    });

    const consentInput = q('input[name="consent"]');
    const consentText = consentInput ? consentInput.closest("label")?.querySelector("span") : null;
    if (consentText) {
      consentText.textContent = labels.consent;
    }

    const notes = q("#notes");
    if (notes) {
      notes.setAttribute("placeholder", content.notesPlaceholder);
    }

    const currentTools = q("#currentTools");
    if (currentTools) {
      currentTools.setAttribute("placeholder", content.currentToolsPlaceholder);
    }

    qa("#country option").forEach((option, index) => {
      const value = content.countryOptions[index];
      if (value) {
        option.textContent = value;
      }
    });

    qa("#operationType option").forEach((option, index) => {
      const value = content.operationTypeOptions[index];
      if (value) {
        option.textContent = value;
      }
    });

    qa("#monthlyOrders option").forEach((option, index) => {
      const value = content.monthlyOrdersOptions[index];
      if (value) {
        option.textContent = value;
      }
    });

    qa("#urgency option").forEach((option, index) => {
      const value = content.urgencyOptions[index];
      if (value) {
        option.textContent = value;
      }
    });

    setText("[data-step-next]", content.next);
    setText("[data-step-prev]", content.previous);
    setText("[data-step-submit]", content.submit);
    setText("[data-step-reset]", content.reset);
    setText("[data-post-submit-new]", content.sendAnother);
    setText("[data-post-submit-back]", content.backToHome);
  };

  const applyLanguage = (lang, options) => {
    const selectedLang = SUPPORTED_LANGS.has(lang) ? lang : "es";
    const persist = !(options && options.persist === false);

    currentLang = selectedLang;
    if (persist) {
      saveLang(selectedLang);
    }

    applyCommon(selectedLang);

    if (document.body.dataset.page === "index") {
      applyIndex(selectedLang);
    }

    if (document.body.dataset.page === "application") {
      applyApplication(selectedLang);
    }

    document.dispatchEvent(new CustomEvent("trackflow:languagechange", { detail: { lang: selectedLang } }));
  };

  const initSwitch = () => {
    qa("[data-lang-option]").forEach((button) => {
      button.addEventListener("click", () => {
        const lang = button.getAttribute("data-lang-option");
        applyLanguage(lang);
      });
    });
  };

  window.TrackFlowI18n = {
    getCurrentLanguage: () => currentLang,
    t: (path) => getPath(translations[currentLang], path) || "",
    getValidationMessages: () => translations[currentLang].validation,
    setLanguage: (lang) => applyLanguage(lang),
    init: () => {
      initSwitch();
      applyLanguage(currentLang, { persist: false });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.TrackFlowI18n.init();
  });
})();
