import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

function StackTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{label}:00</span>
      {payload.map((entry) => (
        <span key={entry.dataKey} className="noise-chart-tooltip__value" style={{ color: entry.color }}>
          {entry.name}: {entry.value}건
        </span>
      ))}
    </div>
  );
}

export default function StackedBarChart({ data, bars, height = 260, xKey = "hour" }) {
  return (
    <div className="noise-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis tick={{ fill: CHART_COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<StackTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.axis }} />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              stackId="a"
              fill={bar.color}
              radius={bar.radius}
              maxBarSize={32}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
