"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch, getAuthToken, logoutAndRedirect } from "@/lib/auth";

type Profile = {
  name: string | null;
  phone: string | null;
  address: string | null;
};

type AccountResponse = {
  user: {
    email: string;
  };
  profile: Profile | null;
};

export default function AccountProfilePage() {
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile>({
    name: "",
    phone: "",
    address: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken();
      if (!token) {
        logoutAndRedirect();
        return;
      }

      try {
        const response = await apiFetch("/backend/auth/me");
        const data: AccountResponse = await response.json();

        if (!response.ok) {
          throw new Error(data?.user ? "No se pudo cargar el perfil." : "Sesión inválida.");
        }

        setUserEmail(data.user.email);
        setProfile({
          name: data.profile?.name ?? "",
          phone: data.profile?.phone ?? "",
          address: data.profile?.address ?? "",
        });
      } catch (loadError) {
        if (loadError instanceof Error) {
          setError(loadError.message);
        } else {
          setError("No se pudo cargar el perfil.");
        }
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await apiFetch("/backend/profiles/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name || undefined,
          phone: profile.phone || undefined,
          address: profile.address || undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo guardar el perfil.");
      }

      setProfile({
        name: data?.name ?? profile.name,
        phone: data?.phone ?? profile.phone,
        address: data?.address ?? profile.address,
      });
      setSuccess("Perfil actualizado correctamente.");
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("No se pudo actualizar el perfil.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 760 }}>
      <header className="pageHeader">
        <span className="eyebrow">CUENTA</span>
        <h1>Perfil</h1>
        <p>Consulta y actualiza tus datos personales del backoffice.</p>
        <p>
          <Link href="/account/change-password">Cambiar contrasena</Link>
        </p>
      </header>

      <section className="card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Email</span>
            <input value={userEmail} readOnly disabled style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db", background: "#f3f4f6" }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Nombre</span>
              <input
                value={profile.name ?? ""}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Teléfono</span>
              <input
                value={profile.phone ?? ""}
                onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Dirección</span>
            <input
              value={profile.address ?? ""}
              onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))}
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </label>

          {error ? <p className="error">{error}</p> : null}
          {success ? <p style={{ color: "#166534", margin: 0 }}>{success}</p> : null}

          <button type="submit" disabled={isSaving} style={{ width: "fit-content" }}>
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </section>
    </main>
  );
}
