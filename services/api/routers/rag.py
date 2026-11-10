from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from services.api.schemas_responses import HTTPErrorResponse, RAGQueryResponse

from services.api.security import get_current_user


router = APIRouter(prefix="/api/rag", tags=["rag"])


class RAGQueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str = Field(max_length=2000)

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("La consulta no puede estar vacía")
        return value


@router.post("/query", response_model=RAGQueryResponse, responses={503: {"model": HTTPErrorResponse}})
def query_knowledge(
    payload: RAGQueryRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        from data.pipelines.rag import (
            RAGConfigurationError,
            RAGUnavailableError,
            query,
        )
    except ModuleNotFoundError as error:
        if error.name == "data" or (error.name and error.name.startswith("data.")):
            raise HTTPException(
                status_code=503,
                detail="El pipeline RAG no está disponible en este despliegue.",
            ) from error
        raise

    try:
        return query(payload.question)
    except RAGConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except RAGUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
