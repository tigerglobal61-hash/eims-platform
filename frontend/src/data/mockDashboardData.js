import { NODE_LIST } from "./nodes";
import { DUST_TREND_DATA, NOISE_TREND_DATA } from "./mockData";

const BASE_NODE_METRICS = {
  T1: { noise: 65, pm10: 22, pm25: 11 },
  D1: { noise: 72, pm10: 28, pm25: 14 },
  D2: { noise: 68, pm10: 26, pm25: 13 },
  D3: { noise: 61, pm10: 22, pm25: 11 },
  D4: { noise: 59, pm10: 20, pm25: 10 },
  D5: { noise: 63, pm10: 24, pm25: 12 },
  D6: { noise: 57, pm10: 18, pm25: 9 },
  D7: { noise: 55, pm10: 16, pm25: 8 },
  D8: { noise: 54, pm10: 15, pm25: 7 },
};

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

function withOffset(value, offset, min = 0) {
  return Math.max(min, value + offset);
}

export function getNodeMetrics(nodeId) {
  const base = BASE_NODE_METRICS[nodeId] ?? BASE_NODE_METRICS.T1;
  const nodeOffset = NODE_OFFSETS[nodeId] ?? 0;

  return {
    noise: withOffset(base.noise, nodeOffset, 30),
    pm10: withOffset(base.pm10, nodeOffset),
    pm25: withOffset(base.pm25, nodeOffset),
  };
}

export function getSiteAverageMetrics() {
  const totals = NODE_LIST.reduce(
    (acc, node) => {
      const metrics = getNodeMetrics(node.id);
      return {
        noise: acc.noise + metrics.noise,
        pm10: acc.pm10 + metrics.pm10,
        pm25: acc.pm25 + metrics.pm25,
      };
    },
    { noise: 0, pm10: 0, pm25: 0 },
  );

  const count = NODE_LIST.length;

  return {
    noise: Math.round((totals.noise / count) * 10) / 10,
    pm10: Math.round(totals.pm10 / count),
    pm25: Math.round(totals.pm25 / count),
  };
}

export function getNodeTrendData(nodeId) {
  const offset = NODE_OFFSETS[nodeId] ?? 0;

  return NOISE_TREND_DATA.map((point, index) => ({
    hour: point.hour,
    noise: withOffset(point.noise, offset, 30),
    pm10: withOffset(DUST_TREND_DATA[index]?.pm10 ?? 20, offset),
    pm25: withOffset(DUST_TREND_DATA[index]?.pm25 ?? 10, offset),
  }));
}
