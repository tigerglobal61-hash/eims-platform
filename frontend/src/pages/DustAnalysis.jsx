import { useState } from "react";
import BarDistributionChart from "../components/BarDistributionChart";
import MultiLineChart from "../components/MultiLineChart";
import FilterChips from "../components/FilterChips";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import {
  CHART_COLORS,
  DUST_DISTRIBUTION,
  DUST_EXCEEDANCE_EVENTS,
  DUST_KPI,
  DUST_TREND_DATA,
  DUST_ZONE_COMPARISON,
} from "../data/mockData";

function dustBarColor(entry) {
  const start = parseInt(entry.range.split("-")[0], 10);
  if (start >= 25) return CHART_COLORS.threshold;
  if (start >= 15) return CHART_COLORS.lineWarm;
  return CHART_COLORS.line;
}

export default function DustAnalysis() {
  const [metric, setMetric] = useState("PM2.5");

  return (
    <div className="page-shell">
      <PageToolbar>
        <FilterChips options={["오늘", "PM2.5", "PM10"]} value={metric} onChange={setMetric} />
      </PageToolbar>

      <section className="na-kpi-row">
        {DUST_KPI.map((kpi) => (
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
            <h2 className="section-title">24시간 미세먼지 추이</h2>
            <span className="section-meta">{metric === "오늘" ? "PM2.5 / PM10" : metric} · Mock</span>
          </div>
          <MultiLineChart
            data={DUST_TREND_DATA}
            height={300}
            yLabel="μg/m³"
            lines={[
              { key: "pm25", name: "PM2.5", color: CHART_COLORS.line },
              { key: "pm10", name: "PM10", color: CHART_COLORS.lineAlt },
            ]}
          />
        </section>

        <section className="panel na-exceed-panel">
          <div className="section-header">
            <h2 className="section-title">기준 초과 이벤트</h2>
            <span className="section-meta">{DUST_EXCEEDANCE_EVENTS.length}건</span>
          </div>
          <ul className="na-exceed-list">
            {DUST_EXCEEDANCE_EVENTS.map((event) => (
              <li key={event.id} className={`na-exceed-item na-exceed-item--${event.level}`}>
                <div className="na-exceed-item__top">
                  <span className="na-exceed-item__id">{event.id}</span>
                  <span className="na-exceed-item__time">{event.time}</span>
                </div>
                <div className="na-exceed-item__body">
                  <span className="na-exceed-item__zone">{event.zone}</span>
                  <span className="na-exceed-item__reading">
                    {event.metric} {event.measured}
                    <span className="na-exceed-item__threshold">/ {event.threshold}</span>
                  </span>
                </div>
                <div className="na-exceed-item__footer">
                  <StatusBadge status={event.level} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">PM2.5 농도 분포</h2>
          <span className="section-meta">오늘 측정 240건</span>
        </div>
        <BarDistributionChart
          data={DUST_DISTRIBUTION}
          xLabel="μg/m³ 구간"
          getColor={dustBarColor}
        />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">구역별 미세먼지 비교</h2>
          <span className="section-meta">4개 구역</span>
        </div>
        <div className="table-wrap">
          <table className="data-table na-zone-table">
            <thead>
              <tr>
                <th>구역</th>
                <th>PM2.5 평균</th>
                <th>PM10 평균</th>
                <th>PM2.5 최대</th>
                <th>PM10 최대</th>
                <th>기준 초과</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {DUST_ZONE_COMPARISON.map((row) => (
                <tr key={row.zone}>
                  <td className="data-table__zone">{row.zone}</td>
                  <td>{row.pm25}</td>
                  <td>{row.pm10}</td>
                  <td>{row.pm25Max}</td>
                  <td>{row.pm10Max}</td>
                  <td>{row.exceed}회</td>
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
