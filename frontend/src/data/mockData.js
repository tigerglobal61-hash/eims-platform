export const ROUTES = [
  {
    path: "/dashboard",
    label: "대시보드",
    icon: "grid",
    title: "건설현장 환경 모니터링 시스템",
    subtitle: "Site A · 전체 현황 요약 · 마지막 갱신 14:35:22",
  },
  {
    path: "/real-time-monitoring",
    label: "실시간 모니터링",
    icon: "realtime",
    title: "실시간 모니터링",
    subtitle: "Site A · 8개 센서 노드 · Live Mock Stream",
  },
  {
    path: "/noise-analysis",
    label: "소음 분석",
    icon: "noise",
    title: "소음 분석",
    subtitle: "Site A · 구역별 · 시간대별 소음 데이터",
  },
  {
    path: "/dust-analysis",
    label: "미세먼지 분석",
    icon: "dust",
    title: "미세먼지 분석",
    subtitle: "Site A · PM2.5 / PM10 추이 및 통계",
  },
  {
    path: "/environment-analysis",
    label: "환경 분석",
    icon: "environment",
    title: "환경 분석",
    subtitle: "Site A · 온습도 · 풍속 · 기상 데이터",
  },
  {
    path: "/correlation-analysis",
    label: "상관 분석",
    icon: "correlation",
    title: "상관 분석",
    subtitle: "Site A · 환경 변수 간 상관관계",
  },
  {
    path: "/event-log",
    label: "이벤트 로그",
    icon: "event",
    title: "이벤트 로그",
    subtitle: "Site A · 시스템 이벤트 및 알림 기록",
  },
  {
    path: "/reports",
    label: "리포트",
    icon: "report",
    title: "리포트",
    subtitle: "Site A · 일/주/월간 환경 리포트",
  },
  {
    path: "/data-management",
    label: "데이터 관리",
    icon: "data",
    title: "데이터 관리",
    subtitle: "Site A · 데이터 수집 · 내보내기 · 보관",
  },
  {
    path: "/settings",
    label: "설정",
    icon: "settings",
    title: "설정",
    subtitle: "Site A · 시스템 및 알림 설정",
  },
];

export const NOISE_TREND_DATA = [
  { hour: "00:00", noise: 38 },
  { hour: "01:00", noise: 36 },
  { hour: "02:00", noise: 35 },
  { hour: "03:00", noise: 34 },
  { hour: "04:00", noise: 36 },
  { hour: "05:00", noise: 40 },
  { hour: "06:00", noise: 48 },
  { hour: "07:00", noise: 55 },
  { hour: "08:00", noise: 62 },
  { hour: "09:00", noise: 65 },
  { hour: "10:00", noise: 68 },
  { hour: "11:00", noise: 70 },
  { hour: "12:00", noise: 72 },
  { hour: "13:00", noise: 71 },
  { hour: "14:00", noise: 72 },
  { hour: "15:00", noise: 69 },
  { hour: "16:00", noise: 68 },
  { hour: "17:00", noise: 65 },
  { hour: "18:00", noise: 58 },
  { hour: "19:00", noise: 52 },
  { hour: "20:00", noise: 48 },
  { hour: "21:00", noise: 45 },
  { hour: "22:00", noise: 42 },
  { hour: "23:00", noise: 40 },
];

export const DUST_TREND_DATA = NOISE_TREND_DATA.map((row, i) => ({
  hour: row.hour,
  pm25: [8, 7, 6, 6, 7, 9, 11, 13, 14, 15, 16, 14, 13, 12, 12, 11, 10, 9, 8, 7, 7, 6, 6, 5][i],
  pm10: [15, 14, 13, 12, 13, 16, 20, 22, 25, 26, 28, 24, 22, 21, 20, 19, 18, 16, 14, 13, 12, 11, 10, 9][i],
}));

export const ENV_TREND_DATA = NOISE_TREND_DATA.map((row, i) => ({
  hour: row.hour,
  temp: [22, 21, 20, 19, 19, 20, 23, 25, 27, 28, 29, 30, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 22, 21][i],
  humidity: [62, 64, 66, 68, 67, 65, 60, 55, 52, 50, 48, 46, 45, 47, 50, 53, 55, 58, 60, 61, 62, 63, 64, 65][i],
}));

export const KPI_DATA = [
  {
    id: "noise",
    label: "소음 (Noise)",
    value: "72",
    unit: "dBA",
    status: "warning",
    trend: "+3.2",
    trendDir: "up",
    threshold: "≤ 70 dBA",
    barWidth: "72%",
  },
  {
    id: "pm25",
    label: "PM2.5",
    value: "12",
    unit: "μg/m³",
    status: "good",
    trend: "-1.5",
    trendDir: "down",
    threshold: "≤ 35 μg/m³",
    barWidth: "34%",
  },
  {
    id: "pm10",
    label: "PM10",
    value: "25",
    unit: "μg/m³",
    status: "good",
    trend: "+0.8",
    trendDir: "up",
    threshold: "≤ 50 μg/m³",
    barWidth: "50%",
  },
  {
    id: "temperature",
    label: "온도 (Temperature)",
    value: "28.4",
    unit: "°C",
    status: "good",
    trend: "+0.6",
    trendDir: "up",
    threshold: "18 – 32 °C",
    barWidth: "71%",
  },
  {
    id: "humidity",
    label: "습도 (Humidity)",
    value: "54",
    unit: "%",
    status: "good",
    trend: "-2.1",
    trendDir: "down",
    threshold: "40 – 70 %",
    barWidth: "54%",
  },
];

export const RECENT_ALERTS = [
  { id: 1, time: "14:32", message: "구역 A 소음 기준 초과 (72 dBA)", level: "warning" },
  { id: 2, time: "13:15", message: "PM2.5 센서 #3 통신 지연", level: "info" },
  { id: 3, time: "11:48", message: "습도 정상 범위 복귀", level: "good" },
];

export const SENSOR_ROWS = [
  { zone: "구역 A", noise: 72, pm25: 14, pm10: 28, temp: 29.1, humidity: 52, status: "warning" },
  { zone: "구역 B", noise: 58, pm25: 9, pm10: 18, temp: 27.3, humidity: 56, status: "good" },
  { zone: "구역 C", noise: 61, pm25: 11, pm10: 22, temp: 28.0, humidity: 53, status: "good" },
  { zone: "구역 D", noise: 55, pm25: 8, pm10: 15, temp: 26.8, humidity: 58, status: "good" },
];

export const LIVE_SENSORS = [
  { id: "SN-001", zone: "구역 A", noise: 72, pm25: 14, pm10: 28, updated: "14:35:20", status: "warning" },
  { id: "SN-002", zone: "구역 B", noise: 58, pm25: 9, pm10: 18, updated: "14:35:19", status: "good" },
  { id: "SN-003", zone: "구역 C", noise: 61, pm25: 11, pm10: 22, updated: "14:35:21", status: "good" },
  { id: "SN-004", zone: "구역 D", noise: 55, pm25: 8, pm10: 15, updated: "14:35:18", status: "good" },
  { id: "SN-005", zone: "구역 A", noise: 68, pm25: 13, pm10: 26, updated: "14:35:20", status: "good" },
  { id: "SN-006", zone: "구역 B", noise: 60, pm25: 10, pm10: 19, updated: "14:35:17", status: "good" },
];

export const RTM_KPI_SUMMARY = [
  { id: "noise", label: "평균 소음", value: "63.4", unit: "dBA", status: "warning", delta: "+2.1" },
  { id: "pm25", label: "평균 PM2.5", value: "10.3", unit: "μg/m³", status: "good", delta: "-0.4" },
  { id: "pm10", label: "평균 PM10", value: "19.8", unit: "μg/m³", status: "good", delta: "+0.2" },
  { id: "nodes", label: "활성 노드", value: "8", unit: "/ 8", status: "good", delta: "100%" },
  { id: "alerts", label: "실시간 알림", value: "2", unit: "건", status: "warning", delta: "+1" },
];

export const SENSOR_NODES = [
  { id: "N-01", name: "Node A-1", zone: "구역 A", x: 16, y: 20, noise: 72, pm25: 14, signal: 92, battery: 87, status: "warning" },
  { id: "N-02", name: "Node A-2", zone: "구역 A", x: 30, y: 34, noise: 68, pm25: 13, signal: 88, battery: 84, status: "good" },
  { id: "N-03", name: "Node B-1", zone: "구역 B", x: 54, y: 18, noise: 58, pm25: 9, signal: 95, battery: 91, status: "good" },
  { id: "N-04", name: "Node B-2", zone: "구역 B", x: 68, y: 36, noise: 60, pm25: 10, signal: 90, battery: 79, status: "good" },
  { id: "N-05", name: "Node C-1", zone: "구역 C", x: 22, y: 60, noise: 61, pm25: 11, signal: 86, battery: 72, status: "good" },
  { id: "N-06", name: "Node C-2", zone: "구역 C", x: 40, y: 74, noise: 59, pm25: 10, signal: 83, battery: 68, status: "info" },
  { id: "N-07", name: "Node D-1", zone: "구역 D", x: 74, y: 64, noise: 55, pm25: 8, signal: 97, battery: 94, status: "good" },
  { id: "N-08", name: "Node D-2", zone: "구역 D", x: 86, y: 50, noise: 54, pm25: 7, signal: 74, battery: 61, status: "warning" },
];

export const RTM_TIMELINE_DATA = [
  { time: "14:05", noise: 58, pm25: 9 },
  { time: "14:10", noise: 61, pm25: 10 },
  { time: "14:15", noise: 64, pm25: 11 },
  { time: "14:20", noise: 67, pm25: 11 },
  { time: "14:25", noise: 70, pm25: 12 },
  { time: "14:30", noise: 71, pm25: 12 },
  { time: "14:35", noise: 72, pm25: 14 },
];

export const SENSOR_HEALTH = [
  { id: "N-01", node: "Node A-1", zone: "구역 A", uptime: "99.2%", latency: "42ms", battery: 87, signal: 92, firmware: "v3.2.1", health: "warning", lastCheck: "14:35:20" },
  { id: "N-02", node: "Node A-2", zone: "구역 A", uptime: "99.8%", latency: "38ms", battery: 84, signal: 88, firmware: "v3.2.1", health: "good", lastCheck: "14:35:20" },
  { id: "N-03", node: "Node B-1", zone: "구역 B", uptime: "100%", latency: "31ms", battery: 91, signal: 95, firmware: "v3.2.0", health: "good", lastCheck: "14:35:19" },
  { id: "N-04", node: "Node B-2", zone: "구역 B", uptime: "98.6%", latency: "45ms", battery: 79, signal: 90, firmware: "v3.2.0", health: "good", lastCheck: "14:35:19" },
  { id: "N-05", node: "Node C-1", zone: "구역 C", uptime: "99.5%", latency: "36ms", battery: 72, signal: 86, firmware: "v3.1.9", health: "good", lastCheck: "14:35:21" },
  { id: "N-06", node: "Node C-2", zone: "구역 C", uptime: "97.1%", latency: "58ms", battery: 68, signal: 83, firmware: "v3.1.9", health: "info", lastCheck: "14:35:18" },
  { id: "N-07", node: "Node D-1", zone: "구역 D", uptime: "100%", latency: "28ms", battery: 94, signal: 97, firmware: "v3.2.1", health: "good", lastCheck: "14:35:21" },
  { id: "N-08", node: "Node D-2", zone: "구역 D", uptime: "96.4%", latency: "72ms", battery: 61, signal: 74, firmware: "v3.1.8", health: "warning", lastCheck: "14:35:17" },
];

export const NOISE_ZONE_DATA = [
  { zone: "구역 A", avg: 68, max: 78, min: 52, exceed: 12 },
  { zone: "구역 B", avg: 55, max: 65, min: 42, exceed: 2 },
  { zone: "구역 C", avg: 58, max: 70, min: 45, exceed: 4 },
  { zone: "구역 D", avg: 52, max: 62, min: 40, exceed: 0 },
];

export const NOISE_ACOUSTIC_KPI = [
  {
    id: "leq",
    label: "Leq",
    desc: "등가소음레벨",
    value: "63.8",
    unit: "dBA",
    status: "warning",
    limit: "기준 70 dBA",
  },
  {
    id: "lmax",
    label: "Lmax",
    desc: "최대소음레벨",
    value: "78.2",
    unit: "dBA",
    status: "critical",
    limit: "기준 75 dBA",
  },
  {
    id: "l10",
    label: "L10",
    desc: "10% 초과 레벨",
    value: "71.4",
    unit: "dBA",
    status: "warning",
    limit: "기준 70 dBA",
  },
  {
    id: "l50",
    label: "L50",
    desc: "중앙값 레벨",
    value: "62.1",
    unit: "dBA",
    status: "good",
    limit: "기준 70 dBA",
  },
  {
    id: "l90",
    label: "L90",
    desc: "90% 초과 레벨",
    value: "48.6",
    unit: "dBA",
    status: "good",
    limit: "기준 55 dBA",
  },
];

export const NOISE_EXCEEDANCE_EVENTS = [
  {
    id: "EX-001",
    time: "14:32",
    zone: "구역 A",
    measured: 72,
    threshold: 70,
    duration: "12 min",
    level: "warning",
  },
  {
    id: "EX-002",
    time: "13:48",
    zone: "구역 A",
    measured: 74,
    threshold: 70,
    duration: "8 min",
    level: "warning",
  },
  {
    id: "EX-003",
    time: "12:15",
    zone: "구역 C",
    measured: 71,
    threshold: 70,
    duration: "5 min",
    level: "warning",
  },
  {
    id: "EX-004",
    time: "11:02",
    zone: "구역 A",
    measured: 78,
    threshold: 75,
    duration: "3 min",
    level: "critical",
  },
  {
    id: "EX-005",
    time: "09:36",
    zone: "구역 B",
    measured: 71,
    threshold: 70,
    duration: "6 min",
    level: "warning",
  },
  {
    id: "EX-006",
    time: "08:22",
    zone: "구역 C",
    measured: 70,
    threshold: 70,
    duration: "4 min",
    level: "info",
  },
];

export const NOISE_DISTRIBUTION = [
  { range: "40-45", count: 18, percent: 7.5 },
  { range: "45-50", count: 36, percent: 15.0 },
  { range: "50-55", count: 52, percent: 21.7 },
  { range: "55-60", count: 48, percent: 20.0 },
  { range: "60-65", count: 38, percent: 15.8 },
  { range: "65-70", count: 28, percent: 11.7 },
  { range: "70-75", count: 14, percent: 5.8 },
  { range: "75-80", count: 6, percent: 2.5 },
];

export const NOISE_ZONE_COMPARISON = [
  {
    zone: "구역 A",
    leq: 68.2,
    lmax: 78.2,
    l10: 74.1,
    l50: 66.5,
    l90: 52.3,
    exceed: 12,
    status: "warning",
  },
  {
    zone: "구역 B",
    leq: 55.4,
    lmax: 65.0,
    l10: 62.8,
    l50: 54.2,
    l90: 44.1,
    exceed: 2,
    status: "good",
  },
  {
    zone: "구역 C",
    leq: 58.6,
    lmax: 70.4,
    l10: 66.2,
    l50: 57.8,
    l90: 47.5,
    exceed: 4,
    status: "good",
  },
  {
    zone: "구역 D",
    leq: 52.1,
    lmax: 62.3,
    l10: 59.4,
    l50: 51.0,
    l90: 41.8,
    exceed: 0,
    status: "good",
  },
];

export const CORRELATION_MATRIX = [
  { pair: "소음 ↔ PM2.5", coefficient: 0.62, strength: "중간" },
  { pair: "소음 ↔ PM10", coefficient: 0.71, strength: "강함" },
  { pair: "PM2.5 ↔ PM10", coefficient: 0.89, strength: "강함" },
  { pair: "온도 ↔ 습도", coefficient: -0.45, strength: "중간" },
  { pair: "소음 ↔ 온도", coefficient: 0.28, strength: "약함" },
  { pair: "PM2.5 ↔ 습도", coefficient: -0.33, strength: "약함" },
];

export const EVENT_LOG = [
  { id: "EVT-1042", time: "2026-06-20 14:32:08", type: "알림", zone: "구역 A", message: "소음 기준 초과 (72 dBA)", level: "warning" },
  { id: "EVT-1041", time: "2026-06-20 13:15:44", type: "통신", zone: "구역 C", message: "PM2.5 센서 #3 응답 지연", level: "info" },
  { id: "EVT-1040", time: "2026-06-20 11:48:22", type: "복구", zone: "구역 B", message: "습도 정상 범위 복귀", level: "good" },
  { id: "EVT-1039", time: "2026-06-20 09:22:10", type: "알림", zone: "구역 A", message: "PM10 기준 접근 (48 μg/m³)", level: "warning" },
  { id: "EVT-1038", time: "2026-06-20 08:05:33", type: "시스템", zone: "전체", message: "일일 데이터 수집 시작", level: "info" },
  { id: "EVT-1037", time: "2026-06-19 22:14:55", type: "알림", zone: "구역 D", message: "야간 소음 기준 초과 (55 dBA)", level: "critical" },
];

export const REPORTS = [
  { id: "RPT-2026-06", title: "2026년 6월 월간 환경 리포트", period: "2026-06-01 ~ 2026-06-20", status: "ready" },
  { id: "RPT-2026-W25", title: "第25주 주간 환경 리포트", period: "2026-06-16 ~ 2026-06-20", status: "ready" },
  { id: "RPT-2026-06-20", title: "일일 환경 리포트", period: "2026-06-20", status: "generating" },
  { id: "RPT-2026-05", title: "2026년 5월 월간 환경 리포트", period: "2026-05-01 ~ 2026-05-31", status: "ready" },
];

export const DATASETS = [
  { id: "DS-001", name: "소음 원시 데이터", records: "128,450", size: "245 MB", lastSync: "2026-06-20 14:30" },
  { id: "DS-002", name: "미세먼지 원시 데이터", records: "128,450", size: "198 MB", lastSync: "2026-06-20 14:30" },
  { id: "DS-003", name: "기상 원시 데이터", records: "64,225", size: "86 MB", lastSync: "2026-06-20 14:28" },
  { id: "DS-004", name: "이벤트 로그", records: "1,042", size: "12 MB", lastSync: "2026-06-20 14:35" },
];

export const CHART_COLORS = {
  line: "#00c2d4",
  lineAlt: "#2d8cf0",
  lineWarm: "#f59e0b",
  lineGreen: "#22c55e",
  grid: "rgba(56, 120, 190, 0.12)",
  axis: "#5a7290",
  threshold: "#f59e0b",
};

export const DASHBOARD_WEEKLY_SUMMARY = [
  { day: "월", noise: 58, pm25: 10, alerts: 2 },
  { day: "화", noise: 61, pm25: 11, alerts: 3 },
  { day: "수", noise: 64, pm25: 12, alerts: 4 },
  { day: "목", noise: 63, pm25: 11, alerts: 2 },
  { day: "금", noise: 66, pm25: 13, alerts: 5 },
  { day: "토", noise: 52, pm25: 8, alerts: 1 },
  { day: "일", noise: 48, pm25: 7, alerts: 0 },
];

export const DUST_KPI = [
  { id: "pm25_avg", label: "PM2.5 평균", value: "10.3", unit: "μg/m³", status: "good", limit: "기준 35 μg/m³" },
  { id: "pm10_avg", label: "PM10 평균", value: "19.8", unit: "μg/m³", status: "good", limit: "기준 50 μg/m³" },
  { id: "pm25_max", label: "PM2.5 최대", value: "16.2", unit: "μg/m³", status: "good", limit: "기준 35 μg/m³" },
  { id: "pm10_max", label: "PM10 최대", value: "28.4", unit: "μg/m³", status: "good", limit: "기준 50 μg/m³" },
  { id: "exceed", label: "기준 초과", value: "0", unit: "건", status: "good", limit: "오늘 기준" },
];

export const DUST_DISTRIBUTION = [
  { range: "0-5", count: 42, percent: 17.5 },
  { range: "5-10", count: 68, percent: 28.3 },
  { range: "10-15", count: 58, percent: 24.2 },
  { range: "15-20", count: 38, percent: 15.8 },
  { range: "20-25", count: 22, percent: 9.2 },
  { range: "25-30", count: 8, percent: 3.3 },
  { range: "30-35", count: 4, percent: 1.7 },
];

export const DUST_ZONE_COMPARISON = [
  { zone: "구역 A", pm25: 14.2, pm10: 28.1, pm25Max: 16.2, pm10Max: 28.4, exceed: 0, status: "good" },
  { zone: "구역 B", pm25: 9.1, pm10: 18.4, pm25Max: 11.5, pm10Max: 22.0, exceed: 0, status: "good" },
  { zone: "구역 C", pm25: 11.3, pm10: 22.6, pm25Max: 13.8, pm10Max: 25.1, exceed: 0, status: "good" },
  { zone: "구역 D", pm25: 8.2, pm10: 15.3, pm25Max: 10.1, pm10Max: 18.6, exceed: 0, status: "good" },
];

export const DUST_EXCEEDANCE_EVENTS = [
  { id: "DX-001", time: "06-18 15:22", zone: "구역 A", measured: 36, threshold: 35, metric: "PM2.5", level: "warning" },
  { id: "DX-002", time: "06-15 11:08", zone: "구역 C", measured: 52, threshold: 50, metric: "PM10", level: "warning" },
];

export const ENV_KPI = [
  { id: "temp", label: "평균 온도", value: "27.8", unit: "°C", status: "good", limit: "18 – 32 °C" },
  { id: "humidity", label: "평균 습도", value: "54.8", unit: "%", status: "good", limit: "40 – 70 %" },
  { id: "wind", label: "평균 풍속", value: "2.4", unit: "m/s", status: "good", limit: "≤ 10 m/s" },
  { id: "heat", label: "체감 온도", value: "29.1", unit: "°C", status: "warning", limit: "≤ 33 °C" },
  { id: "comfort", label: "쾌적 지수", value: "72", unit: "점", status: "good", limit: "≥ 60 점" },
];

export const ENV_WIND_DATA = NOISE_TREND_DATA.map((row, i) => ({
  hour: row.hour,
  wind: [1.2, 1.0, 0.8, 0.7, 0.9, 1.1, 1.8, 2.2, 2.8, 3.1, 3.4, 3.0, 2.6, 2.4, 2.5, 2.8, 2.6, 2.2, 1.8, 1.5, 1.3, 1.2, 1.1, 1.0][i],
  gust: [2.0, 1.6, 1.4, 1.2, 1.5, 1.8, 2.8, 3.4, 4.2, 4.8, 5.1, 4.6, 4.0, 3.8, 3.9, 4.4, 4.1, 3.5, 2.9, 2.4, 2.1, 1.9, 1.7, 1.5][i],
}));

export const ENV_ZONE_COMPARISON = [
  { zone: "구역 A", temp: 29.1, humidity: 52, wind: 2.6, comfort: 68, status: "good" },
  { zone: "구역 B", temp: 27.3, humidity: 56, wind: 2.1, comfort: 74, status: "good" },
  { zone: "구역 C", temp: 28.0, humidity: 53, wind: 2.4, comfort: 72, status: "good" },
  { zone: "구역 D", temp: 26.8, humidity: 58, wind: 1.9, comfort: 76, status: "good" },
];

export const ENV_COMFORT_TREND = NOISE_TREND_DATA.map((row, i) => ({
  hour: row.hour,
  comfort: [78, 79, 80, 81, 80, 78, 74, 70, 66, 64, 62, 60, 58, 59, 62, 65, 68, 70, 72, 74, 75, 76, 77, 78][i],
}));

export const CORRELATION_SCATTER = [
  { zone: "구역 A", noise: 72, pm25: 14 },
  { zone: "구역 A-2", noise: 68, pm25: 13 },
  { zone: "구역 B", noise: 58, pm25: 9 },
  { zone: "구역 B-2", noise: 60, pm25: 10 },
  { zone: "구역 C", noise: 61, pm25: 11 },
  { zone: "구역 C-2", noise: 59, pm25: 10 },
  { zone: "구역 D", noise: 55, pm25: 8 },
  { zone: "구역 D-2", noise: 54, pm25: 7 },
  { zone: "샘플-09", noise: 65, pm25: 12 },
  { zone: "샘플-10", noise: 70, pm25: 13 },
  { zone: "샘플-11", noise: 63, pm25: 11 },
  { zone: "샘플-12", noise: 56, pm25: 8 },
];

export const CORRELATION_BAR_DATA = CORRELATION_MATRIX.map((item) => ({
  pair: item.pair.replace(" ↔ ", "\n↔ "),
  coefficient: item.coefficient,
  abs: Math.abs(item.coefficient),
}));

export const EVENT_STATS = [
  { id: "total", label: "전체 이벤트", value: "142", unit: "건", status: "info" },
  { id: "warning", label: "주의 알림", value: "38", unit: "건", status: "warning" },
  { id: "critical", label: "위험 알림", value: "4", unit: "건", status: "critical" },
  { id: "resolved", label: "복구 완료", value: "96", unit: "건", status: "good" },
  { id: "today", label: "오늘 발생", value: "6", unit: "건", status: "info" },
];

export const EVENT_TIMELINE = [
  { hour: "08", alerts: 1, system: 1, recovery: 0 },
  { hour: "09", alerts: 2, system: 0, recovery: 0 },
  { hour: "10", alerts: 1, system: 0, recovery: 1 },
  { hour: "11", alerts: 1, system: 0, recovery: 1 },
  { hour: "12", alerts: 0, system: 0, recovery: 0 },
  { hour: "13", alerts: 1, system: 1, recovery: 0 },
  { hour: "14", alerts: 2, system: 0, recovery: 1 },
];

export const EVENT_LOG_EXTENDED = [
  ...EVENT_LOG,
  { id: "EVT-1036", time: "2026-06-19 18:42:11", type: "알림", zone: "구역 A", message: "소음 기준 초과 (73 dBA)", level: "warning" },
  { id: "EVT-1035", time: "2026-06-19 16:20:05", type: "복구", zone: "구역 C", message: "PM2.5 센서 #3 통신 복구", level: "good" },
  { id: "EVT-1034", time: "2026-06-19 14:05:33", type: "알림", zone: "구역 B", message: "풍속 급증 (5.2 m/s)", level: "info" },
  { id: "EVT-1033", time: "2026-06-19 10:12:44", type: "시스템", zone: "전체", message: "펌웨어 업데이트 배포", level: "info" },
  { id: "EVT-1032", time: "2026-06-18 22:30:18", type: "알림", zone: "구역 A", message: "야간 소음 기준 초과 (56 dBA)", level: "critical" },
];

export const REPORT_TEMPLATES = [
  { id: "daily", label: "일일 리포트", desc: "24시간 환경 데이터 요약" },
  { id: "weekly", label: "주간 리포트", desc: "7일간 추이 및 이벤트 분석" },
  { id: "monthly", label: "월간 리포트", desc: "월간 통계 및 규제 준수 현황" },
  { id: "custom", label: "사용자 정의", desc: "기간 및 항목 선택" },
];

export const REPORT_STATS = [
  { id: "ready", label: "생성 완료", value: "12", unit: "건", status: "good" },
  { id: "generating", label: "생성 중", value: "1", unit: "건", status: "info" },
  { id: "scheduled", label: "예약됨", value: "3", unit: "건", status: "info" },
  { id: "downloads", label: "이번 달 다운로드", value: "28", unit: "회", status: "good" },
];

export const REPORT_HISTORY_CHART = [
  { month: "1월", count: 4 },
  { month: "2월", count: 5 },
  { month: "3월", count: 6 },
  { month: "4월", count: 5 },
  { month: "5월", count: 8 },
  { month: "6월", count: 7 },
];

export const STORAGE_USAGE = [
  { name: "소음", value: 245, color: "#00c2d4" },
  { name: "미세먼지", value: 198, color: "#2d8cf0" },
  { name: "기상", value: 86, color: "#22c55e" },
  { name: "이벤트", value: 12, color: "#f59e0b" },
];

export const SYNC_HISTORY = [
  { time: "14:35", status: "success", records: 1280, message: "전체 센서 동기화 완료" },
  { time: "14:30", status: "success", records: 1280, message: "정기 동기화 완료" },
  { time: "14:00", status: "warning", records: 1150, message: "Node D-2 지연 (130건 대기)" },
  { time: "13:30", status: "success", records: 1280, message: "정기 동기화 완료" },
  { time: "13:00", status: "success", records: 1280, message: "정기 동기화 완료" },
];

export const SETTINGS_SECTIONS = {
  alerts: { noiseLimit: 70, pm25Limit: 35, pm10Limit: 50, interval: 60 },
  notifications: { email: true, sms: true, push: false, nightMode: false },
  system: { siteName: "Site A", timezone: "Asia/Seoul", language: "ko", autoReport: true },
};

