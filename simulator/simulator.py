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

# Smooth daily profiles.
# Unit:
# - noise_dba: dB(A)
# - pm25 / pm10: ug/m3
#
# Lunch dip is intentionally removed.
# The profile gradually increases from early morning,
# stays elevated during daytime construction activity,
# and gradually decreases after work hours.

NOISE_PROFILE = [
    (0, 33.5),
    (5, 33.5),
    (6, 37.0),
    (7, 55.0),
    (8, 64.5),
    (10, 69.5),
    (12, 70.0),
    (14, 71.0),
    (16, 70.0),
    (17, 68.5),
    (18, 63.0),
    (19, 50.0),
    (20, 43.0),
    (22, 35.0),
    (24, 33.5),
]

PM25_PROFILE = [
    (0, 7.0),
    (5, 7.0),
    (6, 8.0),
    (7, 10.0),
    (8, 12.0),
    (10, 14.5),
    (12, 15.0),
    (14, 16.0),
    (16, 15.5),
    (17, 14.5),
    (18, 12.5),
    (19, 9.0),
    (22, 7.0),
    (24, 7.0),
]

PM10_PROFILE = [
    (0, 16.0),
    (5, 16.0),
    (6, 18.0),
    (7, 25.0),
    (8, 32.0),
    (10, 45.0),
    (12, 50.0),
    (14, 55.0),
    (16, 52.0),
    (17, 47.0),
    (18, 38.0),
    (19, 28.0),
    (22, 18.0),
    (24, 16.0),
]


def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def get_decimal_hour(now):
    return now.hour + now.minute / 60 + now.second / 3600


def interpolate_profile(now, profile_points):
    current_hour = get_decimal_hour(now)

    for i in range(len(profile_points) - 1):
        h1, v1 = profile_points[i]
        h2, v2 = profile_points[i + 1]

        if h1 <= current_hour <= h2:
            if h2 == h1:
                return v1

            ratio = (current_hour - h1) / (h2 - h1)
            return v1 + (v2 - v1) * ratio

    return profile_points[-1][1]


def get_noise_std(noise_mean):
    if noise_mean >= 65:
        return 2.4
    if noise_mean >= 50:
        return 2.1
    return 1.7


def get_pm25_std(pm25_mean):
    if pm25_mean >= 14:
        return 1.8
    if pm25_mean >= 10:
        return 1.5
    return 1.2


def get_pm10_std(pm10_mean):
    if pm10_mean >= 45:
        return 6.0
    if pm10_mean >= 30:
        return 4.5
    return 3.0


def get_noise_by_time(now):
    noise_mean = interpolate_profile(now, NOISE_PROFILE)
    noise_std = get_noise_std(noise_mean)

    noise = random.gauss(noise_mean, noise_std)
    return round(clamp(noise, 28, 82), 1)


def get_pm_by_time(now):
    pm25_mean = interpolate_profile(now, PM25_PROFILE)
    pm10_mean = interpolate_profile(now, PM10_PROFILE)

    pm25 = random.gauss(pm25_mean, get_pm25_std(pm25_mean))
    pm10 = random.gauss(pm10_mean, get_pm10_std(pm10_mean))

    pm25 = clamp(pm25, 3, 35)

    # Keep physical consistency:
    # PM1 <= PM2.5 <= PM4 <= PM10
    pm10 = max(pm10, pm25 + random.uniform(5, 18))
    pm10 = clamp(pm10, pm25 + 3, 100)

    pm1 = pm25 * random.uniform(0.25, 0.45)
    pm4 = pm25 + (pm10 - pm25) * random.uniform(0.25, 0.55)

    return {
        "pm1": round(pm1, 1),
        "pm25": round(pm25, 1),
        "pm4": round(pm4, 1),
        "pm10": round(pm10, 1),
    }


def get_weather_by_time(now):
    temp_profile = [
        (0, 23.5),
        (5, 23.0),
        (8, 25.0),
        (12, 29.0),
        (15, 31.0),
        (18, 29.0),
        (22, 25.0),
        (24, 23.5),
    ]

    humidity_profile = [
        (0, 72),
        (5, 76),
        (8, 68),
        (12, 55),
        (15, 48),
        (18, 55),
        (22, 68),
        (24, 72),
    ]

    temp_mean = interpolate_profile(now, temp_profile)
    hum_mean = interpolate_profile(now, humidity_profile)

    temperature = random.gauss(temp_mean, 0.8)
    humidity = random.gauss(hum_mean, 4)

    return {
        "temperature": round(clamp(temperature, 18, 36), 1),
        "humidity": round(clamp(humidity, 35, 90), 1),
    }


def get_light_by_time(now):
    light_profile = [
        (0, 20),
        (5, 20),
        (6, 120),
        (7, 600),
        (9, 2500),
        (12, 4200),
        (15, 3500),
        (17, 1800),
        (19, 300),
        (20, 80),
        (24, 20),
    ]

    light_mean = interpolate_profile(now, light_profile)
    light_std = max(light_mean * 0.12, 30)

    light = random.gauss(light_mean, light_std)
    return round(clamp(light, 0, 5000), 0)


def get_battery_value():
    # Temporary simulator value.
    # This can later be changed to a slow discharge model.
    return round(random.uniform(82, 96), 1)


def get_rssi_value():
    return round(random.uniform(-90, -60), 0)


def make_value():
    now = datetime.now()

    noise = get_noise_by_time(now)
    pm = get_pm_by_time(now)
    weather = get_weather_by_time(now)

    light = get_light_by_time(now)
    battery = get_battery_value()
    rssi = get_rssi_value()

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
    print("Smooth daily profile enabled")
    print("Lunch dip disabled")
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
