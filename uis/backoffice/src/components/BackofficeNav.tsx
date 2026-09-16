"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AuthHeaderActions } from "@/components/AuthHeaderActions";
import { useAuthToken } from "@/lib/auth";
import { ThemeSwitch } from "@/components/ThemeSwitch";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/incidents", label: "Incidencias" },
  { href: "/suppliers", label: "Proveedores" },
];

export function BackofficeNav() {
  const pathname = usePathname();
  const authenticated = Boolean(useAuthToken());
  return <header className="navbar"><div className="navContent">
    <Link href="/" className="brand" aria-label="TrackFlow, inicio"><Image src="/trackflow-logo.svg" alt="" width={36} height={36} className="brandLogo" /><span className="brandName">TrackFlow</span><span className="brandTag">Backoffice Ops</span></Link>
    {authenticated && <nav className="navLinks" aria-label="Navegación principal">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}</nav>}
    <div className="navActions"><ThemeSwitch />{authenticated && <Link className="profileLink" href="/account/profile">Mi perfil</Link>}<AuthHeaderActions /></div>
  </div></header>;
}
