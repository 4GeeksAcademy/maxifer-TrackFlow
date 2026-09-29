"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  createInboundOrder,
  getInventoryProducts,
  warehouseLabels,
  type InventoryProduct,
} from "@/lib/inventory";

export default function InboundOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reference, setReference] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const productIdFromQuery = searchParams.get("productId");
  const effectiveProductId = selectedProductId || productIdFromQuery || (products[0] ? String(products[0].id) : "");
  const selectedProduct = products.find((product) => String(product.id) === effectiveProductId) ?? null;

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getInventoryProducts();
        if (!active) return;
        setProducts(data);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catálogo de productos.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, [productIdFromQuery, selectedProductId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedProduct) {
      setError("Selecciona un producto para continuar.");
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!reference.trim() || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError("Completa la referencia y una cantidad válida.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createInboundOrder({
        sku_id: selectedProduct.id,
        quantity: parsedQuantity,
        reference: reference.trim(),
        warehouse: selectedProduct.warehouse,
      });

      setReference("");
      setQuantity("");
      setSelectedProductId("");
      setSuccess("Entrada registrada correctamente.");
      router.replace("/inventory/orders/inbound");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo registrar la entrada.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container">
      <header className="pageHeader">
        <span className="eyebrow">Inventario</span>
        <h1>Orden de entrada</h1>
        <p>Registra la recepción de mercancía para un SKU concreto.</p>
      </header>

      <div className="mb-5 flex flex-wrap gap-3">
        <Link href="/inventory/products" className="button secondaryButton">
          Volver a productos
        </Link>
        <Link href="/inventory/orders" className="button secondaryButton">
          Ver historial
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton label="Cargando formulario de entrada" variant="table" columns={2} />
      ) : (
        <section className="card">
          <form className="incidentForm" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Producto</span>
              <select
                value={effectiveProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                required
              >
                <option value="">Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Almacén</span>
              <input
                type="text"
                value={selectedProduct ? warehouseLabels[selectedProduct.warehouse] : "-"}
                readOnly
              />
            </label>

            <label className="form-field incidentWide">
              <span>Referencia</span>
              <input
                type="text"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="PO-2024-0102"
                required
              />
            </label>

            <label className="form-field">
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Ej: 25"
                required
              />
            </label>

            {selectedProduct ? (
              <div className="form-field">
                <span>Stock actual</span>
                <input type="text" value={`${selectedProduct.current_stock} unidades`} readOnly />
              </div>
            ) : null}

            {error ? <p role="alert" className="error incidentWide">{error}</p> : null}
            {success ? <p className="successMessage incidentWide">{success}</p> : null}

            <div className="incidentWide">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando…" : "Registrar entrada"}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
