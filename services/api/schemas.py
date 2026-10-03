from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class InventoryRequest(BaseModel):
	model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class SKUCreate(InventoryRequest):
	name: str = Field(min_length=1)
	sku: str = Field(min_length=1)
	client_name: str = Field(min_length=1)
	category: Literal["fashion", "electronics", "cosmetics"]
	warehouse: Literal["LA", "ZGZ"]


class SKUResponse(SKUCreate):
	id: int
	current_stock: int


class StockEntryCreate(InventoryRequest):
	sku_id: int = Field(gt=0)
	quantity: int = Field(gt=0)
	reference: str = Field(min_length=1)
	warehouse: Literal["LA", "ZGZ"]


class StockExitCreate(InventoryRequest):
	sku_id: int = Field(gt=0)
	quantity: int = Field(gt=0)
	exit_type: Literal["dispatch", "loss"]
	tracking_number: str | None = None
	warehouse: Literal["LA", "ZGZ"]

	@model_validator(mode="after")
	def validate_tracking_number(self):
		if self.exit_type == "dispatch" and not self.tracking_number:
			raise ValueError("tracking_number is required for dispatch")
		if self.exit_type == "loss" and self.tracking_number is not None:
			raise ValueError("tracking_number must be null for loss")
		return self


class StockEntryResponse(StockEntryCreate):
	id: int
	created_at: datetime
	user_uuid: str

	model_config = ConfigDict(from_attributes=True)


class StockExitResponse(StockExitCreate):
	id: int
	created_at: datetime
	user_uuid: str

	model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
	id: int
	movement_type: Literal["inbound", "outbound"]
	quantity: int
	created_at: datetime
	user_uuid: str
	warehouse: Literal["LA", "ZGZ"]
	reference: str | None = None
	exit_type: Literal["dispatch", "loss"] | None = None
	tracking_number: str | None = None
	sku: SKUResponse