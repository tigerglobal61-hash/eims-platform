import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "../data/mockData";

function CorrTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{item.pair.replace("\n", " ")}</span>
      <span className="noise-chart-tooltip__value">r = {item.coefficient.toFixed(2)}</span>
    </div>
  );
}

export default function CorrelationBarChart({ data, height = 300 }) {
  return (
    <div className="noise-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" horizontal={false} />
          <XAxis
            type="number"
            domain={[-1, 1]}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            type="category"
            dataKey="pair"
            width={110}
            tick={{ fill: CHART_COLORS.axis, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CorrTooltip />} cursor={{ fill: "rgba(45, 140, 240, 0.08)" }} />
          <ReferenceLine x={0} stroke={CHART_COLORS.axis} />
          <Bar dataKey="coefficient" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((entry) => (
              <Cell
                key={entry.pair}
                fill={entry.coefficient >= 0 ? CHART_COLORS.line : CHART_COLORS.lineAlt}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
