import { METRIC_THRESHOLDS } from "../data/thresholds";
import { getStatusDisplayLabel } from "./statusDisplayLabels";

export const GAUGE_CONFIG = {
  pm10: {
    metricKey: "pm10",
    label: "Particulate Matter (PM10)",
    unit: " μg/m³",
  },
  pm25: {
    metricKey: "pm25",
    label: "Ultra-fine Particles (PM2.5)",
    unit: " μg/m³",
  },
  noise: {
    metricKey: "noise",
    label: "Noise Level (dB)",
    unit: " dB(A)",
  },
};

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

/**
 * Display Board presentation mapping only — does not change threshold/status logic.
 * normal → GOOD, caution (Elevated) → FAIR, warning/critical (High/Very High) → POOR
 */
export function getDisplayBoardStatusPresentation(value, metricKey) {
  const status = getDisplayStatus(value, metricKey);

  switch (status.code) {
    case "normal":
      return { code: "good", label: "GOOD" };
    case "caution":
      return { code: "fair", label: "FAIR" };
    case "warning":
    case "critical":
      return { code: "poor", label: "POOR" };
    case "unavailable":
      return { code: "unavailable", label: "—" };
    default:
      return { code: "good", label: "GOOD" };
  }
}
