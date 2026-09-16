"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { setAuthToken } from "@/lib/auth";

type FieldErrors = Partial<Record<"name" | "email" | "password" | "phone" | "address", string>>;
const FIELD_NAMES = new Set(["name", "email", "password", "phone", "address"]);

function parseFieldErrors(detail: unknown): FieldErrors | null {
  if (Array.isArray(detail)) {
    const errors: FieldErrors = {};

    for (const item of detail) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const error = item as { loc?: unknown[]; msg?: unknown };
      const field = error.loc?.findLast((location) => typeof location === "string" && FIELD_NAMES.has(location));

      if (field && typeof field === "string") {
        errors[field as keyof FieldErrors] = String(error.msg ?? "Valor invÃ¡lido.");
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  if (detail && typeof detail === "object") {
    const errors = Object.fromEntries(
      Object.entries(detail).map(([key, value]) => [key, Array.isArray(value) ? value.join(" ") : String(value)]),
    ) as FieldErrors;

    return Object.keys(errors).length > 0 ? errors : null;
  }

  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const createResponse = await fetch("/backend/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone || undefined,
          address: form.address || undefined,
        }),
      });

      const createData = await createResponse.json().catch(() => null);

      if (!createResponse.ok) {
        const errors = parseFieldErrors(createData?.detail);

        if (errors) {
          setFieldErrors(errors);
          return;
        }

        if (createData?.detail && typeof createData.detail === "string") {
          throw new Error(createData.detail);
        }

        throw new Error("No fue posible crear la cuenta.");
      }

      const loginResponse = await fetch("/backend/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: form.email,
          password: form.password,
        }).toString(),
      });

      const loginData = await loginResponse.json().catch(() => null);

      if (!loginResponse.ok) {
        throw new Error(loginData?.detail ?? "La cuenta se creó, pero no pudimos iniciar sesión.");
      }

      setAuthToken(loginData.access_token);
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("No fue posible completar el registro.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container authPage" style={{ maxWidth: 720 }}>
      <section className="card authCard" style={{ padding: "2rem" }}>
        <span className="eyebrow">TRACKFLOW</span>
        <h1 style={{ marginTop: "0.75rem" }}>Crear cuenta</h1>
        <p>Registra al usuario del backoffice interno.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Nombre</span>
              <input
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
              {fieldErrors.name ? <small className="error">{fieldErrors.name}</small> : null}
            </label>

            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                required
                style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
              {fieldErrors.email ? <small className="error">{fieldErrors.email}</small> : null}
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Contraseña</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleChange("password", event.target.value)}
                required
                minLength={8}
                style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
              {fieldErrors.password ? <small className="error">{fieldErrors.password}</small> : null}
            </label>

            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Teléfono</span>
              <input
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
              {fieldErrors.phone ? <small className="error">{fieldErrors.phone}</small> : null}
            </label>
          </div>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Dirección</span>
            <input
              value={form.address}
              onChange={(event) => handleChange("address", event.target.value)}
              style={{ padding: "0.8rem 0.9rem", borderRadius: 8, border: "1px solid #d1d5db" }}
            />
            {fieldErrors.address ? <small className="error">{fieldErrors.address}</small> : null}
          </label>

          {submitError ? <p className="error">{submitError}</p> : null}

          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
