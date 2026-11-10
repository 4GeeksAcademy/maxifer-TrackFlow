import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import IncidentCreateDialog from "../IncidentCreateDialog";
import SupplierCreateDialog from "../SupplierCreateDialog";
import { createIncident } from "@/lib/incidents";
import { apiFetch } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({ apiFetch: jest.fn() }));
jest.mock("@/lib/incidents", () => ({ ...jest.requireActual("@/lib/incidents"), createIncident: jest.fn() }));

let root: Root;
let host: HTMLDivElement;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  jest.resetAllMocks();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
    this.querySelector<HTMLElement>("button, input")?.focus();
  };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

async function fill(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  await act(async () => {
    const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(element, value);
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
  });
}

async function submit() {
  await act(async () => {
    host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

it("retains incident validation and refreshes the parent only after a successful save", async () => {
  const onClose = jest.fn(), onCreated = jest.fn();
  jest.mocked(createIncident).mockResolvedValue({ id: 1 } as Awaited<ReturnType<typeof createIncident>>);
  await act(async () => root.render(createElement(IncidentCreateDialog, { onClose, onCreated })));
  expect(host.querySelector("dialog")?.open).toBe(true);
  await submit();
  expect(createIncident).not.toHaveBeenCalled();
  expect(host.querySelectorAll("[aria-invalid=true]").length).toBe(2);
  await fill(host.querySelector("input")!, "Synthetic title");
  await fill(host.querySelector("textarea")!, "Synthetic description");
  await submit();
  expect(createIncident).toHaveBeenCalledWith(expect.objectContaining({ title: "Synthetic title", description: "Synthetic description" }));
  expect(onCreated).toHaveBeenCalledWith("Incidencia creada correctamente.");
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("keeps incident API errors visible without closing the dialog", async () => {
  const onClose = jest.fn(), onCreated = jest.fn();
  jest.mocked(createIncident).mockRejectedValue(new Error("Synthetic save failure"));
  await act(async () => root.render(createElement(IncidentCreateDialog, { onClose, onCreated })));
  await fill(host.querySelector("input")!, "Synthetic title");
  await fill(host.querySelector("textarea")!, "Synthetic description");
  await submit();
  expect(host.querySelector("[role=alert]")?.textContent).toContain("Synthetic save failure");
  expect(onCreated).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it("derives supplier currency from country and refreshes after creating the supplier", async () => {
  const onClose = jest.fn(), onCreated = jest.fn().mockResolvedValue(undefined);
  jest.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => ({ id: "1" }) } as Response);
  await act(async () => root.render(createElement(SupplierCreateDialog, { onClose, onCreated })));
  await fill(host.querySelector("input")!, "Synthetic supplier");
  await fill(host.querySelector("select")!, "Spain");
  await fill(host.querySelector<HTMLInputElement>('input[type=number]')!, "7.5");
  expect(host.querySelector<HTMLInputElement>("input[readonly]")?.value).toBe("EUR");
  await submit();
  const [, init] = jest.mocked(apiFetch).mock.calls[0];
  expect(JSON.parse(init!.body as string)).toEqual(expect.objectContaining({ name: "Synthetic supplier", country: "Spain", currency: "EUR", rate_per_shipment: 7.5 }));
  expect(onCreated).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
});
