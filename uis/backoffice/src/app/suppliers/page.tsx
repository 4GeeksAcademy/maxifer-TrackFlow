"use client";


import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


import type {
  FormEvent,
} from "react";

import { apiFetch } from "@/lib/auth";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";


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


type SupplierCurrency =
  | "USD"
  | "EUR";


type Supplier = {
  id: string;
  name: string;
  country: SupplierCountry;
  categories:
    SupplierCategory[];
  rate_per_shipment: number;
  currency: SupplierCurrency;
  status: SupplierStatus;
  updated_at: string;
  service_zone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
};


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
    return detail;
  }

  if (
    Array.isArray(
      detail
    )
  ) {
    return detail
      .map(
        (item) => {
          if (
            typeof item
            === "string"
          ) {
            return item;
          }

          if (
            item
            && typeof item
              === "object"
            && "msg"
              in item
          ) {
            return String(
              item.msg
            );
          }

          return JSON.stringify(
            item
          );
        }
      )
      .join(" | ");
  }

  return (
    "La API devolvió "
    + "un error no esperado."
  );
}


export default function SuppliersPage() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [createMessage, setCreateMessage] = useState("");

  const [
    suppliers,
    setSuppliers,
  ] = useState<
    Supplier[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    formLoading,
    setFormLoading,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState<
    Record<string, boolean>
  >({});

  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState<
    ""
    | SupplierCountry
  >(""
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<
    ""
    | SupplierCategory
  >(""
  );

  const [
    draftRates,
    setDraftRates,
  ] = useState<
    Record<string, string>
  >({});

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


  const inferredCurrency =
    useMemo(() => {
      return newSupplier.country
        === "USA"
        ? "USD"
        : "EUR";
    }, [
      newSupplier.country,
    ]);


  const loadSuppliers =
    useCallback(async () => {

      setLoading(true);
      setPageError("");

      try {
        const params =
          new URLSearchParams();

      if (
        selectedCountry
      ) {
        params.set(
          "country",
          selectedCountry,
        );
      }

      if (
        selectedCategory
      ) {
        params.set(
          "category",
          selectedCategory,
        );
      }

      const query =
        params.toString();

      const endpoint =
        query
          ? (
              "/backend/suppliers?"
              + query
            )
          : "/backend/suppliers";

      const response =
        await apiFetch(endpoint);

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

        const rows =
          data;

        setSuppliers(rows);
        setDraftRates(
          Object.fromEntries(
            rows.map(
              (supplier: Supplier) => [
                supplier.id,
                String(
                  supplier.rate_per_shipment,
                ),
              ],
            ),
          ),
        );

      } catch (error) {

        if (
          error
          instanceof Error
        ) {
          setPageError(
            error.message,
          );
        } else {
          setPageError(
            "No fue posible "
            + "cargar proveedores.",
          );
        }

      } finally {
        setLoading(false);
      }

    }, [
      selectedCategory,
      selectedCountry,
    ]);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSuppliers();
  }, [
    loadSuppliers,
  ]);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#new-supplier" && !dialogRef.current?.open) dialogRef.current?.showModal();
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  function closeDialog() {
    dialogRef.current?.close();
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

      await loadSuppliers();
      setCreateMessage("Proveedor creado correctamente.");
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


  async function updateRate(
    supplierId: string,
  ) {
    setPageError("");
    setActionLoading(
      (previous) => ({
        ...previous,
        [supplierId]: true,
      }),
    );

    try {
      const response =
        await apiFetch(
          (
            "/backend/suppliers/"
            + supplierId
            + "/rate"
          ),
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rate_per_shipment:
                Number(
                  draftRates[
                    supplierId
                  ],
                ),
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

      const updated =
        data;

      setSuppliers(
        (previous) =>
          previous.map(
            (item) =>
              item.id
              === supplierId
                ? updated
                : item,
          ),
      );

      setDraftRates(
        (previous) => ({
          ...previous,
          [supplierId]: String(
            updated.rate_per_shipment,
          ),
        }),
      );

    } catch (error) {

      if (
        error
        instanceof Error
      ) {
        setPageError(
          error.message,
        );
      } else {
        setPageError(
          "No fue posible "
          + "actualizar la tarifa.",
        );
      }

    } finally {
      setActionLoading(
        (previous) => ({
          ...previous,
          [supplierId]: false,
        }),
      );
    }
  }


  async function toggleStatus(
    supplier: Supplier,
  ) {
    const nextStatus =
      supplier.status
      === "active"
        ? "suspended"
        : "active";

    setPageError("");
    setActionLoading(
      (previous) => ({
        ...previous,
        [supplier.id]: true,
      }),
    );

    try {
      const response =
        await apiFetch(
          (
            "/backend/suppliers/"
            + supplier.id
            + "/status"
          ),
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status:
                nextStatus,
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

      const updated =
        data;

      setSuppliers(
        (previous) =>
          previous.map(
            (item) =>
              item.id
              === supplier.id
                ? updated
                : item,
          ),
      );

    } catch (error) {

      if (
        error
        instanceof Error
      ) {
        setPageError(
          error.message,
        );
      } else {
        setPageError(
          "No fue posible "
          + "actualizar estado.",
        );
      }

    } finally {
      setActionLoading(
        (previous) => ({
          ...previous,
          [supplier.id]: false,
        }),
      );
    }
  }


  return (
    <main className="container">

      <header className="pageHeader">

        <span className="eyebrow">
          COMPRAS / RED DE PROVEEDORES
        </span>


        <div className="pageHeaderTitleRow">
          <h1>Gestión integrada de proveedores</h1>
          <button id="new-supplier" type="button" className="button" onClick={() => { setCreateMessage(""); setFormError(""); dialogRef.current?.showModal(); }}>Crear proveedor</button>
        </div>


        <p>
          Consultá, filtrá y
          actualizá proveedores
          de USA y Spain sin
          salir del backoffice.
        </p>

      </header>
      {createMessage && <p role="status" className="successMessage mb-5">{createMessage}</p>}


      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Proveedores mostrados", suppliers.length, "tone-info"],
          ["Activos", suppliers.filter((supplier) => supplier.status === "active").length, "tone-success"],
          ["Suspendidos", suppliers.filter((supplier) => supplier.status === "suspended").length, "tone-danger"],
        ].map(([label, count, tone]) => <div key={label} className={`metricPanel ${tone}`}><span>{label}</span>{loading ? <div className="skeletonLine skeletonMetric" aria-label="Cargando proveedores" /> : <strong>{count}</strong>}</div>)}
      </div>

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


      <section className="card">

        <div className="supplierFilters">

          <label>
            Filtrar país
            <select
              value={selectedCountry}
              onChange={(
                event,
              ) => {
                setSelectedCountry(
                  event
                    .target
                    .value
                    ? parseCountry(
                        event
                          .target
                          .value,
                      )
                    : "",
                );
              }}
            >
              <option value="">
                Todos
              </option>
              <option value="USA">
                USA
              </option>
              <option value="Spain">
                Spain
              </option>
            </select>
          </label>


          <label>
            Filtrar categoría
            <select
              value={selectedCategory}
              onChange={(
                event,
              ) => {
                setSelectedCategory(
                  event
                    .target
                    .value
                    ? parseCategory(
                        event
                          .target
                          .value,
                      )
                    : "",
                );
              }}
            >
              <option value="">
                Todas
              </option>
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

        </div>


        {pageError && (
          <p className="error">
            {pageError}
          </p>
        )}


        {loading ? (
          <LoadingSkeleton label="Cargando proveedores" variant="table" columns={6} />
        ) : (
          <div className="tableWrap">
            <table className="supplierTable">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>País</th>
                  <th>Categorías</th>
                  <th>Tarifa</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(
                  (supplier) => {
                    const rowLoading =
                      actionLoading[
                        supplier.id
                      ];

                    return (
                      <tr
                        key={supplier.id}
                        className={
                          supplier.status
                          === "active"
                            ? "rowActive"
                            : "rowSuspended"
                        }
                      >
                        <td>
                          {supplier.name}
                        </td>
                        <td>
                          {supplier.country}
                        </td>
                        <td>
                          {supplier.categories
                            .join(", ")}
                        </td>
                        <td>
                          <div className="rateEditor">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={
                                draftRates[
                                  supplier.id
                                ]
                                ?? String(
                                  supplier.rate_per_shipment,
                                )
                              }
                              onChange={(
                                event,
                              ) => {
                                setDraftRates(
                                  (previous) => ({
                                    ...previous,
                                    [supplier.id]:
                                      event
                                        .target
                                        .value,
                                  }),
                                );
                              }}
                            />
                            <span>
                              {supplier.currency}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={
                              supplier.status
                              === "active"
                                ? "statusBadge statusActive"
                                : "statusBadge statusSuspended"
                            }
                          >
                            {supplier.status}
                          </span>
                        </td>
                        <td>
                          <div className="rowActions">
                            <button
                              disabled={rowLoading}
                              onClick={() => {
                                void updateRate(
                                  supplier.id,
                                );
                              }}
                            >
                              Guardar tarifa
                            </button>
                            <button
                              disabled={rowLoading}
                              className="mutedButton"
                              onClick={() => {
                                void toggleStatus(
                                  supplier,
                                );
                              }}
                            >
                              {
                                supplier.status
                                === "active"
                                  ? "Suspender"
                                  : "Activar"
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}

      </section>

    </main>
  );

}
