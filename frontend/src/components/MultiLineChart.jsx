import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartTimeLabel } from "../api/chart";
import { CHART_COLORS } from "../data/mockData";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{formatChartTimeLabel(label)}</span>
      {payload.map((entry) => (
        <span key={entry.dataKey} className="noise-chart-tooltip__value" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </span>
      ))}
    </div>
  );
}

export default function MultiLineChart({
  data,
  lines,
  height = 280,
  yLabel,
  xKey = "hour",
  xInterval = 2,
}) {
  return (
    <div className="noise-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            interval={xInterval}
            tickFormatter={xKey === "time" ? formatChartTimeLabel : undefined}
          />
          <YAxis
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={
              yLabel
                ? {
                    value: yLabel,
                    angle: -90,
                    position: "insideLeft",
                    fill: CHART_COLORS.axis,
                    fontSize: 11,
                    offset: 10,
                  }
                : undefined
            }
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.axis }} />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
