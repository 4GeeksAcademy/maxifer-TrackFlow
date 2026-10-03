"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "trackflow-backoffice-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") {
      document.documentElement.dataset.theme = saved;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const preference = window.localStorage.getItem(KEY);
      setTheme(preference === "light" || preference === "dark" ? preference : media.matches ? "dark" : "light");
    };
    const initialSync = window.setTimeout(sync, 0);
    media.addEventListener("change", sync);
    return () => { window.clearTimeout(initialSync); media.removeEventListener("change", sync); };
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(KEY, next);
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }

  return <button type="button" onClick={toggle} aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"} title={theme === "dark" ? "Modo claro" : "Modo oscuro"} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink hover:bg-surface-soft">{theme === "dark" ? "☀" : "☾"}</button>;
}
