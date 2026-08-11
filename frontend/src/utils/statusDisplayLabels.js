export const STATUS_DISPLAY_LABELS = {
  normal: "Normal",
  good: "Normal",
  unavailable: "Unavailable",
  attention: "Elevated",
  caution: "Elevated",
  info: "Elevated",
  elevated: "High",
  warning: "High",
  high: "High",
  critical: "Very High",
};

export const BACKEND_ALERT_LEVEL_LABELS = {
  Attention: "Elevated",
  Elevated: "High",
  High: "Very High",
  Normal: "Normal",
};

export function getStatusDisplayLabel(key, { uppercase = false } = {}) {
  if (key == null || key === "") {
    return uppercase ? "—" : "—";
  }

  const direct = BACKEND_ALERT_LEVEL_LABELS[key];
  const normalized = String(key).toLowerCase();
  const label = direct ?? STATUS_DISPLAY_LABELS[normalized] ?? String(key);

  return uppercase ? label.toUpperCase() : label;
}

export function getAlertLevelDisplayLabel(level) {
  return getStatusDisplayLabel(level);
}
