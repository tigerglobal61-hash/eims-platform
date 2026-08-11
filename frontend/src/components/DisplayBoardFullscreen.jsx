import { getNodeById } from "../data/nodes";
import DisplayBoardFootnotes from "./DisplayBoardFootnotes";
import DisplayBoardMetricRow, { GAUGE_CONFIG } from "./DisplayBoardMetricRow";

function formatBoardTimestamp(isoString) {
  if (!isoString) return "—";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

export default function DisplayBoardFullscreen({ reading, averageLabel }) {
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
          <span className="display-board-fullscreen__meta-label">Last updated</span>
          <time className="display-board-fullscreen__timestamp" dateTime={reading.time}>
            {formatBoardTimestamp(reading.time)}
          </time>
        </div>
      </div>

      <div className="display-board-fullscreen__measurement">
        <div className="display-board-fullscreen__metrics">
          <DisplayBoardMetricRow config={GAUGE_CONFIG.pm10} value={reading.pm10} />
          <DisplayBoardMetricRow config={GAUGE_CONFIG.pm25} value={reading.pm25} />
          <DisplayBoardMetricRow config={GAUGE_CONFIG.noise} value={reading.noise_dba} />
        </div>
      </div>

      <DisplayBoardFootnotes averageLabel={averageLabel} fullscreen />
    </div>
  );
}
