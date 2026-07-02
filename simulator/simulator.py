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


def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def get_noise_by_time(now):
    hour = now.hour

    # Daytime: 07:00–19:00
    # Weighted daily average target ≈ 68 dBA
    if 7 <= hour < 19:
        if 7 <= hour < 9:
            mean = 64.5   # preparation
            std = 2.5
        elif 9 <= hour < 12:
            mean = 70.0   # active morning work
            std = 3.0
        elif 12 <= hour < 13:
            mean = 61.5   # lunch break
            std = 2.0
        elif 13 <= hour < 17:
            mean = 71.0   # active afternoon work
            std = 3.0
        else:
            mean = 65.5   # finishing work
            std = 2.5

        noise = random.gauss(mean, std)
        return round(clamp(noise, 55, 82), 1)

    # Nighttime: 19:00–07:00
    # Weighted nighttime average target ≈ 36 dBA
    else:
        if 19 <= hour < 22:
            mean = 41.0   # residual evening noise
            std = 2.0
        elif 22 <= hour or hour < 5:
            mean = 33.5   # quiet nighttime
            std = 1.8
        else:
            mean = 37.0   # early morning background
            std = 2.0

        noise = random.gauss(mean, std)
        return round(clamp(noise, 28, 48), 1)


def get_pm_by_time(now):
    hour = now.hour
    weekday = now.weekday()

    # Weekend: lower construction activity
    if weekday >= 5:
        pm25_mean = 8
        pm10_mean = 18

    # Daytime construction hours
    elif 7 <= hour < 19:
        if 7 <= hour < 9:
            pm25_mean = 11
            pm10_mean = 30
        elif 9 <= hour < 12:
            pm25_mean = 15
            pm10_mean = 48
        elif 12 <= hour < 13:
            pm25_mean = 10
            pm10_mean = 25
        elif 13 <= hour < 17:
            pm25_mean = 16
            pm10_mean = 55
        else:
            pm25_mean = 12
            pm10_mean = 34

    # Nighttime
    else:
        pm25_mean = 7
        pm10_mean = 16

    pm25 = random.gauss(pm25_mean, 2.0)
    pm10 = random.gauss(pm10_mean, 7.0)

    pm25 = clamp(pm25, 3, 35)
    pm10 = max(pm10, pm25 + random.uniform(5, 20))
    pm10 = clamp(pm10, pm25 + 3, 90)

    pm1 = pm25 * random.uniform(0.25, 0.45)
    pm4 = pm25 + (pm10 - pm25) * random.uniform(0.25, 0.55)

    return {
        "pm1": round(pm1, 1),
        "pm25": round(pm25, 1),
        "pm4": round(pm4, 1),
        "pm10": round(pm10, 1),
    }


def get_weather_by_time(now):
    hour = now.hour

    if 5 <= hour < 10:
        temp_mean = 24.5
        hum_mean = 68
    elif 10 <= hour < 15:
        temp_mean = 29.0
        hum_mean = 52
    elif 15 <= hour < 19:
        temp_mean = 31.0
        hum_mean = 48
    elif 19 <= hour < 23:
        temp_mean = 27.0
        hum_mean = 60
    else:
        temp_mean = 23.5
        hum_mean = 72

    temperature = random.gauss(temp_mean, 1.2)
    humidity = random.gauss(hum_mean, 5)

    return {
        "temperature": round(clamp(temperature, 18, 36), 1),
        "humidity": round(clamp(humidity, 35, 90), 1),
    }


def get_light_by_time(now):
    hour = now.hour

    if 7 <= hour < 19:
        if 7 <= hour < 9:
            mean = 1200
        elif 9 <= hour < 16:
            mean = 3800
        else:
            mean = 1800

        light = random.gauss(mean, 500)
        return round(clamp(light, 300, 5000), 0)

    else:
        light = random.gauss(80, 50)
        return round(clamp(light, 0, 300), 0)


def make_value():
    now = datetime.now()

    noise = get_noise_by_time(now)
    pm = get_pm_by_time(now)
    weather = get_weather_by_time(now)

    light = get_light_by_time(now)
    battery = round(random.uniform(82, 96), 1)
    rssi = round(random.uniform(-90, -60), 0)

    qc_flag = 0
    if noise > 70 or pm["pm25"] > 20 or pm["pm10"] > 70 or rssi < -85:
        qc_flag = 1

    return {
        "device_id": DEVICE_ID,
        "site_id": SITE_ID,
        "zone": ZONE,
        "comm_type": COMM_TYPE,
        "deployment_status": DEPLOYMENT_STATUS,
        "noise_dba": noise,
        "pm1": pm["pm1"],
        "pm25": pm["pm25"],
        "pm4": pm["pm4"],
        "pm10": pm["pm10"],
        "temperature": weather["temperature"],
        "humidity": weather["humidity"],
        "light": light,
        "battery": battery,
        "rssi": rssi,
        "qc_flag": qc_flag,
    }


if __name__ == "__main__":
    print("EIMS LTE-style simulator started...")
    print("Device: T1 only")
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
