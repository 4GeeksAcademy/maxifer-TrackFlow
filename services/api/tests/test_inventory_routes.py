import pytest
from fastapi import HTTPException
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from services.api.inventory_models import SKU, StockEntry, StockExit
from services.api.routers import inventory
from services.api.schemas import SKUCreate, StockEntryCreate, StockExitCreate


@pytest.fixture
def inventory_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    engine.dispose()


def product_payload(sku="TF-001", warehouse="LA"):
    return SKUCreate(
        name="TrackFlow Tote",
        sku=sku,
        client_name="TrackFlow",
        category="fashion",
        warehouse=warehouse,
    )


def add_product(session, sku="TF-001", warehouse="LA"):
    product = SKU(**product_payload(sku, warehouse).model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def add_inbound(session, product, quantity, warehouse=None):
    entry = StockEntry(
        sku_id=product.id,
        quantity=quantity,
        reference="PO-100",
        warehouse=warehouse or product.warehouse,
        user_uuid="user-123",
    )
    session.add(entry)
    session.commit()
    return entry


def test_get_products_returns_empty_then_calculates_stock(inventory_session):
    assert inventory.get_products(db=inventory_session) == []
    product = add_product(inventory_session)
    add_inbound(inventory_session, product, 12)
    inventory_session.add(
        StockExit(
            sku_id=product.id,
            quantity=3,
            exit_type="dispatch",
            tracking_number="TRACK-001",
            warehouse=product.warehouse,
            user_uuid="user-123",
        )
    )
    inventory_session.commit()

    result = inventory.get_products(db=inventory_session)

    assert len(result) == 1
    assert result[0].sku == "TF-001"
    assert result[0].current_stock == 9


def test_create_product_returns_zero_stock_and_rejects_duplicate_sku(inventory_session):
    user = {"id": "user-123"}
    created = inventory.create_product(product_payload(), db=inventory_session, current_user=user)

    assert created.sku == "TF-001"
    assert created.current_stock == 0
    with pytest.raises(HTTPException) as error:
        inventory.create_product(product_payload(), db=inventory_session, current_user=user)
    assert error.value.status_code == 409
    with pytest.raises(HTTPException) as missing_user_id:
        inventory.create_product(product_payload("TF-002"), db=inventory_session, current_user={})
    assert missing_user_id.value.status_code == 401


def test_get_product_returns_current_stock_or_not_found(inventory_session):
    product = add_product(inventory_session)
    add_inbound(inventory_session, product, 4)

    assert inventory.get_product(product.id, db=inventory_session).current_stock == 4
    with pytest.raises(HTTPException) as error:
        inventory.get_product(999, db=inventory_session)
    assert error.value.status_code == 404


def test_create_inbound_order_updates_stock_and_rejects_invalid_target(inventory_session):
    product = add_product(inventory_session)
    user = {"id": "user-123"}
    order = inventory.create_inbound_order(
        StockEntryCreate(sku_id=product.id, quantity=8, reference="PO-101", warehouse="LA"),
        db=inventory_session,
        current_user=user,
    )

    assert order.quantity == 8
    assert inventory.calculate_stock(inventory_session, product.id, "LA") == 8
    with pytest.raises(HTTPException) as mismatch:
        inventory.create_inbound_order(
            StockEntryCreate(sku_id=product.id, quantity=1, reference="PO-102", warehouse="ZGZ"),
            db=inventory_session,
            current_user=user,
        )
    assert mismatch.value.status_code == 400
    with pytest.raises(HTTPException) as missing:
        inventory.create_inbound_order(
            StockEntryCreate(sku_id=999, quantity=1, reference="PO-103", warehouse="LA"),
            db=inventory_session,
            current_user=user,
        )
    assert missing.value.status_code == 404


def test_create_outbound_order_checks_available_stock(inventory_session):
    product = add_product(inventory_session)
    add_inbound(inventory_session, product, 5)
    user = {"id": "user-123"}
    order = inventory.create_outbound_order(
        StockExitCreate(
            sku_id=product.id,
            quantity=3,
            exit_type="dispatch",
            tracking_number="TRACK-002",
            warehouse="LA",
        ),
        db=inventory_session,
        current_user=user,
    )

    assert order.quantity == 3
    assert inventory.calculate_stock(inventory_session, product.id, "LA") == 2
    with pytest.raises(HTTPException) as mismatch:
        inventory.create_outbound_order(
            StockExitCreate(
                sku_id=product.id,
                quantity=1,
                exit_type="loss",
                warehouse="ZGZ",
            ),
            db=inventory_session,
            current_user=user,
        )
    assert mismatch.value.status_code == 400
    with pytest.raises(HTTPException) as insufficient:
        inventory.create_outbound_order(
            StockExitCreate(
                sku_id=product.id,
                quantity=3,
                exit_type="loss",
                warehouse="LA",
            ),
            db=inventory_session,
            current_user=user,
        )
    assert insufficient.value.status_code == 400
    with pytest.raises(HTTPException) as missing:
        inventory.create_outbound_order(
            StockExitCreate(sku_id=999, quantity=1, exit_type="loss", warehouse="LA"),
            db=inventory_session,
            current_user=user,
        )
    assert missing.value.status_code == 404


def test_get_orders_lists_movements_with_updated_stock(inventory_session):
    assert inventory.get_orders(db=inventory_session) == []
    product = add_product(inventory_session)
    add_inbound(inventory_session, product, 10)
    inventory_session.add(
        StockExit(
            sku_id=product.id,
            quantity=2,
            exit_type="loss",
            tracking_number=None,
            warehouse=product.warehouse,
            user_uuid="user-123",
        )
    )
    inventory_session.commit()

    orders = inventory.get_orders(db=inventory_session)

    assert [order.movement_type for order in orders] == ["inbound", "outbound"]
    assert all(order.sku.current_stock == 8 for order in orders)