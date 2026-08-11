import { getStatusDisplayLabel } from "../utils/statusDisplayLabels";

const LABELS = {
  good: getStatusDisplayLabel("good"),
  info: getStatusDisplayLabel("info"),
  warning: getStatusDisplayLabel("warning"),
  critical: getStatusDisplayLabel("critical"),
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-dot" />
      {LABELS[status] ?? status}
    </span>
  );
}
