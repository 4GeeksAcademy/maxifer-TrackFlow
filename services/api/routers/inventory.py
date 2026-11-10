from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from services.api.database import get_inventory_db
from services.api.inventory_models import SKU, StockEntry, StockExit
from services.api.schemas import (
	OrderResponse,
	SKUCreate,
	SKUResponse,
	SKUReference,
	StockEntryCreate,
	StockEntryResponse,
	StockExitCreate,
	StockExitResponse,
)
from services.api.security import get_current_user


router = APIRouter(prefix="/inventory", tags=["inventory"])


def calculate_stock(db: Session, sku_id: int, warehouse: str) -> int:
	inbound = db.exec(
		select(func.coalesce(func.sum(StockEntry.quantity), 0))
		.where(StockEntry.sku_id == sku_id)
		.where(StockEntry.warehouse == warehouse)
	).one()
	outbound = db.exec(
		select(func.coalesce(func.sum(StockExit.quantity), 0))
		.where(StockExit.sku_id == sku_id)
		.where(StockExit.warehouse == warehouse)
	).one()
	return int(inbound - outbound)


def _sku_response(db: Session, product: SKU) -> SKUResponse:
	return SKUResponse(
		id=product.id,
		name=product.name,
		sku=product.sku,
		client_name=product.client_name,
		category=product.category,
		warehouse=product.warehouse,
		current_stock=calculate_stock(db, product.id, product.warehouse),
	)


def _authenticated_user_uuid(current_user: dict) -> str:
	user_uuid = current_user.get("id")
	if not user_uuid:
		raise HTTPException(status_code=401, detail="Authenticated user has no id")
	return str(user_uuid)


@router.get("/products", response_model=list[SKUResponse])
def get_products(db: Session = Depends(get_inventory_db)):
	return [_sku_response(db, product) for product in db.exec(select(SKU)).all()]


@router.post("/products", response_model=SKUResponse, status_code=201)
def create_product(
	payload: SKUCreate,
	db: Session = Depends(get_inventory_db),
	current_user: dict = Depends(get_current_user),
):
	_authenticated_user_uuid(current_user)
	product = SKU(**payload.model_dump())
	db.add(product)
	try:
		db.commit()
	except IntegrityError as error:
		db.rollback()
		raise HTTPException(status_code=409, detail="SKU already exists") from error
	db.refresh(product)
	return _sku_response(db, product)


@router.get("/products/{product_id}", response_model=SKUResponse)
def get_product(product_id: int, db: Session = Depends(get_inventory_db)):
	product = db.get(SKU, product_id)
	if product is None:
		raise HTTPException(status_code=404, detail="Product not found")
	return _sku_response(db, product)


@router.post("/orders/inbound", response_model=StockEntryResponse, status_code=201)
def create_inbound_order(
	payload: StockEntryCreate,
	db: Session = Depends(get_inventory_db),
	current_user: dict = Depends(get_current_user),
):
	product = db.get(SKU, payload.sku_id)
	if product is None:
		raise HTTPException(status_code=404, detail="Product not found")
	if product.warehouse != payload.warehouse:
		raise HTTPException(status_code=400, detail="Warehouse does not match SKU")

	order = StockEntry(
		**payload.model_dump(),
		user_uuid=_authenticated_user_uuid(current_user),
	)
	db.add(order)
	db.commit()
	db.refresh(order)
	return StockEntryResponse(
		id=order.id, created_at=order.created_at, user_uuid=order.user_uuid,
		quantity=order.quantity, warehouse=order.warehouse,
		reference=order.reference, sku=SKUReference.model_validate(product),
	)


@router.post("/orders/outbound", response_model=StockExitResponse, status_code=201)
def create_outbound_order(
	payload: StockExitCreate,
	db: Session = Depends(get_inventory_db),
	current_user: dict = Depends(get_current_user),
):
	product = db.exec(
		select(SKU).where(SKU.id == payload.sku_id).with_for_update()
	).first()
	if product is None:
		raise HTTPException(status_code=404, detail="Product not found")
	if product.warehouse != payload.warehouse:
		raise HTTPException(status_code=400, detail="Warehouse does not match SKU")

	available = calculate_stock(db, product.id, payload.warehouse)
	if payload.quantity > available:
		raise HTTPException(
			status_code=400,
			detail=(
				f"Insufficient stock for SKU '{product.sku}'. Available: {available}, "
				f"requested: {payload.quantity}."
			),
		)

	order = StockExit(
		**payload.model_dump(),
		user_uuid=_authenticated_user_uuid(current_user),
	)
	db.add(order)
	db.commit()
	db.refresh(order)
	return StockExitResponse(
		id=order.id, created_at=order.created_at, user_uuid=order.user_uuid,
		quantity=order.quantity, warehouse=order.warehouse,
		exit_type=order.exit_type, tracking_number=order.tracking_number,
		sku=SKUReference.model_validate(product),
	)


@router.get("/orders", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_inventory_db)):
	entry_rows = db.exec(select(StockEntry, SKU).join(SKU)).all()
	exit_rows = db.exec(select(StockExit, SKU).join(SKU)).all()

	movements = []
	for entry, product in entry_rows:
		movements.append(OrderResponse(
			id=entry.id,
			movement_type="inbound",
			quantity=entry.quantity,
			created_at=entry.created_at,
			user_uuid=entry.user_uuid,
			warehouse=entry.warehouse,
			reference=entry.reference,
			sku=SKUReference.model_validate(product),
		))
	for order, product in exit_rows:
		movements.append(OrderResponse(
			id=order.id,
			movement_type="outbound",
			quantity=order.quantity,
			created_at=order.created_at,
			user_uuid=order.user_uuid,
			warehouse=order.warehouse,
			exit_type=order.exit_type,
			tracking_number=order.tracking_number,
			sku=SKUReference.model_validate(product),
		))

	return sorted(movements, key=lambda movement: movement.created_at)
