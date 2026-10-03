import { apiFetch } from "@/lib/auth";

export type Warehouse = "LA" | "ZGZ";
export type InventoryCategory = "fashion" | "electronics" | "cosmetics";
export type InventoryMovementType = "inbound" | "outbound";

export type InventoryProduct = {
  id: number;
  name: string;
  sku: string;
  client_name: string;
  category: InventoryCategory;
  warehouse: Warehouse;
  current_stock: number;
};

export type InventoryProductInput = Omit<InventoryProduct, "id" | "current_stock">;

export type InventoryOrder = {
  id: number;
  movement_type: InventoryMovementType;
  quantity: number;
  created_at: string;
  user_uuid: string;
  warehouse: Warehouse;
  reference?: string | null;
  exit_type?: "dispatch" | "loss" | null;
  tracking_number?: string | null;
  sku: InventoryProduct;
};

export const INVENTORY_LOW_STOCK_THRESHOLD = 10;

export const warehouseLabels: Record<Warehouse, string> = {
  LA: "Los Ángeles",
  ZGZ: "Zaragoza",
};

export const inventoryCategoryLabels: Record<InventoryCategory, string> = {
  fashion: "Moda",
  electronics: "Electrónica",
  cosmetics: "Cosmética",
};

export const movementTypeLabels: Record<InventoryMovementType, string> = {
  inbound: "Entrada",
  outbound: "Salida",
};

function parseApiErrorMessage(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") {
          return item.msg;
        }
        return "";
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  if (detail && typeof detail === "object") {
    if ("message" in detail && typeof detail.message === "string") {
      return detail.message;
    }
    if ("detail" in detail) {
      return parseApiErrorMessage(detail.detail);
    }
  }

  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

async function readApiError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null);
  return parseApiErrorMessage(payload?.detail ?? payload?.message ?? payload);
}

export async function getInventoryProducts(): Promise<InventoryProduct[]> {
  const response = await apiFetch("/backend/inventory/products");
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(payload?.detail ?? payload?.message ?? payload));
  }

  return Array.isArray(payload) ? (payload as InventoryProduct[]) : [];
}

export async function createInventoryProduct(product: InventoryProductInput): Promise<InventoryProduct> {
  const response = await apiFetch("/backend/inventory/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(payload?.detail ?? payload?.message ?? payload));
  }

  return payload as InventoryProduct;
}

export async function createInboundOrder(payload: {
  sku_id: number;
  quantity: number;
  reference: string;
  warehouse: Warehouse;
}) {
  const response = await apiFetch("/backend/inventory/orders/inbound", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data?.detail ?? data?.message ?? data));
  }

  return data as { id: number; created_at: string; user_uuid: string };
}

export async function createOutboundOrder(payload: {
  sku_id: number;
  quantity: number;
  exit_type: "dispatch" | "loss";
  tracking_number?: string | null;
  warehouse: Warehouse;
}) {
  const response = await apiFetch("/backend/inventory/orders/outbound", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(data?.detail ?? data?.message ?? data));
  }

  return data as { id: number; created_at: string; user_uuid: string };
}

export async function getInventoryOrders(): Promise<InventoryOrder[]> {
  const response = await apiFetch("/backend/inventory/orders");
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseApiErrorMessage(payload?.detail ?? payload?.message ?? payload));
  }

  return Array.isArray(payload) ? (payload as InventoryOrder[]) : [];
}

export function formatStockStatus(currentStock: number) {
  if (currentStock <= 0) {
    return { label: "Sin stock", icon: "●", color: "var(--danger)", background: "var(--danger-soft)", border: "1px solid var(--tone-danger-line)" };
  }

  if (currentStock <= INVENTORY_LOW_STOCK_THRESHOLD) {
    return { label: "Stock bajo", icon: "⚠", color: "var(--warning)", background: "var(--warning-soft)", border: "1px solid var(--tone-warning-line)" };
  }

  return { label: "Stock saludable", icon: "✓", color: "var(--accent)", background: "var(--tone-success)", border: "1px solid var(--tone-success-line)" };
}

export { readApiError };
