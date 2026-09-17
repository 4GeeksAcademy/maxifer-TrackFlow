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
    <main className="container">
      <section className="auth-panel">
        <span className="eyebrow">TRACKFLOW / ACCESO</span>
        <h1>Iniciar sesión</h1>
        <p>Accede al backoffice interno de operaciones.</p>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p role="alert" className="error">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center">
          ¿No tienes cuenta? <Link href="/register">Crear una cuenta</Link>
        </p>
      </section>
    </main>
  );
}
