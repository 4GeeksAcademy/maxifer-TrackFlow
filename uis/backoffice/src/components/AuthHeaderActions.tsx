"use client";

import Link from "next/link";

import { logoutAndRedirect, useAuthToken } from "@/lib/auth";

export function AuthHeaderActions() {
  const isAuthenticated = Boolean(useAuthToken());

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="headerAction">
        Iniciar sesión
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="headerAction"
      onClick={() => {
        logoutAndRedirect();
      }}
    >
      Cerrar sesión
    </button>
  );
}
