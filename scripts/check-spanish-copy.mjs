import fs from "node:fs";
import vm from "node:vm";

const files = ["index.html", "application.html", "i18n.js", "validation.js"];
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (/[ÃÂ�]/.test(content)) {
    failures.push(`${file}: contiene texto con mojibake o caracteres de reemplazo.`);
  }
}

const i18nSource = fs.readFileSync("i18n.js", "utf8");
const esBlockStart = i18nSource.indexOf("    es: {");
const esBlockEnd = i18nSource.indexOf("    en: {");
const esBlock = esBlockStart >= 0 && esBlockEnd > esBlockStart
  ? i18nSource.slice(esBlockStart, esBlockEnd)
  : "";

if (!esBlock) {
  failures.push("i18n.js: no se pudo aislar el bloque de traducciones en español.");
}

const accentlessSpanishPatterns = [
  /\bLogistica\b/,
  /\blogistica\b/,
  /\bultima\b/,
  /\bpreparacion\b/,
  /\bEspana\b/,
  /\boperacion\b/,
  /\bOperacion\b/,
  /\bdevolucion\b/,
  /\bGestion\b/,
  /\bgestion\b/,
  /\bpais\b/,
  /\bpaises\b/,
  /\bsegun\b/,
  /\brevision\b/,
  /\bCuentanos\b/,
  /\bvalido\b/,
  /\bautorizacion\b/,
  /\bconversacion\b/,
  /\brevisara\b/,
  /\bdesafios\b/,
  /\balmacen\b/,
  /\bAtencion\b/,
  /\bCoordinacion\b/,
  /\benvios\b/,
  /\bresolucion\b/,
  /\btecnologica\b/,
  /\btecnologia\b/,
  /\bContactanos\b/,
  /\bNavegacion\b/,
  /\bSeleccion\b/,
  /\bmenu\b/
];

for (const pattern of accentlessSpanishPatterns) {
  if (pattern.test(esBlock)) {
    failures.push(`i18n.js: el bloque ES contiene texto sin tilde: ${pattern}`);
  }
}

const documentMock = {
  documentElement: { lang: "es" },
  body: { dataset: { page: "test" } },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  dispatchEvent: () => {}
};

const context = {
  window: {},
  document: documentMock,
  navigator: { language: "es-UY" },
  localStorage: {
    getItem: () => "es",
    setItem: () => {}
  },
  CustomEvent: class CustomEvent {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  }
};

vm.createContext(context);
vm.runInContext(i18nSource, context, { filename: "i18n.js" });

const t = context.window.TrackFlowI18n?.t;
if (typeof t !== "function") {
  failures.push("i18n.js: TrackFlowI18n.t no quedó disponible.");
} else {
  const expected = new Map([
    ["common.navAria", "Navegación principal"],
    ["common.menuOpen", "Abrir menú"],
    ["common.contact", "Contáctanos"],
    ["index.title", "TrackFlow | Logística de última milla para e-commerce"],
    ["index.heroBadge", "Fundada en 2009 | Los Ángeles + Zaragoza"],
    ["index.offerEyebrow", "Qué ofrecemos hoy"],
    ["index.faqs.0.q", "¿Qué es TrackFlow?"],
    ["index.faqs.4.q", "¿Cómo gestiona TrackFlow la última milla y los transportistas?"],
    ["application.title", "Hablemos de tu operación | TrackFlow"],
    ["application.heading", "Cuéntanos cómo funciona hoy tu operación logística."],
    ["application.labels.country", "País de operación principal *"],
    ["application.labels.notes", "¿Qué necesitas resolver? *"],
    ["application.countryOptions.2", "España"],
    ["validation.email", "Usa un email corporativo válido, por ejemplo ops@empresa.com."],
    ["validation.success", "Gracias. Recibimos tu consulta y el equipo de TrackFlow revisará tu contexto operativo antes de coordinar una conversación."]
  ]);

  for (const [path, value] of expected) {
    const actual = t(path);
    if (actual !== value) {
      failures.push(`i18n.js: ${path} esperaba "${value}" y recibió "${actual}".`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Spanish copy check passed.");
