import { getNodeById } from "../data/nodes";
import {
  GAUGE_CONFIG,
  getDisplayStatus,
  getGaugeMarkerPercent,
  getStatusEmoji,
} from "../utils/displayBoardStatus";

function formatBoardTimestamp(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function MetricGauge({ config, value }) {
  const status = getDisplayStatus(value, config.metricKey);
  const markerPct = getGaugeMarkerPercent(value, config.max);
  const referencePct = getGaugeMarkerPercent(config.referenceLine, config.max);
  const fillClass =
    config.variant === "noise"
      ? "display-board-gauge__fill display-board-gauge__fill--noise"
      : status.code === "normal"
        ? "display-board-gauge__fill"
        : `display-board-gauge__fill display-board-gauge__fill--${status.code}`;
  const formattedValue =
    typeof value === "number" ? value.toFixed(config.metricKey === "noise" ? 1 : 0) : value;
  const unitText = config.unit.trim();

  return (
    <div className={`display-board-metric display-board-metric--${status.code}`}>
      <div className="display-board-metric__label">
        <span className="display-board-metric__name">{config.label}</span>
        <span className={`display-board-metric__status display-board-metric__status--${status.code}`}>
          {status.label}
        </span>
      </div>

      <div className="display-board-gauge">
        <div className={`display-board-gauge__track display-board-gauge__track--${config.variant}`}>
          <div className={fillClass} style={{ width: `${markerPct}%` }} />
          <span className="display-board-gauge__reference" style={{ left: `${referencePct}%` }}>
            <span className="display-board-gauge__reference-line" />
            <span className="display-board-gauge__reference-label">{config.referenceLine}</span>
          </span>
          <span className="display-board-gauge__marker" style={{ left: `${markerPct}%` }} aria-hidden="true" />
        </div>
      </div>

      <span className="display-board-metric__emoji" aria-hidden="true">
        {getStatusEmoji(status.code)}
      </span>

      <div className="display-board-metric__value">
        <span className="display-board-metric__value-number">{formattedValue}</span>
        <span className="display-board-metric__value-unit">{unitText}</span>
      </div>
    </div>
  );
}

function BoardMeta({ reading, node }) {
  return (
    <div className="display-board-led__meta">
      <p className="display-board-led__location">
        <span className="display-board-led__meta-label">Location</span>
        <span className="display-board-led__meta-value">
          #{reading.device_id} - {node.label}
        </span>
      </p>
      <div className="display-board-led__status-block">
        <span className="display-board-led__meta-label">Date</span>
        <time className="display-board-led__timestamp" dateTime={reading.time}>
          {formatBoardTimestamp(reading.time)}
        </time>
      </div>
    </div>
  );
}

export default function DisplayBoardPanel({ reading }) {
  const node = getNodeById(reading.device_id);

  return (
    <div className="display-board-visual">
      <div className="display-board-inner">
        <div className="display-board-led">
          <header className="display-board-led__header">
            <h2 className="display-board-led__title">INDIANA FAB PROJECT</h2>
            <p className="display-board-led__subtitle">ENVIRONMENTAL INFORMATION</p>
          </header>

          <BoardMeta reading={reading} node={node} />

          <div className="display-board-led__metrics">
            <div className="display-board-measurement-box">
              <div className="display-board-metrics">
                <MetricGauge config={GAUGE_CONFIG.pm10} value={reading.pm10} />
                <MetricGauge config={GAUGE_CONFIG.pm25} value={reading.pm25} />
                <MetricGauge config={GAUGE_CONFIG.noise} value={reading.noise_dba} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
