"use client";

import { useState } from "react";

import { apiFetch } from "@/lib/auth";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Las contrasenas nuevas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/backend/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo cambiar la contrasena.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Contrasena actualizada correctamente.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo cambiar la contrasena.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 760 }}>
      <header className="pageHeader">
        <span className="eyebrow">CUENTA</span>
        <h1>Cambiar contrasena</h1>
      </header>

      <section className="card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Contrasena actual</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              disabled={loading}
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Nueva contrasena</span>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              disabled={loading}
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Confirmar nueva contrasena</span>
            <input
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={loading}
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          {error ? <p className="error">{error}</p> : null}
          {success ? <p style={{ color: "#166534", margin: 0 }}>{success}</p> : null}

          <button type="submit" disabled={loading} style={{ width: "fit-content" }}>
            {loading ? "Guardando..." : "Cambiar contrasena"}
          </button>
        </form>
      </section>
    </main>
  );
}
