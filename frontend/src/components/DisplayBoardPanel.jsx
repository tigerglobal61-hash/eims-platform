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
        <span className="display-board-led__meta-label">Last updated</span>
        <time className="display-board-led__timestamp" dateTime={reading.time}>
          {formatBoardTimestamp(reading.time)}
        </time>
      </div>
    </div>
  );
}

export default function DisplayBoardPanel({ reading, averageLabel }) {
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
                <DisplayBoardMetricRow config={GAUGE_CONFIG.pm10} value={reading.pm10} />
                <DisplayBoardMetricRow config={GAUGE_CONFIG.pm25} value={reading.pm25} />
                <DisplayBoardMetricRow config={GAUGE_CONFIG.noise} value={reading.noise_dba} />
              </div>
            </div>
          </div>

          <DisplayBoardFootnotes averageLabel={averageLabel} />
        </div>
      </div>
    </div>
  );
}
