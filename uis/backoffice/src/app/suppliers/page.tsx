"use client";


import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import dynamic from "next/dynamic";

import { apiFetch } from "@/lib/auth";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { prepareSuppliers } from "@/lib/supplier-view";


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


type SupplierListItem = {
  id: string;
  name: string;
  country: SupplierCountry;
  categories:
    SupplierCategory[];
  rate_per_shipment: number;
  currency: SupplierCurrency;
  status: SupplierStatus;
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


const SupplierCreateDialog = dynamic(() => import("@/components/SupplierCreateDialog"), { loading: () => <p role="status">Cargando formulario de proveedor...</p> });

export default function SuppliersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  const [
    suppliers,
    setSuppliers,
  ] = useState<
    SupplierListItem[]
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

  const prepared = useMemo(() => prepareSuppliers(suppliers), [suppliers]);

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
              (supplier: SupplierListItem) => [
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
      if (window.location.hash === "#new-supplier") setDialogOpen(true);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  function closeDialog() {
    setDialogOpen(false);
    if (window.location.hash === "#new-supplier") history.replaceState(null, "", window.location.pathname + window.location.search);
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
    supplier: SupplierListItem,
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
          <button id="new-supplier" type="button" className="button" onClick={() => { setCreateMessage(""); setDialogOpen(true); }}>Crear proveedor</button>
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
          ["Activos", prepared.counts.active, "tone-success"],
          ["Suspendidos", prepared.counts.suspended, "tone-danger"],
        ].map(([label, count, tone]) => <div key={label} className={`metricPanel ${tone}`}><span>{label}</span>{loading ? <div className="skeletonLine skeletonMetric" aria-label="Cargando proveedores" /> : <strong>{count}</strong>}</div>)}
      </div>

      {dialogOpen && <SupplierCreateDialog onClose={closeDialog} onCreated={async () => { await loadSuppliers(); setCreateMessage("Proveedor creado correctamente."); }} />}


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
                {prepared.rows.map(
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
                          {supplier.categoryLabel}
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
