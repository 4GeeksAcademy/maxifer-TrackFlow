"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  createOutboundOrder,
  getInventoryProducts,
  warehouseLabels,
  type InventoryProduct,
} from "@/lib/inventory";

export default function OutboundOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [exitType, setExitType] = useState<"dispatch" | "loss">("dispatch");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const productIdFromQuery = searchParams.get("productId");
  const effectiveProductId = selectedProductId || productIdFromQuery || (products[0] ? String(products[0].id) : "");
  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === effectiveProductId) ?? null,
    [effectiveProductId, products],
  );

  const currentStock = selectedProduct?.current_stock ?? 0;
  const quantityValue = Number(quantity);
  const stockWarning =
    selectedProduct && quantity !== "" && Number.isFinite(quantityValue) && quantityValue > currentStock;

  const quantityInlineError =
    stockWarning
      ? `La cantidad solicitada supera el stock disponible (${currentStock} unidades).`
      : "";

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

    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      setError("Introduce una cantidad válida para la salida.");
      return;
    }

    if (nextQuantity > currentStock) {
      setError(`La cantidad solicitada supera el stock disponible (${currentStock} unidades).`);
      return;
    }

    if (exitType === "dispatch" && !trackingNumber.trim()) {
      setError("Para una salida de tipo dispatch es obligatorio indicar el tracking.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createOutboundOrder({
        sku_id: selectedProduct.id,
        quantity: nextQuantity,
        exit_type: exitType,
        tracking_number: exitType === "dispatch" ? trackingNumber.trim() || null : null,
        warehouse: selectedProduct.warehouse,
      });

      setQuantity("");
      setTrackingNumber("");
      setSelectedProductId("");
      setSuccess("Salida registrada correctamente.");
      router.replace("/inventory/orders/outbound");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo registrar la salida.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container">
      <header className="pageHeader">
        <span className="eyebrow">Inventario</span>
        <h1>Orden de salida</h1>
        <p>Controla el stock real antes de despachar unidades.</p>
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
        <LoadingSkeleton label="Cargando formulario de salida" variant="table" columns={2} />
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

            <div className="form-field">
              <span>Stock actual</span>
              <input type="text" value={selectedProduct ? `${selectedProduct.current_stock} unidades` : "-"} readOnly />
            </div>

            <label className="form-field">
              <span>Tipo de salida</span>
              <select value={exitType} onChange={(event) => setExitType(event.target.value as "dispatch" | "loss")}>
                <option value="dispatch">Despacho</option>
                <option value="loss">Pérdida</option>
              </select>
            </label>

            <label className="form-field">
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Ej: 8"
                required
              />
              {quantityInlineError ? <span className="fieldError">{quantityInlineError}</span> : null}
            </label>

            {exitType === "dispatch" ? (
              <label className="form-field incidentWide">
                <span>Tracking</span>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="1Z999AA10123456784"
                />
              </label>
            ) : null}

            {error ? <p role="alert" className="error incidentWide">{error}</p> : null}
            {success ? <p className="successMessage incidentWide">{success}</p> : null}

            <div className="incidentWide">
              <button type="submit" disabled={isSubmitting || Boolean(quantityInlineError)}>
                {isSubmitting ? "Guardando…" : "Registrar salida"}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
