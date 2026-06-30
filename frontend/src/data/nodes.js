export const NODE_LIST = [
  { id: "T1", label: "Temporary Node" },
  { id: "D1", label: "West Side North" },
  { id: "D2", label: "West Side South" },
  { id: "D3", label: "Southwest" },
  { id: "D4", label: "Southeast" },
  { id: "D5", label: "East Side South" },
  { id: "D6", label: "East Side North" },
  { id: "D7", label: "Northeast" },
  { id: "D8", label: "Northwest" },
];

export const AUTO_PLAY_ORDER = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "T1"];

export function getNodeById(nodeId) {
  return NODE_LIST.find((node) => node.id === nodeId) ?? NODE_LIST[0];
}

export function formatNodeLocation(nodeId) {
  const node = getNodeById(nodeId);
  return `${node.id} - ${node.label}`;
}

export function formatNodeOption(node) {
  return `${node.id} · ${node.label}`;
}
