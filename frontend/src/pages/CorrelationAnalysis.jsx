import { useState } from "react";
import CorrelationBarChart from "../components/CorrelationBarChart";
import CorrelationScatterChart from "../components/CorrelationScatterChart";
import FilterChips from "../components/FilterChips";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import { CORRELATION_BAR_DATA, CORRELATION_MATRIX, CORRELATION_SCATTER } from "../data/mockData";

function strengthStatus(strength) {
  if (strength === "강함") return "warning";
  if (strength === "중간") return "info";
  return "good";
}

export default function CorrelationAnalysis() {
  const [method, setMethod] = useState("Pearson");

  return (
    <div className="page-shell">
      <PageToolbar>
        <FilterChips
          options={["Pearson", "24시간", "Site A"]}
          value={method}
          onChange={setMethod}
        />
      </PageToolbar>

      <div className="na-charts-grid">
        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">소음 ↔ PM2.5 산점도</h2>
            <span className="section-meta">구역별 샘플 · r = 0.62</span>
          </div>
          <CorrelationScatterChart data={CORRELATION_SCATTER} height={300} />
        </section>

        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">상관계수 막대 차트</h2>
            <span className="section-meta">-1.0 ~ 1.0</span>
          </div>
          <CorrelationBarChart data={CORRELATION_BAR_DATA} height={300} />
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">환경 변수 상관관계</h2>
            <span className="section-meta">{method} · Mock</span>
        </div>
        <div className="correlation-grid">
          {CORRELATION_MATRIX.map((item) => (
            <article key={item.pair} className="correlation-card">
              <span className="correlation-card__pair">{item.pair}</span>
              <span className="correlation-card__value">{item.coefficient.toFixed(2)}</span>
              <StatusBadge status={strengthStatus(item.strength)} />
              <span className="correlation-card__strength">{item.strength}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">상관계수 상세</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>변수 쌍</th>
                <th>상관계수</th>
                <th>강도</th>
                <th>해석</th>
              </tr>
            </thead>
            <tbody>
              {CORRELATION_MATRIX.map((item) => (
                <tr key={item.pair}>
                  <td className="data-table__zone">{item.pair}</td>
                  <td>{item.coefficient.toFixed(2)}</td>
                  <td>{item.strength}</td>
                  <td>
                    {Math.abs(item.coefficient) >= 0.7
                      ? "강한 연관성"
                      : Math.abs(item.coefficient) >= 0.4
                        ? "중간 연관성"
                        : "약한 연관성"}
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
