import { apiFetch } from "@/lib/auth";

import { formatStockStatus, getInventoryProducts, readApiError } from "../inventory";

jest.mock("@/lib/auth", () => ({ apiFetch: jest.fn() }));

const apiFetchMock = jest.mocked(apiFetch);

function response(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

describe("inventory helpers", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("extracts nested API validation messages", async () => {
    await expect(readApiError(response({ detail: [{ msg: "Name is required" }, "Invalid SKU"] })))
      .resolves.toBe("Name is required. Invalid SKU");
  });

  it("uses a generic API message when the response body is malformed", async () => {
    const malformedResponse = {
      json: jest.fn().mockRejectedValue(new Error("invalid JSON")),
    } as unknown as Response;

    await expect(readApiError(malformedResponse)).resolves.toBe(
      "No se pudo completar la operación. Inténtalo de nuevo.",
    );
  });

  it("returns inventory products and treats a non-array payload as empty", async () => {
    const products = [{ id: 3, sku: "TF-003", current_stock: 8 }];
    apiFetchMock.mockResolvedValueOnce(response(products)).mockResolvedValueOnce(response({ items: products }));

    await expect(getInventoryProducts()).resolves.toEqual(products);
    await expect(getInventoryProducts()).resolves.toEqual([]);
    expect(apiFetchMock).toHaveBeenCalledWith("/backend/inventory/products");
  });

  it("rejects inventory requests with the API error", async () => {
    apiFetchMock.mockResolvedValue(response({ detail: "SKU already exists" }, 409));

    await expect(getInventoryProducts()).rejects.toThrow("SKU already exists");
  });

  it("formats empty, low, and healthy stock at the threshold", () => {
    expect(formatStockStatus(0).label).toBe("Sin stock");
    expect(formatStockStatus(10).label).toBe("Stock bajo");
    expect(formatStockStatus(11).label).toBe("Stock saludable");
  });
});