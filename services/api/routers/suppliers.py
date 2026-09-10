from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from tinydb import Query as TinyQuery

from services.api.database import (
	document_to_record,
	get_suppliers_table,
)
from services.api.models import (
	SupplierCategory,
	SupplierCountry,
	SupplierCreate,
	SupplierRateUpdate,
	SupplierResponse,
	SupplierStatusUpdate,
)


router = APIRouter(
	prefix="/suppliers",
	tags=["suppliers"],
)


def _get_supplier_or_404(supplier_id: int):
	supplier = get_suppliers_table().get(doc_id=supplier_id)
	if supplier is None:
		raise HTTPException(
			status_code=404,
			detail="Supplier not found.",
		)
	return supplier


@router.post(
	"",
	response_model=SupplierResponse,
	status_code=status.HTTP_201_CREATED,
)
def create_supplier(payload: SupplierCreate):
	table = get_suppliers_table()
	record = payload.model_dump(mode="json")
	record["updated_at"] = datetime.now(timezone.utc).isoformat()

	supplier_id = table.insert(record)
	created = table.get(doc_id=supplier_id)

	if created is None:
		raise HTTPException(
			status_code=500,
			detail="Failed to create supplier.",
		)

	return SupplierResponse(**document_to_record(created))


@router.get(
	"",
	response_model=list[SupplierResponse],
)
def list_suppliers(
	country: SupplierCountry | None = Query(default=None),
	category: SupplierCategory | None = Query(default=None),
):
	table = get_suppliers_table()
	query = TinyQuery()

	if country is None and category is None:
		docs = table.all()

	elif country is not None and category is None:
		docs = table.search(query.country == country.value)

	elif country is None and category is not None:
		docs = table.search(query.categories.any([category.value]))

	else:
		docs = table.search(
			(query.country == country.value)
			& (query.categories.any([category.value]))
		)

	return [SupplierResponse(**document_to_record(doc)) for doc in docs]


@router.get(
	"/{supplier_id}",
	response_model=SupplierResponse,
)
def get_supplier_by_id(supplier_id: int):
	supplier = _get_supplier_or_404(supplier_id)
	return SupplierResponse(**document_to_record(supplier))


@router.patch(
	"/{supplier_id}/rate",
	response_model=SupplierResponse,
)
def update_supplier_rate(
	supplier_id: int,
	payload: SupplierRateUpdate,
):
	_get_supplier_or_404(supplier_id)
	now = datetime.now(timezone.utc).isoformat()

	table = get_suppliers_table()
	table.update(
		{
			"rate_per_shipment": payload.rate_per_shipment,
			"updated_at": now,
		},
		doc_ids=[supplier_id],
	)

	updated = table.get(doc_id=supplier_id)
	if updated is None:
		raise HTTPException(
			status_code=500,
			detail="Failed to update supplier rate.",
		)

	return SupplierResponse(**document_to_record(updated))


@router.patch(
	"/{supplier_id}/status",
	response_model=SupplierResponse,
)
def update_supplier_status(
	supplier_id: int,
	payload: SupplierStatusUpdate,
):
	_get_supplier_or_404(supplier_id)
	table = get_suppliers_table()

	table.update(
		{
			"status": payload.status.value,
		},
		doc_ids=[supplier_id],
	)

	updated = table.get(doc_id=supplier_id)
	if updated is None:
		raise HTTPException(
			status_code=500,
			detail="Failed to update supplier status.",
		)

	return SupplierResponse(**document_to_record(updated))


@router.delete(
	"/{supplier_id}",
)
def delete_supplier(supplier_id: int):
	_get_supplier_or_404(supplier_id)
	get_suppliers_table().remove(doc_ids=[supplier_id])

	return {
		"deleted": True,
		"id": str(supplier_id),
	}
