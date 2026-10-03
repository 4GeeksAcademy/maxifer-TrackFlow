"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  formatStockStatus,
  getInventoryProducts,
  inventoryCategoryLabels,
  INVENTORY_LOW_STOCK_THRESHOLD,
  warehouseLabels,
  type InventoryProduct,
} from "@/lib/inventory";

export default function InventoryProductsPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getInventoryProducts();
        if (active) {
          setProducts(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el inventario.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="container">
      <header className="pageHeader">
        <span className="eyebrow">Inventario</span>
        <h1>Productos</h1>
        <p>Stock actual por SKU y almacén. El umbral de alerta es de {INVENTORY_LOW_STOCK_THRESHOLD} unidades.</p>
      </header>

      {error ? <p role="alert" className="error">{error}</p> : null}

      {loading ? (
        <LoadingSkeleton label="Cargando productos" variant="table" columns={6} />
      ) : (
        <section className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2>Listado de SKU</h2>
            <Link href="/inventory/orders" className="button secondaryButton">
              Ver historial
            </Link>
          </div>

          <div className="tableWrap">
            <table className="incidentTable">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Cliente</th>
                  <th>Almacén</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockStatus = formatStockStatus(product.current_stock);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="font-semibold text-ink">{product.name}</div>
                      </td>
                      <td>{product.sku}</td>
                      <td>{product.client_name}</td>
                      <td>{warehouseLabels[product.warehouse]}</td>
                      <td>{inventoryCategoryLabels[product.category]}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.4rem 0.75rem",
                            borderRadius: "999px",
                            fontWeight: 700,
                            background: stockStatus.background,
                            color: stockStatus.color,
                            border: stockStatus.border,
                          }}
                        >
                          <span aria-hidden="true">{stockStatus.icon}</span>
                          {product.current_stock}
                        </span>
                      </td>
                      <td>
                        <div className="rowActions">
                          <Link
                            href={`/inventory/orders/inbound?productId=${product.id}`}
                            className="button secondaryButton"
                            style={{ minHeight: "2.25rem", padding: "0.5rem 0.75rem" }}
                          >
                            Entrada
                          </Link>
                          <Link
                            href={`/inventory/orders/outbound?productId=${product.id}`}
                            className="button secondaryButton"
                            style={{ minHeight: "2.25rem", padding: "0.5rem 0.75rem" }}
                          >
                            Salida
                          </Link>
                        </div>
                      </td>
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
