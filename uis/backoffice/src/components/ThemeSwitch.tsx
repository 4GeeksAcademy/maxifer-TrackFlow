"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("backoffice-theme-change", onChange);
  return () => window.removeEventListener("backoffice-theme-change", onChange);
}

function getSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

export function ThemeSwitch() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.dispatchEvent(new Event("backoffice-theme-change"));
    try {
      localStorage.setItem("backoffice-theme", next ? "dark" : "light");
    } catch {
      // The switch still works when browser storage is unavailable.
    }
  }

  return <button type="button" className="themeSwitch" role="switch" aria-checked={dark} aria-label="Modo oscuro" onClick={toggleTheme}>
    <span aria-hidden="true">☀</span><span className="themeSwitchTrack"><span className="themeSwitchThumb" /></span><span aria-hidden="true">☾</span>
  </button>;
}
