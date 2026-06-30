import { useState } from "react";
import NoiseChart from "../components/NoiseChart";
import NoiseDistributionChart from "../components/NoiseDistributionChart";
import FilterChips from "../components/FilterChips";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import {
  NOISE_ACOUSTIC_KPI,
  NOISE_EXCEEDANCE_EVENTS,
  NOISE_ZONE_COMPARISON,
} from "../data/mockData";

function isOverThreshold(value, threshold = 70) {
  return value > threshold;
}

export default function NoiseAnalysis() {
  const [zoneFilter, setZoneFilter] = useState("전체");

  return (
    <div className="page-shell na-page">
      <PageToolbar>
        <FilterChips options={["오늘", "구역 A", "전체"]} value={zoneFilter} onChange={setZoneFilter} />
      </PageToolbar>

      <section className="na-kpi-row">
        {NOISE_ACOUSTIC_KPI.map((kpi) => (
          <article key={kpi.id} className={`na-kpi-card na-kpi-card--${kpi.status}`}>
            <div className="na-kpi-card__header">
              <div>
                <span className="na-kpi-card__label">{kpi.label}</span>
                <span className="na-kpi-card__desc">{kpi.desc}</span>
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
            <h2 className="section-title">시간대별 소음 추이</h2>
            <span className="section-meta">24시간 · Site A {zoneFilter !== "오늘" ? `· ${zoneFilter}` : ""} · Mock</span>
          </div>
          <NoiseChart height={300} />
        </section>

        <section className="panel na-exceed-panel">
          <div className="section-header">
            <h2 className="section-title">기준 초과 이벤트</h2>
            <span className="section-meta">{NOISE_EXCEEDANCE_EVENTS.length}건</span>
          </div>
          <ul className="na-exceed-list">
            {NOISE_EXCEEDANCE_EVENTS.map((event) => (
              <li key={event.id} className={`na-exceed-item na-exceed-item--${event.level}`}>
                <div className="na-exceed-item__top">
                  <span className="na-exceed-item__id">{event.id}</span>
                  <span className="na-exceed-item__time">{event.time}</span>
                </div>
                <div className="na-exceed-item__body">
                  <span className="na-exceed-item__zone">{event.zone}</span>
                  <span className="na-exceed-item__reading">
                    {event.measured} dBA
                    <span className="na-exceed-item__threshold">/ {event.threshold} dBA</span>
                  </span>
                </div>
                <div className="na-exceed-item__footer">
                  <StatusBadge status={event.level} />
                  <span className="na-exceed-item__duration">지속 {event.duration}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">소음 레벨 분포</h2>
          <span className="section-meta">오늘 측정 240건 · dBA 구간별</span>
        </div>
        <NoiseDistributionChart height={280} />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">구역별 소음 비교</h2>
          <span className="section-meta">4개 구역 · Acoustic Metrics</span>
        </div>
        <div className="table-wrap">
          <table className="data-table na-zone-table">
            <thead>
              <tr>
                <th>구역</th>
                <th>Leq</th>
                <th>Lmax</th>
                <th>L10</th>
                <th>L50</th>
                <th>L90</th>
                <th>기준 초과</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {NOISE_ZONE_COMPARISON.map((row) => (
                <tr key={row.zone}>
                  <td className="data-table__zone">{row.zone}</td>
                  <td className={isOverThreshold(row.leq) ? "data-table__warn" : ""}>{row.leq}</td>
                  <td className={isOverThreshold(row.lmax, 75) ? "data-table__warn" : ""}>{row.lmax}</td>
                  <td className={isOverThreshold(row.l10) ? "data-table__warn" : ""}>{row.l10}</td>
                  <td>{row.l50}</td>
                  <td>{row.l90}</td>
                  <td className={row.exceed > 0 ? "data-table__warn" : ""}>{row.exceed}회</td>
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
