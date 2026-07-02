import { useEffect, useState } from "react";
import { CHART_REFRESH_MS, fetchChart } from "../api/chart";

export default function useChartData(deviceId, { hours = 24, windowMinutes = 15 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load(showLoading = false) {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        const chartData = await fetchChart(deviceId, hours, windowMinutes);
        if (!cancelled) {
          setData(Array.isArray(chartData) ? chartData : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load chart data",
          );
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load(true);

    const timer = window.setInterval(() => load(false), CHART_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [deviceId, hours, windowMinutes]);

  return { data, loading, error };
}
