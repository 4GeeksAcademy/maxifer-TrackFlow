"use client";

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
    <main className="container">
      <header className="pageHeader">
        <span className="eyebrow">CUENTA</span>
        <h1>Mi perfil</h1>
        <p>Consulta y actualiza tus datos personales del backoffice.</p>
      </header>

      <section className="card max-w-4xl">
        <h2>Datos generales y ubicación</h2>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="form-field">
            <span>Correo electrónico · solo lectura</span>
            <input value={userEmail} readOnly aria-label="Correo electrónico" />
          </label>

          <div className="form-grid">
            <label className="form-field">
              <span>Nombre</span>
              <input
                value={profile.name ?? ""}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <label className="form-field">
              <span>Teléfono</span>
              <input
                value={profile.phone ?? ""}
                onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </div>

          <label className="form-field">
            <span>Dirección</span>
            <textarea
              value={profile.address ?? ""}
              onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))}
              rows={3}
            />
          </label>

          {error ? <p className="error">{error}</p> : null}
          {success ? <p role="status" className="successMessage">{success}</p> : null}

          <button type="submit" disabled={isSaving} className="w-fit">
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </section>
    </main>
  );
}
