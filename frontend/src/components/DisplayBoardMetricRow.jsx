import {
  GAUGE_CONFIG,
  getDisplayStatus,
  getGaugeMarkerPercent,
  getGaugeThresholdLabels,
} from "../utils/displayBoardStatus";

function formatMetricValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return String(Math.round(value));
}

function GaugeTrack({ metricKey, max, value, hasValue }) {
  const thresholdLabels = getGaugeThresholdLabels(metricKey);
  const markerPct = hasValue ? getGaugeMarkerPercent(value, metricKey, max) : 0;

  return (
    <>
      <div className={`db-gauge__track${hasValue ? "" : " db-gauge__track--unavailable"}`}>
        <div className="db-gauge__segments" aria-hidden="true">
          {hasValue ? (
            <>
              <div className="db-gauge__segment db-gauge__segment--green" />
              <div className="db-gauge__segment db-gauge__segment--yellow" />
              <div className="db-gauge__segment db-gauge__segment--orange" />
              <div className="db-gauge__segment db-gauge__segment--red" />
            </>
          ) : (
            <div className="db-gauge__segment db-gauge__segment--unavailable" />
          )}
        </div>

        {hasValue && (
          <span className="db-gauge__marker" style={{ left: `${markerPct}%` }} aria-hidden="true" />
        )}
      </div>

      {hasValue && (
        <div className="db-gauge__thresholds" aria-hidden="true">
          {thresholdLabels.map((marker) => (
            <span
              key={marker.value}
              className="db-gauge__threshold"
              style={{ left: `${marker.percent}%` }}
            >
              <span className="db-gauge__threshold-tick" />
              <span className="db-gauge__threshold-label">{marker.value}</span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default function DisplayBoardMetricRow({ config, value }) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  const status = hasValue
    ? getDisplayStatus(value, config.metricKey)
    : { code: "unavailable", label: "UNAVAILABLE" };
  const formattedValue = formatMetricValue(value);
  const unitText = config.unit.trim();

  return (
    <div className={`db-metric-row db-metric-row--${status.code}`}>
      <div className="db-metric-row__label">
        <span className="db-metric-row__name">{config.label}</span>
        <span className={`db-metric-row__status db-metric-row__status--${status.code}`}>
          {status.label}
        </span>
      </div>

      <div className="db-gauge">
        <GaugeTrack
          metricKey={config.metricKey}
          max={config.max}
          value={value}
          hasValue={hasValue}
        />
      </div>

      <div className="db-metric-row__value">
        <span className="db-metric-row__value-number">{formattedValue}</span>
        {hasValue && <span className="db-metric-row__value-unit">{unitText}</span>}
      </div>
    </div>
  );
}

export { GAUGE_CONFIG };
