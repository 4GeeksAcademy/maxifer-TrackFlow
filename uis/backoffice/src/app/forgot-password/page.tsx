"use client";

import Link from "next/link";
import { useState } from "react";

const GENERIC_MESSAGE = "Si esa direccion esta registrada, recibiras un enlace en breve.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await fetch("/backend/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setSent(true);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 560 }}>
      <section className="card" style={{ padding: "2rem" }}>
        <span className="eyebrow">TRACKFLOW</span>
        <h1 style={{ marginTop: "0.75rem" }}>Recuperar contrasena</h1>
        <p>Ingresa tu email para recibir un enlace de recuperacion.</p>

        {sent ? (
          <p>{GENERIC_MESSAGE}</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
                style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </label>

            <button type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        {error ? <p className="error">{error}</p> : null}
        <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link href="/login">Volver al login</Link>
        </p>
      </section>
    </main>
  );
}
