import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{point.zone}</span>
      <span className="noise-chart-tooltip__value">소음 {point.noise} dBA</span>
      <span className="noise-chart-tooltip__value" style={{ color: CHART_COLORS.lineAlt }}>
        PM2.5 {point.pm25} μg/m³
      </span>
    </div>
  );
}

export default function CorrelationScatterChart({ data, height = 300 }) {
  return (
    <div className="noise-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" />
          <XAxis
            type="number"
            dataKey="noise"
            name="소음"
            unit=" dBA"
            domain={[50, 80]}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            type="number"
            dataKey="pm25"
            name="PM2.5"
            unit=" μg/m³"
            domain={[5, 20]}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <ZAxis range={[80, 400]} />
          <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "4 4" }} />
          <Scatter data={data} fill={CHART_COLORS.line} fillOpacity={0.85} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
