import { useEffect, useState } from "react";
import MetricTrendChart from "../components/MetricTrendChart";
import NodeSelect from "../components/NodeSelect";
import StatusBadge from "../components/StatusBadge";
import {
  KPI_REFRESH_MS,
  fetchLatestAverage,
  fetchSiteAverage,
  mapLatestAvgToNodeMetrics,
  mapSiteAverageToNodeMetrics,
} from "../api/latest";
import { getNoaaWeather, getPrimaryAlert } from "../api/weather";
import { CHART_COLORS } from "../data/mockData";
import useChartData from "../hooks/useChartData";
import { formatNodeLocation } from "../data/nodes";
import {
  METRIC_THRESHOLDS,
  MOVING_AVERAGE_LABEL,
  getMetricStatus,
} from "../data/thresholds";
const KPI_PLACEHOLDERS = { noise: "—", pm10: "—", pm25: "—" };

function getKpiLoadMeta(loading, error, metrics) {
  if (loading) return null;
  if (error) return "Unable to load";
  if (!metrics) return "No data";
  return null;
}
const KPI_ORDER = ["noise", "pm10", "pm25"];
const ALERTS_REFRESH_MS = 5 * 60 * 1000;

const SITE_AVERAGE_NOTICE = {
  ko: "현장 대표값은 활성 노드별 15분 이동평균값의 평균입니다. 알림 및 기준 초과 판단은 각 노드별 15분 이동평균값을 기준으로 개별 판단합니다.",
  en: "Site average = average of each active node's 15-min moving average. Alerts are evaluated per node.",
};

function formatAlertExpires(isoString) {
  if (!isoString) return "—";

  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

function formatForecastWind(period) {
  if (!period) return "—";
  return `${period.windDirection} ${period.windSpeed}`;
}

function ForecastDay({ label, period }) {
  if (!period) return null;

  return (
    <article className="weather-card__day">
      <h3 className="weather-card__day-title">{label}</h3>
      <p className="weather-card__temp">
        {period.temperature}°{period.temperatureUnit}
      </p>
      <p className="weather-card__forecast">{period.shortForecast}</p>
      <p className="weather-card__wind">Wind {formatForecastWind(period)}</p>
    </article>
  );
}

function NoaaWeatherCard({ forecast, alerts, loading, error }) {
  const primaryAlert = getPrimaryAlert(alerts);

  return (
    <section className="weather-card panel" aria-live="polite">
      <div className="weather-card__header">
        <h2 className="weather-card__title">NOAA Weather</h2>
      </div>

      {loading && !forecast && (
        <p className="weather-card__message">Loading NOAA weather...</p>
      )}

      {!loading && error && !forecast && (
        <p className="weather-card__message weather-card__message--error">
          NOAA weather unavailable
        </p>
      )}

      {forecast && (
        <>
          <div className="weather-card__forecast-grid">
            <ForecastDay label="Today" period={forecast.today} />
            <ForecastDay label="Tomorrow" period={forecast.tomorrow} />
          </div>

          <div className="weather-card__alerts">
            <h3 className="weather-card__alerts-title">Active Alerts</h3>
            {primaryAlert ? (
              <div className="weather-card__alert-item">
                <p className="weather-card__alert-event">{primaryAlert.event}</p>
                <p className="weather-card__alert-meta">
                  <span>{primaryAlert.severity}</span>
                  <span>Expires {formatAlertExpires(primaryAlert.expires)}</span>
                </p>
              </div>
            ) : (
              <p className="weather-card__alert-empty">No active weather alerts</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default function Dashboard() {
  const [selectedNodeId, setSelectedNodeId] = useState("D1");
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [nodeMetrics, setNodeMetrics] = useState(null);
  const [siteMetrics, setSiteMetrics] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(true);
  const [siteLoading, setSiteLoading] = useState(true);
  const [nodeError, setNodeError] = useState(false);
  const [siteError, setSiteError] = useState(false);

  const displayedSiteMetrics = siteMetrics ?? KPI_PLACEHOLDERS;
  const selectedNodeMetrics = nodeMetrics ?? KPI_PLACEHOLDERS;
  const siteLoadMeta = getKpiLoadMeta(siteLoading, siteError, siteMetrics);
  const nodeLoadMeta = getKpiLoadMeta(nodeLoading, nodeError, nodeMetrics);
  const { data: trendData } = useChartData(selectedNodeId);

  function handleNodeChange(nodeId) {
    setNodeMetrics(null);
    setNodeLoading(true);
    setNodeError(false);
    setSelectedNodeId(nodeId);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSiteMetrics(isBackgroundRefresh = false) {
      if (!isBackgroundRefresh) {
        setSiteLoading(true);
      }

      try {
        const data = await fetchSiteAverage(15);
        const metrics = mapSiteAverageToNodeMetrics(data);

        if (!cancelled) {
          setSiteMetrics(metrics);
          setSiteError(false);
        }
      } catch {
        if (!cancelled) {
          setSiteMetrics(null);
          setSiteError(true);
        }
      } finally {
        if (!cancelled) {
          setSiteLoading(false);
        }
      }
    }

    loadSiteMetrics();

    const timer = window.setInterval(() => loadSiteMetrics(true), KPI_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadNodeMetrics(isBackgroundRefresh = false) {
      if (!isBackgroundRefresh) {
        setNodeLoading(true);
      }

      try {
        const data = await fetchLatestAverage(selectedNodeId, 15);
        const metrics = mapLatestAvgToNodeMetrics(data);

        if (!cancelled) {
          setNodeMetrics(metrics);
          setNodeError(false);
        }
      } catch {
        if (!cancelled) {
          setNodeMetrics(null);
          setNodeError(true);
        }
      } finally {
        if (!cancelled) {
          setNodeLoading(false);
        }
      }
    }

    loadNodeMetrics();

    const timer = window.setInterval(() => loadNodeMetrics(true), KPI_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedNodeId]);

  useEffect(() => {
    let cancelled = false;
  
    async function loadWeather(showLoading = false) {
      if (showLoading) {
        setWeatherLoading(true);
      }
      setWeatherError(false);
  
      try {
        const weather = await getNoaaWeather({ siteId: "HEP" });
  
        if (!cancelled) {
          setForecast(weather.forecast);
          setAlerts(weather.alerts ?? []);
        }
      } catch {
        if (!cancelled) {
          setWeatherError(true);
          setAlerts([]);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    }
  
    loadWeather(true);
  
    const weatherTimer = window.setInterval(
      () => loadWeather(false),
      ALERTS_REFRESH_MS
    );
  
    return () => {
      cancelled = true;
      window.clearInterval(weatherTimer);
    };
  }, []);


  function renderKpiSectionMeta(loadMeta) {
    if (!loadMeta) {
      return MOVING_AVERAGE_LABEL;
    }

    return `${MOVING_AVERAGE_LABEL} · ${loadMeta}`;
  }

  function renderKpiCards(metrics, labelKey) {
    return KPI_ORDER.map((metricKey) => {
      const config = METRIC_THRESHOLDS[metricKey];
      const value = metrics[metricKey];
      const status =
        typeof value === "number" ? getMetricStatus(value, metricKey) : "good";

      return (
        <article key={`${labelKey}-${metricKey}`} className={`kpi-card kpi-card--${status}`}>
          <div className="kpi-card__header">
            <span className="kpi-card__label">{config[labelKey]}</span>
            <StatusBadge status={status} />
          </div>
          <div className="kpi-card__value-row">
            <span className="kpi-card__value">{value}</span>
            <span className="kpi-card__unit">{config.unit}</span>
          </div>
          <span className="kpi-card__threshold">{MOVING_AVERAGE_LABEL}</span>
        </article>
      );
    });
  }

  return (
    <div className="page-shell dashboard-page">
      <div className="dashboard-overview-grid">
        <div className="dashboard-overview-left">
          <section className="panel dashboard-notice">
            <p className="dashboard-notice__text">{SITE_AVERAGE_NOTICE.ko}</p>
            <p className="dashboard-notice__subtext">{SITE_AVERAGE_NOTICE.en}</p>
          </section>

          <section className="dashboard-kpi-section">
            <div className="section-header">
              <h2 className="section-title">Site Average</h2>
              <span className="section-meta">{renderKpiSectionMeta(siteLoadMeta)}</span>
            </div>
            <div className="dashboard-node-metrics">{renderKpiCards(displayedSiteMetrics, "siteLabel")}</div>
          </section>
        </div>

        <div className="dashboard-overview-right">
          <NoaaWeatherCard
            forecast={forecast}
            alerts={alerts}
            loading={weatherLoading}
            error={weatherError}
          />
        </div>
      </div>

      <section className="panel panel--table dashboard-alerts-wide">
        <div className="section-header">
          <h2 className="section-title">Recent Alerts</h2>
        </div>
        <div className="table-wrap dashboard-alerts-wide__scroll">
          <p className="dashboard-notice__text">No recent alerts</p>
          <p className="dashboard-notice__subtext">No alerts have been recorded.</p>
        </div>
      </section>

      <section className="panel node-selector-toolbar node-selector-panel">
        <NodeSelect
          id="dashboard-node-select"
          value={selectedNodeId}
          onChange={handleNodeChange}
          meta={formatNodeLocation(selectedNodeId)}
        />
      </section>

      <section className="dashboard-kpi-section">
        <div className="section-header">
          <h2 className="section-title">Selected Node</h2>
          <span className="section-meta">{renderKpiSectionMeta(nodeLoadMeta)}</span>
        </div>
        <div className="dashboard-node-metrics">{renderKpiCards(selectedNodeMetrics, "label")}</div>
      </section>

      <div className="dashboard-charts-stack">
        <section className="panel panel--chart">
          <div className="section-header">
            <h2 className="section-title">Noise dB(A) · {MOVING_AVERAGE_LABEL}</h2>
          </div>
          <MetricTrendChart
            data={trendData}
            dataKey={METRIC_THRESHOLDS.noise.dataKey}
            name={METRIC_THRESHOLDS.noise.label}
            unit={METRIC_THRESHOLDS.noise.unit}
            thresholds={METRIC_THRESHOLDS.noise.levels}
            stroke={CHART_COLORS.line}
            height={240}
          />
        </section>

        <section className="panel panel--chart">
          <div className="section-header">
            <h2 className="section-title">PM10 · {MOVING_AVERAGE_LABEL}</h2>
          </div>
          <MetricTrendChart
            data={trendData}
            dataKey={METRIC_THRESHOLDS.pm10.dataKey}
            name={METRIC_THRESHOLDS.pm10.label}
            unit={METRIC_THRESHOLDS.pm10.unit}
            thresholds={METRIC_THRESHOLDS.pm10.levels}
            stroke={CHART_COLORS.lineAlt}
            height={240}
          />
        </section>

        <section className="panel panel--chart">
          <div className="section-header">
            <h2 className="section-title">PM2.5 · {MOVING_AVERAGE_LABEL}</h2>
          </div>
          <MetricTrendChart
            data={trendData}
            dataKey={METRIC_THRESHOLDS.pm25.dataKey}
            name={METRIC_THRESHOLDS.pm25.label}
            unit={METRIC_THRESHOLDS.pm25.unit}
            thresholds={METRIC_THRESHOLDS.pm25.levels}
            stroke={CHART_COLORS.lineWarm}
            height={240}
          />
        </section>
      </div>
    </div>
  );
}
