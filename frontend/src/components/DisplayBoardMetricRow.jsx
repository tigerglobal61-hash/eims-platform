import {
  GAUGE_CONFIG,
  getDisplayBoardStatusPresentation,
} from "../utils/displayBoardStatus";

function formatMetricValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return String(Math.round(value));
}

export default function DisplayBoardMetricRow({ config, value }) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  const presentation = getDisplayBoardStatusPresentation(value, config.metricKey);
  const formattedValue = formatMetricValue(value);
  const unitText = config.unit.trim();

  return (
    <div className={`db-metric-row db-metric-row--${presentation.code}`}>
      <div className="db-metric-row__name">{config.label}</div>

      <div
        className={`db-metric-row__status db-metric-row__status--${presentation.code}`}
        aria-label={hasValue ? `Status: ${presentation.label}` : "Status unavailable"}
      >
        {presentation.label}
      </div>

      <div className="db-metric-row__value">
        <span className="db-metric-row__value-number">{formattedValue}</span>
        {hasValue && <span className="db-metric-row__value-unit">{unitText}</span>}
      </div>
    </div>
  );
}

export { GAUGE_CONFIG };
