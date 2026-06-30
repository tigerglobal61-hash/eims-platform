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
import { CHART_COLORS, NOISE_DISTRIBUTION } from "../data/mockData";

function DistributionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{label} dBA</span>
      <span className="noise-chart-tooltip__value">{payload[0].value}건 ({payload[0].payload.percent}%)</span>
    </div>
  );
}

function barColor(range) {
  const start = parseInt(range.split("-")[0], 10);
  if (start >= 70) return CHART_COLORS.threshold;
  if (start >= 65) return "#fbbf24";
  if (start >= 55) return CHART_COLORS.lineAlt;
  return CHART_COLORS.line;
}

export default function NoiseDistributionChart({ height = 280 }) {
  return (
    <div className="noise-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={NOISE_DISTRIBUTION} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            label={{
              value: "dBA 구간",
              position: "insideBottom",
              offset: -2,
              fill: CHART_COLORS.axis,
              fontSize: 11,
            }}
          />
          <YAxis
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "측정 건수",
              angle: -90,
              position: "insideLeft",
              fill: CHART_COLORS.axis,
              fontSize: 11,
              offset: 10,
            }}
          />
          <Tooltip content={<DistributionTooltip />} cursor={{ fill: "rgba(45, 140, 240, 0.08)" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {NOISE_DISTRIBUTION.map((entry) => (
              <Cell key={entry.range} fill={barColor(entry.range)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
