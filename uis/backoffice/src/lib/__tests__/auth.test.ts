import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

import {
  AUTH_TOKEN_KEY,
  apiFetch,
  clearAuthSession,
  emitProfileStateChange,
  getAuthToken,
  isAuthenticated,
  setAuthToken,
  useAuthToken,
} from "../auth";

function AuthTokenProbe() {
  return createElement("span", null, useAuthToken() ?? "signed-out");
}

describe("auth session helpers", () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
      configurable: true,
      value: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("stores, reads, and clears the auth token", () => {
    expect(getAuthToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);

    setAuthToken("session-token");

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("session-token");
    expect(getAuthToken()).toBe("session-token");
    expect(isAuthenticated()).toBe(true);

    clearAuthSession();
    expect(getAuthToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("emits auth and profile state changes", () => {
    const authListener = jest.fn();
    const profileListener = jest.fn();
    window.addEventListener("trackflow-auth-state", authListener);
    window.addEventListener("trackflow-profile-state", profileListener);

    setAuthToken("session-token");
    emitProfileStateChange();

    expect(authListener).toHaveBeenCalledTimes(1);
    expect(profileListener).toHaveBeenCalledTimes(1);
    window.removeEventListener("trackflow-auth-state", authListener);
    window.removeEventListener("trackflow-profile-state", profileListener);
  });

  it("updates hook subscribers when the token changes", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(AuthTokenProbe));
    });
    expect(container.textContent).toBe("signed-out");

    await act(async () => {
      setAuthToken("updated-token");
    });
    expect(container.textContent).toBe("updated-token");

    await act(async () => root.unmount());
    container.remove();
  });

  it("adds a bearer header when fetching with a stored token", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ status: 200 } as Response);
    global.fetch = fetchMock;
    setAuthToken("session-token");

    const response = await apiFetch("/api/profile", {
      headers: { "X-Trace-Id": "trace-123" },
    });

    const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];
    const headers = new Headers(init.headers);
    expect(response.status).toBe(200);
    expect(headers.get("Authorization")).toBe("Bearer session-token");
    expect(headers.get("X-Trace-Id")).toBe("trace-123");
  });

  it("does not add an authorization header without a token", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ status: 200 } as Response);
    global.fetch = fetchMock;

    await apiFetch("/api/public");

    const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit];
    expect(new Headers(init.headers).has("Authorization")).toBe(false);
  });

  it("clears the session when the API returns unauthorized", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ status: 401 } as Response);
    global.fetch = fetchMock;
    window.history.replaceState({}, "", "/login");
    setAuthToken("expired-token");

    const response = await apiFetch("/api/profile");

    expect(response.status).toBe(401);
    expect(getAuthToken()).toBeNull();
  });
});