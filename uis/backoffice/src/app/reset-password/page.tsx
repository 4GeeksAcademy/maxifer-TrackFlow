"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("El enlace no es valido. Solicita uno nuevo.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contrasenas nuevas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/backend/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "El enlace es invalido o expiro.");
      }

      router.replace("/login?reset=success");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo actualizar la contrasena.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 560 }}>
      <section className="card" style={{ padding: "2rem" }}>
        <span className="eyebrow">TRACKFLOW</span>
        <h1 style={{ marginTop: "0.75rem" }}>Nueva contrasena</h1>

        {!token ? (
          <p className="error">El enlace no es valido. Solicita uno nuevo.</p>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Nueva contrasena</span>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              disabled={loading || !token}
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Confirmar contrasena</span>
            <input
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={loading || !token}
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          {error ? <p className="error">{error}</p> : null}

          <button type="submit" disabled={loading || !token} style={{ width: "100%" }}>
            {loading ? "Actualizando..." : "Actualizar contrasena"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link href="/forgot-password">Solicitar otro enlace</Link>
        </p>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="container" style={{ maxWidth: 560 }}>
          <section className="card" style={{ padding: "2rem" }}>
            <p>Cargando...</p>
          </section>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
