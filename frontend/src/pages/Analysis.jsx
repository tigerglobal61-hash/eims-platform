import { useEffect, useMemo, useState } from "react";
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

export default function Analysis() {
  const [selectedNodeId, setSelectedNodeId] = useState("T1");
  const [activeTab, setActiveTab] = useState("noise");
  const [averageMinutes, setAverageMinutes] = useState(15);
  const [t1Metrics, setT1Metrics] = useState(null);
  const [t1DailyMax, setT1DailyMax] = useState(null);
  const ActivePanel = TAB_CONTENT[activeTab];

  useEffect(() => {
    if (selectedNodeId !== "T1") {
      setT1Metrics(null);
      setT1DailyMax(null);
      return undefined;
    }

    let cancelled = false;

    async function loadT1KpiData() {
      try {
        const avgData = await fetchLatestAverage("T1", averageMinutes);
        const metrics = mapLatestAvgToNodeMetrics(avgData);

        if (!cancelled && metrics) {
          setT1Metrics(metrics);
        }
      } catch {
        // Keep previously displayed values on failure.
      }

      try {
        const maxData = await fetchDailyMax("T1");

        if (!cancelled) {
          setT1DailyMax(maxData);
        }
      } catch {
        // Keep previously displayed values on failure.
      }
    }

    loadT1KpiData();

    const timer = window.setInterval(loadT1KpiData, KPI_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [selectedNodeId, averageMinutes]);

  const liveMetrics = useMemo(() => {
    if (selectedNodeId !== "T1") {
      return null;
    }

    return t1Metrics ?? null;
  }, [selectedNodeId, t1Metrics]);

  const dailyMax = useMemo(() => {
    if (selectedNodeId !== "T1") {
      return null;
    }

    return t1DailyMax;
  }, [selectedNodeId, t1DailyMax]);

  return (
    <div className="page-shell analysis-page">
      <section className="panel node-selector-toolbar">
        <div className="analysis-toolbar">
          <NodeSelect
            id="analysis-node-select"
            value={selectedNodeId}
            onChange={setSelectedNodeId}
            meta={formatNodeLocation(selectedNodeId)}
          />
          {selectedNodeId === "T1" && (
            <FilterChips
              options={ANALYSIS_AVERAGE_WINDOW_OPTIONS}
              value={getAnalysisAverageWindowLabel(averageMinutes)}
              onChange={(label) => setAverageMinutes(ANALYSIS_AVERAGE_WINDOW_MINUTES[label])}
            />
          )}
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
        key={`${activeTab}-${selectedNodeId}-${averageMinutes}`}
      />
    </div>
  );
}
