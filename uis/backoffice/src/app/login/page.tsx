"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { setAuthToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams({
        username: email,
        password,
      });

      const response = await fetch("/backend/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "Correo o contraseña incorrectos.");
      }

      setAuthToken(data.access_token);
      router.push("/");
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("No fue posible iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 560 }}>
      <section className="card" style={{ padding: "2rem" }}>
        <span className="eyebrow">TRACKFLOW</span>
        <h1 style={{ marginTop: "0.75rem" }}>Iniciar sesión</h1>
        <p>Accede al backoffice interno de operaciones.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          <p style={{ margin: 0, textAlign: "right" }}>
            <Link href="/forgot-password">Olvidaste tu contrasena?</Link>
          </p>

          {error ? (
            <p className="error" style={{ margin: 0 }}>
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
          ¿No tienes cuenta? <Link href="/register">Crear una cuenta</Link>
        </p>
      </section>
    </main>
  );
}
