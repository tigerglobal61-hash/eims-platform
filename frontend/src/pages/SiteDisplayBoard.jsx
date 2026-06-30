import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLatestReading } from "../api/latest";
import DisplayBoardFullscreen from "../components/DisplayBoardFullscreen";
import DisplayBoardPanel from "../components/DisplayBoardPanel";
import NodeSelect from "../components/NodeSelect";
import { AUTO_PLAY_ORDER, formatNodeLocation } from "../data/nodes";

const SLIDESHOW_INTERVAL_MS = 5000;

export default function SiteDisplayBoard() {
  const [selectedNodeId, setSelectedNodeId] = useState("D1");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fullscreenRef = useRef(null);

  const autoPlayIndex = AUTO_PLAY_ORDER.indexOf(selectedNodeId);
  const autoPlayProgress =
    autoPlayIndex === -1 ? "—" : `${autoPlayIndex + 1}/${AUTO_PLAY_ORDER.length}`;

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore exit errors
      }
    }
    setIsFullscreen(false);
    setIsAutoPlay(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReading() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchLatestReading(selectedNodeId);
        if (!cancelled) {
          setReading(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load sensor data");
          setReading(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReading();

    return () => {
      cancelled = true;
    };
  }, [selectedNodeId]);

  useEffect(() => {
    if (!isFullscreen || !isAutoPlay) return undefined;

    const timer = window.setInterval(() => {
      setSelectedNodeId((currentId) => {
        const currentIndex = AUTO_PLAY_ORDER.indexOf(currentId);
        const nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + 1) % AUTO_PLAY_ORDER.length;
        return AUTO_PLAY_ORDER[nextIndex];
      });
    }, SLIDESHOW_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isFullscreen, isAutoPlay]);

  useEffect(() => {
    if (!isFullscreen || !fullscreenRef.current) return undefined;

    const element = fullscreenRef.current;

    async function enter() {
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        }
      } catch {
        setIsFullscreen(false);
        setIsAutoPlay(false);
      }
    }

    enter();

    return undefined;
  }, [isFullscreen]);

  useEffect(() => {
    function onFullscreenChange() {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setIsAutoPlay(false);
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, exitFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("display-board-fullscreen-active");
    } else {
      document.body.classList.remove("display-board-fullscreen-active");
    }

    return () => {
      document.body.classList.remove("display-board-fullscreen-active");
    };
  }, [isFullscreen]);

  function handleNodeChange(nodeId) {
    setSelectedNodeId(nodeId);
  }

  function handleAutoPlayFullscreen() {
    setSelectedNodeId(AUTO_PLAY_ORDER[0]);
    setIsAutoPlay(true);
    setIsFullscreen(true);
  }

  function handleSingleFullscreen() {
    setIsAutoPlay(false);
    setIsFullscreen(true);
  }

  function handleStopAutoPlay() {
    setIsAutoPlay(false);
  }

  if (isFullscreen) {
    return (
      <div className="display-board-fullscreen" ref={fullscreenRef} role="dialog" aria-modal="true">
        <div className="display-board-fullscreen__controls">
          {isAutoPlay && (
            <span className="display-board-fullscreen__info">
              {formatNodeLocation(selectedNodeId)} · {autoPlayProgress}
            </span>
          )}
          <div className="display-board-fullscreen__actions">
            {isAutoPlay && (
              <button type="button" className="btn btn--ghost btn--xs" onClick={handleStopAutoPlay}>
                정지
              </button>
            )}
            <button type="button" className="btn btn--ghost btn--xs" onClick={exitFullscreen}>
              Exit Fullscreen
            </button>
          </div>
        </div>

        {loading || !reading ? (
          <div className="display-board-fullscreen__loading">Loading sensor data...</div>
        ) : (
          <DisplayBoardFullscreen key={reading.device_id + reading.time} reading={reading} />
        )}
      </div>
    );
  }

  return (
    <div className="page-shell display-board-page">
      <div className="display-board-toolbar">
        <NodeSelect
          id="display-board-node-select"
          value={selectedNodeId}
          onChange={handleNodeChange}
        />
        <div className="display-board-toolbar__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={handleAutoPlayFullscreen}>
            전체 자동재생
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleSingleFullscreen}>
            전체화면 보기
          </button>
        </div>
      </div>

      {error && <p className="display-board-error">{error}</p>}

      <section className="panel display-board-stage">
        {loading || !reading ? (
          <div className="display-board-loading">Loading sensor data...</div>
        ) : (
          <DisplayBoardPanel key={reading.device_id + reading.time} reading={reading} />
        )}
      </section>
    </div>
  );
}
