import { NODE_LIST, formatNodeOption } from "../data/nodes";

export default function NodeSelect({
  value,
  onChange,
  id = "node-select",
  className = "",
  meta,
}) {
  return (
    <div className={`node-selector ${className}`.trim()}>
      <label className="node-selector__field" htmlFor={id}>
        <span className="node-selector__label">Node</span>
        <select
          id={id}
          className="form-field__input node-selector__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {NODE_LIST.map((node) => (
            <option key={node.id} value={node.id}>
              {formatNodeOption(node)}
            </option>
          ))}
        </select>
      </label>
      {meta ? <span className="node-selector__meta">{meta}</span> : null}
    </div>
  );
}
