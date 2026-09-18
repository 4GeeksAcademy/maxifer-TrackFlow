"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthHeaderActions } from "@/components/AuthHeaderActions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logoutAndRedirect } from "@/lib/auth";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/incidents", label: "Incidencias" },
  { href: "/suppliers", label: "Proveedores" },
];

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return <Link href="/" onClick={onNavigate} className="flex items-center gap-3 text-xl font-bold tracking-tight text-ink">
    <Image src="/trackflow-logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-lg" />
    <span>TrackFlow<span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Backoffice Ops</span></span>
  </Link>;
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <div className="flex h-full min-h-0 flex-col">
    <div className="border-b border-line px-5 py-5"><Brand onNavigate={onNavigate} /></div>
    <nav aria-label="Navegación principal" className="flex flex-col gap-1 px-3 py-5 text-sm font-semibold">
      {links.map(({ href, label }) => <Link key={href} href={href} onClick={onNavigate} aria-current={pathname === href ? "page" : undefined} className={`rounded-lg px-4 py-3 transition-colors ${pathname === href ? "bg-accent text-white" : "text-ink hover:bg-surface-soft"}`}>{label}</Link>)}
    </nav>
  </div>;
}

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <div ref={container} className="accountMenu">
    <button ref={trigger} type="button" aria-label="Cuenta" aria-expanded={open} aria-controls="account-menu-options" onClick={() => setOpen(value => !value)} className="accountMenuTrigger">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
    </button>
    {open && <div id="account-menu-options" className="accountMenuOptions">
      <Link href="/account/profile" onClick={() => setOpen(false)} className="accountMenuItem">Mi perfil</Link>
      <button type="button" onClick={logoutAndRedirect} className="accountMenuItem">Cerrar sesión</button>
    </div>}
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const publicPage = pathname === "/login" || pathname === "/register";
  const mobileMenu = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenu.current?.open) mobileMenu.current.close();
  }, [pathname]);

  function closeMenu() {
    mobileMenu.current?.close();
  }

  function openMenu() {
    mobileMenu.current?.showModal();
    setMenuOpen(true);
  }

  if (publicPage) return <>
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Brand />
        <div className="flex items-center gap-2"><ThemeToggle /><AuthHeaderActions /></div>
      </div>
    </header>
    <AuthGuard>{children}</AuthGuard>
    <footer className="mt-8 border-t border-line bg-surface px-6 py-5 text-center text-xs text-muted">TrackFlow · Backoffice de operaciones</footer>
  </>;

  return <div className="backofficeShell">
    <aside className="backofficeSidebar hidden lg:block"><SidebarContent pathname={pathname} /></aside>
    <dialog ref={mobileMenu} aria-label="Menú de navegación" onClose={() => setMenuOpen(false)} onClick={(event) => { if (event.target === mobileMenu.current) closeMenu(); }} className="mobileSidebar">
      <button type="button" onClick={closeMenu} aria-label="Cerrar menú" className="mobileSidebarClose">×</button>
      <SidebarContent pathname={pathname} onNavigate={closeMenu} />
    </dialog>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="backofficeTopbar">
        <button type="button" onClick={openMenu} aria-label="Abrir menú" aria-haspopup="dialog" aria-expanded={menuOpen} className="mobileMenuButton lg:hidden">☰</button>
        <span className="text-sm font-semibold text-muted lg:hidden">Backoffice Ops</span>
        <div className="ml-auto flex items-center gap-2"><ThemeToggle /><AccountMenu key={pathname} /></div>
      </header>
      <AuthGuard>{children}</AuthGuard>
      <footer className="mt-auto border-t border-line bg-surface px-6 py-5 text-center text-xs text-muted">TrackFlow · Backoffice de operaciones</footer>
    </div>
  </div>;
}
