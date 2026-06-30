const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://eims-api.onrender.com";

export async function getNoaaWeather({ siteId = "HEP" } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/weather?site_id=${siteId}`
  );

  if (!response.ok) {
    throw new Error(`Weather API failed (${response.status})`);
  }

  return response.json();
}

export function getPrimaryAlert(alerts) {
  if (!alerts?.length) return null;

  const rank = {
    Extreme: 0,
    Severe: 1,
    Moderate: 2,
    Minor: 3,
    Unknown: 4,
  };

  return [...alerts].sort(
    (a, b) => (rank[a.severity] ?? 99) - (rank[b.severity] ?? 99)
  )[0];
}