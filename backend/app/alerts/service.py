from datetime import datetime, timezone

from app.config import INFLUX_BUCKET
from app.thresholds import ALERT_AVERAGE_MINUTES, ALERT_CATEGORIES
from app.alerts.evaluator import process_metric_reading

SITE_DEVICE_IDS = ("D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8")


def _utc_now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def fetch_device_averages(query_api, device_id, minutes=ALERT_AVERAGE_MINUTES):
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -{minutes}m)
      |> filter(fn: (r) => r["_measurement"] == "sensor_data")
      |> filter(fn: (r) => r["device_id"] == "{device_id}")
      |> filter(fn: (r) =>
        r["_field"] == "noise_dba" or
        r["_field"] == "pm10" or
        r["_field"] == "pm25"
      )
      |> group(columns: ["_field"])
      |> mean()
    '''

    result = {}
    tables = query_api.query(query)

    for table in tables:
        for record in table.records:
            result[record.get_field()] = round(record.get_value(), 2)

    return result


def evaluate_all_alerts(query_api, store, window_minutes=ALERT_AVERAGE_MINUTES):
    observed_at = _utc_now_iso()

    for device_id in SITE_DEVICE_IDS:
        averages = fetch_device_averages(query_api, device_id, window_minutes)

        for category_config in ALERT_CATEGORIES:
            field = category_config["field"]
            value = averages.get(field)
            process_metric_reading(
                store=store,
                device_id=device_id,
                category=category_config["category"],
                metric_key=category_config["metric_key"],
                value=value,
                observed_at=observed_at,
            )

    return {
        "window_minutes": window_minutes,
        "evaluated_at": observed_at,
        "alerts": store.list_alerts(),
    }
