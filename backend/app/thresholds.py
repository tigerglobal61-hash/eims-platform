"""Environmental threshold configuration shared by alert evaluation."""

METRIC_THRESHOLDS = {
    "noise": {
        "field": "noise_dba",
        "category": "Noise",
        "levels": [
            {"key": "caution", "value": 70, "label": "Attention"},
            {"key": "warning", "value": 75, "label": "Elevated"},
            {"key": "critical", "value": 80, "label": "High"},
        ],
    },
    "pm10": {
        "field": "pm10",
        "category": "PM10",
        "levels": [
            {"key": "caution", "value": 150, "label": "Attention"},
            {"key": "warning", "value": 160, "label": "Elevated"},
            {"key": "critical", "value": 170, "label": "High"},
        ],
    },
    "pm25": {
        "field": "pm25",
        "category": "PM2.5",
        "levels": [
            {"key": "caution", "value": 35, "label": "Attention"},
            {"key": "warning", "value": 45, "label": "Elevated"},
            {"key": "critical", "value": 55, "label": "High"},
        ],
    },
}

ALERT_CATEGORIES = [
    {"metric_key": "pm10", "category": "PM10", "field": "pm10"},
    {"metric_key": "pm25", "category": "PM2.5", "field": "pm25"},
    {"metric_key": "noise", "category": "Noise", "field": "noise_dba"},
]

ALERT_LEVELS = ("Normal", "Attention", "Elevated", "High")
ALERT_AVERAGE_MINUTES = 60


def get_alert_level(value, metric_key):
    if value is None:
        return "Normal"

    levels = METRIC_THRESHOLDS[metric_key]["levels"]
    if value >= levels[2]["value"]:
        return "High"
    if value >= levels[1]["value"]:
        return "Elevated"
    if value >= levels[0]["value"]:
        return "Attention"
    return "Normal"


def get_threshold_for_level(level, metric_key):
    if level == "Normal":
        return None

    levels = METRIC_THRESHOLDS[metric_key]["levels"]
    for entry in levels:
        if entry["label"] == level:
            return entry["value"]
    return None
