from app.thresholds import get_alert_level, get_threshold_for_level


def process_metric_reading(store, device_id, category, metric_key, value, observed_at):
    """
    Apply alert transition rules for one node + category reading.

    Rules:
    - Normal: resolve active alert if present; never create Normal alerts
    - Same non-Normal level: update active alert only (no duplicate)
    - Level change: resolve previous alert, create new alert for new level
    """
    new_level = get_alert_level(value, metric_key)
    active = store.get_active_alert(device_id, category)

    if new_level == "Normal":
        if active:
            store.resolve_alert(active["alert_id"], observed_at, value if value is not None else active["latest_value"])
        return None

    if value is None:
        return active

    threshold = get_threshold_for_level(new_level, metric_key)

    if not active:
        alert_id = store.create_alert(
            device_id=device_id,
            category=category,
            level=new_level,
            started_at=observed_at,
            start_value=value,
            latest_value=value,
            threshold=threshold,
            last_seen=observed_at,
        )
        return alert_id

    if active["level"] == new_level:
        store.update_active_alert(active["alert_id"], value, observed_at)
        return active["alert_id"]

    store.resolve_alert(active["alert_id"], observed_at, value)
    alert_id = store.create_alert(
        device_id=device_id,
        category=category,
        level=new_level,
        started_at=observed_at,
        start_value=value,
        latest_value=value,
        threshold=threshold,
        last_seen=observed_at,
    )
    return alert_id
