from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo
from app.auth.routes import router as auth_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from influxdb_client import InfluxDBClient, Point
from pydantic import BaseModel

from app.config import INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET
import requests

app = FastAPI(title="EIMS API")

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SITE_TIMEZONE = ZoneInfo("America/Indiana/Indianapolis")
DAILY_MAX_FIELDS = ("noise_dba", "pm25", "pm10")


def get_influx_client():
    return InfluxDBClient(
        url=INFLUX_URL,
        token=INFLUX_TOKEN,
        org=INFLUX_ORG,
    )


class SensorData(BaseModel):
    device_id: str
    site_id: str = "HEP"
    zone: str = "Z2"
    comm_type: str = "LTE"
    deployment_status: str = "active"

    noise_dba: Optional[float] = None
    pm1: Optional[float] = None
    pm25: Optional[float] = None
    pm4: Optional[float] = None
    pm10: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    light: Optional[float] = None
    battery: Optional[float] = None
    rssi: Optional[float] = None
    qc_flag: float = 0.0


@app.get("/")
def root():
    return {"message": "EIMS API is running"}


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/data")
def receive_data(data: SensorData):
    point = (
        Point("sensor_data")
        .tag("site_id", data.site_id)
        .tag("zone", data.zone)
        .tag("device_id", data.device_id)
        .tag("comm_type", data.comm_type)
        .tag("deployment_status", data.deployment_status)
        .time(datetime.now(timezone.utc))
    )

    fields = data.dict()

    for key, value in fields.items():
        if key in ["site_id", "zone", "device_id", "comm_type", "deployment_status"]:
            continue
        if value is not None:
            point = point.field(key, value)

    with get_influx_client() as client:
        write_api = client.write_api()
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)

    return {
        "status": "received",
        "device_id": data.device_id,
        "site_id": data.site_id,
        "zone": data.zone,
    }


@app.get("/api/v1/latest")
def latest(device_id: str = "T1"):
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -24h)
      |> filter(fn: (r) => r["_measurement"] == "sensor_data")
      |> filter(fn: (r) => r["device_id"] == "{device_id}")
      |> last()
    '''

    result = {}

    with get_influx_client() as client:
        query_api = client.query_api()
        tables = query_api.query(query)

        for table in tables:
            for record in table.records:
                result[record.get_field()] = record.get_value()
                result["time"] = record.get_time().isoformat()
                result["device_id"] = record.values.get("device_id")
                result["site_id"] = record.values.get("site_id")
                result["zone"] = record.values.get("zone")

    return result


@app.get("/api/v1/history")
def history(device_id: str = "T1", field: str = "noise_dba", hours: int = 1):
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -{hours}h)
      |> filter(fn: (r) => r["_measurement"] == "sensor_data")
      |> filter(fn: (r) => r["device_id"] == "{device_id}")
      |> filter(fn: (r) => r["_field"] == "{field}")
    '''

    data = []

    with get_influx_client() as client:
        query_api = client.query_api()
        tables = query_api.query(query)

        for table in tables:
            for record in table.records:
                data.append({
                    "time": record.get_time().isoformat(),
                    "value": record.get_value(),
                    "field": record.get_field(),
                    "device_id": record.values.get("device_id"),
                })

    return data

NOAA_BASE_URL = "https://api.weather.gov"

SITE_COORDINATES = {
    "HEP": {
        "latitude": 40.47214633854291,
        "longitude": -86.92019547763846,
    }
}

ALERT_SEVERITY_RANK = {
    "Extreme": 0,
    "Severe": 1,
    "Moderate": 2,
    "Minor": 3,
    "Unknown": 4,
}


def noaa_get(url: str):
    response = requests.get(
        url,
        headers={
            "Accept": "application/geo+json",
            "User-Agent": "EIMS Platform (environmental-monitoring, seo191@purdue.edu)",
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def map_forecast_period(period):
    if not period:
        return None

    return {
        "name": period.get("name"),
        "temperature": period.get("temperature"),
        "temperatureUnit": period.get("temperatureUnit"),
        "windSpeed": period.get("windSpeed"),
        "windDirection": period.get("windDirection"),
        "shortForecast": period.get("shortForecast"),
        "detailedForecast": period.get("detailedForecast"),
        "icon": period.get("icon"),
    }


def extract_today_tomorrow(periods):
    if not periods:
        return {
            "today": None,
            "tomorrow": None,
        }

    today = next((p for p in periods if p.get("name", "").lower().startswith("today")), None)
    tomorrow = next((p for p in periods if p.get("name", "").lower().startswith("tomorrow")), None)

    if today is None:
        today = next((p for p in periods if p.get("isDaytime")), periods[0])

    if tomorrow is None:
        today_index = periods.index(today)
        tomorrow = next(
            (p for p in periods[today_index + 1:] if p.get("isDaytime")),
            periods[today_index + 1] if today_index + 1 < len(periods) else None,
        )

    return {
        "today": map_forecast_period(today),
        "tomorrow": map_forecast_period(tomorrow),
    }


def map_alert(feature):
    properties = feature.get("properties", {}) if feature else {}

    return {
        "event": properties.get("event", "Weather Alert"),
        "severity": properties.get("severity", "Unknown"),
        "expires": properties.get("expires"),
        "headline": properties.get("headline") or properties.get("event") or "Weather Alert",
    }


@app.get("/api/v1/weather")
def weather(site_id: str = "HEP"):
    site = SITE_COORDINATES.get(site_id.upper(), SITE_COORDINATES["HEP"])
    latitude = site["latitude"]
    longitude = site["longitude"]

    points_payload = noaa_get(f"{NOAA_BASE_URL}/points/{latitude},{longitude}")
    forecast_url = points_payload.get("properties", {}).get("forecast")

    if not forecast_url:
        return {
            "forecast": {
                "today": None,
                "tomorrow": None,
            },
            "alerts": [],
        }

    forecast_payload = noaa_get(forecast_url)
    forecast = extract_today_tomorrow(
        forecast_payload.get("properties", {}).get("periods", [])
    )

    alerts_payload = noaa_get(
        f"{NOAA_BASE_URL}/alerts/active?point={latitude},{longitude}"
    )

    alerts = [
        map_alert(feature)
        for feature in alerts_payload.get("features", [])
    ]

    alerts = sorted(
        alerts,
        key=lambda alert: ALERT_SEVERITY_RANK.get(alert.get("severity"), 99),
    )

    return {
        "site_id": site_id.upper(),
        "latitude": latitude,
        "longitude": longitude,
        "forecast": forecast,
        "alerts": alerts,
    }
    
@app.get("/api/v1/latest_avg")
def latest_avg(device_id: str = "T1", minutes: int = 15):
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

    result = {
        "device_id": device_id,
        "window_minutes": minutes,
    }

    with get_influx_client() as client:
        query_api = client.query_api()
        tables = query_api.query(query)

        for table in tables:
            for record in table.records:
                result[record.get_field()] = round(record.get_value(), 2)

    result["time"] = datetime.now(timezone.utc).isoformat()
    return result


def _round_chart_value(value):
    if value is None:
        return None
    return round(float(value), 2)


def _format_chart_time(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _flux_time(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _empty_daily_max_entry():
    return {"max": None, "time": None}


@app.get("/api/v1/daily_max")
def daily_max(device_id: str = "T1"):
    now_site = datetime.now(SITE_TIMEZONE)
    start_site = now_site.replace(hour=0, minute=0, second=0, microsecond=0)
    start_utc = start_site.astimezone(timezone.utc)
    start_time = _flux_time(start_utc)

    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: time(v: "{start_time}"), stop: now())
      |> filter(fn: (r) => r["_measurement"] == "sensor_data")
      |> filter(fn: (r) => r["device_id"] == "{device_id}")
      |> filter(fn: (r) =>
        r["_field"] == "noise_dba" or
        r["_field"] == "pm25" or
        r["_field"] == "pm10"
      )
      |> group(columns: ["_field"])
      |> sort(columns: ["_value"], desc: true)
      |> limit(n: 1)
    '''

    result = {
        "device_id": device_id,
        "date": start_site.strftime("%Y-%m-%d"),
        **{field: _empty_daily_max_entry() for field in DAILY_MAX_FIELDS},
    }

    with get_influx_client() as client:
        query_api = client.query_api()
        tables = query_api.query(query)

        for table in tables:
            for record in table.records:
                field = record.get_field()
                if field not in DAILY_MAX_FIELDS:
                    continue

                value = record.get_value()
                if value is None:
                    continue

                result[field] = {
                    "max": round(float(value), 2),
                    "time": _format_chart_time(record.get_time()),
                }

    return result


@app.get("/api/v1/chart")
def chart(device_id: str = "T1", hours: int = 24, window_minutes: int = 15):
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -{hours}h)
      |> filter(fn: (r) => r["_measurement"] == "sensor_data")
      |> filter(fn: (r) => r["device_id"] == "{device_id}")
      |> filter(fn: (r) =>
        r["_field"] == "noise_dba" or
        r["_field"] == "pm10" or
        r["_field"] == "pm25"
      )
      |> aggregateWindow(every: {window_minutes}m, fn: mean, createEmpty: false)
      |> group()
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    '''

    data = []

    with get_influx_client() as client:
        query_api = client.query_api()
        tables = query_api.query(query)

        for table in tables:
            for record in table.records:
                values = record.values
                data.append({
                    "time": _format_chart_time(record.get_time()),
                    "noise": _round_chart_value(values.get("noise_dba")),
                    "pm10": _round_chart_value(values.get("pm10")),
                    "pm25": _round_chart_value(values.get("pm25")),
                })

    data.sort(key=lambda point: point["time"])
    return data
