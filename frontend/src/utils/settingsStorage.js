import { SETTINGS_SECTIONS } from "../data/mockData";

const SETTINGS_KEY = "eims-settings";

export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return structuredClone(SETTINGS_SECTIONS);

    const parsed = JSON.parse(saved);
    return {
      alerts: { ...SETTINGS_SECTIONS.alerts, ...parsed.alerts },
      notifications: { ...SETTINGS_SECTIONS.notifications, ...parsed.notifications },
      system: { ...SETTINGS_SECTIONS.system, ...parsed.system },
    };
  } catch {
    return structuredClone(SETTINGS_SECTIONS);
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);
  return structuredClone(SETTINGS_SECTIONS);
}
