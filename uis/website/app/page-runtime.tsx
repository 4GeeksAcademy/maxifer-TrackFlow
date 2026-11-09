"use client";

import { useEffect, type ReactNode } from "react";

type PageRuntimeProps = {
  page: "index" | "application";
  bodyClass: string;
  children: ReactNode;
};

export default function PageRuntime({
  page,
  bodyClass,
  children
}: PageRuntimeProps) {
  useEffect(() => {
    let active = true;

    const initialize = async () => {
      await import("./i18n-runtime.js");
      if (!active) return;

      if (page === "application") {
        await import("./application-form.js");
        if (!active) return;
        await import("./application-interactions.js");
      } else {
        await import("./index-interactions.js");
      }
    };

    initialize().catch((error: unknown) => {
      console.error(`Could not initialize the ${page} page interactions.`, error);
    });

    return () => {
      active = false;
    };
  }, [page]);

  return (
    <div data-page={page} className={`min-h-screen ${bodyClass}`}>
      {children}
    </div>
  );
}
