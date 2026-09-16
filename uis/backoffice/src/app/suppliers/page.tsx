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

const CATEGORY_LABELS: Record<SupplierCategory, string> = {
  carrier_last_mile: "Última milla",
  carrier_international: "Transporte internacional",
  warehouse_supplies: "Suministros de almacén",
  packaging_materials: "Embalaje",
  reverse_logistics: "Logística inversa",
  fleet_maintenance: "Mantenimiento de flota",
  it_and_wms_software: "Software y WMS",
  cleaning_and_facilities: "Limpieza e instalaciones",
};


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

  const createDialog = useRef<HTMLDialogElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"" | SupplierStatus>("");
  const [editingRateId, setEditingRateId] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash === "#new-supplier" && !createDialog.current?.open) createDialog.current?.showModal();
  }, []);

  const [
    suppliers,
    setSuppliers,
  ] = useState<
    Supplier[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

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

  const visibleSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("es");
    return suppliers.filter((supplier) =>
      (!selectedStatus || supplier.status === selectedStatus)
      && (!query || [supplier.name, supplier.service_zone, supplier.contact_email]
        .some((value) => value?.toLocaleLowerCase("es").includes(query))),
    );
  }, [suppliers, searchQuery, selectedStatus]);

  const activeCount = suppliers.filter((supplier) => supplier.status === "active").length;
  const suspendedCount = suppliers.length - activeCount;
  const usaCount = suppliers.filter((supplier) => supplier.country === "USA").length;
  const spainCount = suppliers.length - usaCount;


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
      createDialog.current?.close();

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
      setEditingRateId(null);

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
    <main className="container suppliersPage">

      <header className="pageHeader supplierPageHeader">

        <span className="eyebrow">
          TRACKFLOW HUB / ADQUISICIONES &amp; FLOTAS
        </span>


        <h1>
          Gestión integral de proveedores
        </h1>


        <p>
          Consultá, filtrá y actualizá proveedores de USA y España.
        </p>

        <button ref={createButton} type="button" className="supplierCreateToggle" onClick={() => { setFormError(""); createDialog.current?.showModal(); }}>+ Dar de alta nuevo proveedor</button>
      </header>

      <div className="supplierOverview" aria-label="Resumen de proveedores">
        <div className="supplierStat"><span>DIRECTORIO</span><strong>{suppliers.length}</strong><small>proveedores en la selección</small><div><i className="statDot green" /> Activos: {activeCount} <i className="statDot red" /> Suspendidos: {suspendedCount}</div></div>
        <div className="supplierStat"><span>SEGMENTACIÓN GEOGRÁFICA</span><div className="supplierSplit"><b>USA <small>USD</small><strong>{usaCount}</strong></b><b>España <small>EUR</small><strong>{spainCount}</strong></b></div><small>Según país registrado</small></div>
        <div className="supplierStat"><span>ESPECIALIDADES</span><strong>{new Set(suppliers.flatMap((supplier) => supplier.categories)).size}</strong><small>categorías representadas</small><div>Directorio logístico y operativo</div></div>
        <div className="supplierStat"><span>TARIFAS Y DESPACHOS</span><strong>{suppliers.filter((supplier) => supplier.rate_per_shipment > 0).length}</strong><small>tarifas configuradas</small><div>USD y EUR por envío</div></div>
      </div>


      <dialog id="new-supplier" ref={createDialog} className="supplierModal" aria-labelledby="supplier-modal-title" onClose={() => createButton.current?.focus()} onClick={event => { if (event.target === event.currentTarget) createDialog.current?.close(); }}>
      <section className="card supplierCreateCard">

        <header className="supplierModalHeader"><div><h2 id="supplier-modal-title">Registrar proveedor</h2><p>Alta en el directorio operativo</p></div><button type="button" className="supplierModalClose" onClick={() => createDialog.current?.close()} aria-label="Cerrar formulario">×</button></header>


        <form
          onSubmit={handleCreateSupplier}
          className="supplierForm"
        >

          <label>
            Nombre
            <input
              autoFocus
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


          <div className="supplierFormWide supplierFormActions">
            <button type="button" className="mutedButton" onClick={() => createDialog.current?.close()}>Cancelar</button>
            <button
              type="submit"
              disabled={formLoading}
            >
              {
                formLoading
                ? "Guardando..."
                : "Crear proveedor"
              }
            </button>
          </div>

        </form>


        {formError && (
          <p className="error">
            {formError}
          </p>
        )}

      </section>
      </dialog>


      <section className="card">

        <div className="supplierFilters">

          <label className="supplierSearch">Buscar proveedor
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Razón social, zona o email..." />
          </label>

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

          <label>Estado
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as "" | SupplierStatus)}>
              <option value="">Todos</option><option value="active">Activo</option><option value="suspended">Suspendido</option>
            </select>
          </label>

        </div>


        {pageError && (
          <p className="error">
            {pageError}
          </p>
        )}


        {loading ? (
          <p>
            Cargando proveedores...
          </p>
        ) : visibleSuppliers.length === 0 ? <p className="supplierEmpty">No hay proveedores para los filtros seleccionados.</p> : (
          <div className="tableWrap">
            <table className="supplierTable">
              <thead>
                <tr>
                  <th>Proveedor y zona operativa</th>
                  <th>País y divisa</th>
                  <th>Categoría</th>
                  <th>Tarifa de despacho</th>
                  <th>Estado operativo</th>
                  <th>Acciones rápidas</th>
                </tr>
              </thead>
              <tbody>
                {visibleSuppliers.map(
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
                        <td><div className="supplierIdentity"><span className="supplierAvatar" aria-hidden="true">{supplier.name.slice(0, 2).toUpperCase()}</span><div><strong>{supplier.name}</strong><small>{supplier.service_zone || supplier.contact_email || "Zona no indicada"}</small></div></div></td>
                        <td><span className="supplierCountry">{supplier.country === "Spain" ? "España" : "USA"}</span> <span className="currencyTag">{supplier.currency}</span></td>
                        <td><div className="supplierCategories">{supplier.categories.map((category) => <span className="categoryBadge" key={category}>{CATEGORY_LABELS[category] ?? category}</span>)}</div></td>
                        <td>
                          <div className="rateEditor">
                            {editingRateId === supplier.id ? <><input
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
                            /><span>{supplier.currency}</span><button type="button" className="rateSave" disabled={rowLoading} onClick={() => void updateRate(supplier.id)} aria-label={`Guardar tarifa de ${supplier.name}`}>✓</button><button type="button" className="rateCancel" onClick={() => { setDraftRates((current) => ({ ...current, [supplier.id]: String(supplier.rate_per_shipment) })); setEditingRateId(null); }} aria-label="Cancelar edición">×</button></> : <><strong>{new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(supplier.rate_per_shipment)} {supplier.currency === "EUR" ? "€" : "$"}</strong><button type="button" className="rateEdit" onClick={() => setEditingRateId(supplier.id)} aria-label={`Editar tarifa de ${supplier.name}`}>✎</button></>}
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
                            {supplier.status === "active" ? "Activo" : "Suspendido"}
                          </span>
                        </td>
                        <td>
                          <div className="rowActions">
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
