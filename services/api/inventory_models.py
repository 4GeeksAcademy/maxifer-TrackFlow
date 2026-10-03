from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import CheckConstraint
from sqlmodel import Field, Relationship, SQLModel


class SKU(SQLModel, table=True):
	__tablename__ = "inventory_skus"
	__table_args__ = (
		CheckConstraint("category IN ('fashion', 'electronics', 'cosmetics')"),
		CheckConstraint("warehouse IN ('LA', 'ZGZ')"),
	)

	id: int | None = Field(default=None, primary_key=True)
	name: str
	sku: str = Field(index=True, unique=True)
	client_name: str
	category: str
	warehouse: str

	entries: list["StockEntry"] = Relationship(back_populates="product")
	exits: list["StockExit"] = Relationship(back_populates="product")


class StockEntry(SQLModel, table=True):
	__tablename__ = "inventory_stock_entries"
	__table_args__ = (
		CheckConstraint("quantity > 0"),
		CheckConstraint("warehouse IN ('LA', 'ZGZ')"),
	)

	id: int | None = Field(default=None, primary_key=True)
	sku_id: int = Field(foreign_key="inventory_skus.id", index=True)
	quantity: int
	reference: str
	warehouse: str
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
	user_uuid: str

	product: Optional[SKU] = Relationship(back_populates="entries")


class StockExit(SQLModel, table=True):
	__tablename__ = "inventory_stock_exits"
	__table_args__ = (
		CheckConstraint("quantity > 0"),
		CheckConstraint("warehouse IN ('LA', 'ZGZ')"),
		CheckConstraint("exit_type IN ('dispatch', 'loss')"),
		CheckConstraint(
			"(exit_type = 'dispatch' AND tracking_number IS NOT NULL) OR "
			"(exit_type = 'loss' AND tracking_number IS NULL)"
		),
	)

	id: int | None = Field(default=None, primary_key=True)
	sku_id: int = Field(foreign_key="inventory_skus.id", index=True)
	quantity: int
	exit_type: str
	tracking_number: str | None = None
	warehouse: str
	created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
	user_uuid: str

	product: Optional[SKU] = Relationship(back_populates="exits")