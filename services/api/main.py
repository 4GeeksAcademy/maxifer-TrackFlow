import sys
from pathlib import Path

# Permite ejecutar la app desde distintos cwd (raíz o services/api).
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

import logging
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import Response, JSONResponse

from packages.incidents_analysis import (
    analyze_csv_text,
    summary_to_csv,
)
from services.api.auth import router as auth_router
from services.api.routers.profiles import router as profiles_router
from services.api.routers.suppliers import (
    router as suppliers_router,
)
from services.api.routers.users import router as users_router
from services.api.routers.incidents import router as incidents_router
from services.api.security import get_current_user

app = FastAPI(
    title="TrackFlow Incidents API",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(profiles_router)
app.include_router(suppliers_router)
app.include_router(users_router)
app.include_router(incidents_router)


@app.exception_handler(RequestValidationError)
async def request_validation_error(request: Request, exc: RequestValidationError):
    first = exc.errors()[0]
    location = first.get("loc", ())
    field = str(location[-1]) if location else "unknown"
    return JSONResponse(status_code=400, content={
        "error": "validation_error", "field": field,
        "message": f"El campo {field} es obligatorio" if first.get("type") == "missing" else f"El campo {field} no es válido",
    })


@app.exception_handler(Exception)
async def unexpected_error(request: Request, exc: Exception):
    logging.getLogger(__name__).exception("Unexpected API error", exc_info=exc)
    return JSONResponse(status_code=500, content={"error": "internal_error", "message": "No se pudo completar la operación"})

LAST_ANALYSIS = None


@app.get("/")
def root():
    return {
        "message": "TrackFlow Incidents API is running",
    }


@app.post("/api/incidents/analyze")
async def analyze_incidents(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    global LAST_ANALYSIS

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="El fichero no tiene nombre.",
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=415,
            detail="El fichero debe tener extensión .csv.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="El fichero está vacío.",
        )

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise HTTPException(
            status_code=400,
            detail="El fichero debe utilizar codificación UTF-8.",
        ) from error

    try:
        result = analyze_csv_text(
            text=text,
            source_file=file.filename,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    LAST_ANALYSIS = result
    return result


@app.get("/api/incidents/results/export")
def export_results(
    current_user: dict = Depends(get_current_user),
):
    if LAST_ANALYSIS is None:
        raise HTTPException(
            status_code=404,
            detail="Todavía no existe ningún análisis para exportar.",
        )

    csv_content = summary_to_csv(LAST_ANALYSIS)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="results.csv"',
        },
    )
