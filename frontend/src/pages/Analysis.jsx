import { useEffect, useState } from "react";
import FilterChips from "../components/FilterChips";
import NodeSelect from "../components/NodeSelect";
import {
  KPI_REFRESH_MS,
  fetchDailyMax,
  fetchLatestAverage,
  mapLatestAvgToNodeMetrics,
} from "../api/latest";
import {
  ANALYSIS_AVERAGE_WINDOW_MINUTES,
  ANALYSIS_AVERAGE_WINDOW_OPTIONS,
  getAnalysisAverageWindowLabel,
} from "../data/mockAnalysisData";
import { formatNodeLocation } from "../data/nodes";
import DustAnalysis from "./DustAnalysis";
import NoiseAnalysis from "./NoiseAnalysis";

const TABS = [
  { id: "noise", label: "Noise" },
  { id: "pm", label: "PM" },
];

const TAB_CONTENT = {
  noise: NoiseAnalysis,
  pm: DustAnalysis,
};

function resetLiveDataState(setters) {
  setters.setLiveMetrics(null);
  setters.setDailyMax(null);
  setters.setLoading(true);
  setters.setLiveMetricsError(false);
  setters.setDailyMaxError(false);
  setters.setLiveMetricsNoData(false);
  setters.setDailyMaxNoData(false);
}

export default function Analysis() {
  const [selectedNodeId, setSelectedNodeId] = useState("D1");
  const [activeTab, setActiveTab] = useState("noise");
  const [averageMinutes, setAverageMinutes] = useState(15);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [dailyMax, setDailyMax] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveMetricsError, setLiveMetricsError] = useState(false);
  const [dailyMaxError, setDailyMaxError] = useState(false);
  const [liveMetricsNoData, setLiveMetricsNoData] = useState(false);
  const [dailyMaxNoData, setDailyMaxNoData] = useState(false);
  const ActivePanel = TAB_CONTENT[activeTab];

  const liveStateSetters = {
    setLiveMetrics,
    setDailyMax,
    setLoading,
    setLiveMetricsError,
    setDailyMaxError,
    setLiveMetricsNoData,
    setDailyMaxNoData,
  };

  function handleNodeChange(nodeId) {
    resetLiveDataState(liveStateSetters);
    setSelectedNodeId(nodeId);
  }

  function handleAverageChange(label) {
    resetLiveDataState(liveStateSetters);
    setAverageMinutes(ANALYSIS_AVERAGE_WINDOW_MINUTES[label]);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadKpiData(isBackgroundRefresh = false) {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }

      try {
        const avgData = await fetchLatestAverage(selectedNodeId, averageMinutes);
        const metrics = mapLatestAvgToNodeMetrics(avgData);

        if (!cancelled) {
          setLiveMetrics(metrics);
          setLiveMetricsError(false);
          setLiveMetricsNoData(!metrics);
        }
      } catch {
        if (!cancelled) {
          setLiveMetrics(null);
          setLiveMetricsError(true);
          setLiveMetricsNoData(false);
        }
      }

      try {
        const maxData = await fetchDailyMax(selectedNodeId);

        if (!cancelled) {
          setDailyMax(maxData);
          setDailyMaxError(false);
          setDailyMaxNoData(!maxData);
        }
      } catch {
        if (!cancelled) {
          setDailyMax(null);
          setDailyMaxError(true);
          setDailyMaxNoData(false);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadKpiData();

    const timer = window.setInterval(() => loadKpiData(true), KPI_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedNodeId, averageMinutes]);

  return (
    <div className="page-shell analysis-page">
      <section className="panel node-selector-toolbar">
        <div className="analysis-toolbar">
          <NodeSelect
            id="analysis-node-select"
            value={selectedNodeId}
            onChange={handleNodeChange}
            meta={formatNodeLocation(selectedNodeId)}
          />
          <FilterChips
            options={ANALYSIS_AVERAGE_WINDOW_OPTIONS}
            value={getAnalysisAverageWindowLabel(averageMinutes)}
            onChange={handleAverageChange}
          />
        </div>
      </section>

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

      <ActivePanel
        embedded
        nodeId={selectedNodeId}
        liveMetrics={liveMetrics}
        dailyMax={dailyMax}
        averageMinutes={averageMinutes}
        loading={loading}
        liveMetricsError={liveMetricsError}
        dailyMaxError={dailyMaxError}
        liveMetricsNoData={liveMetricsNoData}
        dailyMaxNoData={dailyMaxNoData}
        key={`${activeTab}-${selectedNodeId}-${averageMinutes}`}
      />
    </div>
  );
}
