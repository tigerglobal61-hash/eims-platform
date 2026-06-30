import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

function DistributionTooltip({ active, payload, label, unit = "건" }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{label}</span>
      <span className="noise-chart-tooltip__value">
        {payload[0].value}
        {unit}
        {payload[0].payload.percent != null ? ` (${payload[0].payload.percent}%)` : ""}
      </span>
    </div>
  );
}

export default function BarDistributionChart({
  data,
  xKey = "range",
  valueKey = "count",
  height = 280,
  xLabel,
  yLabel = "측정 건수",
  unit = "건",
  getColor,
}) {
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
            label={
              xLabel
                ? { value: xLabel, position: "insideBottom", offset: -2, fill: CHART_COLORS.axis, fontSize: 11 }
                : undefined
            }
          />
          <YAxis
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              fill: CHART_COLORS.axis,
              fontSize: 11,
              offset: 10,
            }}
          />
          <Tooltip content={<DistributionTooltip unit={unit} />} cursor={{ fill: "rgba(45, 140, 240, 0.08)" }} />
          <Bar dataKey={valueKey} radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell
                key={`${entry[xKey]}-${index}`}
                fill={getColor ? getColor(entry, index) : CHART_COLORS.line}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
