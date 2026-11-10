import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import SuppliersPage from "@/app/suppliers/page";
import { apiFetch } from "@/lib/auth";
import { prepareSuppliers } from "../supplier-view";

jest.mock("@/lib/auth", () => ({ apiFetch: jest.fn() }));
jest.mock("next/dynamic", () => () => () => null);
jest.mock("../supplier-view", () => ({ prepareSuppliers: jest.fn(jest.requireActual("../supplier-view").prepareSuppliers) }));

it("reuses prepared rows while editing a draft and recomputes after updating a supplier", async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const supplier = { id: "1", name: "Synthetic", country: "USA", categories: ["carrier_last_mile", "reverse_logistics"], rate_per_shipment: 5, currency: "USD", status: "active" };
  jest.mocked(apiFetch)
    .mockResolvedValueOnce({ ok: true, json: async () => [supplier] } as Response)
    .mockResolvedValueOnce({ ok: true, json: async () => ({ ...supplier, status: "suspended" }) } as Response);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(SuppliersPage)));
    expect(host.textContent).toContain("carrier_last_mile, reverse_logistics");
    const count = jest.mocked(prepareSuppliers).mock.calls.length;
    const input = host.querySelector<HTMLInputElement>('input[type=number]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "7");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(input.value).toBe("7");
    expect(jest.mocked(prepareSuppliers).mock.calls.length).toBe(count);
    const suspend = Array.from(host.querySelectorAll("button")).find(button => button.textContent?.includes("Suspender"))!;
    await act(async () => suspend.click());
    expect(jest.mocked(prepareSuppliers).mock.calls.length).toBe(count + 1);
    expect(host.querySelector(".rowSuspended")).not.toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
