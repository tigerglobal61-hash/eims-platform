import random
import time
from datetime import datetime, timezone
import requests

API_URL = "https://eims-api.onrender.com/api/v1/data"

DEVICE_ID = "T1"
SITE_ID = "HEP"
ZONE = "Z2"
COMM_TYPE = "LTE"
DEPLOYMENT_STATUS = "active"


def make_value():
    noise = round(random.uniform(58, 78), 1)
    pm1 = round(random.uniform(2, 8), 1)
    pm25 = round(random.uniform(8, 25), 1)
    pm4 = round(pm25 + random.uniform(2, 8), 1)
    pm10 = round(pm4 + random.uniform(4, 15), 1)
    temperature = round(random.uniform(24, 32), 1)
    humidity = round(random.uniform(45, 72), 1)
    light = round(random.uniform(500, 4500), 0)
    battery = round(random.uniform(82, 96), 1)
    rssi = round(random.uniform(-90, -60), 0)

    qc_flag = 0
    if noise > 70 or pm25 > 20 or rssi < -85:
        qc_flag = 1

    return {
        "device_id": DEVICE_ID,
        "site_id": SITE_ID,
        "zone": ZONE,
        "comm_type": COMM_TYPE,
        "deployment_status": DEPLOYMENT_STATUS,
        "noise_dba": noise,
        "pm1": pm1,
        "pm25": pm25,
        "pm4": pm4,
        "pm10": pm10,
        "temperature": temperature,
        "humidity": humidity,
        "light": light,
        "battery": battery,
        "rssi": rssi,
        "qc_flag": qc_flag,
    }


if __name__ == "__main__":
    print("EIMS LTE-style simulator started...")
    print("Simulator → FastAPI → InfluxDB")
    print("Press Ctrl + C to stop.")

    while True:
        payload = make_value()

        try:
            response = requests.post(API_URL, json=payload, timeout=5)
            now = datetime.now(timezone.utc).isoformat()

            if response.status_code == 200:
                print(f"[{now}] OK | {payload}")
            else:
                print(f"[{now}] ERROR {response.status_code} | {response.text}")

        except Exception as e:
            print("REQUEST ERROR:", e)

        time.sleep(5)
