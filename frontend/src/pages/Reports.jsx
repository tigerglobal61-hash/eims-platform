import { useState } from "react";
import BarDistributionChart from "../components/BarDistributionChart";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import { CHART_COLORS, REPORT_HISTORY_CHART, REPORT_STATS, REPORT_TEMPLATES, REPORTS } from "../data/mockData";

function reportStatus(status) {
  return status === "ready" ? "good" : "info";
}

export default function Reports() {
  const [selectedTemplate, setSelectedTemplate] = useState("daily");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");

  const selectedTemplateInfo = REPORT_TEMPLATES.find((template) => template.id === selectedTemplate);

  function handleGenerate() {
    setGenerating(true);
    setMessage("");
    window.setTimeout(() => {
      setGenerating(false);
      setMessage(`${selectedTemplateInfo?.label ?? "리포트"} 생성이 큐에 등록되었습니다.`);
    }, 1200);
  }

  function handleDownload(format, title) {
    setDownloadMessage(`${title} ${format} 내보내기가 완료되었습니다.`);
    window.setTimeout(() => setDownloadMessage(""), 2500);
  }

  return (
    <div className="page-shell">
      <PageToolbar exports={["PDF", "Excel", "CSV"]} />

      {downloadMessage && (
        <span className="page-toolbar__toast page-toolbar__toast--success page-toolbar__toast--inline">
          {downloadMessage}
        </span>
      )}

      <section className="na-kpi-row">
        {REPORT_STATS.map((stat) => (
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

      <div className="na-charts-grid">
        <section className="panel report-gen-panel">
          <div className="section-header">
            <h2 className="section-title">리포트 생성</h2>
            {selectedTemplateInfo && (
              <span className="section-meta">선택: {selectedTemplateInfo.label}</span>
            )}
          </div>
          <div className="report-templates">
            {REPORT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`report-template ${selectedTemplate === template.id ? "report-template--active" : ""}`}
                onClick={() => setSelectedTemplate(template.id)}
                aria-pressed={selectedTemplate === template.id}
              >
                <span className="report-template__label">{template.label}</span>
                <span className="report-template__desc">{template.desc}</span>
              </button>
            ))}
          </div>
          <div className="settings-grid">
            <label className="form-field">
              <span className="form-field__label">시작일</span>
              <input className="form-field__input" type="date" defaultValue="2026-06-01" />
            </label>
            <label className="form-field">
              <span className="form-field__label">종료일</span>
              <input className="form-field__input" type="date" defaultValue="2026-06-20" />
            </label>
          </div>
          <div className="action-row">
            <button
              type="button"
              className="btn btn--primary"
              disabled={generating}
              onClick={handleGenerate}
            >
              {generating ? "생성 중..." : "리포트 생성"}
            </button>
            <button type="button" className="btn btn--ghost">
              예약 설정
            </button>
          </div>
          {message && <p className="report-gen-panel__message">{message}</p>}
        </section>

        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">월별 생성 추이</h2>
            <span className="section-meta">2026년</span>
          </div>
          <BarDistributionChart
            data={REPORT_HISTORY_CHART}
            xKey="month"
            valueKey="count"
            xLabel="월"
            yLabel="생성 건수"
            unit="건"
            getColor={() => CHART_COLORS.line}
          />
        </section>
      </div>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">환경 리포트 목록</h2>
          <span className="section-meta">{REPORTS.length}건</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>기간</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((report) => (
                <tr key={report.id}>
                  <td className="data-table__zone">{report.id}</td>
                  <td>{report.title}</td>
                  <td>{report.period}</td>
                  <td>
                    <StatusBadge status={reportStatus(report.status)} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        disabled={report.status !== "ready"}
                        onClick={() => handleDownload("PDF", report.title)}
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        disabled={report.status !== "ready"}
                        onClick={() => handleDownload("Excel", report.title)}
                      >
                        Excel
                      </button>
                    </div>
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
