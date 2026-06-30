import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import StoragePieChart from "../components/StoragePieChart";
import { DATASETS, STORAGE_USAGE, SYNC_HISTORY } from "../data/mockData";

function syncStatus(status) {
  if (status === "warning") return "warning";
  return "good";
}

export default function DataManagement() {
  return (
    <div className="page-shell">
      <PageToolbar exports={["CSV", "Excel", "JSON", "Archive"]} />

      <div className="na-charts-grid">
        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">스토리지 사용량</h2>
            <span className="section-meta">총 541 MB</span>
          </div>
          <StoragePieChart data={STORAGE_USAGE} />
        </section>

        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">데이터 내보내기</h2>
          </div>
          <p className="panel-desc">
            선택한 데이터셋을 CSV, Excel, JSON 형식으로 내보낼 수 있습니다. (Mock)
          </p>
          <div className="export-options">
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span>소음 데이터 포함</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span>미세먼지 데이터 포함</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span>기상 데이터 포함</span>
            </label>
            <label className="settings-toggle">
              <input type="checkbox" />
              <span>이벤트 로그 포함</span>
            </label>
          </div>
          <div className="action-row">
            <button type="button" className="btn btn--primary">
              선택 항목 내보내기
            </button>
            <button type="button" className="btn btn--ghost">
              전체 백업
            </button>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <h2 className="section-title">동기화 이력</h2>
          <span className="section-meta">최근 5회</span>
        </div>
        <ul className="sync-list">
          {SYNC_HISTORY.map((item, index) => (
            <li key={`${item.time}-${index}`} className={`sync-item sync-item--${item.status}`}>
              <div className="sync-item__left">
                <span className="sync-item__time">{item.time}</span>
                <span className="sync-item__message">{item.message}</span>
              </div>
              <div className="sync-item__right">
                <span className="sync-item__records">{item.records.toLocaleString()}건</span>
                <StatusBadge status={syncStatus(item.status)} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel panel--table">
        <div className="section-header">
          <h2 className="section-title">데이터셋 현황</h2>
          <span className="section-meta">{DATASETS.length}개 데이터셋</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>레코드</th>
                <th>크기</th>
                <th>마지막 동기화</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {DATASETS.map((dataset) => (
                <tr key={dataset.id}>
                  <td className="data-table__zone">{dataset.id}</td>
                  <td>{dataset.name}</td>
                  <td>{dataset.records}</td>
                  <td>{dataset.size}</td>
                  <td>{dataset.lastSync}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn--ghost btn--sm">
                        내보내기
                      </button>
                      <button type="button" className="btn btn--ghost btn--sm">
                        보관
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
