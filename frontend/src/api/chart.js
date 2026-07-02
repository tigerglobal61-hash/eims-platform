/**
 * Client for GET /api/v1/chart
 *
 * Expected response:
 * [
 *   {
 *     "time": "2026-07-01T14:30:00Z",
 *     "noise": 58.2,
 *     "pm10": 88,
 *     "pm25": 18
 *   }
 * ]
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://eims-api.onrender.com";

export const CHART_REFRESH_MS = 30 * 1000;

export function formatChartTimeLabel(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function fetchChart(deviceId, hours = 24, windowMinutes = 15) {
  const params = new URLSearchParams({
    device_id: deviceId,
    hours: String(hours),
    window_minutes: String(windowMinutes),
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/chart?${params}`);

  if (!response.ok) {
    throw new Error(`Chart API failed (${response.status})`);
  }

  return response.json();
}
