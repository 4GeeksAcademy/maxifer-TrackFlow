import type { CSSProperties } from "react";

export default function IndexContent() {
  return (
    <>
{"\n    "}
<header className={"fixed inset-x-0 top-0 z-40"}>
{"\n      "}
<div className={"border-b border-[color:rgb(var(--tf-text-rgb)/0.12)] bg-[color:rgb(var(--tf-bg-rgb)/0.8)] shadow-[0_10px_26px_-16px_rgb(var(--tf-bg-rgb)/0.95)] backdrop-blur-md"}>
{"\n        "}
<nav className={"mx-auto flex max-w-[1024px] items-center justify-between px-4 py-4 sm:px-5 xl:px-8"} aria-label={"Navegación principal"}>
{"\n        "}
<a href={"#inicio"} className={"flex items-center gap-2 sm:gap-3"} aria-label={"TrackFlow inicio"}>
{"\n          "}
<img src={"/assets/trackflow-logo.svg"} alt={"Logo de TrackFlow"} className={"h-10 w-10 rounded"} />
{"\n          "}
<span>
{"\n            "}
<span className={"block text-base font-semibold tracking-wide text-[var(--tf-text)]"}>
{"TrackFlow"}
</span>
{"\n            "}
<span className={"block text-xs text-[color:rgb(var(--tf-text-rgb)/0.78)] max-[359px]:hidden"}>
{"Last-mile operations"}
</span>
{"\n          "}
</span>
{"\n        "}
</a>
{"\n        "}
<div className={"hidden items-center gap-8 text-sm text-[color:rgb(var(--tf-text-rgb)/0.74)] md:flex"}>
{"\n          "}
<a className={"relative isolate font-medium text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:text-white motion-reduce:transition-none md:py-[0.45rem] before:pointer-events-none before:absolute before:opacity-0 before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none after:pointer-events-none after:absolute after:opacity-0 after:transition-[opacity,transform] after:duration-200 after:content-[''] motion-reduce:after:transition-none md:before:left-1/2 md:before:-top-[0.2rem] md:before:h-[0.35rem] md:before:w-[0.35rem] md:before:-translate-x-1/2 md:before:scale-[0.4] md:before:rounded-full md:before:bg-[var(--tf-accent)] md:before:shadow-[0_0_18px_rgb(var(--tf-accent-rgb)/0.7)] md:after:-inset-x-[0.2rem] md:after:-bottom-[0.35rem] md:after:h-[0.16rem] md:after:scale-x-[0.18] md:after:rounded-full md:after:bg-[linear-gradient(90deg,transparent,var(--tf-brand)_20%,var(--tf-accent)_80%,transparent)] md:after:shadow-[0_0_16px_rgb(var(--tf-brand-rgb)/0.45)] data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] md:data-[active=true]:before:opacity-100 md:data-[active=true]:before:scale-100 md:data-[active=true]:after:opacity-100 md:data-[active=true]:after:scale-x-100"} href={"#inicio"} data-nav-link={""}>
{"Inicio"}
</a>
{"\n          "}
<a className={"relative isolate font-medium text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:text-white motion-reduce:transition-none md:py-[0.45rem] before:pointer-events-none before:absolute before:opacity-0 before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none after:pointer-events-none after:absolute after:opacity-0 after:transition-[opacity,transform] after:duration-200 after:content-[''] motion-reduce:after:transition-none md:before:left-1/2 md:before:-top-[0.2rem] md:before:h-[0.35rem] md:before:w-[0.35rem] md:before:-translate-x-1/2 md:before:scale-[0.4] md:before:rounded-full md:before:bg-[var(--tf-accent)] md:before:shadow-[0_0_18px_rgb(var(--tf-accent-rgb)/0.7)] md:after:-inset-x-[0.2rem] md:after:-bottom-[0.35rem] md:after:h-[0.16rem] md:after:scale-x-[0.18] md:after:rounded-full md:after:bg-[linear-gradient(90deg,transparent,var(--tf-brand)_20%,var(--tf-accent)_80%,transparent)] md:after:shadow-[0_0_16px_rgb(var(--tf-brand-rgb)/0.45)] data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] md:data-[active=true]:before:opacity-100 md:data-[active=true]:before:scale-100 md:data-[active=true]:after:opacity-100 md:data-[active=true]:after:scale-x-100"} href={"#plataforma"} data-nav-link={""}>
{"Servicios"}
</a>
{"\n          "}
<a className={"relative isolate font-medium text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:text-white motion-reduce:transition-none md:py-[0.45rem] before:pointer-events-none before:absolute before:opacity-0 before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none after:pointer-events-none after:absolute after:opacity-0 after:transition-[opacity,transform] after:duration-200 after:content-[''] motion-reduce:after:transition-none md:before:left-1/2 md:before:-top-[0.2rem] md:before:h-[0.35rem] md:before:w-[0.35rem] md:before:-translate-x-1/2 md:before:scale-[0.4] md:before:rounded-full md:before:bg-[var(--tf-accent)] md:before:shadow-[0_0_18px_rgb(var(--tf-accent-rgb)/0.7)] md:after:-inset-x-[0.2rem] md:after:-bottom-[0.35rem] md:after:h-[0.16rem] md:after:scale-x-[0.18] md:after:rounded-full md:after:bg-[linear-gradient(90deg,transparent,var(--tf-brand)_20%,var(--tf-accent)_80%,transparent)] md:after:shadow-[0_0_16px_rgb(var(--tf-brand-rgb)/0.45)] data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] md:data-[active=true]:before:opacity-100 md:data-[active=true]:before:scale-100 md:data-[active=true]:after:opacity-100 md:data-[active=true]:after:scale-x-100"} href={"#mercados"} data-nav-link={""}>
{"Mercados"}
</a>
{"\n          "}
<a className={"relative isolate font-medium text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:text-white motion-reduce:transition-none md:py-[0.45rem] before:pointer-events-none before:absolute before:opacity-0 before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none after:pointer-events-none after:absolute after:opacity-0 after:transition-[opacity,transform] after:duration-200 after:content-[''] motion-reduce:after:transition-none md:before:left-1/2 md:before:-top-[0.2rem] md:before:h-[0.35rem] md:before:w-[0.35rem] md:before:-translate-x-1/2 md:before:scale-[0.4] md:before:rounded-full md:before:bg-[var(--tf-accent)] md:before:shadow-[0_0_18px_rgb(var(--tf-accent-rgb)/0.7)] md:after:-inset-x-[0.2rem] md:after:-bottom-[0.35rem] md:after:h-[0.16rem] md:after:scale-x-[0.18] md:after:rounded-full md:after:bg-[linear-gradient(90deg,transparent,var(--tf-brand)_20%,var(--tf-accent)_80%,transparent)] md:after:shadow-[0_0_16px_rgb(var(--tf-brand-rgb)/0.45)] data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] md:data-[active=true]:before:opacity-100 md:data-[active=true]:before:scale-100 md:data-[active=true]:after:opacity-100 md:data-[active=true]:after:scale-x-100"} href={"#faqs"} data-nav-link={""}>
{"FAQs"}
</a>
{"\n        "}
</div>
{"\n        "}
<div className={"flex items-center gap-2 sm:gap-3"}>
{"\n            "}
<div data-language-switch={""} className={"inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1 shadow-[0_0_0_1px_rgb(var(--tf-text-rgb)/0.08)]"} aria-label={"Selección de idioma"}>
{"\n            "}
<button type={"button"} data-lang-option={"es"} aria-pressed={"true"} className={"rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--tf-text-muted)] hover:text-white"}>
{"ES"}
</button>
{"\n            "}
<button type={"button"} data-lang-option={"en"} aria-pressed={"false"} className={"rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--tf-text-muted)] hover:text-white"}>
{"EN"}
</button>
{"\n          "}
</div>
{"\n          "}
<a href={"/application/"} data-contact-link={""} className={"hidden rounded bg-[var(--tf-brand)] px-4 py-2 text-sm font-semibold text-[var(--tf-bg)] transition hover:bg-[var(--tf-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-bg)] md:inline-flex"}>
{"\n            Contáctanos\n          "}
</a>
{"\n          "}
<button type={"button"} className={"inline-flex h-11 w-11 items-center justify-center rounded border border-white/15 text-[var(--tf-text)] transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-bg)] md:hidden"} aria-controls={"mobile-menu"} aria-expanded={"false"} aria-label={"Abrir menú"} data-menu-button={""}>
{"\n              "}
<span className={"sr-only"} data-menu-label={""}>
{"Abrir menú"}
</span>
{"\n            "}
<span className={"relative block h-5 w-5"} aria-hidden={"true"}>
{"\n              "}
<span className={"absolute left-0 top-1 block h-0.5 w-5 rounded bg-current transition"} data-menu-line={"top"}>
</span>
{"\n              "}
<span className={"absolute left-0 top-2.5 block h-0.5 w-5 rounded bg-current transition"} data-menu-line={"middle"}>
</span>
{"\n              "}
<span className={"absolute left-0 top-4 block h-0.5 w-5 rounded bg-current transition"} data-menu-line={"bottom"}>
</span>
{"\n            "}
</span>
{"\n          "}
</button>
{"\n        "}
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
<a className={"relative block w-full rounded border border-transparent px-3 py-3 text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:bg-white/10 hover:text-white motion-reduce:transition-none before:pointer-events-none before:absolute before:left-[0.55rem] before:top-1/2 before:h-[1.4rem] before:w-[0.18rem] before:-translate-y-1/2 before:scale-y-[0.4] before:rounded-full before:bg-[linear-gradient(180deg,var(--tf-accent),var(--tf-brand))] before:opacity-0 before:shadow-[0_0_18px_rgb(var(--tf-brand-rgb)/0.45)] before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none data-[active=true]:border-[color:rgb(var(--tf-brand-rgb)/0.28)] data-[active=true]:bg-[linear-gradient(90deg,rgb(var(--tf-brand-rgb)/0.18),rgb(var(--tf-accent-rgb)/0.08)),rgb(var(--tf-text-rgb)/0.04)] data-[active=true]:pl-8 data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] data-[active=true]:before:opacity-100 data-[active=true]:before:scale-y-100"} href={"#inicio"} data-nav-link={""}>
{"Inicio"}
</a>
{"\n          "}
<a className={"relative block w-full rounded border border-transparent px-3 py-3 text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:bg-white/10 hover:text-white motion-reduce:transition-none before:pointer-events-none before:absolute before:left-[0.55rem] before:top-1/2 before:h-[1.4rem] before:w-[0.18rem] before:-translate-y-1/2 before:scale-y-[0.4] before:rounded-full before:bg-[linear-gradient(180deg,var(--tf-accent),var(--tf-brand))] before:opacity-0 before:shadow-[0_0_18px_rgb(var(--tf-brand-rgb)/0.45)] before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none data-[active=true]:border-[color:rgb(var(--tf-brand-rgb)/0.28)] data-[active=true]:bg-[linear-gradient(90deg,rgb(var(--tf-brand-rgb)/0.18),rgb(var(--tf-accent-rgb)/0.08)),rgb(var(--tf-text-rgb)/0.04)] data-[active=true]:pl-8 data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] data-[active=true]:before:opacity-100 data-[active=true]:before:scale-y-100"} href={"#plataforma"} data-nav-link={""}>
{"Servicios"}
</a>
{"\n          "}
<a className={"relative block w-full rounded border border-transparent px-3 py-3 text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:bg-white/10 hover:text-white motion-reduce:transition-none before:pointer-events-none before:absolute before:left-[0.55rem] before:top-1/2 before:h-[1.4rem] before:w-[0.18rem] before:-translate-y-1/2 before:scale-y-[0.4] before:rounded-full before:bg-[linear-gradient(180deg,var(--tf-accent),var(--tf-brand))] before:opacity-0 before:shadow-[0_0_18px_rgb(var(--tf-brand-rgb)/0.45)] before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none data-[active=true]:border-[color:rgb(var(--tf-brand-rgb)/0.28)] data-[active=true]:bg-[linear-gradient(90deg,rgb(var(--tf-brand-rgb)/0.18),rgb(var(--tf-accent-rgb)/0.08)),rgb(var(--tf-text-rgb)/0.04)] data-[active=true]:pl-8 data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] data-[active=true]:before:opacity-100 data-[active=true]:before:scale-y-100"} href={"#mercados"} data-nav-link={""}>
{"Mercados"}
</a>
{"\n          "}
<a className={"relative block w-full rounded border border-transparent px-3 py-3 text-[var(--tf-text-muted)] transition-[color,text-shadow,background-color,border-color] duration-200 hover:bg-white/10 hover:text-white motion-reduce:transition-none before:pointer-events-none before:absolute before:left-[0.55rem] before:top-1/2 before:h-[1.4rem] before:w-[0.18rem] before:-translate-y-1/2 before:scale-y-[0.4] before:rounded-full before:bg-[linear-gradient(180deg,var(--tf-accent),var(--tf-brand))] before:opacity-0 before:shadow-[0_0_18px_rgb(var(--tf-brand-rgb)/0.45)] before:transition-[opacity,transform] before:duration-200 before:content-[''] motion-reduce:before:transition-none data-[active=true]:border-[color:rgb(var(--tf-brand-rgb)/0.28)] data-[active=true]:bg-[linear-gradient(90deg,rgb(var(--tf-brand-rgb)/0.18),rgb(var(--tf-accent-rgb)/0.08)),rgb(var(--tf-text-rgb)/0.04)] data-[active=true]:pl-8 data-[active=true]:text-[var(--tf-text)] data-[active=true]:[text-shadow:0_0_18px_rgb(var(--tf-brand-rgb)/0.35)] data-[active=true]:before:opacity-100 data-[active=true]:before:scale-y-100"} href={"#faqs"} data-nav-link={""}>
{"FAQs"}
</a>
{"\n          "}
<a href={"/application/"} data-contact-link={""} className={"mt-3 inline-flex w-full items-center justify-center rounded bg-[var(--tf-brand)] px-4 py-3 text-sm font-semibold text-[var(--tf-bg)] transition hover:bg-[var(--tf-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-bg)]"}>
{"\n            Contáctanos\n          "}
</a>
{"\n        "}
</div>
{"\n      "}
</div>
{"\n    "}
</header>
{"\n\n    "}
<main id={"inicio"} className={"scroll-mt-[var(--header-anchor-offset,4.5rem)]"}>
{"\n      "}
<section className={"relative min-h-[92svh] overflow-hidden md:min-h-[96svh]"}>
{"\n        "}
<picture>
{"\n          "}
<source srcSet={"/assets/trackflow-hero.avif"} type={"image/avif"} />
{"\n          "}
<source srcSet={"/assets/trackflow-hero.webp"} type={"image/webp"} />
{"\n          "}
<img src={"/assets/trackflow-hero.png"} alt={"Centro de operaciones logísticas moderno con paquetes, pantallas de seguimiento y zona de almacén"} width={"1672"} height={"941"} className={"absolute inset-0 h-full w-full object-cover"} fetchPriority={"high"} decoding={"async"} />
{"\n        "}
</picture>
{"\n        "}
<div className={"absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--tf-bg-rgb)/1),rgb(var(--tf-bg-rgb)/0.85),rgb(var(--tf-bg-rgb)/0.25))]"}>
</div>
{"\n        "}
<div className={"absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--tf-bg)] to-transparent"}>
</div>
{"\n\n        "}
<div className={"relative mx-auto flex min-h-[92svh] max-w-[1024px] items-start px-4 pb-10 pt-28 sm:px-5 sm:pb-12 sm:pt-32 md:min-h-[96svh] md:pt-36 xl:px-8 xl:pb-14 xl:pt-40"}>
{"\n          "}
<div className={"max-w-4xl xl:max-w-5xl"}>
{"\n            "}
<p data-hero-badge={""} className={"mb-4 inline-flex rounded-full border border-[color:rgb(var(--tf-accent-rgb)/0.3)] bg-[color:rgb(var(--tf-accent-rgb)/0.1)] px-3 py-1.5 text-xs font-medium text-[var(--tf-accent)] sm:mb-5 sm:px-4 sm:py-2 sm:text-sm"}>
{"\n              Fundada en 2009 | Los Ángeles + Zaragoza\n            "}
</p>
{"\n            "}
<h1 data-hero-title={""} className={"text-[clamp(1.8rem,6.1vw,2.8rem)] font-black leading-[0.97] text-white md:text-[3rem] 2xl:text-[3.3rem]"}>
{"\n              Logística, última milla y devoluciones para operaciones e-commerce en crecimiento.\n            "}
</h1>
{"\n            "}
<p data-hero-body={""} className={"mt-4 max-w-3xl text-sm leading-6 text-[var(--tf-text-muted)] sm:mt-5 sm:text-base sm:leading-7 md:text-[1.04rem] md:leading-7"}>
{"\n              TrackFlow coordina inventario, preparación de pedidos, transportistas y devoluciones para marcas e-commerce que necesitan operar entre Estados Unidos y España sin perder visibilidad de su logística.\n            "}
</p>
{"\n            "}
<div className={"mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row md:mt-8"}>
{"\n              "}
<a href={"/application/"} data-contact-link={""} data-hero-primary={""} className={"inline-flex w-full items-center justify-center rounded bg-[var(--tf-brand)] px-5 py-3 text-sm font-bold text-[var(--tf-bg)] transition hover:bg-[var(--tf-brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--tf-brand)] focus:ring-offset-2 focus:ring-offset-[var(--tf-bg)] sm:w-auto sm:px-6 sm:py-3.5"}>
{"\n                Contáctanos\n              "}
</a>
{"\n              "}
<a href={"#plataforma"} data-hero-secondary={""} className={"inline-flex w-full items-center justify-center rounded border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10 sm:w-auto sm:px-6 sm:py-3.5"}>
{"\n                Ver operación\n              "}
</a>
{"\n            "}
</div>
{"\n          "}
</div>
{"\n        "}
</div>
{"\n      "}
</section>
{"\n\n      "}
<section id={"operacion"} className={"scroll-mt-[var(--header-anchor-offset,4.5rem)] border-y border-[var(--tf-border)] bg-[var(--tf-surface)]/70"}>
{"\n        "}
<div className={"mx-auto grid max-w-[1024px] gap-4 px-4 py-10 sm:gap-6 sm:px-5 sm:grid-cols-2 xl:grid-cols-4 xl:px-8"}>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-white/[0.03] p-5"}>
{"\n            "}
<p className={"text-[1.75rem] font-black text-[var(--tf-accent)]"}>
{"130"}
</p>
{"\n            "}
<p className={"mt-2 text-sm text-[var(--tf-text-muted)]"}>
{"personas operando entre Estados Unidos y España"}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-white/[0.03] p-5"}>
{"\n            "}
<p className={"text-[1.75rem] font-black text-[var(--tf-accent)]"}>
{"2"}
</p>
{"\n            "}
<p className={"mt-2 text-sm text-[var(--tf-text-muted)]"}>
{"almacenes en Los Ángeles y Zaragoza para almacenamiento, picking y preparación de pedidos"}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-white/[0.03] p-5"}>
{"\n            "}
<p className={"text-[1.75rem] font-black text-[var(--tf-accent)]"}>
{"8"}
</p>
{"\n            "}
<p className={"mt-2 text-sm text-[var(--tf-text-muted)]"}>
{"transportistas coordinados diariamente para operaciones de última milla"}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-white/[0.03] p-5"}>
{"\n            "}
<p className={"text-[1.75rem] font-black text-[var(--tf-accent)]"}>
{"18–25%"}
</p>
{"\n            "}
<p className={"mt-2 text-sm text-[var(--tf-text-muted)]"}>
{"del volumen operativo corresponde a devoluciones según cliente y mercado"}
</p>
{"\n          "}
</article>
{"\n        "}
</div>
{"\n      "}
</section>
{"\n\n      "}
<section id={"plataforma"} className={"scroll-mt-[var(--header-anchor-offset,4.5rem)] mx-auto max-w-[1024px] px-4 py-12 sm:px-5 sm:py-14 xl:px-8 xl:py-16"}>
{"\n        "}
<div className={"max-w-3xl"}>
{"\n          "}
<p data-offer-eyebrow={""} className={"text-sm font-bold uppercase tracking-[0.25em] text-[var(--tf-accent)]"}>
{"Qué ofrecemos hoy"}
</p>
{"\n          "}
<h2 data-offer-title={""} className={"mt-4 text-[clamp(1.7rem,5.3vw,2.15rem)] font-black text-white md:text-[2.35rem] 2xl:text-[2.55rem]"}>
{"Operación logística para marcas e-commerce."}
</h2>
{"\n          "}
<p data-offer-body={""} className={"mt-5 text-base leading-7 text-[var(--tf-text-muted)] sm:text-lg sm:leading-8"}>
{"\n            TrackFlow gestiona la operación desde que entra un pedido hasta que se entrega o vuelve como devolución: inventario, preparación, embalaje, transportistas, incidencias y logística inversa.\n          "}
</p>
{"\n        "}
</div>
{"\n\n        "}
<div className={"mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"}>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-[var(--tf-surface)] p-6"}>
{"\n            "}
<span className={"text-2xl font-black text-[var(--tf-accent)]"} aria-hidden={"true"}>
{"01"}
</span>
{"\n            "}
<h3 className={"mt-5 text-lg font-bold text-white"}>
{"Almacenamiento de inventario"}
</h3>
{"\n            "}
<p className={"mt-3 text-[var(--tf-text-muted)]"}>
{"Gestión física de inventario para marcas e-commerce desde almacenes ubicados en Los Ángeles y Zaragoza."}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-[var(--tf-surface)] p-6"}>
{"\n            "}
<span className={"text-2xl font-black text-[var(--tf-accent)]"} aria-hidden={"true"}>
{"02"}
</span>
{"\n            "}
<h3 className={"mt-5 text-lg font-bold text-white"}>
{"Preparación y embalaje"}
</h3>
{"\n            "}
<p className={"mt-3 text-[var(--tf-text-muted)]"}>
{"Recepción de pedidos, picking, preparación de paquetes y coordinación con el transportista asignado."}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-[var(--tf-surface)] p-6"}>
{"\n            "}
<span className={"text-2xl font-black text-[var(--tf-accent)]"} aria-hidden={"true"}>
{"03"}
</span>
{"\n            "}
<h3 className={"mt-5 text-lg font-bold text-white"}>
{"Última milla"}
</h3>
{"\n            "}
<p className={"mt-3 text-[var(--tf-text-muted)]"}>
{"Coordinación de envíos y entregas con una red de transportistas en Estados Unidos y España."}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-[var(--tf-surface)] p-6"}>
{"\n            "}
<span className={"text-2xl font-black text-[var(--tf-accent)]"} aria-hidden={"true"}>
{"04"}
</span>
{"\n            "}
<h3 className={"mt-5 text-lg font-bold text-white"}>
{"Seguimiento operativo e incidencias"}
</h3>
{"\n            "}
<p className={"mt-3 text-[var(--tf-text-muted)]"}>
{"Seguimiento de entregas y resolución de incidencias entre almacenes, transportistas y clientes finales."}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-[var(--tf-surface)] p-6"}>
{"\n            "}
<span className={"text-2xl font-black text-[var(--tf-accent)]"} aria-hidden={"true"}>
{"05"}
</span>
{"\n            "}
<h3 className={"mt-5 text-lg font-bold text-white"}>
{"Logística inversa"}
</h3>
{"\n            "}
<p className={"mt-3 text-[var(--tf-text-muted)]"}>
{"Gestión de devoluciones, revisión de casos y decisiones sobre recogida, reacondicionamiento o descarte."}
</p>
{"\n          "}
</article>
{"\n          "}
<article className={"rounded border border-[var(--tf-border)] bg-[var(--tf-surface)] p-6"}>
{"\n            "}
<span className={"text-2xl font-black text-[var(--tf-accent)]"} aria-hidden={"true"}>
{"06"}
</span>
{"\n            "}
<h3 className={"mt-5 text-lg font-bold text-white"}>
{"Atención operativa para marcas y clientes finales"}
</h3>
{"\n            "}
<p className={"mt-3 text-[var(--tf-text-muted)]"}>
{"Gestión de consultas relacionadas con pedidos, entregas, incidencias y devoluciones en ambos mercados."}
</p>
{"\n          "}
</article>
{"\n        "}
</div>
{"\n      "}
</section>
{"\n\n      "}
<section id={"mercados"} className={"scroll-mt-[var(--header-anchor-offset,4.5rem)] bg-white text-[var(--tf-bg)]"}>
{"\n        "}
<div className={"mx-auto grid max-w-[1024px] gap-10 px-4 py-12 sm:gap-12 sm:px-5 sm:py-14 xl:grid-cols-[0.9fr_1.1fr] xl:px-8 xl:py-16"}>
{"\n          "}
<div>
{"\n            "}
<p data-markets-eyebrow={""} className={"text-sm font-bold uppercase tracking-[0.25em] text-[var(--tf-accent-strong)]"}>
{"Dos mercados"}
</p>
{"\n            "}
<h2 data-markets-title={""} className={"mt-4 text-[clamp(1.7rem,5.3vw,2.15rem)] font-black md:text-[2.35rem] 2xl:text-[2.55rem]"}>
{"Dos países. Una operación logística conectada."}
</h2>
{"\n            "}
<p data-markets-body={""} className={"mt-5 text-base leading-7 text-[var(--tf-market-muted)] sm:text-lg sm:leading-8"}>
{"\n              Los equipos de TrackFlow operan entre Los Ángeles y Zaragoza coordinando almacenes, transportistas, incidencias y devoluciones para marcas e-commerce en dos mercados distintos.\n            "}
</p>
{"\n          "}
</div>
{"\n          "}
<div className={"grid gap-4 sm:grid-cols-2"}>
{"\n            "}
<article className={"rounded border border-[var(--tf-text-muted)] bg-[var(--tf-text)] p-6"}>
{"\n              "}
<h3 className={"text-[1.75rem] font-black"}>
{"Los Ángeles"}
</h3>
{"\n              "}
<p className={"mt-3 text-[var(--tf-market-muted)]"}>
{"Sede ejecutiva y almacén para la operación logística en Estados Unidos."}
</p>
{"\n            "}
</article>
{"\n            "}
<article className={"rounded border border-[var(--tf-text-muted)] bg-[var(--tf-text)] p-6"}>
{"\n              "}
<h3 className={"text-[1.75rem] font-black"}>
{"Zaragoza"}
</h3>
{"\n              "}
<p className={"mt-3 text-[var(--tf-market-muted)]"}>
{"Oficina tecnológica y almacén para la operación logística en España."}
</p>
{"\n            "}
</article>
{"\n            "}
<article className={"rounded border border-[var(--tf-text-muted)] bg-[var(--tf-text)] p-6 sm:col-span-2"}>
{"\n              "}
<h3 className={"text-[1.75rem] font-black"}>
{"Cobertura operativa"}
</h3>
{"\n              "}
<p className={"mt-3 text-[var(--tf-market-muted)]"}>
{"\n                Equipos de almacén, última milla, logística inversa, atención al cliente y tecnología trabajan distribuidos entre ambos países.\n              "}
</p>
{"\n            "}
</article>
{"\n          "}
</div>
{"\n        "}
</div>
{"\n      "}
</section>
{"\n\n      "}
<section id={"faqs"} className={"scroll-mt-[var(--header-anchor-offset,4.5rem)] border-y border-[var(--tf-border)] bg-[var(--tf-surface)]/70"}>
{"\n        "}
<div className={"mx-auto max-w-[1024px] px-4 py-12 sm:px-5 sm:py-14 xl:px-8 xl:py-16"}>
{"\n          "}
<div className={"max-w-3xl"}>
{"\n            "}
<p data-faq-eyebrow={""} className={"text-sm font-bold uppercase tracking-[0.25em] text-[var(--tf-accent)]"}>
{"FAQs"}
</p>
{"\n            "}
<h2 data-faq-title={""} className={"mt-4 text-[clamp(1.7rem,5.3vw,2.15rem)] font-black text-white md:text-[2.35rem] 2xl:text-[2.55rem]"}>
{"Preguntas frecuentes sobre TrackFlow."}
</h2>
{"\n            "}
<p data-faq-body={""} className={"mt-4 max-w-2xl text-base leading-7 text-[var(--tf-text-muted)] sm:text-lg sm:leading-8"}>
{"\n              Respuestas directas sobre la operación logística, la cobertura geográfica, la última milla y las devoluciones para marcas e-commerce.\n            "}
</p>
{"\n          "}
</div>
{"\n\n          "}
<div className={"mt-8 grid gap-3 sm:gap-4 lg:grid-cols-2 lg:items-start"} data-faqs={""}>
{"\n            "}
<article className={"h-fit rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg)] transition-[border-color,box-shadow,background-color] duration-500 ease-out"} data-faq-item={""}>
{"\n              "}
<h3>
{"\n                "}
<button type={"button"} className={"flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.93rem] font-semibold text-white transition-colors duration-300 hover:text-[var(--tf-accent)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--tf-brand)] sm:px-5 sm:text-[0.98rem]"} aria-expanded={"false"} aria-controls={"faq-answer-1"} data-faq-trigger={""}>
{"\n                  "}
<span>
{"¿Qué es TrackFlow?"}
</span>
{"\n                  "}
<span className={"grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-xs text-[var(--tf-brand)] transition duration-500 ease-out"} aria-hidden={"true"} data-faq-icon={""}>
{"+"}
</span>
{"\n                "}
</button>
{"\n              "}
</h3>
{"\n              "}
<div id={"faq-answer-1"} className={"grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out motion-reduce:transition-none"} data-faq-panel={""}>
{"\n                "}
<div className={"overflow-hidden"}>
{"\n                  "}
<p className={"px-4 pb-4 text-sm leading-6 text-[var(--tf-text-muted)] sm:px-5 sm:pb-5 sm:text-[0.95rem]"}>
{"\n                    TrackFlow es una empresa de logística de última milla y gestión de almacenes para marcas e-commerce.\n                    Fue fundada en 2009 en Los Ángeles y opera con equipos y almacenes en Estados Unidos y España.\n                  "}
</p>
{"\n                "}
</div>
{"\n              "}
</div>
{"\n            "}
</article>
{"\n            "}
<article className={"h-fit rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg)] transition-[border-color,box-shadow,background-color] duration-500 ease-out"} data-faq-item={""}>
{"\n              "}
<h3>
{"\n                "}
<button type={"button"} className={"flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.93rem] font-semibold text-white transition-colors duration-300 hover:text-[var(--tf-accent)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--tf-brand)] sm:px-5 sm:text-[0.98rem]"} aria-expanded={"false"} aria-controls={"faq-answer-2"} data-faq-trigger={""}>
{"\n                  "}
<span>
{"¿Qué servicios logísticos ofrece TrackFlow?"}
</span>
{"\n                  "}
<span className={"grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-xs text-[var(--tf-brand)] transition duration-500 ease-out motion-reduce:transition-none"} aria-hidden={"true"} data-faq-icon={""}>
{"+"}
</span>
{"\n                "}
</button>
{"\n              "}
</h3>
{"\n              "}
<div id={"faq-answer-2"} className={"grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out motion-reduce:transition-none"} data-faq-panel={""}>
{"\n                "}
<div className={"overflow-hidden"}>
{"\n                  "}
<p className={"px-4 pb-4 text-sm leading-6 text-[var(--tf-text-muted)] sm:px-5 sm:pb-5 sm:text-[0.95rem]"}>
{"\n                    TrackFlow ofrece almacenamiento de inventario, preparación y embalaje de pedidos,\n                    coordinación de última milla, seguimiento de entregas, gestión de incidencias,\n                    logística inversa y soporte operativo para marcas y destinatarios.\n                  "}
</p>
{"\n                "}
</div>
{"\n              "}
</div>
{"\n            "}
</article>
{"\n            "}
<article className={"h-fit rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg)] transition-[border-color,box-shadow,background-color] duration-500 ease-out"} data-faq-item={""}>
{"\n              "}
<h3>
{"\n                "}
<button type={"button"} className={"flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.93rem] font-semibold text-white transition-colors duration-300 hover:text-[var(--tf-accent)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--tf-brand)] sm:px-5 sm:text-[0.98rem]"} aria-expanded={"false"} aria-controls={"faq-answer-3"} data-faq-trigger={""}>
{"\n                  "}
<span>
{"¿En qué países opera TrackFlow?"}
</span>
{"\n                  "}
<span className={"grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-xs text-[var(--tf-brand)] transition duration-500 ease-out motion-reduce:transition-none"} aria-hidden={"true"} data-faq-icon={""}>
{"+"}
</span>
{"\n                "}
</button>
{"\n              "}
</h3>
{"\n              "}
<div id={"faq-answer-3"} className={"grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out motion-reduce:transition-none"} data-faq-panel={""}>
{"\n                "}
<div className={"overflow-hidden"}>
{"\n                  "}
<p className={"px-4 pb-4 text-sm leading-6 text-[var(--tf-text-muted)] sm:px-5 sm:pb-5 sm:text-[0.95rem]"}>
{"\n                    TrackFlow opera en Estados Unidos y España, con almacenes en Los Ángeles y Zaragoza\n                    y equipos distribuidos entre ambos mercados.\n                  "}
</p>
{"\n                "}
</div>
{"\n              "}
</div>
{"\n            "}
</article>
{"\n            "}
<article className={"h-fit rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg)] transition-[border-color,box-shadow,background-color] duration-500 ease-out"} data-faq-item={""}>
{"\n              "}
<h3>
{"\n                "}
<button type={"button"} className={"flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.93rem] font-semibold text-white transition-colors duration-300 hover:text-[var(--tf-accent)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--tf-brand)] sm:px-5 sm:text-[0.98rem]"} aria-expanded={"false"} aria-controls={"faq-answer-4"} data-faq-trigger={""}>
{"\n                  "}
<span>
{"¿Qué tipo de empresas trabajan con TrackFlow?"}
</span>
{"\n                  "}
<span className={"grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-xs text-[var(--tf-brand)] transition duration-500 ease-out motion-reduce:transition-none"} aria-hidden={"true"} data-faq-icon={""}>
{"+"}
</span>
{"\n                "}
</button>
{"\n              "}
</h3>
{"\n              "}
<div id={"faq-answer-4"} className={"grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out motion-reduce:transition-none"} data-faq-panel={""}>
{"\n                "}
<div className={"overflow-hidden"}>
{"\n                  "}
<p className={"px-4 pb-4 text-sm leading-6 text-[var(--tf-text-muted)] sm:px-5 sm:pb-5 sm:text-[0.95rem]"}>
{"\n                    TrackFlow trabaja con marcas e-commerce que necesitan externalizar o mejorar su operación logística,\n                    desde el almacenamiento del inventario hasta la entrega y gestión de devoluciones.\n                  "}
</p>
{"\n                "}
</div>
{"\n              "}
</div>
{"\n            "}
</article>
{"\n            "}
<article className={"h-fit rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg)] transition-[border-color,box-shadow,background-color] duration-500 ease-out"} data-faq-item={""}>
{"\n              "}
<h3>
{"\n                "}
<button type={"button"} className={"flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.93rem] font-semibold text-white transition-colors duration-300 hover:text-[var(--tf-accent)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--tf-brand)] sm:px-5 sm:text-[0.98rem]"} aria-expanded={"false"} aria-controls={"faq-answer-5"} data-faq-trigger={""}>
{"\n                  "}
<span>
{"¿Cómo gestiona TrackFlow la última milla y los transportistas?"}
</span>
{"\n                  "}
<span className={"grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-xs text-[var(--tf-brand)] transition duration-500 ease-out motion-reduce:transition-none"} aria-hidden={"true"} data-faq-icon={""}>
{"+"}
</span>
{"\n                "}
</button>
{"\n              "}
</h3>
{"\n              "}
<div id={"faq-answer-5"} className={"grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out motion-reduce:transition-none"} data-faq-panel={""}>
{"\n                "}
<div className={"overflow-hidden"}>
{"\n                  "}
<p className={"px-4 pb-4 text-sm leading-6 text-[var(--tf-text-muted)] sm:px-5 sm:pb-5 sm:text-[0.95rem]"}>
{"\n                    TrackFlow coordina envíos con una red de 8 transportistas en Estados Unidos y España y gestiona\n                    incidencias como entregas fallidas, paquetes perdidos o direcciones incorrectas.\n                  "}
</p>
{"\n                "}
</div>
{"\n              "}
</div>
{"\n            "}
</article>
{"\n            "}
<article className={"h-fit rounded-xl border border-[var(--tf-border)] bg-[var(--tf-bg)] transition-[border-color,box-shadow,background-color] duration-500 ease-out"} data-faq-item={""}>
{"\n              "}
<h3>
{"\n                "}
<button type={"button"} className={"flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.93rem] font-semibold text-white transition-colors duration-300 hover:text-[var(--tf-accent)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--tf-brand)] sm:px-5 sm:text-[0.98rem]"} aria-expanded={"false"} aria-controls={"faq-answer-6"} data-faq-trigger={""}>
{"\n                  "}
<span>
{"¿Cómo gestiona TrackFlow las devoluciones?"}
</span>
{"\n                  "}
<span className={"grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-xs text-[var(--tf-brand)] transition duration-500 ease-out motion-reduce:transition-none"} aria-hidden={"true"} data-faq-icon={""}>
{"+"}
</span>
{"\n                "}
</button>
{"\n              "}
</h3>
{"\n              "}
<div id={"faq-answer-6"} className={"grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out motion-reduce:transition-none"} data-faq-panel={""}>
{"\n                "}
<div className={"overflow-hidden"}>
{"\n                  "}
<p className={"px-4 pb-4 text-sm leading-6 text-[var(--tf-text-muted)] sm:px-5 sm:pb-5 sm:text-[0.95rem]"}>
{"\n                    TrackFlow gestiona devoluciones que pueden representar entre el 18% y el 25% del volumen operativo según\n                    cliente y país. El proceso incluye revisión de casos y decisiones sobre recogida, reacondicionamiento o descarte.\n                  "}
</p>
{"\n                "}
</div>
{"\n              "}
</div>
{"\n            "}
</article>
{"\n          "}
</div>
{"\n        "}
</div>
{"\n      "}
</section>
{"\n\n      "}
<section className={"mx-auto max-w-[1024px] px-4 py-16 sm:px-5 sm:py-20 xl:px-8 xl:py-24"}>
{"\n        "}
<div className={"rounded border border-[color:rgb(var(--tf-brand-rgb)/0.3)] bg-[var(--tf-brand)] p-6 text-[var(--tf-bg)] sm:p-8 md:flex md:items-center md:justify-between md:gap-8"}>
{"\n          "}
<div>
{"\n            "}
<h2 data-final-cta-title={""} className={"text-xl font-black sm:text-2xl"}>
{"Hablemos de tu operación."}
</h2>
{"\n            "}
<p data-final-cta-body={""} className={"mt-3 max-w-2xl text-[var(--tf-border)]"}>
{"\n              Cuéntanos cómo funciona hoy tu operación logística y qué desafíos necesitas resolver.\n            "}
</p>
{"\n          "}
</div>
{"\n          "}
<a href={"/application/"} data-contact-link={""} className={"mt-6 inline-flex w-full justify-center rounded bg-[var(--tf-bg)] px-6 py-4 text-sm font-bold text-white sm:w-auto md:mt-0"}>
{"\n            Contáctanos\n          "}
</a>
{"\n        "}
</div>
{"\n      "}
</section>
{"\n    "}
</main>
{"\n\n    "}
<footer id={"contacto"} className={"scroll-mt-[var(--header-anchor-offset,4.5rem)] border-t border-[var(--tf-border)] bg-[var(--tf-bg)] px-4 py-10 sm:px-5 sm:py-12 xl:px-8"}>
{"\n      "}
<div className={"mx-auto grid max-w-[1024px] gap-8 md:grid-cols-3"}>
{"\n        "}
<div>
{"\n          "}
<p className={"text-xl font-black text-white"}>
{"TrackFlow"}
</p>
{"\n          "}
<p data-footer-body={""} className={"mt-3 text-sm leading-6 text-[var(--tf-text-muted)]"}>
{"Logística de última milla y gestión de almacenes para operaciones e-commerce."}
</p>
{"\n        "}
</div>
{"\n        "}
<address data-footer-address={""} className={"not-italic text-sm leading-7 text-[var(--tf-text-muted)]"}>
{"\n          Los Ángeles, CA, United States"}
<br />
{"\n          Zaragoza, España"}
<br />
{"\n          Operaciones en Estados Unidos y España\n        "}
</address>
{"\n        "}
<div className={"text-sm leading-7 text-[var(--tf-text-muted)] md:text-right"}>
{"\n          "}
<a data-footer-form={""} className={"block hover:text-white"} href={"/application/"}>
{"Formulario operativo"}
</a>
{"\n          "}
<a data-footer-services={""} className={"block hover:text-white"} href={"#plataforma"}>
{"Servicios"}
</a>
{"\n          "}
<p className={"mt-4"}>
{"© 2026 TrackFlow"}
</p>
{"\n        "}
</div>
{"\n      "}
</div>
{"\n    "}
</footer>
{"\n    "}
{"\n  "}
    </>
  );
}
