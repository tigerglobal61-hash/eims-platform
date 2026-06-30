import { useMemo, useState } from "react";
import FilterChips from "../components/FilterChips";
import PageToolbar from "../components/PageToolbar";
import StackedBarChart from "../components/StackedBarChart";
import StatusBadge from "../components/StatusBadge";
import {
  CHART_COLORS,
  EVENT_LOG_EXTENDED,
  EVENT_STATS,
  EVENT_TIMELINE,
} from "../data/mockData";

const FILTERS = ["전체", "알림", "통신", "복구", "시스템"];

export default function EventLog() {
  const [filter, setFilter] = useState("전체");

  const filteredEvents = useMemo(() => {
    if (filter === "전체") return EVENT_LOG_EXTENDED;
    return EVENT_LOG_EXTENDED.filter((event) => event.type === filter);
  }, [filter]);

  return (
    <div className="page-shell">
      <PageToolbar>
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
      </PageToolbar>

      <section className="na-kpi-row">
        {EVENT_STATS.map((stat) => (
          <article key={stat.id} className={`na-kpi-card na-kpi-card--${stat.status}`}>
            <div className="na-kpi-card__header">
              <div>
                <span className="na-kpi-card__label">{stat.label}</span>
              </div>
              <StatusBadge status={stat.status} />
            </div>
            <div className="na-kpi-card__value-row">
              <span className="na-kpi-card__value">{stat.value}</span>
              <span className="na-kpi-card__unit">{stat.unit}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">시간대별 이벤트 발생</h2>
          <span className="section-meta">오늘 · 08:00 – 14:00</span>
        </div>
        <StackedBarChart
          data={EVENT_TIMELINE}
          bars={[
            { key: "alerts", name: "알림", color: CHART_COLORS.threshold, radius: [0, 0, 0, 0] },
            { key: "system", name: "시스템", color: CHART_COLORS.lineAlt, radius: [0, 0, 0, 0] },
            { key: "recovery", name: "복구", color: CHART_COLORS.lineGreen, radius: [4, 4, 0, 0] },
          ]}
        />
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">이벤트 로그</h2>
          <span className="section-meta">{filteredEvents.length}건</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>시간</th>
                <th>유형</th>
                <th>구역</th>
                <th>메시지</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td className="data-table__zone">{event.id}</td>
                  <td>{event.time}</td>
                  <td>{event.type}</td>
                  <td>{event.zone}</td>
                  <td>{event.message}</td>
                  <td>
                    <StatusBadge status={event.level} />
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
