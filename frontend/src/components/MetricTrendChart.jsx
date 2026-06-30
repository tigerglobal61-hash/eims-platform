import { useMemo } from "react";
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
import { CHART_COLORS } from "../data/mockData";
import { THRESHOLD_KO, THRESHOLD_LINE_COLORS } from "../data/thresholds";

const HEADROOM = 10;

const MIN_LABEL_OFFSET = {
  caution: 0,
  warning: 4,
  critical: 8,
};

function getYAxisDomain(data, dataKey, thresholds) {
  const thresholdValues = thresholds.map((t) => t.value);
  const values = (data ?? []).map((d) => Number(d[dataKey])).filter(Number.isFinite);
  const dataMax = values.length ? Math.max(...values) : 0;
  const thresholdMax = thresholdValues.length ? Math.max(...thresholdValues) : 0;
  const scaleMax = Math.max(thresholdMax, dataMax);

  const domainMax = Math.ceil((scaleMax + HEADROOM) / 5) * 5;

  return [0, domainMax];
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="noise-chart-tooltip">
      <span className="noise-chart-tooltip__time">{label}</span>
      <span className="noise-chart-tooltip__value">
        {payload[0].value} {unit}
      </span>
    </div>
  );
}

function ThresholdReferenceLabel({ viewBox, thresholdKey, value }) {
  if (!viewBox) return null;

  const { x, y, width } = viewBox;
  const color = THRESHOLD_LINE_COLORS[thresholdKey];
  const label = `${THRESHOLD_KO[thresholdKey]} ${value}`;
  const labelWidth = 54;
  const labelHeight = 16;
  const offsetY = MIN_LABEL_OFFSET[thresholdKey] ?? 0;
  const boxX = x + width - labelWidth - 6;
  const boxY = y - labelHeight / 2 - offsetY;

  return (
    <g>
      <rect
        x={boxX}
        y={boxY}
        width={labelWidth}
        height={labelHeight}
        rx={4}
        fill="rgba(7, 17, 31, 0.88)"
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={boxX + labelWidth / 2}
        y={boxY + labelHeight / 2 + 4}
        textAnchor="middle"
        fill={color}
        fontSize={10}
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}

export default function MetricTrendChart({
  data,
  dataKey,
  name,
  unit,
  height = 220,
  thresholds = [],
  stroke = CHART_COLORS.line,
}) {
  const yAxisDomain = useMemo(
    () => getYAxisDomain(data, dataKey, thresholds),
    [data, dataKey, thresholds],
  );

  return (
    <div className="noise-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 120, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            interval={2}
          />
          <YAxis
            domain={yAxisDomain}
            tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: unit,
              angle: -90,
              position: "insideLeft",
              fill: CHART_COLORS.axis,
              fontSize: 11,
              offset: 10,
            }}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          {thresholds.map((threshold) => (
            <ReferenceLine
              key={threshold.key}
              y={threshold.value}
              stroke={THRESHOLD_LINE_COLORS[threshold.key]}
              strokeDasharray="6 4"
              label={
                <ThresholdReferenceLabel
                  thresholdKey={threshold.key}
                  value={threshold.value}
                />
              }
            />
          ))}
          <Line
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={stroke}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: stroke, stroke: "#07111f", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { getYAxisDomain };
