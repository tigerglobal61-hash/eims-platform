import { useEffect, useMemo, useState } from "react";
import MetricTrendChart from "../components/MetricTrendChart";
import NodeSelect from "../components/NodeSelect";
import StatusBadge from "../components/StatusBadge";
import { getNoaaAlerts, getNoaaForecast, getPrimaryAlert } from "../api/weather";
import { CHART_COLORS, RECENT_ALERTS } from "../data/mockData";
import { getNoaaWeather, getPrimaryAlert } from "../api/weather";
import { formatNodeLocation } from "../data/nodes";
import {
  METRIC_THRESHOLDS,
  MOVING_AVERAGE_LABEL,
  getMetricStatus,
} from "../data/thresholds";

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
  const [selectedNodeId, setSelectedNodeId] = useState("T1");
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  const siteMetrics = useMemo(() => getSiteAverageMetrics(), []);
  const nodeMetrics = useMemo(() => getNodeMetrics(selectedNodeId), [selectedNodeId]);
  const trendData = useMemo(() => getNodeTrendData(selectedNodeId), [selectedNodeId]);

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

    async function loadAlerts() {
      try {
        const nextAlerts = await getNoaaAlerts();
        if (!cancelled) {
          setAlerts(nextAlerts);
        }
      } catch {
        if (!cancelled) {
          setAlerts([]);
        }
      }
    }

    loadForecast(true);
    loadAlerts();

    const forecastTimer = window.setInterval(() => loadForecast(false), FORECAST_REFRESH_MS);
    const alertsTimer = window.setInterval(loadAlerts, ALERTS_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(forecastTimer);
      window.clearInterval(alertsTimer);
    };
  }, []);

  function renderKpiCards(metrics, labelKey) {
    return KPI_ORDER.map((metricKey) => {
      const config = METRIC_THRESHOLDS[metricKey];
      const value = metrics[metricKey];
      const status = getMetricStatus(value, metricKey);

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
              <span className="section-meta">{MOVING_AVERAGE_LABEL}</span>
            </div>
            <div className="dashboard-node-metrics">{renderKpiCards(siteMetrics, "siteLabel")}</div>
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
          <span className="section-meta">{RECENT_ALERTS.length} items</span>
        </div>
        <div className="table-wrap dashboard-alerts-wide__scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Node</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ALERTS.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.time}</td>
                  <td>{alert.node}</td>
                  <td>{alert.type}</td>
                  <td>{alert.message}</td>
                  <td>
                    <StatusBadge status={alert.level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel node-selector-toolbar node-selector-panel">
        <NodeSelect
          id="dashboard-node-select"
          value={selectedNodeId}
          onChange={setSelectedNodeId}
          meta={formatNodeLocation(selectedNodeId)}
        />
      </section>

      <section className="dashboard-kpi-section">
        <div className="section-header">
          <h2 className="section-title">Selected Node</h2>
          <span className="section-meta">{MOVING_AVERAGE_LABEL}</span>
        </div>
        <div className="dashboard-node-metrics">{renderKpiCards(nodeMetrics, "label")}</div>
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
