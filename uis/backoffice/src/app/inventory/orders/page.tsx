"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  getInventoryOrders,
  movementTypeLabels,
  warehouseLabels,
  type InventoryOrder,
} from "@/lib/inventory";

export default function InventoryOrdersPage() {
  const [orders, setOrders] = useState<InventoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const data = await getInventoryOrders();
        if (active) {
          setOrders(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el historial de movimientos.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrders();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="container">
      <header className="pageHeader">
        <span className="eyebrow">Inventario</span>
        <h1>Historial de órdenes</h1>
        <p>Vista de solo lectura de movimientos de entrada y salida.</p>
      </header>

      <div className="mb-5 flex flex-wrap gap-3">
        <Link href="/inventory/products" className="button secondaryButton">
          Ver productos
        </Link>
      </div>

      {error ? <p role="alert" className="error">{error}</p> : null}

      {loading ? (
        <LoadingSkeleton label="Cargando historial" variant="table" columns={7} />
      ) : (
        <section className="card">
          <div className="tableWrap">
            <table className="incidentTable">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Tipo</th>
                  <th>Almacén</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Referencia</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const badgeStyle = order.movement_type === "inbound"
                    ? { background: "var(--tone-success)", color: "var(--accent)", border: "1px solid var(--tone-success-line)" }
                    : { background: "var(--tone-info)", color: "var(--accent)", border: "1px solid var(--tone-info-line)" };

                  return (
                    <tr key={`${order.movement_type}-${order.id}`}>
                      <td>
                        <div className="font-semibold text-ink">{order.sku.name}</div>
                        <div className="text-xs text-muted">{order.sku.sku}</div>
                      </td>
                      <td>{order.quantity}</td>
                      <td>
                        <span style={{ ...badgeStyle, display: "inline-flex", alignItems: "center", padding: "0.35rem 0.65rem", borderRadius: "999px", fontWeight: 700 }}>
                          {movementTypeLabels[order.movement_type]}
                        </span>
                      </td>
                      <td>{warehouseLabels[order.warehouse]}</td>
                      <td>{new Date(order.created_at).toLocaleString("es-ES")}</td>
                      <td className="font-mono text-xs">{order.user_uuid}</td>
                      <td>{order.reference ?? order.tracking_number ?? order.exit_type ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
