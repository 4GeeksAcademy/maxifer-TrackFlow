"""Public projections independent of persistence and write payloads."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ApiErrorResponse(BaseModel):
    error: str
    message: str


class ValidationErrorResponse(ApiErrorResponse):
    field: str


class HTTPErrorResponse(BaseModel):
    detail: str


class IncidentListItem(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    origin: str
    branch: str
    created_at: datetime
    updated_at: datetime


class IncidentResponse(IncidentListItem):
    """Public incident without the importer's internal source_id."""


class IncidentSummaryResponse(BaseModel):
    total: int
    by_status: dict[str, int]
    by_category: dict[str, int]
    by_origin: dict[str, int]
    by_branch: dict[str, int]


class AnalysisBreakdown(BaseModel):
    count: int
    percentage: float


class SatisfactionResponse(BaseModel):
    closed_cases: int
    scored_cases: int
    average: float | None
    scores: dict[str, int]


class IncidentAnalysisResponse(BaseModel):
    company: Literal["TRACKFLOW"]
    source_file: str
    total_records: int
    valid_records: int
    invalid_records: int
    invalid_breakdown: dict[str, int]
    by_category: dict[str, AnalysisBreakdown]
    by_status: dict[str, AnalysisBreakdown]
    by_country: dict[str, AnalysisBreakdown]
    satisfaction: SatisfactionResponse


class RAGSourceResponse(BaseModel):
    source_document: str
    section: str


class RAGQueryResponse(BaseModel):
    answer: str
    sources: list[RAGSourceResponse]
    retrieved_count: int
    abstained: bool
