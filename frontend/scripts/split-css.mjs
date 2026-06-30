import fs from "fs";

const css = fs.readFileSync("src/App.css", "utf8");
const lines = css.split("\n");

function slice(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function extractMediaQueries(source) {
  const blocks = [];
  const stripped = source.replace(/@media[^{]+\{[\s\S]*?\n\}/g, (match) => {
    blocks.push(match.trim());
    return "";
  });
  return { stripped, blocks };
}

const { stripped, blocks } = extractMediaQueries(css);
const sLines = stripped.split("\n");

function findLine(prefix) {
  const idx = sLines.findIndex((l) => l.includes(prefix));
  return idx === -1 ? -1 : idx + 1;
}

const markers = {
  sidebar: findLine("/* ── Sidebar ──"),
  statusBadge: findLine("/* ── Status badge ──"),
  content: findLine("/* ── Content area ──"),
  kpi: findLine("/* ── KPI cards ──"),
  login: findLine("/* ── Login page ──"),
  forms: findLine("/* ── Forms & buttons ──"),
  rtm: findLine("/* ── Real-time monitoring ──"),
  dashboardKpi: findLine(".dashboard-kpi-section"),
  noise: findLine("/* ── Noise analysis ──"),
  shared: findLine("/* ── Shared page layout ──"),
  displayBoard: findLine("/* ── Site Display Board ──"),
};

const joinRange = (start, end) => sLines.slice(start - 1, end).join("\n").trim();

const base = joinRange(1, markers.sidebar - 1);
const layout =
  joinRange(markers.sidebar, markers.statusBadge - 1) +
  "\n\n" +
  joinRange(markers.content, markers.kpi - 1);

const components =
  joinRange(markers.statusBadge, markers.content - 1) +
  "\n\n" +
  joinRange(markers.kpi, markers.login - 1) +
  "\n\n" +
  joinRange(markers.forms, markers.rtm - 1) +
  "\n\n" +
  joinRange(markers.shared, markers.displayBoard - 1);

const login = joinRange(markers.login, markers.forms - 1);

const dashboard =
  joinRange(markers.rtm, markers.dashboardKpi - 1) +
  "\n\n" +
  joinRange(markers.dashboardKpi, markers.noise - 1);

const analysis = joinRange(markers.noise, markers.shared - 1);

const displayBoard = joinRange(markers.displayBoard, sLines.length);

fs.mkdirSync("src/styles", { recursive: true });
fs.writeFileSync("src/styles/base.css", base);
fs.writeFileSync("src/styles/layout.css", layout);
fs.writeFileSync("src/styles/components.css", components);
fs.writeFileSync("src/styles/login.css", login);
fs.writeFileSync("src/styles/dashboard.css", dashboard);
fs.writeFileSync("src/styles/analysis.css", analysis);
fs.writeFileSync("src/styles/display-board.css", displayBoard);
fs.writeFileSync("src/styles/responsive.css", blocks.join("\n\n"));

console.log("Split complete:", Object.fromEntries(
  fs.readdirSync("src/styles").map((f) => [f, fs.statSync(`src/styles/${f}`).size]),
));
