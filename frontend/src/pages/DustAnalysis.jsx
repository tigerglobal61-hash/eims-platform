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
import { formatNodeLocation } from "../data/nodes";

function dustBarColor(entry) {
  const start = parseInt(entry.range.split("-")[0], 10);
  if (start >= 25) return CHART_COLORS.threshold;
  if (start >= 15) return CHART_COLORS.lineWarm;
  return CHART_COLORS.line;
}

export default function DustAnalysis({
  embedded = false,
  nodeId = "T1",
  liveMetrics = null,
  averageMinutes = 15,
}) {
  const nodeData = useMemo(() => getNodeDustAnalysis(nodeId), [nodeId]);
  const kpis = useMemo(() => {
    if (!liveMetrics) {
      return nodeData.kpis;
    }

    return nodeData.kpis.map((kpi) => {
      if (kpi.id === "pm25_avg") {
        return {
          ...kpi,
          label: getAnalysisAverageKpiLabel(averageMinutes, "pm25"),
          value: String(liveMetrics.pm25),
          status: pmStatus(liveMetrics.pm25, 35, 45, 55),
        };
      }

      if (kpi.id === "pm10_avg") {
        return {
          ...kpi,
          label: getAnalysisAverageKpiLabel(averageMinutes, "pm10"),
          value: String(liveMetrics.pm10),
          status: pmStatus(liveMetrics.pm10, 150, 160, 170),
        };
      }

      return kpi;
    });
  }, [nodeData.kpis, liveMetrics, averageMinutes]);

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
          <h2 className="section-title">24시간 미세먼지 추이</h2>
          <span className="section-meta">PM2.5 / PM10 · {formatNodeLocation(nodeId)}</span>
        </div>
        <MultiLineChart
          data={nodeData.trend}
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
