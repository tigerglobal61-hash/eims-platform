import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_DB_PATH = Path(__file__).resolve().parents[2] / "data" / "alerts.db"


def _utc_now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_iso(value):
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def _duration_seconds(started_at, ended_at=None):
    start = _parse_iso(started_at)
    end = _parse_iso(ended_at) if ended_at else datetime.now(timezone.utc)
    if not start or not end:
        return 0
    return max(0, int((end - start).total_seconds()))


class AlertStore:
    def __init__(self, db_path=DEFAULT_DB_PATH):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS alerts (
                    alert_id TEXT PRIMARY KEY,
                    device_id TEXT NOT NULL,
                    category TEXT NOT NULL,
                    level TEXT NOT NULL,
                    started_at TEXT NOT NULL,
                    ended_at TEXT,
                    start_value REAL NOT NULL,
                    latest_value REAL NOT NULL,
                    threshold REAL NOT NULL,
                    last_seen TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('active', 'resolved'))
                )
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_alerts_active_lookup
                ON alerts(device_id, category, status)
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_alerts_started_at
                ON alerts(started_at DESC)
                """
            )

    def get_active_alert(self, device_id, category):
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT * FROM alerts
                WHERE device_id = ? AND category = ? AND status = 'active'
                ORDER BY started_at DESC
                LIMIT 1
                """,
                (device_id, category),
            ).fetchone()
            return dict(row) if row else None

    def create_alert(
        self,
        device_id,
        category,
        level,
        started_at,
        start_value,
        latest_value,
        threshold,
        last_seen,
    ):
        alert_id = str(uuid.uuid4())
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO alerts (
                    alert_id, device_id, category, level, started_at, ended_at,
                    start_value, latest_value, threshold, last_seen, status
                ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 'active')
                """,
                (
                    alert_id,
                    device_id,
                    category,
                    level,
                    started_at,
                    start_value,
                    latest_value,
                    threshold,
                    last_seen,
                ),
            )
        return alert_id

    def update_active_alert(self, alert_id, latest_value, last_seen):
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE alerts
                SET latest_value = ?, last_seen = ?
                WHERE alert_id = ? AND status = 'active'
                """,
                (latest_value, last_seen, alert_id),
            )

    def resolve_alert(self, alert_id, ended_at, latest_value):
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE alerts
                SET ended_at = ?, latest_value = ?, last_seen = ?, status = 'resolved'
                WHERE alert_id = ? AND status = 'active'
                """,
                (ended_at, latest_value, ended_at, alert_id),
            )

    def list_alerts(self, limit=100):
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT * FROM alerts
                ORDER BY
                    CASE WHEN status = 'active' THEN 0 ELSE 1 END,
                    started_at DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
            return [self.serialize_alert(dict(row)) for row in rows]

    def serialize_alert(self, row):
        duration_seconds = _duration_seconds(row["started_at"], row["ended_at"])
        return {
            "alert_id": row["alert_id"],
            "device_id": row["device_id"],
            "category": row["category"],
            "level": row["level"],
            "started_at": row["started_at"],
            "ended_at": row["ended_at"],
            "duration_seconds": duration_seconds,
            "start_value": row["start_value"],
            "latest_value": row["latest_value"],
            "threshold": row["threshold"],
            "last_seen": row["last_seen"],
            "status": row["status"],
        }
