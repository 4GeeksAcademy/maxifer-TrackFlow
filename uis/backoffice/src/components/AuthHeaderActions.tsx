"use client";

import Link from "next/link";

import { logoutAndRedirect, useAuthToken } from "@/lib/auth";

export function AuthHeaderActions() {
  const isAuthenticated = Boolean(useAuthToken());

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="button secondaryButton">
        Iniciar sesión
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="button secondaryButton"
      onClick={() => {
        logoutAndRedirect();
      }}
    >
      Cerrar sesión
    </button>
  );
}
