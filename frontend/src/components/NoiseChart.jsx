import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, NOISE_TREND_DATA } from "../data/mockData";

function NoiseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{label}</span>
      <span className="noise-chart-tooltip__value">{payload[0].value} dBA</span>
    </div>
  );
}

export default function NoiseChart({ height = 240, threshold = 70, thresholdLabel = "기준 70 dBA" }) {
  return (
    <div className="noise-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={NOISE_TREND_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            interval={2}
          />
          <YAxis
            domain={[30, 80]}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "dBA",
              angle: -90,
              position: "insideLeft",
              fill: CHART_COLORS.axis,
              fontSize: 11,
              offset: 10,
            }}
          />
          <Tooltip
            content={<NoiseTooltip />}
            cursor={{ stroke: CHART_COLORS.line, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          {threshold && (
            <ReferenceLine
              y={threshold}
              stroke={CHART_COLORS.threshold}
              strokeDasharray="6 4"
              label={{
                value: thresholdLabel,
                fill: CHART_COLORS.threshold,
                fontSize: 11,
                position: "insideTopRight",
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="noise"
            name="Noise"
            stroke={CHART_COLORS.line}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: CHART_COLORS.line, stroke: "#07111f", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
