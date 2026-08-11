import logging

from fastapi import APIRouter, Query, Request

from app.alerts.service import evaluate_all_alerts
from app.thresholds import ALERT_AVERAGE_MINUTES

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/v1", tags=["alerts"])


@router.get("/alerts")
def list_alerts(
    request: Request,
    limit: int = Query(100, ge=1, le=500),
    evaluate: bool = Query(True),
):
    store = request.app.state.alert_store
    query_api = request.app.state.query_api

    if evaluate:
        try:
            result = evaluate_all_alerts(query_api, store, ALERT_AVERAGE_MINUTES)
            alerts = result["alerts"][:limit]
            return {
                "window_minutes": result["window_minutes"],
                "evaluated_at": result["evaluated_at"],
                "alerts": alerts,
            }
        except Exception:
            logger.exception("Alert evaluation failed; returning persisted alerts")

    return {
        "window_minutes": ALERT_AVERAGE_MINUTES,
        "evaluated_at": None,
        "alerts": store.list_alerts(limit=limit),
    }
