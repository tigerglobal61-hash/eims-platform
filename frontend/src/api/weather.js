// TODO: In production, proxy through FastAPI:
// GET /api/v1/weather?site_id=HEP

const NOAA_BASE_URL = "https://api.weather.gov";
const DEFAULT_LATITUDE = 40.4237;
const DEFAULT_LONGITUDE = -86.9212;

const NOAA_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "EIMS Platform (environmental-monitoring, contact@eims.local)",
};

const ALERT_SEVERITY_RANK = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Minor: 3,
  Unknown: 4,
};

async function noaaFetch(url) {
  const response = await fetch(url, { headers: NOAA_HEADERS });

  if (!response.ok) {
    throw new Error(`NOAA request failed (${response.status})`);
  }

  return response.json();
}

function mapForecastPeriod(period) {
  if (!period) return null;

  return {
    name: period.name,
    temperature: period.temperature,
    temperatureUnit: period.temperatureUnit,
    windSpeed: period.windSpeed,
    windDirection: period.windDirection,
    shortForecast: period.shortForecast,
    detailedForecast: period.detailedForecast,
    icon: period.icon,
  };
}

function extractTodayTomorrow(periods) {
  if (!periods?.length) {
    throw new Error("NOAA forecast missing periods");
  }

  const todayIndex = periods.findIndex((period) => /^today/i.test(period.name));
  const tomorrowIndex = periods.findIndex((period) => /^tomorrow/i.test(period.name));

  const todayPeriod =
    (todayIndex >= 0 ? periods[todayIndex] : null) ??
    periods.find((period) => period.isDaytime) ??
    periods[0];

  let tomorrowPeriod = tomorrowIndex >= 0 ? periods[tomorrowIndex] : null;

  if (!tomorrowPeriod) {
    const todayPosition = periods.indexOf(todayPeriod);
    tomorrowPeriod =
      periods.slice(todayPosition + 1).find((period) => period.isDaytime) ??
      periods[todayPosition + 1];
  }

  if (!tomorrowPeriod) {
    throw new Error("NOAA forecast missing tomorrow period");
  }

  return {
    today: mapForecastPeriod(todayPeriod),
    tomorrow: mapForecastPeriod(tomorrowPeriod),
  };
}

function mapAlert(feature) {
  const properties = feature?.properties ?? {};

  return {
    event: properties.event ?? "Weather Alert",
    severity: properties.severity ?? "Unknown",
    expires: properties.expires ?? null,
    headline: properties.headline ?? properties.event ?? "Weather Alert",
  };
}

function sortAlertsBySeverity(alerts) {
  return [...alerts].sort((left, right) => {
    const leftRank = ALERT_SEVERITY_RANK[left.severity] ?? 99;
    const rightRank = ALERT_SEVERITY_RANK[right.severity] ?? 99;
    return leftRank - rightRank;
  });
}

async function getForecastUrl(latitude, longitude) {
  const pointsUrl = `${NOAA_BASE_URL}/points/${latitude},${longitude}`;
  const pointsPayload = await noaaFetch(pointsUrl);
  const forecastUrl = pointsPayload?.properties?.forecast;

  if (!forecastUrl) {
    throw new Error("NOAA points response missing forecast URL");
  }

  return forecastUrl;
}

export async function getNoaaForecast({
  latitude = DEFAULT_LATITUDE,
  longitude = DEFAULT_LONGITUDE,
} = {}) {
  const forecastUrl = await getForecastUrl(latitude, longitude);
  const forecastPayload = await noaaFetch(forecastUrl);

  return extractTodayTomorrow(forecastPayload?.properties?.periods);
}

export async function getNoaaAlerts({
  latitude = DEFAULT_LATITUDE,
  longitude = DEFAULT_LONGITUDE,
} = {}) {
  const alertsUrl = `${NOAA_BASE_URL}/alerts/active?point=${latitude},${longitude}`;
  const alertsPayload = await noaaFetch(alertsUrl);
  const alerts = (alertsPayload?.features ?? []).map(mapAlert);

  return sortAlertsBySeverity(alerts);
}

export async function getNoaaWeather({
  latitude = DEFAULT_LATITUDE,
  longitude = DEFAULT_LONGITUDE,
} = {}) {
  const [forecast, alerts] = await Promise.all([
    getNoaaForecast({ latitude, longitude }),
    getNoaaAlerts({ latitude, longitude }),
  ]);

  return {
    forecast,
    alerts,
  };
}

export function getPrimaryAlert(alerts) {
  if (!alerts?.length) return null;
  return sortAlertsBySeverity(alerts)[0];
}
