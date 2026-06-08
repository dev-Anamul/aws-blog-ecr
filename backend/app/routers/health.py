import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/health")
def health_check(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@router.get("/health/ready")
def readiness_check(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        logger.exception("Database readiness check failed")
        return {"status": "not_ready"}
