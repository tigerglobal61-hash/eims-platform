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

function FullscreenMetric({ config, value }) {
  const status = getDisplayStatus(value, config.metricKey);
  const markerPct = getGaugeMarkerPercent(value, config.max);
  const referencePct = getGaugeMarkerPercent(config.referenceLine, config.max);
  const fillClass =
    config.variant === "noise"
      ? "display-board-fullscreen__gauge-fill display-board-fullscreen__gauge-fill--noise"
      : status.code === "normal"
        ? "display-board-fullscreen__gauge-fill"
        : `display-board-fullscreen__gauge-fill display-board-fullscreen__gauge-fill--${status.code}`;
  const formattedValue =
    typeof value === "number" ? value.toFixed(config.metricKey === "noise" ? 1 : 0) : value;
  const unitText = config.unit.trim();

  return (
    <div className={`display-board-fullscreen__metric display-board-fullscreen__metric--${status.code}`}>
      <div className="display-board-fullscreen__label">
        <span className="display-board-fullscreen__name">{config.label}</span>
        <span className={`display-board-fullscreen__status display-board-fullscreen__status--${status.code}`}>
          {status.label}
        </span>
      </div>

      <div className="display-board-fullscreen__gauge">
        <div className={`display-board-fullscreen__gauge-track display-board-fullscreen__gauge-track--${config.variant}`}>
          <div className={fillClass} style={{ width: `${markerPct}%` }} />
          <span className="display-board-fullscreen__reference" style={{ left: `${referencePct}%` }}>
            <span className="display-board-fullscreen__reference-line" />
            <span className="display-board-fullscreen__reference-label">{config.referenceLine}</span>
          </span>
          <span className="display-board-fullscreen__marker" style={{ left: `${markerPct}%` }} aria-hidden="true" />
        </div>
      </div>

      <div className="display-board-fullscreen__reading">
        <span className="display-board-fullscreen__emoji" aria-hidden="true">
          {getStatusEmoji(status.code)}
        </span>
        <div className="display-board-fullscreen__value">
          <span className="display-board-fullscreen__value-number">{formattedValue}</span>
          <span className="display-board-fullscreen__value-unit">{unitText}</span>
        </div>
      </div>
    </div>
  );
}

export default function DisplayBoardFullscreen({ reading }) {
  const node = getNodeById(reading.device_id);

  return (
    <div className="display-board-fullscreen__panel">
      <header className="display-board-fullscreen__header">
        <h2 className="display-board-fullscreen__title">INDIANA FAB PROJECT</h2>
        <p className="display-board-fullscreen__subtitle">ENVIRONMENTAL INFORMATION</p>
      </header>

      <div className="display-board-fullscreen__meta">
        <p className="display-board-fullscreen__location">
          <span className="display-board-fullscreen__meta-label">Location</span>
          <span className="display-board-fullscreen__meta-value">
            #{reading.device_id} - {node.label}
          </span>
        </p>
        <div className="display-board-fullscreen__status-block">
          <span className="display-board-fullscreen__meta-label">Date</span>
          <time className="display-board-fullscreen__timestamp" dateTime={reading.time}>
            {formatBoardTimestamp(reading.time)}
          </time>
        </div>
      </div>

      <div className="display-board-fullscreen__measurement">
        <div className="display-board-fullscreen__metrics">
          <FullscreenMetric config={GAUGE_CONFIG.pm10} value={reading.pm10} />
          <FullscreenMetric config={GAUGE_CONFIG.pm25} value={reading.pm25} />
          <FullscreenMetric config={GAUGE_CONFIG.noise} value={reading.noise_dba} />
        </div>
      </div>
    </div>
  );
}
