import { useMemo } from "react";
import MetricTrendChart from "../components/MetricTrendChart";
import StatusBadge from "../components/StatusBadge";
import { CHART_COLORS } from "../data/mockData";
import {
  getAnalysisAverageKpiLabel,
  getNodeNoiseAnalysis,
  noiseStatus,
} from "../data/mockAnalysisData";
import { formatPeakTime } from "../api/latest";
import { formatNodeLocation } from "../data/nodes";
import useChartData from "../hooks/useChartData";
import { METRIC_THRESHOLDS } from "../data/thresholds";

function isOverThreshold(value, threshold = 70) {
  return value > threshold;
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

export default function NoiseAnalysis({
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
  const nodeData = useMemo(() => getNodeNoiseAnalysis(nodeId), [nodeId]);
  const { data: trendData } = useChartData(nodeId);

  const kpis = useMemo(() => {
    const movingAverage = resolveLiveValue({
      loading,
      error: liveMetricsError,
      noData: liveMetricsNoData,
      value: liveMetrics?.noise,
      formatValue: (value) => String(value),
      getStatus: noiseStatus,
    });

    const lmaxData = dailyMax?.noise_dba;
    const lmaxValue = lmaxData?.max;
    const lmax = resolveLiveValue({
      loading,
      error: dailyMaxError,
      noData: dailyMaxNoData || typeof lmaxValue !== "number" || Number.isNaN(lmaxValue),
      value: lmaxValue,
      formatValue: (value) => value.toFixed(1),
      getStatus: noiseStatus,
    });

    return [
      {
        id: "ma",
        label: getAnalysisAverageKpiLabel(averageMinutes, "noise"),
        unit: "dB(A)",
        limit: "Threshold 70 dB(A)",
        ...movingAverage,
      },
      {
        id: "lmax",
        label: "Lmax",
        unit: "dB(A)",
        limit: "Threshold 75 dB(A)",
        peakTime:
          !loading &&
          !dailyMaxError &&
          !dailyMaxNoData &&
          typeof lmaxValue === "number"
            ? formatPeakTime(lmaxData?.time)
            : null,
        ...lmax,
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
          <h2 className="section-title">시간대별 소음 추이</h2>
          <span className="section-meta">24h · {formatNodeLocation(nodeId)}</span>
        </div>
        <MetricTrendChart
          data={trendData}
          dataKey={METRIC_THRESHOLDS.noise.dataKey}
          name={METRIC_THRESHOLDS.noise.label}
          unit={METRIC_THRESHOLDS.noise.unit}
          thresholds={METRIC_THRESHOLDS.noise.levels}
          stroke={CHART_COLORS.line}
          height={300}
        />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">노드 소음 상세</h2>
          <span className="section-meta">Node: {nodeId}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table na-zone-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>15-min MA</th>
                <th>Lmax</th>
                <th>L10</th>
                <th>L50</th>
                <th>L90</th>
                <th>Exceed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="data-table__zone">{nodeData.nodeSummary.nodeId}</td>
                <td className={isOverThreshold(nodeData.nodeSummary.movingAverage) ? "data-table__warn" : ""}>
                  {nodeData.nodeSummary.movingAverage}
                </td>
                <td className={isOverThreshold(nodeData.nodeSummary.lmax, 75) ? "data-table__warn" : ""}>
                  {nodeData.nodeSummary.lmax}
                </td>
                <td className={isOverThreshold(nodeData.nodeSummary.l10) ? "data-table__warn" : ""}>
                  {nodeData.nodeSummary.l10}
                </td>
                <td>{nodeData.nodeSummary.l50}</td>
                <td>{nodeData.nodeSummary.l90}</td>
                <td className={nodeData.nodeSummary.exceed > 0 ? "data-table__warn" : ""}>
                  {nodeData.nodeSummary.exceed}
                </td>
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
    return <div className="na-page">{content}</div>;
  }

  return <div className="page-shell na-page">{content}</div>;
}
