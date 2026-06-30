import { useState } from "react";
import MultiLineChart from "../components/MultiLineChart";
import FilterChips from "../components/FilterChips";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import {
  CHART_COLORS,
  RTM_KPI_SUMMARY,
  RTM_TIMELINE_DATA,
  SENSOR_HEALTH,
  SENSOR_NODES,
} from "../data/mockData";

const MAP_ZONES = [
  { label: "구역 A", x: 8, y: 8, w: 38, h: 38 },
  { label: "구역 B", x: 50, y: 8, w: 42, h: 38 },
  { label: "구역 C", x: 8, y: 52, w: 42, h: 38 },
  { label: "구역 D", x: 54, y: 52, w: 38, h: 38 },
];

function MetricBar({ label, value, tone = "good" }) {
  return (
    <div className="rtm-metric-bar">
      <div className="rtm-metric-bar__header">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="rtm-metric-bar__track">
        <div
          className={`rtm-metric-bar__fill rtm-metric-bar__fill--${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function signalTone(value) {
  if (value < 80) return "warning";
  if (value < 85) return "info";
  return "good";
}

function batteryTone(value) {
  if (value < 70) return "warning";
  if (value < 80) return "info";
  return "good";
}

export default function RealTimeMonitoring() {
  const [streamMode, setStreamMode] = useState("Live");

  return (
    <div className="page-shell rtm-page">
      <PageToolbar exports={["CSV", "JSON"]}>
        <FilterChips options={["Live", "Paused"]} value={streamMode} onChange={setStreamMode} />
        {streamMode === "Live" && <span className="status-dot status-dot--pulse" />}
        <span className="section-meta">{streamMode === "Live" ? "Mock Stream" : "Paused"}</span>
      </PageToolbar>

      <section className="rtm-kpi-row">
        {RTM_KPI_SUMMARY.map((kpi) => (
          <article key={kpi.id} className={`rtm-kpi-card rtm-kpi-card--${kpi.status}`}>
            <span className="rtm-kpi-card__label">{kpi.label}</span>
            <div className="rtm-kpi-card__value-row">
              <span className="rtm-kpi-card__value">{kpi.value}</span>
              <span className="rtm-kpi-card__unit">{kpi.unit}</span>
            </div>
            <div className="rtm-kpi-card__footer">
              <StatusBadge status={kpi.status} />
              <span className="rtm-kpi-card__delta">{kpi.delta}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="rtm-main-grid">
        <section className="panel rtm-map-panel">
          <div className="section-header">
            <h2 className="section-title">현장 센서 맵</h2>
            <span className="section-meta">
              <span className="status-dot status-dot--pulse" /> Live · 8 Nodes
            </span>
          </div>

          <div className="rtm-map">
            <div className="rtm-map__grid" aria-hidden="true" />
            {MAP_ZONES.map((zone) => (
              <div
                key={zone.label}
                className="rtm-map__zone"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.w}%`,
                  height: `${zone.h}%`,
                }}
              >
                {zone.label}
              </div>
            ))}
            {SENSOR_NODES.map((node) => (
              <div
                key={node.id}
                className={`rtm-map__node rtm-map__node--${node.status}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <span className="rtm-map__node-pulse" />
                <span className="rtm-map__node-dot" />
                <div className="rtm-map__node-card">
                  <span className="rtm-map__node-id">{node.id}</span>
                  <span className="rtm-map__node-noise">{node.noise} dBA</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rtm-map-legend">
            <span><i className="rtm-legend-dot rtm-legend-dot--good" /> 정상</span>
            <span><i className="rtm-legend-dot rtm-legend-dot--warning" /> 주의</span>
            <span><i className="rtm-legend-dot rtm-legend-dot--info" /> 지연</span>
          </div>
        </section>

        <section className="panel rtm-nodes-panel">
          <div className="section-header">
            <h2 className="section-title">노드 상태</h2>
            <span className="section-meta">8개 센서 노드</span>
          </div>
          <div className="rtm-node-grid">
            {SENSOR_NODES.map((node) => (
              <article key={node.id} className={`rtm-node-card rtm-node-card--${node.status}`}>
                <div className="rtm-node-card__header">
                  <div>
                    <span className="rtm-node-card__id">{node.id}</span>
                    <span className="rtm-node-card__name">{node.name}</span>
                  </div>
                  <StatusBadge status={node.status} />
                </div>
                <span className="rtm-node-card__zone">{node.zone}</span>
                <div className="rtm-node-card__metrics">
                  <div>
                    <span className="rtm-node-card__metric-label">소음</span>
                    <span className="rtm-node-card__metric-value">{node.noise} dBA</span>
                  </div>
                  <div>
                    <span className="rtm-node-card__metric-label">PM2.5</span>
                    <span className="rtm-node-card__metric-value">{node.pm25} μg/m³</span>
                  </div>
                </div>
                <MetricBar label="신호" value={node.signal} tone={signalTone(node.signal)} />
                <MetricBar label="배터리" value={node.battery} tone={batteryTone(node.battery)} />
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">실시간 타임라인</h2>
          <span className="section-meta">최근 30분 · 5분 간격 · Mock</span>
        </div>
        <MultiLineChart
          data={RTM_TIMELINE_DATA}
          xKey="time"
          xInterval={0}
          height={260}
          lines={[
            { key: "noise", name: "소음 (dBA)", color: CHART_COLORS.line },
            { key: "pm25", name: "PM2.5 (μg/m³)", color: CHART_COLORS.lineAlt },
          ]}
        />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">센서 헬스 모니터링</h2>
          <span className="section-meta">{SENSOR_HEALTH.length}개 노드</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>노드 ID</th>
                <th>이름</th>
                <th>구역</th>
                <th>가동률</th>
                <th>지연</th>
                <th>배터리</th>
                <th>신호</th>
                <th>펌웨어</th>
                <th>마지막 점검</th>
                <th>헬스</th>
              </tr>
            </thead>
            <tbody>
              {SENSOR_HEALTH.map((row) => (
                <tr key={row.id}>
                  <td className="data-table__zone">{row.id}</td>
                  <td>{row.node}</td>
                  <td>{row.zone}</td>
                  <td>{row.uptime}</td>
                  <td className={parseInt(row.latency, 10) > 60 ? "data-table__warn" : ""}>
                    {row.latency}
                  </td>
                  <td className={row.battery < 70 ? "data-table__warn" : ""}>{row.battery}%</td>
                  <td className={row.signal < 80 ? "data-table__warn" : ""}>{row.signal}%</td>
                  <td>{row.firmware}</td>
                  <td>{row.lastCheck}</td>
                  <td>
                    <StatusBadge status={row.health} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
