import sys
from pathlib import Path

from fastapi import (
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)

from fastapi.responses import (
    Response,
)


# Permite ejecutar la app desde distintos cwd (raíz o services/api).
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))


from packages.incidents_analysis import (
    analyze_csv_text,
    summary_to_csv,
)

from services.api.routers.suppliers import (
    router as suppliers_router,
)


app = FastAPI(
    title=(
        "TrackFlow Incidents API"
    ),
    version="1.0.0",
)


app.include_router(
    suppliers_router
)


LAST_ANALYSIS = None


@app.get("/")
def root():

    return {
        "message":
            (
                "TrackFlow Incidents "
                "API is running"
            )
    }


@app.post(
    "/api/incidents/analyze"
)
async def analyze_incidents(
    file: UploadFile = File(...)
):

    global LAST_ANALYSIS


    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail=(
                "El fichero "
                "no tiene nombre."
            ),
        )


    if not (
        file.filename
        .lower()
        .endswith(".csv")
    ):

        raise HTTPException(
            status_code=415,
            detail=(
                "El fichero debe "
                "tener extensión .csv."
            ),
        )


    content = await file.read()


    if not content:

        raise HTTPException(
            status_code=400,
            detail=(
                "El fichero está vacío."
            ),
        )


    try:

        text = content.decode(
            "utf-8-sig"
        )


    except UnicodeDecodeError as error:

        raise HTTPException(
            status_code=400,
            detail=(
                "El fichero debe "
                "utilizar codificación "
                "UTF-8."
            ),
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


@app.get(
    "/api/incidents/results/export"
)
def export_results():

    if LAST_ANALYSIS is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Todavía no existe "
                "ningún análisis "
                "para exportar."
            ),
        )


    csv_content = (
        summary_to_csv(
            LAST_ANALYSIS
        )
    )


    return Response(
        content=csv_content,

        media_type="text/csv",

        headers={
            "Content-Disposition":
                (
                    "attachment; "
                    'filename="results.csv"'
                )
        },
    )
