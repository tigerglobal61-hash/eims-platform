import { useState } from "react";
import MultiLineChart from "../components/MultiLineChart";
import FilterChips from "../components/FilterChips";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import {
  CHART_COLORS,
  ENV_COMFORT_TREND,
  ENV_KPI,
  ENV_TREND_DATA,
  ENV_WIND_DATA,
  ENV_ZONE_COMPARISON,
} from "../data/mockData";

export default function EnvironmentAnalysis() {
  const [view, setView] = useState("오늘");

  return (
    <div className="page-shell">
      <PageToolbar>
        <FilterChips options={["오늘", "온습도", "풍속"]} value={view} onChange={setView} />
      </PageToolbar>

      <section className="na-kpi-row">
        {ENV_KPI.map((kpi) => (
          <article key={kpi.id} className={`na-kpi-card na-kpi-card--${kpi.status}`}>
            <div className="na-kpi-card__header">
              <div>
                <span className="na-kpi-card__label">{kpi.label}</span>
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

      <div className="na-charts-grid">
        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">24시간 온습도 추이</h2>
            <span className="section-meta">Temperature / Humidity</span>
          </div>
          <MultiLineChart
            data={ENV_TREND_DATA}
            height={280}
            lines={[
              { key: "temp", name: "온도 (°C)", color: CHART_COLORS.lineWarm },
              { key: "humidity", name: "습도 (%)", color: CHART_COLORS.line },
            ]}
          />
        </section>

        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">24시간 풍속 추이</h2>
            <span className="section-meta">Wind / Gust</span>
          </div>
          <MultiLineChart
            data={ENV_WIND_DATA}
            height={280}
            yLabel="m/s"
            lines={[
              { key: "wind", name: "풍속", color: CHART_COLORS.lineAlt },
              { key: "gust", name: "돌풍", color: CHART_COLORS.lineGreen },
            ]}
          />
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">쾌적 지수 추이</h2>
          <span className="section-meta">Comfort Index · 0–100</span>
        </div>
        <MultiLineChart
          data={ENV_COMFORT_TREND}
          height={240}
          lines={[{ key: "comfort", name: "쾌적 지수", color: CHART_COLORS.lineGreen }]}
        />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">구역별 환경 비교</h2>
          <span className="section-meta">4개 구역</span>
        </div>
        <div className="table-wrap">
          <table className="data-table na-zone-table">
            <thead>
              <tr>
                <th>구역</th>
                <th>온도 (°C)</th>
                <th>습도 (%)</th>
                <th>풍속 (m/s)</th>
                <th>쾌적 지수</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {ENV_ZONE_COMPARISON.map((row) => (
                <tr key={row.zone}>
                  <td className="data-table__zone">{row.zone}</td>
                  <td>{row.temp}</td>
                  <td>{row.humidity}</td>
                  <td>{row.wind}</td>
                  <td>{row.comfort}</td>
                  <td>
                    <StatusBadge status={row.status} />
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
