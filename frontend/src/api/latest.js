/**
 * Client for GET /api/v1/latest?device_id={deviceId}
 *
 * Expected FastAPI response:
 * {
 *   "device_id": "D1",
 *   "site_id": "HEP",
 *   "zone": "Z2",
 *   "time": "2026-07-01T14:35:20Z",
 *   "noise_dba": 76.5,
 *   "pm25": 32,
 *   "pm10": 142
 * }
 */

const MOCK_DELAY_MS = 300;

export const mockLatestData = {
  T1: {
    device_id: "T1",
    site_id: "HEP",
    zone: "Z0",
    time: "2026-07-01T14:30:00Z",
    noise_dba: 58.2,
    pm25: 18,
    pm10: 88,
  },
  D1: {
    device_id: "D1",
    site_id: "HEP",
    zone: "Z2",
    time: "2026-07-01T14:35:20Z",
    noise_dba: 76.5,
    pm25: 32,
    pm10: 142,
  },
  D2: {
    device_id: "D2",
    site_id: "HEP",
    zone: "Z2",
    time: "2026-07-01T14:35:18Z",
    noise_dba: 62.0,
    pm25: 22,
    pm10: 95,
  },
  D3: {
    device_id: "D3",
    site_id: "HEP",
    zone: "Z3",
    time: "2026-07-01T14:35:16Z",
    noise_dba: 64.5,
    pm25: 28,
    pm10: 152,
  },
  D4: {
    device_id: "D4",
    site_id: "HEP",
    zone: "Z3",
    time: "2026-07-01T14:35:14Z",
    noise_dba: 59.8,
    pm25: 48,
    pm10: 118,
  },
  D5: {
    device_id: "D5",
    site_id: "HEP",
    zone: "Z4",
    time: "2026-07-01T14:35:12Z",
    noise_dba: 77.2,
    pm25: 30,
    pm10: 138,
  },
  D6: {
    device_id: "D6",
    site_id: "HEP",
    zone: "Z4",
    time: "2026-07-01T14:35:10Z",
    noise_dba: 68.0,
    pm25: 38,
    pm10: 163,
  },
  D7: {
    device_id: "D7",
    site_id: "HEP",
    zone: "Z1",
    time: "2026-07-01T14:35:08Z",
    noise_dba: 81.4,
    pm25: 24,
    pm10: 110,
  },
  D8: {
    device_id: "D8",
    site_id: "HEP",
    zone: "Z1",
    time: "2026-07-01T14:35:06Z",
    noise_dba: 73.5,
    pm25: 56,
    pm10: 172,
  },
};

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function fetchLatestReading(deviceId) {
  await wait(MOCK_DELAY_MS);

  const record = mockLatestData[deviceId];
  if (record) {
    return { ...record };
  }

  return {
    device_id: deviceId,
    site_id: "HEP",
    zone: "Z0",
    time: new Date().toISOString(),
    noise_dba: 0,
    pm25: 0,
    pm10: 0,
  };
}
