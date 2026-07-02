import { getNodeMetrics } from "./mockDashboardData";
import { DUST_DISTRIBUTION } from "./mockData";

const NODE_OFFSETS = {
  T1: 0,
  D1: 4,
  D2: 3,
  D3: 1,
  D4: 0,
  D5: 2,
  D6: -1,
  D7: -2,
  D8: -3,
};

const PEAK_TIMES = {
  D1: { lmax: "14:25", pm25Max: "13:20", pm10Max: "13:40" },
  D2: { lmax: "14:10", pm25Max: "12:55", pm10Max: "13:05" },
  D3: { lmax: "13:48", pm25Max: "12:30", pm10Max: "12:50" },
  D4: { lmax: "13:35", pm25Max: "12:15", pm10Max: "12:45" },
  D5: { lmax: "14:05", pm25Max: "13:00", pm10Max: "13:25" },
  D6: { lmax: "13:42", pm25Max: "12:20", pm10Max: "12:35" },
  D7: { lmax: "13:28", pm25Max: "11:50", pm10Max: "12:10" },
  D8: { lmax: "13:18", pm25Max: "11:40", pm10Max: "11:55" },
};

function offset(nodeId) {
  return NODE_OFFSETS[nodeId] ?? 0;
}

function withOffset(value, nodeId, min = 0) {
  return Math.max(min, value + offset(nodeId));
}

function noiseStatus(value) {
  if (value >= 80) return "critical";
  if (value >= 75) return "warning";
  if (value >= 70) return "info";
  return "good";
}

function pmStatus(value, caution, warning, critical) {
  if (value >= critical) return "critical";
  if (value >= warning) return "warning";
  if (value >= caution) return "info";
  return "good";
}

export const ANALYSIS_AVERAGE_WINDOW_OPTIONS = ["15 min", "1 hr", "8 hr", "24 hr"];

export const ANALYSIS_AVERAGE_WINDOW_MINUTES = {
  "15 min": 15,
  "1 hr": 60,
  "8 hr": 480,
  "24 hr": 1440,
};

export function getAnalysisAverageWindowLabel(minutes) {
  return (
    ANALYSIS_AVERAGE_WINDOW_OPTIONS.find(
      (label) => ANALYSIS_AVERAGE_WINDOW_MINUTES[label] === minutes,
    ) ?? "15 min"
  );
}

export function getAnalysisAverageKpiLabel(minutes, metricKey) {
  const windowLabel =
    minutes === 15
      ? "15-min"
      : minutes === 60
        ? "1 hr"
        : minutes === 480
          ? "8 hr"
          : minutes === 1440
            ? "24 hr"
            : `${minutes}-min`;

  if (metricKey === "noise") {
    return minutes === 15 ? "15-min Moving Average" : `${windowLabel} Average`;
  }

  if (metricKey === "pm25") {
    return `PM2.5 ${windowLabel} Average`;
  }

  if (metricKey === "pm10") {
    return `PM10 ${windowLabel} Average`;
  }

  return `${windowLabel} Average`;
}

export { noiseStatus, pmStatus };

export function getNodeNoiseAnalysis(nodeId) {
  const metrics = getNodeMetrics(nodeId);

  if (nodeId === "T1") {
    return {
      kpis: [
        {
          id: "ma",
          label: "15-min Moving Average",
          value: "—",
          unit: "dB(A)",
          status: "good",
          limit: "Threshold 70 dB(A)",
        },
        {
          id: "lmax",
          label: "Lmax",
          value: "—",
          unit: "dB(A)",
          status: "good",
          limit: "Threshold 75 dB(A)",
        },
      ],
      nodeSummary: {
        nodeId,
        movingAverage: metrics.noise,
        lmax: "—",
        l10: withOffset(71.4, nodeId, 30),
        l50: withOffset(62.1, nodeId, 30),
        l90: withOffset(54.8, nodeId, 30),
        exceed: 0,
        status: noiseStatus(metrics.noise),
      },
    };
  }

  const lmax = withOffset(82.4, nodeId, 30);
  const peaks = PEAK_TIMES[nodeId] ?? PEAK_TIMES.D1;

  return {
    kpis: [
      {
        id: "ma",
        label: "15-min Moving Average",
        value: String(metrics.noise),
        unit: "dB(A)",
        status: noiseStatus(metrics.noise),
        limit: "Threshold 70 dB(A)",
      },
      {
        id: "lmax",
        label: "Lmax",
        value: lmax.toFixed(1),
        unit: "dB(A)",
        peakTime: peaks.lmax,
        status: noiseStatus(lmax),
        limit: "Threshold 75 dB(A)",
      },
    ],
    nodeSummary: {
      nodeId,
      movingAverage: metrics.noise,
      lmax,
      l10: withOffset(71.4, nodeId, 30),
      l50: withOffset(62.1, nodeId, 30),
      l90: withOffset(54.8, nodeId, 30),
      exceed: offset(nodeId) > 2 ? 2 : 0,
      status: noiseStatus(metrics.noise),
    },
  };
}

export function getNodeDustAnalysis(nodeId) {
  const metrics = getNodeMetrics(nodeId);

  if (nodeId === "T1") {
    return {
      kpis: [
        {
          id: "pm25_avg",
          label: "PM2.5 Average",
          value: "—",
          unit: "μg/m³",
          status: "good",
          limit: "Threshold 35 μg/m³",
        },
        {
          id: "pm10_avg",
          label: "PM10 Average",
          value: "—",
          unit: "μg/m³",
          status: "good",
          limit: "Threshold 150 μg/m³",
        },
        {
          id: "pm25_max",
          label: "PM2.5 Max",
          value: "—",
          unit: "μg/m³",
          status: "good",
          limit: "Threshold 35 μg/m³",
        },
        {
          id: "pm10_max",
          label: "PM10 Max",
          value: "—",
          unit: "μg/m³",
          status: "good",
          limit: "Threshold 150 μg/m³",
        },
      ],
      distribution: DUST_DISTRIBUTION,
      nodeSummary: {
        nodeId,
        pm25: metrics.pm25,
        pm10: metrics.pm10,
        pm25Max: "—",
        pm10Max: "—",
        status: pmStatus(metrics.pm10, 150, 160, 170),
      },
    };
  }

  const peaks = PEAK_TIMES[nodeId] ?? PEAK_TIMES.D1;
  const pm25Max = withOffset(48, nodeId);
  const pm10Max = withOffset(168, nodeId);

  return {
    kpis: [
      {
        id: "pm25_avg",
        label: "PM2.5 Average",
        value: String(metrics.pm25),
        unit: "μg/m³",
        status: pmStatus(metrics.pm25, 35, 45, 55),
        limit: "Threshold 35 μg/m³",
      },
      {
        id: "pm10_avg",
        label: "PM10 Average",
        value: String(metrics.pm10),
        unit: "μg/m³",
        status: pmStatus(metrics.pm10, 150, 160, 170),
        limit: "Threshold 150 μg/m³",
      },
      {
        id: "pm25_max",
        label: "PM2.5 Max",
        value: pm25Max.toFixed(1),
        unit: "μg/m³",
        peakTime: peaks.pm25Max,
        status: pmStatus(pm25Max, 35, 45, 55),
        limit: "Threshold 35 μg/m³",
      },
      {
        id: "pm10_max",
        label: "PM10 Max",
        value: pm10Max.toFixed(1),
        unit: "μg/m³",
        peakTime: peaks.pm10Max,
        status: pmStatus(pm10Max, 150, 160, 170),
        limit: "Threshold 150 μg/m³",
      },
    ],
    distribution: DUST_DISTRIBUTION,
    nodeSummary: {
      nodeId,
      pm25: metrics.pm25,
      pm10: metrics.pm10,
      pm25Max,
      pm10Max,
      status: pmStatus(metrics.pm10, 150, 160, 170),
    },
  };
}
