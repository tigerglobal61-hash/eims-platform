import { METRIC_THRESHOLDS } from "../data/thresholds";
import { getStatusDisplayLabel } from "./statusDisplayLabels";

export const GAUGE_CONFIG = {
  pm10: {
    metricKey: "pm10",
    max: 200,
    label: "Particulate (PM10)",
    unit: " μg/m³",
  },
  pm25: {
    metricKey: "pm25",
    max: 70,
    label: "Particulate (PM2.5)",
    unit: " μg/m³",
  },
  noise: {
    metricKey: "noise",
    max: 90,
    label: "Noise (dBA)",
    unit: " dB(A)",
  },
};

export const GAUGE_SEGMENT_BOUNDARIES = [25, 50, 75];

export function getDisplayStatus(value, metricKey) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return { code: "unavailable", label: "UNAVAILABLE" };
  }

  const { levels } = METRIC_THRESHOLDS[metricKey];

  if (value >= levels[2].value) {
    return { code: "critical", label: getStatusDisplayLabel("critical", { uppercase: true }) };
  }
  if (value >= levels[1].value) {
    return { code: "warning", label: getStatusDisplayLabel("warning", { uppercase: true }) };
  }
  if (value >= levels[0].value) {
    return { code: "caution", label: getStatusDisplayLabel("caution", { uppercase: true }) };
  }

  return {
    code: "normal",
    label: getStatusDisplayLabel("normal", { uppercase: true }),
  };
}

export function getGaugeThresholdLabels(metricKey) {
  const { levels } = METRIC_THRESHOLDS[metricKey];

  return levels.map((level, index) => ({
    value: level.value,
    percent: GAUGE_SEGMENT_BOUNDARIES[index],
  }));
}

/**
 * Maps a measured value into the visually equal 25% gauge segments,
 * interpolating within each segment using the metric's threshold bounds.
 */
export function getGaugeMarkerPercent(value, metricKey, max) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  const { levels } = METRIC_THRESHOLDS[metricKey];
  const [t1, t2, t3] = levels.map((level) => level.value);
  const segmentSpan = 25;

  if (value < t1) {
    const lowerBound = 0;
    const range = t1 - lowerBound || 1;
    const ratio = (value - lowerBound) / range;
    return ratio * segmentSpan;
  }

  if (value < t2) {
    const range = t2 - t1 || 1;
    const ratio = (value - t1) / range;
    return segmentSpan + ratio * segmentSpan;
  }

  if (value < t3) {
    const range = t3 - t2 || 1;
    const ratio = (value - t2) / range;
    return segmentSpan * 2 + ratio * segmentSpan;
  }

  const upperBound = max > t3 ? max : t3 + 1;
  const range = upperBound - t3 || 1;
  const ratio = Math.min(1, Math.max(0, (value - t3) / range));
  return segmentSpan * 3 + ratio * segmentSpan;
}
