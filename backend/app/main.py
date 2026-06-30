from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from influxdb_client import InfluxDBClient, Point
from pydantic import BaseModel

from app.config import INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET


app = FastAPI(title="EIMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
