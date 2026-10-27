"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md";
};

export function Modal({ title, description, isOpen, onClose, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size === "sm" ? "max-w-md" : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 text-left backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full ${sizeClass} overflow-y-auto rounded-lg border border-[#c6c6cd] bg-white shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#c6c6cd] bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-black">{title}</h2>
            {description ? <p className="mt-1 text-sm text-[#45464d]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#45464d] hover:bg-[#f0edef] hover:text-black"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
