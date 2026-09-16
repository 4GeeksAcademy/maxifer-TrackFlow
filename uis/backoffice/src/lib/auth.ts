"use client";

import { useSyncExternalStore } from "react";

export const AUTH_TOKEN_KEY = "trackflow_auth_token";
const AUTH_STATE_EVENT = "trackflow-auth-state";

function emitAuthStateChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  emitAuthStateChange();
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  emitAuthStateChange();
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function logoutAndRedirect() {
  clearAuthSession();

  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers ?? {});
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearAuthSession();

    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.replace("/login");
    }
  }

  return response;
}

function subscribeToAuthToken(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(AUTH_STATE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(AUTH_STATE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useAuthToken() {
  return useSyncExternalStore(subscribeToAuthToken, getAuthToken, () => null);
}
