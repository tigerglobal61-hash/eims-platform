import { useState } from "react";
import MultiLineChart from "../components/MultiLineChart";
import NoiseChart from "../components/NoiseChart";
import FilterChips from "../components/FilterChips";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import {
  CHART_COLORS,
  DASHBOARD_WEEKLY_SUMMARY,
  KPI_DATA,
  RECENT_ALERTS,
  SENSOR_ROWS,
} from "../data/mockData";

export default function Dashboard() {
  const [period, setPeriod] = useState("오늘");

  return (
    <div className="page-shell">
      <PageToolbar>
        <FilterChips options={["오늘", "7일", "30일"]} value={period} onChange={setPeriod} />
      </PageToolbar>

      <section className="kpi-section">
        <div className="section-header">
          <h2 className="section-title">실시간 KPI</h2>
          <span className="section-meta">5개 센서 집계 · Site A · {period}</span>
        </div>
        <div className="kpi-grid">
          {KPI_DATA.map((kpi) => (
            <article key={kpi.id} className={`kpi-card kpi-card--${kpi.status}`}>
              <div className="kpi-card__header">
                <span className="kpi-card__label">{kpi.label}</span>
                <StatusBadge status={kpi.status} />
              </div>
              <div className="kpi-card__value-row">
                <span className="kpi-card__value">{kpi.value}</span>
                <span className="kpi-card__unit">{kpi.unit}</span>
              </div>
              <div className="kpi-card__footer">
                <span className={`kpi-card__trend kpi-card__trend--${kpi.trendDir}`}>
                  {kpi.trendDir === "up" ? "▲" : "▼"} {kpi.trend}
                </span>
                <span className="kpi-card__threshold">{kpi.threshold}</span>
              </div>
              <div className="kpi-card__bar">
                <div
                  className={`kpi-card__bar-fill kpi-card__bar-fill--${kpi.status}`}
                  style={{ width: kpi.barWidth }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="content-grid">
        <section className="panel panel--chart">
          <div className="section-header">
            <h2 className="section-title">24시간 소음 추이</h2>
            <span className="section-meta">Noise (dBA)</span>
          </div>
          <NoiseChart />
        </section>

        <section className="panel panel--alerts">
          <div className="section-header">
            <h2 className="section-title">최근 알림</h2>
            <span className="section-meta">{RECENT_ALERTS.length}건</span>
          </div>
          <ul className="alert-list">
            {RECENT_ALERTS.map((alert) => (
              <li key={alert.id} className={`alert-item alert-item--${alert.level}`}>
                <span className="alert-item__time">{alert.time}</span>
                <span className="alert-item__message">{alert.message}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">주간 환경 요약</h2>
          <span className="section-meta">소음 · PM2.5 · 알림</span>
        </div>
        <MultiLineChart
          data={DASHBOARD_WEEKLY_SUMMARY}
          xKey="day"
          xInterval={0}
          height={260}
          lines={[
            { key: "noise", name: "소음 (dBA)", color: CHART_COLORS.line },
            { key: "pm25", name: "PM2.5 (×2)", color: CHART_COLORS.lineAlt },
            { key: "alerts", name: "알림 (건)", color: CHART_COLORS.lineWarm },
          ]}
        />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">구역별 센서 현황</h2>
          <span className="section-meta">4개 구역</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>구역</th>
                <th>소음 (dBA)</th>
                <th>PM2.5</th>
                <th>PM10</th>
                <th>온도 (°C)</th>
                <th>습도 (%)</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {SENSOR_ROWS.map((row) => (
                <tr key={row.zone}>
                  <td className="data-table__zone">{row.zone}</td>
                  <td className={row.noise > 70 ? "data-table__warn" : ""}>{row.noise}</td>
                  <td>{row.pm25}</td>
                  <td>{row.pm10}</td>
                  <td>{row.temp}</td>
                  <td>{row.humidity}</td>
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
