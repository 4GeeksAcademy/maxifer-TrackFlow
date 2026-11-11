"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/auth";
type SupplierCountry =
  | "USA"
  | "Spain";


type SupplierStatus =
  | "active"
  | "suspended";


type SupplierCategory =
  | "carrier_last_mile"
  | "carrier_international"
  | "warehouse_supplies"
  | "packaging_materials"
  | "reverse_logistics"
  | "fleet_maintenance"
  | "it_and_wms_software"
  | "cleaning_and_facilities";


type NewSupplierForm = {
  name: string;
  country: SupplierCountry;
  category: SupplierCategory;
  rate_per_shipment: string;
  status: SupplierStatus;
  service_zone: string;
  contact_email: string;
  notes: string;
};


const CATEGORY_OPTIONS:
  SupplierCategory[] = [
    "carrier_last_mile",
    "carrier_international",
    "warehouse_supplies",
    "packaging_materials",
    "reverse_logistics",
    "fleet_maintenance",
    "it_and_wms_software",
    "cleaning_and_facilities",
  ];


function parseCountry(
  value: string,
): SupplierCountry {
  return value
    === "Spain"
    ? "Spain"
    : "USA";
}


function parseCategory(
  value: string,
): SupplierCategory {
  switch (value) {
    case "carrier_last_mile":
    case "carrier_international":
    case "warehouse_supplies":
    case "packaging_materials":
    case "reverse_logistics":
    case "fleet_maintenance":
    case "it_and_wms_software":
    case "cleaning_and_facilities":
      return value;
    default:
      return "carrier_last_mile";
  }
}


function parseStatus(
  value: string,
): SupplierStatus {
  return value
    === "suspended"
    ? "suspended"
    : "active";
}


function parseErrorDetail(
  detail: unknown,
): string {
  if (
    typeof detail
    === "string"
  ) {
    if (
      detail.toLowerCase().includes("required")
      || detail.toLowerCase().includes("validation")
    ) {
      return "Revisá los datos del formulario e intentá nuevamente.";
    }

    return "No se pudo completar la operación. Intentá nuevamente.";
  }

  if (
    Array.isArray(detail)
  ) {
    return "Revisá los datos del formulario e intentá nuevamente.";
  }

  return "No se pudo completar la operación. Intentá nuevamente.";
}


export default function SupplierCreateDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [
    newSupplier,
    setNewSupplier,
  ] = useState<
    NewSupplierForm
  >({
    name: "",
    country: "USA",
    category:
      "carrier_last_mile",
    rate_per_shipment: "",
    status: "active",
    service_zone: "",
    contact_email: "",
    notes: "",
  });


  const inferredCurrency = newSupplier.country === "USA" ? "USD" : "EUR";

  useEffect(() => {
    const trigger = document.getElementById("new-supplier");
    dialogRef.current?.showModal();
    return () => { trigger?.focus(); };
  }, []);
  function closeDialog() {
    dialogRef.current?.close();
    onClose();
    if (window.location.hash === "#new-supplier") history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
  }


  async function handleCreateSupplier(
    event:
      FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setFormLoading(true);
    setFormError("");

    try {
      const response =
        await apiFetch(
          "/backend/suppliers",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name:
                newSupplier.name,
              country:
                newSupplier.country,
              categories: [
                newSupplier.category,
              ],
              rate_per_shipment:
                Number(
                  newSupplier.rate_per_shipment,
                ),
              currency:
                inferredCurrency,
              status:
                newSupplier.status,
              service_zone:
                newSupplier.service_zone
                || undefined,
              contact_email:
                newSupplier.contact_email
                || undefined,
              notes:
                newSupplier.notes
                || undefined,
            }),
          },
        );

      const data =
        await response
          .json()
          .catch(
            () => null,
          );

      if (!response.ok) {
        throw new Error(
          parseErrorDetail(
            data?.detail,
          ),
        );
      }

      setNewSupplier({
        name: "",
        country: "USA",
        category:
          "carrier_last_mile",
        rate_per_shipment: "",
        status: "active",
        service_zone: "",
        contact_email: "",
        notes: "",
      });

      await onCreated();

      closeDialog();

    } catch (error) {

      if (
        error
        instanceof Error
      ) {
        setFormError(
          error.message,
        );
      } else {
        setFormError(
          "No fue posible "
          + "crear el proveedor.",
        );
      }

    } finally {
      setFormLoading(false);
    }

  }


  return (
<dialog ref={dialogRef} className="incidentDialog" aria-labelledby="supplier-dialog-title" onClick={handleDialogClick} onCancel={event => { event.preventDefault(); closeDialog(); }} onClose={() => { if (window.location.hash === "#new-supplier") history.replaceState(null, "", window.location.pathname + window.location.search); }}>

        <div className="incidentDialogHeader"><h2 id="supplier-dialog-title">Registrar proveedor</h2><button type="button" className="incidentDialogClose" aria-label="Cerrar formulario" onClick={closeDialog}>×</button></div>


        <form
          onSubmit={handleCreateSupplier}
          className="supplierForm"
        >

          <label>
            Nombre
            <input
              required
              value={newSupplier.name}
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    name:
                      event
                        .target
                        .value,
                  }),
                );
              }}
            />
          </label>


          <label>
            País
            <select
              value={newSupplier.country}
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    country:
                        parseCountry(
                          event
                            .target
                            .value,
                        ),
                  }),
                );
              }}
            >
              <option value="USA">
                USA
              </option>
              <option value="Spain">
                Spain
              </option>
            </select>
          </label>


          <label>
            Categoría
            <select
              value={newSupplier.category}
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    category:
                        parseCategory(
                          event
                            .target
                            .value,
                        ),
                  }),
                );
              }}
            >
              {CATEGORY_OPTIONS
                .map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
                )}
            </select>
          </label>


          <label>
            Tarifa por envío
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={
                newSupplier
                  .rate_per_shipment
              }
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    rate_per_shipment:
                      event
                        .target
                        .value,
                  }),
                );
              }}
            />
          </label>


          <label>
            Moneda
            <input
              value={inferredCurrency}
              readOnly
            />
          </label>


          <label>
            Estado
            <select
              value={newSupplier.status}
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    status:
                        parseStatus(
                          event
                            .target
                            .value,
                        ),
                  }),
                );
              }}
            >
              <option value="active">
                active
              </option>
              <option value="suspended">
                suspended
              </option>
            </select>
          </label>


          <label>
            Zona de servicio
            <input
              value={newSupplier.service_zone}
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    service_zone:
                      event
                        .target
                        .value,
                  }),
                );
              }}
            />
          </label>


          <label>
            Contact email
            <input
              type="email"
              value={newSupplier.contact_email}
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    contact_email:
                      event
                        .target
                        .value,
                  }),
                );
              }}
            />
          </label>


          <label className="supplierFormWide">
            Notas
            <textarea
              value={newSupplier.notes}
              onChange={(
                event,
              ) => {
                setNewSupplier(
                  (previous) => ({
                    ...previous,
                    notes:
                      event
                        .target
                        .value,
                  }),
                );
              }}
            />
          </label>


          <div className="supplierFormWide flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={formLoading}
            >
              {
                formLoading
                ? "Guardando..."
                : "Guardar proveedor"
              }
            </button>
            <button type="button" className="button secondaryButton" onClick={closeDialog}>Cancelar</button>
          </div>

        </form>


        {formError && (
          <p role="alert" className="error">
            {formError}
          </p>
        )}

      </dialog>
  );
}
