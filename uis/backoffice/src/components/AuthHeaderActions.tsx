"use client";

import Link from "next/link";

import { logoutAndRedirect, useAuthToken } from "@/lib/auth";

export function AuthHeaderActions() {
  const isAuthenticated = Boolean(useAuthToken());

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="button secondaryButton" style={{ marginTop: 0 }}>
        Iniciar sesión
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="button secondaryButton"
      style={{ marginTop: 0 }}
      onClick={() => {
        logoutAndRedirect();
      }}
    >
      Cerrar sesión
    </button>
  );
}
