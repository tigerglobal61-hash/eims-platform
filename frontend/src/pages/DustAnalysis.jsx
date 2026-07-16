import { useMemo } from "react";
import BarDistributionChart from "../components/BarDistributionChart";
import MultiLineChart from "../components/MultiLineChart";
import StatusBadge from "../components/StatusBadge";
import { CHART_COLORS } from "../data/mockData";
import {
  getAnalysisAverageKpiLabel,
  getNodeDustAnalysis,
  pmStatus,
} from "../data/mockAnalysisData";
import { formatPeakTime } from "../api/latest";
import { formatNodeLocation } from "../data/nodes";
import useChartData from "../hooks/useChartData";

function dustBarColor(entry) {
  const start = parseInt(entry.range.split("-")[0], 10);
  if (start >= 25) return CHART_COLORS.threshold;
  if (start >= 15) return CHART_COLORS.lineWarm;
  return CHART_COLORS.line;
}

function resolveLiveValue({ loading, error, noData, value, formatValue, getStatus }) {
  if (loading) {
    return { value: "—", status: "good", dataStatus: null };
  }

  if (error) {
    return { value: "—", status: "good", dataStatus: "Unable to load" };
  }

  if (noData || typeof value !== "number" || Number.isNaN(value)) {
    return { value: "—", status: "good", dataStatus: "No data" };
  }

  return {
    value: formatValue(value),
    status: getStatus(value),
    dataStatus: null,
  };
}

export default function DustAnalysis({
  embedded = false,
  nodeId = "D1",
  liveMetrics = null,
  dailyMax = null,
  averageMinutes = 15,
  loading = false,
  liveMetricsError = false,
  dailyMaxError = false,
  liveMetricsNoData = false,
  dailyMaxNoData = false,
}) {
  const nodeData = useMemo(() => getNodeDustAnalysis(nodeId), [nodeId]);
  const { data: trendData } = useChartData(nodeId);

  const kpis = useMemo(() => {
    const pm25Average = resolveLiveValue({
      loading,
      error: liveMetricsError,
      noData: liveMetricsNoData,
      value: liveMetrics?.pm25,
      formatValue: (value) => String(value),
      getStatus: (value) => pmStatus(value, 35, 45, 55),
    });

    const pm10Average = resolveLiveValue({
      loading,
      error: liveMetricsError,
      noData: liveMetricsNoData,
      value: liveMetrics?.pm10,
      formatValue: (value) => String(value),
      getStatus: (value) => pmStatus(value, 150, 160, 170),
    });

    const pm25MaxData = dailyMax?.pm25;
    const pm25MaxValue = pm25MaxData?.max;
    const pm25Max = resolveLiveValue({
      loading,
      error: dailyMaxError,
      noData: dailyMaxNoData || typeof pm25MaxValue !== "number" || Number.isNaN(pm25MaxValue),
      value: pm25MaxValue,
      formatValue: (value) => value.toFixed(1),
      getStatus: (value) => pmStatus(value, 35, 45, 55),
    });

    const pm10MaxData = dailyMax?.pm10;
    const pm10MaxValue = pm10MaxData?.max;
    const pm10Max = resolveLiveValue({
      loading,
      error: dailyMaxError,
      noData: dailyMaxNoData || typeof pm10MaxValue !== "number" || Number.isNaN(pm10MaxValue),
      value: pm10MaxValue,
      formatValue: (value) => value.toFixed(1),
      getStatus: (value) => pmStatus(value, 150, 160, 170),
    });

    return [
      {
        id: "pm25_avg",
        label: getAnalysisAverageKpiLabel(averageMinutes, "pm25"),
        unit: "μg/m³",
        limit: "Threshold 35 μg/m³",
        ...pm25Average,
      },
      {
        id: "pm10_avg",
        label: getAnalysisAverageKpiLabel(averageMinutes, "pm10"),
        unit: "μg/m³",
        limit: "Threshold 150 μg/m³",
        ...pm10Average,
      },
      {
        id: "pm25_max",
        label: "PM2.5 Max",
        unit: "μg/m³",
        limit: "Threshold 35 μg/m³",
        peakTime:
          !loading &&
          !dailyMaxError &&
          !dailyMaxNoData &&
          typeof pm25MaxValue === "number"
            ? formatPeakTime(pm25MaxData?.time)
            : null,
        ...pm25Max,
      },
      {
        id: "pm10_max",
        label: "PM10 Max",
        unit: "μg/m³",
        limit: "Threshold 150 μg/m³",
        peakTime:
          !loading &&
          !dailyMaxError &&
          !dailyMaxNoData &&
          typeof pm10MaxValue === "number"
            ? formatPeakTime(pm10MaxData?.time)
            : null,
        ...pm10Max,
      },
    ];
  }, [
    loading,
    liveMetrics,
    dailyMax,
    averageMinutes,
    liveMetricsError,
    dailyMaxError,
    liveMetricsNoData,
    dailyMaxNoData,
  ]);

  const content = (
    <>
      <section className="na-kpi-row">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`na-kpi-card na-kpi-card--${kpi.status}`}>
            <div className="na-kpi-card__header">
              <div>
                <span className="na-kpi-card__label">{kpi.label}</span>
                {kpi.peakTime && (
                  <span className="na-kpi-card__desc">발생시간 {kpi.peakTime}</span>
                )}
                {kpi.dataStatus && (
                  <span className="na-kpi-card__desc">{kpi.dataStatus}</span>
                )}
              </div>
              <StatusBadge status={kpi.status} />
            </div>
            <div className="na-kpi-card__value-row">
              <span className="na-kpi-card__value">{kpi.value}</span>
              <span className="na-kpi-card__unit">{kpi.unit}</span>
            </div>
            <span className="na-kpi-card__limit">{kpi.limit}</span>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">24시간 미세먼지 추이</h2>
          <span className="section-meta">PM2.5 / PM10 · {formatNodeLocation(nodeId)}</span>
        </div>
        <MultiLineChart
          data={trendData}
          xKey="time"
          height={300}
          yLabel="μg/m³"
          lines={[
            { key: "pm25", name: "PM2.5", color: CHART_COLORS.line },
            { key: "pm10", name: "PM10", color: CHART_COLORS.lineAlt },
          ]}
        />
      </section>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">PM2.5 Distribution</h2>
          <span className="section-meta">Node: {nodeId}</span>
        </div>
        <BarDistributionChart
          data={nodeData.distribution}
          xLabel="μg/m³ range"
          getColor={dustBarColor}
        />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">노드 미세먼지 상세</h2>
          <span className="section-meta">Node: {nodeId}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table na-zone-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>PM2.5 Avg</th>
                <th>PM10 Avg</th>
                <th>PM2.5 Max</th>
                <th>PM10 Max</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="data-table__zone">{nodeData.nodeSummary.nodeId}</td>
                <td>{nodeData.nodeSummary.pm25}</td>
                <td>{nodeData.nodeSummary.pm10}</td>
                <td>{nodeData.nodeSummary.pm25Max}</td>
                <td>{nodeData.nodeSummary.pm10Max}</td>
                <td>
                  <StatusBadge status={nodeData.nodeSummary.status} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  if (embedded) {
    return content;
  }

  return <div className="page-shell">{content}</div>;
}
