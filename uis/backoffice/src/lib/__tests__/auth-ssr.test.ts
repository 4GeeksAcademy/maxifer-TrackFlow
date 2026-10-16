/** @jest-environment node */

import {
  clearAuthSession,
  emitProfileStateChange,
  getAuthToken,
  isAuthenticated,
  logoutAndRedirect,
  setAuthToken,
} from "../auth";

describe("auth helpers during server rendering", () => {
  it("treats the session as absent when window is unavailable", () => {
    expect(getAuthToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
    expect(() => setAuthToken("server-token")).not.toThrow();
    expect(() => clearAuthSession()).not.toThrow();
    expect(() => emitProfileStateChange()).not.toThrow();
    expect(() => logoutAndRedirect()).not.toThrow();
  });
});