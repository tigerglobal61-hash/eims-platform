/**
 * Client for GET /api/v1/alerts
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://eims-api.onrender.com";

export const ALERTS_REFRESH_MS = 30 * 1000;
const ALERT_TIMEZONE = "America/New_York";

export async function fetchAlerts(limit = 100) {
  const params = new URLSearchParams({
    limit: String(limit),
    evaluate: "true",
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/alerts?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Alerts API failed (${response.status})`);
  }

  const data = await response.json();

  return Array.isArray(data.alerts) ? data.alerts : [];
}

export function formatAlertDuration(seconds) {
  if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds < 0) {
    return "—";
  }

  if (seconds < 60) {
    return `${seconds} sec`;
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} min`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

export function formatAlertDate(isoString) {
  if (!isoString) {
    return "—";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: ALERT_TIMEZONE,
  });
}

export function formatAlertTime(isoString) {
  if (!isoString) {
    return "—";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: ALERT_TIMEZONE,
  });
}

export function getAlertEndTitle(endedAt, startedAt) {
  if (!endedAt || !startedAt) {
    return undefined;
  }

  const endDate = formatAlertDate(endedAt);
  const startDate = formatAlertDate(startedAt);

  if (endDate === startDate || endDate === "—") {
    return undefined;
  }

  return `${endDate} ${formatAlertTime(endedAt)}`;
}

export function getAlertLevelClass(level) {
  switch (level) {
    case "Attention":
      return "alert-level-badge--attention";
    case "Elevated":
      return "alert-level-badge--elevated";
    case "High":
      return "alert-level-badge--high";
    default:
      return "alert-level-badge--neutral";
  }
}
