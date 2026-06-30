import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "../data/mockData";

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{payload[0].name}</span>
      <span className="noise-chart-tooltip__value">{payload[0].value} MB</span>
    </div>
  );
}

export default function StoragePieChart({ data, height = 260 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="storage-chart">
      <div className="noise-chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="storage-legend">
        {data.map((item) => (
          <li key={item.name}>
            <span className="storage-legend__dot" style={{ background: item.color }} />
            <span>{item.name}</span>
            <span className="storage-legend__value">
              {item.value} MB ({Math.round((item.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
