export default function FilterChips({ options, value, onChange }) {
  return options.map((option) => (
    <button
      key={option}
      type="button"
      className={`filter-chip ${value === option ? "filter-chip--active" : ""}`}
      onClick={() => onChange(option)}
      aria-pressed={value === option}
    >
      {option}
    </button>
  ));
}
