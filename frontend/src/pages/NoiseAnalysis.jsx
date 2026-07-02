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

export default function NoiseAnalysis({
  embedded = false,
  nodeId = "T1",
  liveMetrics = null,
  dailyMax = null,
  averageMinutes = 15,
}) {
  const nodeData = useMemo(() => getNodeNoiseAnalysis(nodeId), [nodeId]);
  const { data: trendData } = useChartData(nodeId);
  const kpis = useMemo(() => {
    if (nodeId !== "T1") {
      return nodeData.kpis;
    }

    return nodeData.kpis.map((kpi) => {
      if (kpi.id === "ma") {
        return {
          ...kpi,
          label: getAnalysisAverageKpiLabel(averageMinutes, "noise"),
          value: liveMetrics ? String(liveMetrics.noise) : "—",
          status: liveMetrics ? noiseStatus(liveMetrics.noise) : "good",
        };
      }

      if (kpi.id === "lmax") {
        const maxData = dailyMax?.noise_dba;
        const maxValue = maxData?.max;

        return {
          ...kpi,
          value: typeof maxValue === "number" ? maxValue.toFixed(1) : "—",
          peakTime:
            typeof maxValue === "number"
              ? formatPeakTime(maxData?.time)
              : "—",
          status: typeof maxValue === "number" ? noiseStatus(maxValue) : "good",
        };
      }

      return kpi;
    });
  }, [nodeData.kpis, liveMetrics, dailyMax, averageMinutes, nodeId]);

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
