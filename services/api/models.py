from datetime import datetime, timezone
from enum import Enum

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


VALID_CATEGORIES = [
	"carrier_last_mile",
	"carrier_international",
	"warehouse_supplies",
	"packaging_materials",
	"reverse_logistics",
	"fleet_maintenance",
	"it_and_wms_software",
	"cleaning_and_facilities",
]


class SupplierCountry(str, Enum):
    USA = "USA"
    SPAIN = "Spain"


class SupplierCurrency(str, Enum):
	USD = "USD"
	EUR = "EUR"


class SupplierStatus(str, Enum):
	ACTIVE = "active"
	SUSPENDED = "suspended"


class SupplierCategory(str, Enum):
	CARRIER_LAST_MILE = "carrier_last_mile"
	CARRIER_INTERNATIONAL = "carrier_international"
	WAREHOUSE_SUPPLIES = "warehouse_supplies"
	PACKAGING_MATERIALS = "packaging_materials"
	REVERSE_LOGISTICS = "reverse_logistics"
	FLEET_MAINTENANCE = "fleet_maintenance"
	IT_AND_WMS_SOFTWARE = "it_and_wms_software"
	CLEANING_AND_FACILITIES = "cleaning_and_facilities"


class SupplierBase(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str = Field(min_length=1)
    country: SupplierCountry
    categories: list[SupplierCategory] = Field(min_length=1)
    rate_per_shipment: float = Field(gt=0)
    currency: SupplierCurrency
    status: SupplierStatus
    service_zone: str | None = None
    contact_email: str | None = None
    notes: str | None = None

    @field_validator("categories")
    @classmethod
    def validate_categories_not_empty(cls, values: list[SupplierCategory]) -> list[SupplierCategory]:
        if not values:
            raise ValueError("categories debe contener al menos una categoría.")
        return values

    @model_validator(mode="after")
    def validate_currency_by_country(self) -> "SupplierBase":
        if self.country == SupplierCountry.USA and self.currency != SupplierCurrency.USD:
            raise ValueError('currency debe ser "USD" cuando country es "USA".')

        if self.country == SupplierCountry.SPAIN and self.currency != SupplierCurrency.EUR:
            raise ValueError('currency debe ser "EUR" cuando country es "Spain".')

        return self


class SupplierCreate(SupplierBase):
    pass


class SupplierResponse(SupplierBase):
	id: str
	updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SupplierRateUpdate(BaseModel):
	model_config = ConfigDict(
		extra="forbid",
	)

	rate_per_shipment: float = Field(gt=0)


class SupplierStatusUpdate(BaseModel):
	model_config = ConfigDict(
		extra="forbid",
	)

	status: SupplierStatus
