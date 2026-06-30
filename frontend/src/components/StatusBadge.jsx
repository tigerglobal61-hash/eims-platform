const LABELS = { good: "정상", warning: "주의", critical: "위험", info: "정보" };

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-dot" />
      {LABELS[status]}
    </span>
  );
}
