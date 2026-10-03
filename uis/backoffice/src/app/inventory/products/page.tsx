"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  createInventoryProduct,
  formatStockStatus,
  getInventoryProducts,
  inventoryCategoryLabels,
  INVENTORY_LOW_STOCK_THRESHOLD,
  warehouseLabels,
  type InventoryProduct,
  type InventoryProductInput,
} from "@/lib/inventory";

const initialProductForm: InventoryProductInput = {
  name: "",
  sku: "",
  client_name: "",
  category: "fashion",
  warehouse: "LA",
};

export default function InventoryProductsPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productForm, setProductForm] = useState<InventoryProductInput>(initialProductForm);

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

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const product = await createInventoryProduct({
        ...productForm,
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        client_name: productForm.client_name.trim(),
      });
      setProducts((currentProducts) => [...currentProducts, product]);
      setProductForm(initialProductForm);
      setShowCreateForm(false);
      setSuccess("Producto creado correctamente.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear el producto.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container">
      <header className="pageHeader">
        <span className="eyebrow">Inventario</span>
        <div className="pageHeaderTitleRow">
          <h1>Productos</h1>
          <button
            type="button"
            className={`button ${showCreateForm ? "secondaryButton" : ""}`}
            onClick={() => { setShowCreateForm((isOpen) => !isOpen); setError(""); }}
          >
            {showCreateForm ? "Cancelar" : "Crear producto"}
          </button>
        </div>
        <p>Stock actual por SKU y almacén. El umbral de alerta es de {INVENTORY_LOW_STOCK_THRESHOLD} unidades.</p>
      </header>

      {error ? <p role="alert" className="error">{error}</p> : null}
      {success ? <p role="status" className="successMessage mb-5">{success}</p> : null}

      {showCreateForm ? (
        <section className="card">
          <h2>Nuevo producto</h2>
          <form className="incidentForm" onSubmit={handleCreateProduct}>
            <label className="form-field">
              <span>Nombre del producto</span>
              <input
                value={productForm.name}
                onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="form-field">
              <span>SKU</span>
              <input
                value={productForm.sku}
                onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))}
                required
              />
            </label>
            <label className="form-field">
              <span>Cliente</span>
              <input
                value={productForm.client_name}
                onChange={(event) => setProductForm((current) => ({ ...current, client_name: event.target.value }))}
                required
              />
            </label>
            <label className="form-field">
              <span>Categoría</span>
              <select
                value={productForm.category}
                onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value as InventoryProductInput["category"] }))}
              >
                {Object.entries(inventoryCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Almacén</span>
              <select
                value={productForm.warehouse}
                onChange={(event) => setProductForm((current) => ({ ...current, warehouse: event.target.value as InventoryProductInput["warehouse"] }))}
              >
                {Object.entries(warehouseLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <div className="incidentWide flex flex-wrap gap-2">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar producto"}
              </button>
              <button type="button" className="button secondaryButton" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : null}

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
                {products.length === 0 ? (
                  <tr><td colSpan={7}>Aún no hay productos en el inventario.</td></tr>
                ) : products.map((product) => {
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
