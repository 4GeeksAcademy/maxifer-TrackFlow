"""Validated representation of a stored TrackFlow incident."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, model_validator
from packages.shared.incidents import validate_incident


class Incident(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: int | None = None
    source_id: str | None = None
    title: str
    description: str
    category: str
    status: str
    origin: str
    branch: str
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="after")
    def check_domain(self):
        validate_incident(self.model_dump(include={"title", "description", "category", "status", "origin", "branch"}))
        return self
