from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.routes import documents

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""

    app = FastAPI(
        title=settings.API_TITLE,
        version=settings.API_VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json"
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(documents.router, prefix=settings.API_PREFIX)

    @app.get("/")
    async def root():
        return {
            "message": "MedIntel API",
            "version": settings.API_VERSION,
            "docs": "/api/docs"
        }

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    logger.info(f"FastAPI application created - Environment: {settings.ENVIRONMENT}")

    return app


app = create_app()
