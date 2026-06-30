import { useState } from "react";
import NodeSelect from "../components/NodeSelect";
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
  const ActivePanel = TAB_CONTENT[activeTab];

  return (
    <div className="page-shell analysis-page">
      <section className="panel node-selector-toolbar">
        <NodeSelect
          id="analysis-node-select"
          value={selectedNodeId}
          onChange={setSelectedNodeId}
          meta={formatNodeLocation(selectedNodeId)}
        />
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

      <ActivePanel embedded nodeId={selectedNodeId} key={`${activeTab}-${selectedNodeId}`} />
    </div>
  );
}
