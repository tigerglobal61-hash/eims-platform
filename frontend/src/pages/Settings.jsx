import { useState } from "react";
import PageToolbar from "../components/PageToolbar";
import { ROLES } from "../data/roles";
import { loadSettings, resetSettings, saveSettings } from "../utils/settingsStorage";

const TABS = [
  { id: "alerts", label: "알림 기준" },
  { id: "notifications", label: "알림 채널" },
  { id: "system", label: "시스템" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  function updateSettings(section, key, value) {
    setSettings((prev) => {
      const next = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
      saveSettings(next);
      return next;
    });
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    const defaults = resetSettings();
    setSettings(defaults);
    setSaved(false);
  }

  return (
    <div className="page-shell">
      <PageToolbar exports={["JSON"]} />

      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`panel-tab ${activeTab === tab.id ? "panel-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "alerts" && (
        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">환경 기준값 설정</h2>
          </div>
          <div className="settings-grid">
            <label className="form-field">
              <span className="form-field__label">소음 기준 (dBA)</span>
              <input
                className="form-field__input"
                type="number"
                value={settings.alerts.noiseLimit}
                onChange={(event) =>
                  updateSettings("alerts", "noiseLimit", Number(event.target.value))
                }
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">PM2.5 기준 (μg/m³)</span>
              <input
                className="form-field__input"
                type="number"
                value={settings.alerts.pm25Limit}
                onChange={(event) =>
                  updateSettings("alerts", "pm25Limit", Number(event.target.value))
                }
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">PM10 기준 (μg/m³)</span>
              <input
                className="form-field__input"
                type="number"
                value={settings.alerts.pm10Limit}
                onChange={(event) =>
                  updateSettings("alerts", "pm10Limit", Number(event.target.value))
                }
              />
            </label>
            <label className="form-field">
              <span className="form-field__label">데이터 수집 주기 (초)</span>
              <input
                className="form-field__input"
                type="number"
                value={settings.alerts.interval}
                onChange={(event) =>
                  updateSettings("alerts", "interval", Number(event.target.value))
                }
              />
            </label>
          </div>
        </section>
      )}

      {activeTab === "notifications" && (
        <section className="panel">
          <div className="section-header">
            <h2 className="section-title">알림 채널 설정</h2>
          </div>
          <div className="settings-list">
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(event) => updateSettings("notifications", "email", event.target.checked)}
              />
              <span>이메일 알림 활성화</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(event) => updateSettings("notifications", "sms", event.target.checked)}
              />
              <span>SMS 알림 활성화</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(event) => updateSettings("notifications", "push", event.target.checked)}
              />
              <span>푸시 알림 활성화</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.notifications.nightMode}
                onChange={(event) =>
                  updateSettings("notifications", "nightMode", event.target.checked)
                }
              />
              <span>야간 알림 제한 (22:00 – 06:00)</span>
            </label>
          </div>
        </section>
      )}

      {activeTab === "system" && (
        <>
          <section className="panel">
            <div className="section-header">
              <h2 className="section-title">시스템 설정</h2>
            </div>
            <div className="settings-grid">
              <label className="form-field">
                <span className="form-field__label">현장명</span>
                <input
                  className="form-field__input"
                  type="text"
                  value={settings.system.siteName}
                  onChange={(event) => updateSettings("system", "siteName", event.target.value)}
                />
              </label>
              <label className="form-field">
                <span className="form-field__label">시간대</span>
                <input
                  className="form-field__input"
                  type="text"
                  value={settings.system.timezone}
                  onChange={(event) => updateSettings("system", "timezone", event.target.value)}
                />
              </label>
              <label className="form-field">
                <span className="form-field__label">언어</span>
                <select
                  className="form-field__input"
                  value={settings.system.language}
                  onChange={(event) => updateSettings("system", "language", event.target.value)}
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label className="settings-toggle settings-toggle--block">
                <input
                  type="checkbox"
                  checked={settings.system.autoReport}
                  onChange={(event) => updateSettings("system", "autoReport", event.target.checked)}
                />
                <span>자동 리포트 생성 (매월 1일)</span>
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="section-header">
              <h2 className="section-title">역할 Mock 데이터</h2>
            </div>
            <div className="role-list">
              {Object.values(ROLES).map((role) => (
                <div key={role.id} className="role-item">
                  <span className="role-item__label">{role.label}</span>
                  <span className="role-item__permissions">{role.permissions.join(" · ")}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="panel">
        <div className="action-row">
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            설정 저장
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleReset}>
            초기화
          </button>
          {saved && (
            <span className="page-toolbar__toast page-toolbar__toast--success">
              설정이 저장되었습니다.
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
