import { METRIC_THRESHOLDS } from "../data/thresholds";

export const GAUGE_CONFIG = {
  pm10: {
    metricKey: "pm10",
    max: 200,
    variant: "pm",
    label: "Particulate Matter (PM10)",
    unit: " μg/m³",
    referenceLine: METRIC_THRESHOLDS.pm10.levels[0].value,
  },
  pm25: {
    metricKey: "pm25",
    max: 70,
    variant: "pm",
    label: "Ultra-fine Particles (PM2.5)",
    unit: " μg/m³",
    referenceLine: METRIC_THRESHOLDS.pm25.levels[0].value,
  },
  noise: {
    metricKey: "noise",
    max: 90,
    variant: "noise",
    label: "Noise Level (dB)",
    unit: " dB(A)",
    referenceLine: METRIC_THRESHOLDS.noise.levels[0].value,
  },
};

export function getDisplayStatus(value, metricKey) {
  const { levels } = METRIC_THRESHOLDS[metricKey];

  if (value >= levels[2].value) {
    return { code: "critical", label: "CRITICAL" };
  }
  if (value >= levels[1].value) {
    return { code: "warning", label: "WARNING" };
  }
  if (value >= levels[0].value) {
    return { code: "caution", label: "CAUTION" };
  }

  return {
    code: "normal",
    label: "NORMAL",
  };
}

export function getStatusEmoji(code) {
  switch (code) {
    case "critical":
      return "🚨";
    case "warning":
      return "😐";
    case "caution":
      return "⚠️";
    default:
      return "😊";
  }
}

export function getGaugeMarkerPercent(value, max) {
  return Math.min(100, Math.max(0, (value / max) * 100));
}
