import tempfile
import unittest
from datetime import datetime, timedelta, timezone

from app.alerts.evaluator import process_metric_reading
from app.alerts.store import AlertStore


class AlertEvaluatorTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.NamedTemporaryFile(suffix=".db")
        self.store = AlertStore(self._tmp.name)
        self.device_id = "D3"
        self.category = "Noise"
        self.metric_key = "noise"

    def tearDown(self):
        self._tmp.close()
        self.device_id = "D3"
        self.category = "Noise"
        self.metric_key = "noise"

    def _at(self, hour, minute):
        base = datetime(2026, 8, 11, 9, 0, tzinfo=timezone.utc)
        return (base + timedelta(hours=hour - 9, minutes=minute - 0)).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    def test_d3_noise_transition_sequence(self):
        timeline = [
            (self._at(9, 0), 68, None),
            (self._at(9, 10), 71, "Attention"),
            (self._at(9, 20), 72, "Attention"),
            (self._at(9, 30), 76, "Elevated"),
            (self._at(9, 45), 77, "Elevated"),
            (self._at(10, 0), 82, "High"),
            (self._at(10, 20), 78, "Elevated"),
            (self._at(10, 40), 67, None),
        ]

        for observed_at, value, expected_active_level in timeline:
            process_metric_reading(
                self.store,
                self.device_id,
                self.category,
                self.metric_key,
                value,
                observed_at,
            )
            active = self.store.get_active_alert(self.device_id, self.category)
            if expected_active_level is None:
                self.assertIsNone(active, f"Expected no active alert at {observed_at}")
            else:
                self.assertIsNotNone(active, f"Expected active alert at {observed_at}")
                self.assertEqual(active["level"], expected_active_level)

        alerts = self.store.list_alerts(limit=20)
        self.assertEqual(len(alerts), 4)

        alert_a, alert_b, alert_c, alert_d = sorted(alerts, key=lambda item: item["started_at"])

        self.assertEqual(alert_a["level"], "Attention")
        self.assertEqual(alert_a["started_at"], self._at(9, 10))
        self.assertEqual(alert_a["ended_at"], self._at(9, 30))
        self.assertEqual(alert_a["duration_seconds"], 20 * 60)

        self.assertEqual(alert_b["level"], "Elevated")
        self.assertEqual(alert_b["started_at"], self._at(9, 30))
        self.assertEqual(alert_b["ended_at"], self._at(10, 0))
        self.assertEqual(alert_b["duration_seconds"], 30 * 60)

        self.assertEqual(alert_c["level"], "High")
        self.assertEqual(alert_c["started_at"], self._at(10, 0))
        self.assertEqual(alert_c["ended_at"], self._at(10, 20))
        self.assertEqual(alert_c["duration_seconds"], 20 * 60)

        self.assertEqual(alert_d["level"], "Elevated")
        self.assertEqual(alert_d["started_at"], self._at(10, 20))
        self.assertEqual(alert_d["ended_at"], self._at(10, 40))
        self.assertEqual(alert_d["duration_seconds"], 20 * 60)

    def test_same_level_does_not_create_duplicate(self):
        first_at = self._at(10, 0)
        second_at = self._at(10, 5)

        process_metric_reading(self.store, self.device_id, self.category, self.metric_key, 71, first_at)
        process_metric_reading(self.store, self.device_id, self.category, self.metric_key, 72, second_at)

        alerts = self.store.list_alerts(limit=10)
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]["level"], "Attention")
        self.assertEqual(alerts[0]["started_at"], first_at)
        self.assertEqual(alerts[0]["latest_value"], 72)
        self.assertEqual(alerts[0]["last_seen"], second_at)

    def test_reentry_after_normal_creates_new_event(self):
        first_start = self._at(10, 0)
        first_end = self._at(10, 20)
        second_start = self._at(11, 0)

        process_metric_reading(self.store, self.device_id, self.category, self.metric_key, 71, first_start)
        process_metric_reading(self.store, self.device_id, self.category, self.metric_key, 68, first_end)
        process_metric_reading(self.store, self.device_id, self.category, self.metric_key, 72, second_start)

        alerts = self.store.list_alerts(limit=10)
        self.assertEqual(len(alerts), 2)
        resolved, active = sorted(alerts, key=lambda item: item["started_at"])

        self.assertEqual(resolved["status"], "resolved")
        self.assertEqual(resolved["started_at"], first_start)
        self.assertEqual(resolved["ended_at"], first_end)

        self.assertEqual(active["status"], "active")
        self.assertEqual(active["started_at"], second_start)
        self.assertIsNone(active["ended_at"])


if __name__ == "__main__":
    unittest.main()
