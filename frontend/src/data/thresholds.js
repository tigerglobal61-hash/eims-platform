export const MOVING_AVERAGE_LABEL = "15-min moving average";

export const THRESHOLD_KO = {
  caution: "주의",
  warning: "경계",
  critical: "심각",
};

export const METRIC_THRESHOLDS = {
  noise: {
    unit: "dB(A)",
    label: "Noise dB(A)",
    siteLabel: "Site Average Noise dB(A)",
    dataKey: "noise",
    yDomain: [30, 90],
    levels: [
      { key: "caution", value: 70, label: "Caution 70" },
      { key: "warning", value: 75, label: "Warning 75" },
      { key: "critical", value: 80, label: "Critical 80" },
    ],
  },
  pm10: {
    unit: "μg/m³",
    label: "PM10",
    siteLabel: "Site Average PM10",
    dataKey: "pm10",
    yDomain: [0, 200],
    levels: [
      { key: "caution", value: 150, label: "Caution 150" },
      { key: "warning", value: 160, label: "Warning 160" },
      { key: "critical", value: 170, label: "Critical 170" },
    ],
  },
  pm25: {
    unit: "μg/m³",
    label: "PM2.5",
    siteLabel: "Site Average PM2.5",
    dataKey: "pm25",
    yDomain: [0, 70],
    levels: [
      { key: "caution", value: 35, label: "Caution 35" },
      { key: "warning", value: 45, label: "Warning 45" },
      { key: "critical", value: 55, label: "Critical 55" },
    ],
  },
};

export const THRESHOLD_LINE_COLORS = {
  caution: "#eab308",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export const THRESHOLD_LABEL_OFFSET = {
  caution: 0,
  warning: 16,
  critical: 32,
};

export function getMetricStatus(value, metricKey) {
  const { levels } = METRIC_THRESHOLDS[metricKey];
  if (value >= levels[2].value) return "critical";
  if (value >= levels[1].value) return "warning";
  if (value >= levels[0].value) return "info";
  return "good";
}
