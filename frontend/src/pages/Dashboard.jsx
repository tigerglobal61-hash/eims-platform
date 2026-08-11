import { useEffect, useMemo, useState } from "react";
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
import {
  ALERTS_REFRESH_MS,
  fetchAlerts,
  formatAlertDate,
  formatAlertDuration,
  formatAlertTime,
  getAlertEndTitle,
  getAlertLevelClass,
} from "../api/alerts";
import { getNoaaWeather, getPrimaryAlert } from "../api/weather";
import { CHART_COLORS } from "../data/mockData";
import useChartData from "../hooks/useChartData";
import { formatNodeLocation } from "../data/nodes";
import { METRIC_THRESHOLDS, getMetricStatus } from "../data/thresholds";
import { getAlertLevelDisplayLabel } from "../utils/statusDisplayLabels";

const MOVING_AVERAGE_MINUTES = 60;
const MOVING_AVERAGE_LABEL = "1-hour moving average";
const KPI_PLACEHOLDERS = { noise: "—", pm10: "—", pm25: "—" };

function getKpiLoadMeta(loading, error, metrics) {
  if (loading) return null;
  if (error) return "Unable to load";
  if (!metrics) return "No data";
  return null;
}
const KPI_ORDER = ["noise", "pm10", "pm25"];
const WEATHER_REFRESH_MS = 5 * 60 * 1000;
const ALERTS_PER_PAGE = 10;

function toUtcIso(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function createSampleAlert(preset, nowMs = Date.now()) {
  if (preset === "attention") {
    const startedMs = nowMs - 12 * 60 * 1000;
    return {
      sample: true,
      preset: "attention",
      alert_id: "sample-attention",
      device_id: "D3",
      category: "Noise",
      level: "Attention",
      started_at: toUtcIso(new Date(startedMs)),
      ended_at: null,
      duration_seconds: 12 * 60,
      status: "active",
    };
  }

  if (preset === "elevated") {
    const startedMs = nowMs - 34 * 60 * 1000;
    return {
      sample: true,
      preset: "elevated",
      alert_id: "sample-elevated",
      device_id: "D5",
      category: "PM10",
      level: "Elevated",
      started_at: toUtcIso(new Date(startedMs)),
      ended_at: null,
      duration_seconds: 34 * 60,
      status: "active",
    };
  }

  if (preset === "high") {
    const startedMs = nowMs - 8 * 60 * 1000;
    return {
      sample: true,
      preset: "high",
      alert_id: "sample-high",
      device_id: "D7",
      category: "PM2.5",
      level: "High",
      started_at: toUtcIso(new Date(startedMs)),
      ended_at: null,
      duration_seconds: 8 * 60,
      status: "active",
    };
  }

  const endedMs = nowMs - 25 * 60 * 60 * 1000;
  const startedMs = endedMs - 32 * 60 * 1000;
  return {
    sample: true,
    preset: "resolved",
    alert_id: "sample-resolved",
    device_id: "D3",
    category: "Noise",
    level: "Attention",
    started_at: toUtcIso(new Date(startedMs)),
    ended_at: toUtcIso(new Date(endedMs)),
    duration_seconds: 32 * 60,
    status: "resolved",
  };
}

function buildSamplePreviewAlerts(nowMs = Date.now()) {
  return ["attention", "elevated", "high", "resolved"].map((preset) =>
    createSampleAlert(preset, nowMs)
  );
}

const SITE_AVERAGE_NOTICE = {
  ko: "현장 대표값은 활성 노드별 1시간 이동평균값의 평균입니다. 알림 및 기준 초과 판단도 각 노드별 1시간 이동평균값을 기준으로 개별 판단합니다.",
  en: "Site average = average of each active node's 1-hour moving average. Alerts and threshold exceedances are evaluated per node using the 1-hour moving average.",
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

function AlertLevelBadge({ level }) {
  return (
    <span className={`alert-level-badge ${getAlertLevelClass(level)}`}>
      <span className="alert-level-badge__dot" />
      {getAlertLevelDisplayLabel(level)}
    </span>
  );
}

function getAlertRowNumber({ alerts, rowIndex, isSamplePreview, totalAlertCount, alertsPage }) {
  if (isSamplePreview) {
    return alerts.length - rowIndex;
  }

  return totalAlertCount - ((alertsPage - 1) * ALERTS_PER_PAGE + rowIndex);
}

function AlertHistoryTable({
  alerts,
  durationTick,
  isSamplePreview = false,
  totalAlertCount = 0,
  alertsPage = 1,
}) {
  return (
    <table className="data-table dashboard-alerts-table">
      <colgroup>
        <col className="dashboard-alerts-table__col-index" />
        <col className="dashboard-alerts-table__col-date" />
        <col className="dashboard-alerts-table__col-node" />
        <col className="dashboard-alerts-table__col-category" />
        <col className="dashboard-alerts-table__col-level" />
        <col className="dashboard-alerts-table__col-start" />
        <col className="dashboard-alerts-table__col-end" />
        <col className="dashboard-alerts-table__col-duration" />
      </colgroup>
      <thead>
        <tr>
          <th className="dashboard-alerts-table__th-index">#</th>
          <th>Date</th>
          <th>Node</th>
          <th>Category</th>
          <th>Level</th>
          <th>Start</th>
          <th>End</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert, rowIndex) => (
          <tr
            key={alert.alert_id}
            className={
              alert.status === "active"
                ? "dashboard-alerts-table__row--active"
                : alert.status === "resolved"
                  ? "dashboard-alerts-table__row--resolved"
                  : undefined
            }
          >
            <td className="dashboard-alerts-table__index">
              {getAlertRowNumber({
                alerts,
                rowIndex,
                isSamplePreview,
                totalAlertCount,
                alertsPage,
              })}
            </td>
            <td>{formatAlertDate(alert.started_at)}</td>
            <td>{alert.device_id}</td>
            <td>{alert.category}</td>
            <td>
              <AlertLevelBadge level={alert.level} />
            </td>
            <td>{formatAlertTime(alert.started_at)}</td>
            <td title={getAlertEndTitle(alert.ended_at, alert.started_at)}>
              {formatAlertTime(alert.ended_at)}
            </td>
            <td>{getAlertDurationDisplay(alert, durationTick, isSamplePreview)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function getAlertDurationDisplay(alert, durationTick, isSamplePreview = false) {
  if (isSamplePreview && alert.status === "active") {
    return "Ongoing";
  }

  return getLiveAlertDuration(alert, durationTick);
}

function getLiveAlertDuration(alert, nowMs) {
  if (alert.status !== "active") {
    return formatAlertDuration(alert.duration_seconds);
  }

  const startedMs = new Date(alert.started_at).getTime();
  if (Number.isNaN(startedMs)) {
    return formatAlertDuration(alert.duration_seconds);
  }

  const seconds = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
  return formatAlertDuration(seconds);
}

function NoaaWeatherCard({ forecast, weatherAlerts, loading, error }) {
  const primaryAlert = getPrimaryAlert(weatherAlerts);

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
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [realAlerts, setRealAlerts] = useState([]);
  const [samplePreviewEnabled, setSamplePreviewEnabled] = useState(false);
  const [alertsPage, setAlertsPage] = useState(1);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(false);
  const [durationTick, setDurationTick] = useState(Date.now());
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
  const { data: trendData } = useChartData(selectedNodeId, {
    hours: 24,
    windowMinutes: MOVING_AVERAGE_MINUTES,
  });

  const totalAlertPages =
    realAlerts.length === 0 ? 0 : Math.ceil(realAlerts.length / ALERTS_PER_PAGE);
  const paginatedAlerts =
    totalAlertPages === 0
      ? []
      : realAlerts.slice(
          (alertsPage - 1) * ALERTS_PER_PAGE,
          alertsPage * ALERTS_PER_PAGE
        );
  const showAlertPagination = realAlerts.length > ALERTS_PER_PAGE;
  const samplePreviewAlerts = useMemo(
    () => (samplePreviewEnabled ? buildSamplePreviewAlerts() : []),
    [samplePreviewEnabled]
  );

  function handlePreviousAlertPage() {
    setAlertsPage((page) => Math.max(1, page - 1));
  }

  function handleNextAlertPage() {
    setAlertsPage((page) => Math.min(totalAlertPages, page + 1));
  }

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
        const data = await fetchSiteAverage(MOVING_AVERAGE_MINUTES);
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
        const data = await fetchLatestAverage(selectedNodeId, MOVING_AVERAGE_MINUTES);
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
          setWeatherAlerts(weather.alerts ?? []);
        }
      } catch {
        if (!cancelled) {
          setWeatherError(true);
          setWeatherAlerts([]);
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
      WEATHER_REFRESH_MS
    );
  
    return () => {
      cancelled = true;
      window.clearInterval(weatherTimer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentAlerts(isBackgroundRefresh = false) {
      if (!isBackgroundRefresh) {
        setAlertsLoading(true);
      }

      try {
        const alerts = await fetchAlerts(100);

        if (!cancelled) {
          setRealAlerts(alerts);
          setAlertsError(false);
          setDurationTick(Date.now());
        }
      } catch (error) {
        console.error("[Dashboard] Failed to load alerts:", error);
        if (!cancelled) {
          if (!isBackgroundRefresh) {
            setRealAlerts([]);
          }
          setAlertsError(true);
        }
      } finally {
        if (!cancelled) {
          setAlertsLoading(false);
        }
      }
    }

    loadRecentAlerts();

    const refreshTimer = window.setInterval(
      () => loadRecentAlerts(true),
      ALERTS_REFRESH_MS
    );
    const durationTimer = window.setInterval(
      () => setDurationTick(Date.now()),
      30000
    );

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
      window.clearInterval(durationTimer);
    };
  }, []);

  useEffect(() => {
    if (totalAlertPages === 0) {
      setAlertsPage(1);
      return;
    }

    setAlertsPage((page) => Math.min(Math.max(page, 1), totalAlertPages));
  }, [totalAlertPages]);

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
            weatherAlerts={weatherAlerts}
            loading={weatherLoading}
            error={weatherError}
          />
        </div>
      </div>

      <section className="panel panel--table dashboard-alerts-wide">
        <div className="section-header dashboard-alerts-wide__header">
          <h2 className="section-title">Recent Alerts</h2>
          <span className="section-meta">{realAlerts.length} events</span>
        </div>

        <div className="dashboard-alerts-sample">
          <div className="dashboard-alerts-sample__label">Sample Preview</div>
          <button
            type="button"
            className={`dashboard-alerts-sample__toggle${
              samplePreviewEnabled ? " dashboard-alerts-sample__toggle--on" : ""
            }`}
            aria-pressed={samplePreviewEnabled}
            onClick={() => setSamplePreviewEnabled((enabled) => !enabled)}
          >
            {samplePreviewEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {samplePreviewEnabled && (
          <div className="dashboard-alerts-section dashboard-alerts-section--sample">
            <div className="table-wrap dashboard-alerts-section__table">
              <AlertHistoryTable
                alerts={samplePreviewAlerts}
                durationTick={durationTick}
                isSamplePreview
              />
            </div>
          </div>
        )}

        <div className="dashboard-alerts-section">
          <h3 className="dashboard-alerts-section__title">Actual Alert History</h3>

          {alertsLoading && realAlerts.length === 0 && (
            <p className="dashboard-notice__text">Loading alerts...</p>
          )}

          {!alertsLoading && alertsError && realAlerts.length === 0 && (
            <>
              <p className="dashboard-notice__text">Unable to load alerts</p>
              <p className="dashboard-notice__subtext">
                Alert events could not be retrieved from the API.
              </p>
            </>
          )}

          {!alertsError && realAlerts.length === 0 && !alertsLoading && (
            <>
              <p className="dashboard-notice__text">No recent alerts</p>
              <p className="dashboard-notice__subtext">No alerts have been recorded.</p>
            </>
          )}

          {paginatedAlerts.length > 0 && (
            <>
              <div className="table-wrap dashboard-alerts-section__table">
                <AlertHistoryTable alerts={paginatedAlerts} durationTick={durationTick} totalAlertCount={realAlerts.length} alertsPage={alertsPage} />
              </div>

              {showAlertPagination && (
                <div className="dashboard-alerts-pagination">
                  <button
                    type="button"
                    className="dashboard-alerts-pagination__button"
                    onClick={handlePreviousAlertPage}
                    disabled={alertsPage <= 1}
                  >
                    Previous
                  </button>
                  <span className="dashboard-alerts-pagination__status">
                    Page {alertsPage} of {totalAlertPages}
                  </span>
                  <button
                    type="button"
                    className="dashboard-alerts-pagination__button"
                    onClick={handleNextAlertPage}
                    disabled={alertsPage >= totalAlertPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
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
