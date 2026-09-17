"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthHeaderActions } from "@/components/AuthHeaderActions";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/incidents", label: "Incidencias" },
  { href: "/suppliers", label: "Proveedores" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const publicPage = pathname === "/login" || pathname === "/register";
  return <>
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="mr-auto flex items-center gap-3 text-xl font-bold tracking-tight text-ink"><Image src="/trackflow-logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-lg" /><span>TrackFlow <span className="ml-2 hidden rounded border border-line bg-surface-soft px-2 py-1 align-middle text-[10px] font-semibold uppercase tracking-wider text-muted sm:inline">Backoffice Ops</span></span></Link>
        {!publicPage && <nav aria-label="Navegación principal" className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm font-semibold sm:order-none sm:mx-auto sm:w-auto">
          {links.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`rounded-lg px-3 py-2 ${pathname === href ? "bg-accent text-white" : "text-ink hover:bg-surface-soft"}`}>{label}</Link>)}
          <Link href="/account/profile" aria-current={pathname === "/account/profile" ? "page" : undefined} className={`rounded-lg px-3 py-2 sm:hidden ${pathname === "/account/profile" ? "bg-accent text-white" : "text-ink hover:bg-surface-soft"}`}>Perfil</Link>
        </nav>}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!publicPage && <Link href="/account/profile" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-soft sm:inline-flex">Mi perfil</Link>}
          {!publicPage && <AuthHeaderActions />}
        </div>
      </div>
    </header>
    <AuthGuard>{children}</AuthGuard>
    <footer className="mt-8 border-t border-line bg-surface px-6 py-5 text-center text-xs text-muted">TrackFlow · Backoffice de operaciones</footer>
  </>;
}
