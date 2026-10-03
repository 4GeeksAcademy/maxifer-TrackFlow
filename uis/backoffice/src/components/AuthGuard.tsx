"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthToken } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthToken();
  const authenticated = Boolean(token);
  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const shouldRedirectToLogin = !authenticated && !isPublicPath;
  const shouldRedirectToHome = authenticated && isPublicPath;

  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.replace("/login");
      return;
    }

    if (shouldRedirectToHome) {
      router.replace("/");
    }
  }, [router, shouldRedirectToHome, shouldRedirectToLogin]);

  if (shouldRedirectToLogin || shouldRedirectToHome) {
    return (
      <main className="container" style={{ paddingTop: "4rem" }}>
        <p className="pageHeader">Cargando sesión…</p>
      </main>
    );
  }

  return <>{children}</>;
}
