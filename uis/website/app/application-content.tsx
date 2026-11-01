import type { CSSProperties } from "react";

export default function ApplicationContent() {
  return (
    <>
{"\n    "}
<header className={"fixed inset-x-0 top-0 z-40"} data-app-submit-entry={""} style={{"--app-submit-delay": "20ms"} as CSSProperties}>
{"\n      "}
<div className={"border-b border-[color:rgb(var(--tf-text-rgb)/0.12)] bg-[color:rgb(var(--tf-bg-rgb)/0.96)] shadow-[0_10px_26px_-16px_rgb(var(--tf-bg-rgb)/0.95)] backdrop-blur-md"}>
{"\n        "}
<nav className={"mx-auto flex max-w-[1024px] items-center justify-between px-4 py-4 sm:px-5 xl:px-8"} aria-label={"Navegación principal"}>
{"\n          "}
<a href={"/"} className={"flex items-center gap-2 sm:gap-3"} aria-label={"Volver a TrackFlow"}>
{"\n            "}
<img src={"/assets/trackflow-logo.svg"} alt={"Logo de TrackFlow"} className={"h-10 w-10 rounded"} />
{"\n            "}
<span>
{"\n              "}
<span className={"block text-base font-semibold tracking-wide text-[var(--tf-text)]"}>
{"TrackFlow"}
</span>
{"\n              "}
<span className={"block text-xs text-[color:rgb(var(--tf-text-rgb)/0.78)] max-[359px]:hidden"}>
{"Last-mile operations"}
</span>
{"\n            "}
</span>
{"\n          "}
</a>
{"\n          "}
<div className={"hidden items-center gap-8 text-sm text-[color:rgb(var(--tf-text-rgb)/0.74)] md:flex"}>
{"\n            "}
<a className={"font-medium text-[var(--tf-text-muted)] transition-colors hover:text-white"} href={"/#inicio"} data-nav-link={""}>
{"Inicio"}
</a>
{"\n            "}
<a className={"font-medium text-[var(--tf-text-muted)] transition-colors hover:text-white"} href={"/#plataforma"} data-nav-link={""}>
{"Servicios"}
</a>
{"\n            "}
<a className={"font-medium text-[var(--tf-text-muted)] transition-colors hover:text-white"} href={"/#mercados"} data-nav-link={""}>
{"Mercados"}
</a>
{"\n            "}
<a className={"font-medium text-[var(--tf-text-muted)] transition-colors hover:text-white"} href={"/#faqs"} data-nav-link={""}>
{"FAQs"}
</a>
{"\n          "}
</div>
{"\n          "}
<div className={"flex items-center gap-2 sm:gap-3"}>
{"\n            "}
<div data-language-switch={""} className={"inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1 shadow-[0_0_0_1px_rgb(var(--tf-text-rgb)/0.08)]"} aria-label={"Selección de idioma"}>
{"\n              "}
<button type={"button"} data-lang-option={"es"} aria-pressed={"true"} className={"rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--tf-text-muted)] hover:text-white"}>
{"ES"}
</button>
{"\n              "}
<button type={"button"} data-lang-option={"en"} aria-pressed={"false"} className={"rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--tf-text-muted)] hover:text-white"}>
{"EN"}
</button>
{"\n            "}
</div>
{"\n            "}
<span data-contact-link={""} aria-hidden={"true"} className={"invisible pointer-events-none hidden select-none rounded px-4 py-2 text-sm font-semibold md:inline-flex"}>
{"\n              Contáctanos\n            "}
</span>
{"\n            "}
<button type={"button"} className={"inline-flex h-11 w-11 items-center justify-center rounded border border-white/15 text-[var(--tf-text)] transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-bg)] md:hidden"} aria-controls={"mobile-menu"} aria-expanded={"false"} aria-label={"Abrir menú"} data-menu-button={""}>
{"\n              "}
<span className={"sr-only"} data-menu-label={""}>
{"Abrir menú"}
</span>
{"\n              "}
<span className={"relative block h-5 w-5"} aria-hidden={"true"}>
{"\n                "}
<span className={"absolute left-0 top-1 block h-0.5 w-5 rounded bg-current transition"} data-menu-line={"top"}>
</span>
{"\n                "}
<span className={"absolute left-0 top-2.5 block h-0.5 w-5 rounded bg-current transition"} data-menu-line={"middle"}>
</span>
{"\n                "}
<span className={"absolute left-0 top-4 block h-0.5 w-5 rounded bg-current transition"} data-menu-line={"bottom"}>
</span>
{"\n              "}
</span>
{"\n            "}
</button>
{"\n          "}
</div>
{"\n        "}
</nav>
{"\n      "}
</div>
{"\n      "}
<div id={"mobile-menu"} className={"pointer-events-none grid grid-rows-[0fr] border-b border-white/10 bg-[color:rgb(var(--tf-bg-rgb)/0.92)] px-4 sm:px-5 opacity-0 shadow-md shadow-[color:rgb(var(--tf-brand-rgb)/0.2)] backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none md:hidden"} aria-hidden={"true"} data-mobile-menu={""}>
{"\n        "}
<div className={"mx-auto flex w-full max-w-[1024px] -translate-y-3 flex-col gap-1 overflow-hidden pb-0 pt-0 text-sm font-medium text-[var(--tf-text-muted)] transition-all duration-300 ease-out motion-reduce:transition-none"} data-mobile-menu-content={""}>
{"\n          "}
<a className={"block rounded px-3 py-3 transition-colors hover:bg-white/10 hover:text-white"} href={"/#inicio"} data-nav-link={""}>
{"Inicio"}
</a>
{"\n          "}
<a className={"block rounded px-3 py-3 transition-colors hover:bg-white/10 hover:text-white"} href={"/#plataforma"} data-nav-link={""}>
{"Servicios"}
</a>
{"\n          "}
<a className={"block rounded px-3 py-3 transition-colors hover:bg-white/10 hover:text-white"} href={"/#mercados"} data-nav-link={""}>
{"Mercados"}
</a>
{"\n          "}
<a className={"block rounded px-3 py-3 transition-colors hover:bg-white/10 hover:text-white"} href={"/#faqs"} data-nav-link={""}>
{"FAQs"}
</a>
{"\n        "}
</div>
{"\n      "}
</div>
{"\n    "}
</header>
{"\n\n    "}
<main className={"mx-auto min-h-[92svh] max-w-[1024px] px-4 pb-10 pt-28 sm:px-5 sm:pb-12 sm:pt-32 md:min-h-[96svh] md:overflow-x-hidden md:px-5 md:pt-36 xl:px-8 xl:pb-14 xl:pt-40 [@media(max-height:900px)]:pt-24 [@media(max-height:900px)]:pb-6"} data-app-submit-entry={""} style={{"--app-submit-delay": "70ms"} as CSSProperties}>
{"\n      "}
<section className={"grid gap-4 sm:gap-5 md:grid-cols-[minmax(18rem,0.92fr)_minmax(0,1.08fr)] md:items-start md:gap-6 lg:grid-cols-[0.58fr_1.42fr] lg:gap-3 xl:grid-cols-[0.56fr_1.44fr]"}>
{"\n        "}
<aside className={"md:max-w-[21rem] md:pt-1 lg:max-w-none"}>
{"\n          "}
<p data-application-eyebrow={""} data-app-entry={"eyebrow"} data-app-submit-entry={""} style={{"--app-submit-delay": "120ms"} as CSSProperties} className={"text-sm font-bold uppercase tracking-[0.25em] text-[var(--tf-accent)]"}>
{"Contacto TrackFlow"}
</p>
{"\n          "}
<h1 data-application-title={""} data-app-entry={"title"} data-app-submit-entry={""} style={{"--app-submit-delay": "165ms"} as CSSProperties} className={"mt-2 text-[clamp(1.8rem,4.2vw,2.8rem)] font-black leading-[1.02] text-white md:text-[2.35rem] 2xl:text-[2.55rem]"}>
{"\n            Cuéntanos cómo funciona hoy tu operación logística.\n          "}
</h1>
{"\n          "}
<p data-application-intro={""} data-app-entry={"intro"} data-app-submit-entry={""} style={{"--app-submit-delay": "210ms"} as CSSProperties} className={"mt-4 max-w-[32ch] text-sm leading-6 text-[var(--tf-text-muted)] sm:text-base sm:leading-7 md:text-[1.04rem] md:leading-7"}>
{"\n            Completa el formulario y el equipo de TrackFlow revisará tu contexto operativo antes de coordinar una conversación.\n          "}
</p>
{"\n        "}
</aside>
{"\n\n        "}
<section className={"rounded border border-[color:rgb(var(--tf-text-rgb)/0.22)] bg-[linear-gradient(155deg,rgb(var(--tf-text-rgb)/0.08),rgb(var(--tf-text-rgb)/0.03)_40%,rgb(var(--tf-bg-rgb)/0.82)_100%)] p-3.5 shadow-[0_26px_60px_-40px_rgb(0_0_0/0.95),0_0_0_1px_rgb(var(--tf-brand-rgb)/0.18)] backdrop-blur-sm sm:p-4 md:max-h-[min(720px,calc(100svh-7rem))] md:self-start md:overflow-y-auto md:p-3.5 lg:max-w-none"} data-application-panel={""} data-submitted={"false"} data-app-entry={"panel"} data-app-submit-entry={""} style={{"--app-submit-delay": "255ms"} as CSSProperties}>
{"\n          "}
<form id={"applicationForm"} noValidate={true} className={"space-y-3 transition-all duration-300 ease-out motion-reduce:transition-none md:flex md:flex-col md:gap-2 md:space-y-0"}>
{"\n            "}
<div className={"rounded border border-[color:rgb(var(--tf-text-rgb)/0.16)] bg-[color:rgb(var(--tf-bg-rgb)/0.45)] p-3 md:p-2"} aria-live={"polite"} data-form-progress={""}>
{"\n              "}
<div className={"flex items-start justify-between gap-3"}>
{"\n                "}
<p className={"text-xs font-bold uppercase tracking-[0.16em] text-[var(--tf-text-soft)]"} data-application-progress-label={""}>
{"Paso 1 de 4"}
</p>
{"\n                "}
<button type={"reset"} data-step-reset={""} className={"shrink-0 rounded px-1.5 py-0.5 text-right text-xs font-medium text-[var(--tf-text-soft)] transition hover:text-[var(--tf-error)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--tf-bg)]"}>
{"\n                  Borrar formulario\n                "}
</button>
{"\n              "}
</div>
{"\n              "}
<div className={"mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[color:rgb(var(--tf-text-rgb)/0.12)]"}>
{"\n                "}
<div className={"h-full rounded-full bg-[linear-gradient(90deg,var(--tf-brand),var(--tf-accent))] transition-all duration-300"} data-progress-bar={""} style={{"width": "25%"} as CSSProperties}>
</div>
{"\n              "}
</div>
{"\n              "}
<ol className={"mt-2 grid grid-cols-4 gap-1 text-[0.66rem] text-[var(--tf-text-soft)] sm:text-xs md:mt-1.5"} data-step-indicators={""}>
{"\n                "}
<li className={"rounded border border-[color:rgb(var(--tf-brand-rgb)/0.45)] bg-[color:rgb(var(--tf-brand-rgb)/0.14)] px-1.5 py-1 text-center font-semibold text-[var(--tf-text)] transition-colors hover:border-[color:rgb(var(--tf-brand-rgb)/0.6)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-1 focus:ring-offset-[var(--tf-bg)] cursor-pointer"} role={"button"} tabIndex={0} aria-current={"step"} aria-label={"Ir al paso 1: Empresa"} data-step-indicator={"1"} data-step-label={"1"}>
{"Empresa"}
</li>
{"\n                "}
<li className={"rounded border border-[color:rgb(var(--tf-text-rgb)/0.18)] px-1.5 py-1 text-center transition-colors hover:border-[color:rgb(var(--tf-text-rgb)/0.4)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-1 focus:ring-offset-[var(--tf-bg)] cursor-pointer"} role={"button"} tabIndex={0} aria-current={"false"} aria-label={"Ir al paso 2: Operación"} data-step-indicator={"2"} data-step-label={"2"}>
{"Operación"}
</li>
{"\n                "}
<li className={"rounded border border-[color:rgb(var(--tf-text-rgb)/0.18)] px-1.5 py-1 text-center transition-colors hover:border-[color:rgb(var(--tf-text-rgb)/0.4)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-1 focus:ring-offset-[var(--tf-bg)] cursor-pointer"} role={"button"} tabIndex={0} aria-current={"false"} aria-label={"Ir al paso 3: Contexto"} data-step-indicator={"3"} data-step-label={"3"}>
{"Contexto"}
</li>
{"\n                "}
<li className={"rounded border border-[color:rgb(var(--tf-text-rgb)/0.18)] px-1.5 py-1 text-center transition-colors hover:border-[color:rgb(var(--tf-text-rgb)/0.4)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-1 focus:ring-offset-[var(--tf-bg)] cursor-pointer"} role={"button"} tabIndex={0} aria-current={"false"} aria-label={"Ir al paso 4: Confirmación"} data-step-indicator={"4"} data-step-label={"4"}>
{"Confirmación"}
</li>
{"\n              "}
</ol>
{"\n              "}
<p className={"mt-2 text-[0.7rem] text-[color:rgb(var(--tf-text-rgb)/0.7)] md:mt-1.5"}>
{"Puedes avanzar al siguiente paso o volver a los anteriores en cualquier momento."}
</p>
{"\n            "}
</div>
{"\n\n            "}
<div className={"md:min-h-[13rem] 2xl:min-h-[15.5rem]"} data-form-steps={""}>
{"\n            "}
<fieldset className={"grid gap-2.5 sm:grid-cols-2 md:gap-2 lg:grid-cols-6"} data-form-step={"1"}>
{"\n              "}
<legend data-application-fieldset-step1={""} className={"mb-1.5 text-base font-bold text-white md:mb-1 lg:col-span-6"}>
{"Empresa y contacto"}
</legend>
{"\n              "}
<div className={"sm:col-span-2 lg:col-span-6"}>
{"\n                "}
<label htmlFor={"companyName"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"Nombre de la empresa *"}
</label>
{"\n                "}
<input id={"companyName"} name={"companyName"} type={"text"} minLength={2} className={"mt-1 w-full rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition placeholder:text-[color:rgb(var(--tf-text-rgb)/0.45)] focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"} />
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"companyName"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n              "}
<div className={"lg:col-span-3"}>
{"\n                "}
<label htmlFor={"contactName"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"Persona responsable *"}
</label>
{"\n                "}
<input id={"contactName"} name={"contactName"} type={"text"} minLength={2} className={"mt-1 w-full rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition placeholder:text-[color:rgb(var(--tf-text-rgb)/0.45)] focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"} />
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"contactName"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n              "}
<div className={"lg:col-span-3"}>
{"\n                "}
<label htmlFor={"email"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"Email *"}
</label>
{"\n                "}
<input id={"email"} name={"email"} type={"email"} className={"mt-1 w-full rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition placeholder:text-[color:rgb(var(--tf-text-rgb)/0.45)] focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"} />
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"email"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n            "}
</fieldset>
{"\n\n            "}
<fieldset className={"hidden grid gap-2.5 sm:grid-cols-2 md:gap-2 lg:grid-cols-6"} data-form-step={"2"}>
{"\n              "}
<legend data-application-fieldset-step2={""} className={"mb-1.5 text-base font-bold text-white md:mb-1 lg:col-span-6"}>
{"Operación principal"}
</legend>
{"\n              "}
<div className={"lg:col-span-3"}>
{"\n                "}
<label htmlFor={"country"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"País de operación principal *"}
</label>
{"\n                "}
<select id={"country"} name={"country"} className={"mt-1 w-full rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"}>
{"\n                  "}
<option value={""}>
{"Selecciona un país"}
</option>
{"\n                  "}
<option value={"US"}>
{"Estados Unidos"}
</option>
{"\n                  "}
<option value={"ES"}>
{"España"}
</option>
{"\n                  "}
<option value={"OTHER"}>
{"Otro"}
</option>
{"\n                "}
</select>
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"country"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n              "}
<div className={"lg:col-span-3"}>
{"\n                "}
<label htmlFor={"operationType"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"Tipo de operación *"}
</label>
{"\n                "}
<select id={"operationType"} name={"operationType"} className={"mt-1 w-full rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"}>
{"\n                  "}
<option value={""}>
{"Selecciona el foco principal"}
</option>
{"\n                  "}
<option value={"fulfillment"}>
{"Fulfillment y almacén"}
</option>
{"\n                  "}
<option value={"lastmile"}>
{"Última milla y transportistas"}
</option>
{"\n                  "}
<option value={"returns"}>
{"Devoluciones y logística inversa"}
</option>
{"\n                  "}
<option value={"fullstack"}>
{"Operación end-to-end"}
</option>
{"\n                "}
</select>
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"operationType"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n              "}
<div className={"lg:col-span-3"}>
{"\n                "}
<label htmlFor={"monthlyOrders"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"Volumen mensual estimado *"}
</label>
{"\n                "}
<select id={"monthlyOrders"} name={"monthlyOrders"} className={"mt-1 w-full rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"}>
{"\n                  "}
<option value={""}>
{"Selecciona un rango"}
</option>
{"\n                  "}
<option value={"lt500"}>
{"Menos de 500 pedidos"}
</option>
{"\n                  "}
<option value={"500-2000"}>
{"500 - 2.000 pedidos"}
</option>
{"\n                  "}
<option value={"2000-10000"}>
{"2.000 - 10.000 pedidos"}
</option>
{"\n                  "}
<option value={"gt10000"}>
{"Más de 10.000 pedidos"}
</option>
{"\n                "}
</select>
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"monthlyOrders"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n              "}
<div className={"lg:col-span-3"}>
{"\n                "}
<label htmlFor={"urgency"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"Urgencia del proyecto *"}
</label>
{"\n                "}
<select id={"urgency"} name={"urgency"} className={"mt-1 w-full rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"}>
{"\n                  "}
<option value={""}>
{"Selecciona urgencia"}
</option>
{"\n                  "}
<option value={"now"}>
{"Inmediata (0-30 días)"}
</option>
{"\n                  "}
<option value={"quarter"}>
{"Este trimestre"}
</option>
{"\n                  "}
<option value={"semester"}>
{"Este semestre"}
</option>
{"\n                  "}
<option value={"exploring"}>
{"Solo exploración"}
</option>
{"\n                "}
</select>
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"urgency"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n            "}
</fieldset>
{"\n\n            "}
<fieldset className={"hidden grid gap-2.5 sm:grid-cols-2 md:gap-2 lg:grid-cols-6"} data-form-step={"3"}>
{"\n              "}
<legend data-application-fieldset-step3={""} className={"mb-1.5 text-base font-bold text-white md:mb-1 lg:col-span-6"}>
{"Contexto y desafíos"}
</legend>
{"\n              "}
<div className={"sm:col-span-2 lg:col-span-4"}>
{"\n                "}
<label htmlFor={"notes"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"¿Qué necesitas resolver? *"}
</label>
{"\n                "}
<textarea id={"notes"} name={"notes"} minLength={10} rows={3} placeholder={"Ej: necesitamos reducir incidencias en última milla, mejorar la gestión de devoluciones o centralizar el seguimiento de pedidos."} className={"mt-1 w-full resize-none overflow-hidden rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition placeholder:text-[color:rgb(var(--tf-text-rgb)/0.45)] focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"}>
</textarea>
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"notes"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n              "}
<div className={"sm:col-span-2 lg:col-span-2"}>
{"\n                "}
<label htmlFor={"currentTools"} className={"block text-sm font-medium text-[var(--tf-text-muted)]"}>
{"Stack actual (opcional)"}
</label>
{"\n                "}
<textarea id={"currentTools"} name={"currentTools"} rows={3} placeholder={"Ej: ERP legacy + hojas de cálculo + portal transportista"} className={"mt-1 w-full resize-none overflow-hidden rounded border border-[color:rgb(var(--tf-text-rgb)/0.2)] bg-[color:rgb(var(--tf-bg-rgb)/0.52)] px-3 py-1.5 text-white outline-none transition placeholder:text-[color:rgb(var(--tf-text-rgb)/0.45)] focus:border-[var(--tf-brand)] md:px-2.5 md:py-1"}>
</textarea>
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"currentTools"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n            "}
</fieldset>
{"\n\n            "}
<fieldset className={"hidden grid gap-2.5 sm:grid-cols-2 md:gap-2 lg:grid-cols-6"} data-form-step={"4"}>
{"\n              "}
<legend data-application-fieldset-step4={""} className={"mb-1.5 text-base font-bold text-white md:mb-1 lg:col-span-6"}>
{"Confirmación"}
</legend>
{"\n              "}
<div className={"rounded border border-[color:rgb(var(--tf-text-rgb)/0.18)] bg-[color:rgb(var(--tf-bg-rgb)/0.45)] p-2 sm:col-span-2 md:max-h-[8.75rem] md:overflow-y-auto lg:col-span-6"} data-summary-box={""}>
{"\n                "}
<p className={"text-xs font-bold uppercase tracking-[0.14em] text-[var(--tf-text-soft)]"} data-summary-title={""}>
{"Resumen de tu solicitud"}
</p>
{"\n                "}
<dl className={"mt-1.5 grid gap-x-3 gap-y-1.5 text-[0.83rem] sm:grid-cols-2 md:grid-cols-4 md:gap-y-1"} data-summary-list={""}>
</dl>
{"\n              "}
</div>
{"\n              "}
<div className={"rounded border border-[color:rgb(var(--tf-text-rgb)/0.18)] bg-[color:rgb(var(--tf-bg-rgb)/0.45)] p-1.5 sm:col-span-2 lg:col-span-6"}>
{"\n                "}
<label className={"flex gap-2.5 text-sm text-[var(--tf-text-muted)]"}>
{"\n                  "}
<input id={"consent"} name={"consent"} type={"checkbox"} className={"mt-0.5 h-4 w-4 rounded border-[var(--tf-border)] bg-[var(--tf-bg)] text-[var(--tf-brand)] focus:ring-[var(--tf-brand)]"} />
{"\n                  "}
<span>
{"Acepto que TrackFlow use estos datos para responder mi consulta. *"}
</span>
{"\n                "}
</label>
{"\n                "}
<p className={"mt-0.5 min-h-3 text-xs text-[var(--tf-error)]"} data-error-for={"consent"} aria-live={"polite"}>
</p>
{"\n              "}
</div>
{"\n            "}
</fieldset>
{"\n            "}
</div>
{"\n\n            "}
<div id={"formStatus"} className={"hidden rounded border p-2.5 text-sm"} role={"status"} aria-live={"polite"} data-app-submit-entry={""} style={{"--app-submit-delay": "300ms"} as CSSProperties}>
</div>
{"\n\n            "}
<div className={"hidden flex-col gap-2.5 sm:flex-row"} data-post-submit-actions={""} data-app-submit-entry={""} style={{"--app-submit-delay": "345ms"} as CSSProperties}>
{"\n              "}
<button type={"button"} data-post-submit-new={""} data-app-submit-entry={""} style={{"--app-submit-delay": "390ms"} as CSSProperties} className={"w-full rounded bg-[var(--tf-brand)] px-5 py-3 text-sm font-bold text-[var(--tf-bg)] transition hover:bg-[var(--tf-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-surface)] sm:w-auto sm:py-2"}>
{"\n                Enviar otra consulta\n              "}
</button>
{"\n              "}
<a href={"/#inicio"} data-post-submit-back={""} data-app-submit-entry={""} style={{"--app-submit-delay": "435ms"} as CSSProperties} className={"inline-flex w-full justify-center rounded border border-[var(--tf-border-soft)] bg-transparent px-5 py-3 text-sm font-bold text-[var(--tf-text-muted)] transition hover:border-[var(--tf-text-muted)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tf-text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--tf-surface)] sm:w-auto sm:py-2"}>
{"\n                Volver al inicio\n              "}
</a>
{"\n            "}
</div>
{"\n\n            "}
<div className={"flex flex-col flex-wrap justify-between gap-2.5 border-t border-[color:rgb(var(--tf-text-rgb)/0.12)] pt-2.5 sm:flex-row md:border-t-0 md:pt-0"} data-form-actions={""}>
{"\n              "}
<div className={"flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row"}>
{"\n                "}
<button type={"button"} data-step-prev={""} className={"hidden w-full rounded border border-[var(--tf-border-soft)] bg-transparent px-5 py-3 text-sm font-bold text-[var(--tf-text-muted)] transition hover:border-[var(--tf-text-muted)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tf-text-muted)] focus:ring-offset-2 focus:ring-offset-[var(--tf-surface)] sm:w-auto sm:py-2"}>
{"\n                  Anterior\n                "}
</button>
{"\n              "}
</div>
{"\n              "}
<div className={"ml-auto flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row"}>
{"\n                "}
<button type={"button"} data-step-next={""} className={"w-full rounded bg-[var(--tf-brand)] px-5 py-3 text-sm font-bold text-[var(--tf-bg)] transition hover:bg-[var(--tf-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-surface)] sm:w-auto sm:py-2"}>
{"\n                  Siguiente\n                "}
</button>
{"\n                "}
<button type={"submit"} data-step-submit={""} className={"hidden w-full rounded bg-[var(--tf-brand)] px-5 py-3 text-sm font-bold text-[var(--tf-bg)] transition hover:bg-[var(--tf-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-surface)] sm:w-auto sm:py-2"}>
{"\n                  Enviar consulta\n                "}
</button>
{"\n              "}
</div>
{"\n            "}
</div>
{"\n\n          "}
</form>
{"\n        "}
</section>
{"\n      "}
</section>
{"\n    "}
</main>
{"\n    "}
{"\n  "}
    </>
  );
}
