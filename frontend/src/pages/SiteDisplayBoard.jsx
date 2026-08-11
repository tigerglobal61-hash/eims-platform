import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLatestAverage, KPI_REFRESH_MS } from "../api/latest";
import { useAuth } from "../context/AuthContext";
import DisplayBoardFullscreen from "../components/DisplayBoardFullscreen";
import DisplayBoardPanel from "../components/DisplayBoardPanel";
import { NODE_LIST, formatNodeLocation } from "../data/nodes";

const DISPLAY_AVERAGE_MINUTES = 60;
const DISPLAY_AVERAGE_LABEL = "1-hour moving average";
const PUBLIC_NODE_ID = "D1";
const SLIDESHOW_INTERVAL_MS = 5000;
const AUTHENTICATED_NODE_ORDER = NODE_LIST.map((node) => node.id);

function formatNodeSelectOption(node) {
  return `${node.id} - ${node.label}`;
}

export default function SiteDisplayBoard() {
  const { user, authReady } = useAuth();
  const isAuthenticatedMode = authReady && Boolean(user);
  const [selectedNodeId, setSelectedNodeId] = useState(PUBLIC_NODE_ID);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fullscreenRef = useRef(null);

  const effectiveNodeId = isAuthenticatedMode ? selectedNodeId : PUBLIC_NODE_ID;

  const autoPlayIndex = AUTHENTICATED_NODE_ORDER.indexOf(selectedNodeId);
  const autoPlayProgress =
    autoPlayIndex === -1 ? "—" : `${autoPlayIndex + 1}/${AUTHENTICATED_NODE_ORDER.length}`;

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
    if (isAuthenticatedMode) return;

    if (selectedNodeId !== PUBLIC_NODE_ID) {
      setSelectedNodeId(PUBLIC_NODE_ID);
    }
    if (isAutoPlay) {
      setIsAutoPlay(false);
    }
  }, [isAuthenticatedMode, selectedNodeId, isAutoPlay]);

  useEffect(() => {
    let cancelled = false;

    async function loadReading(isBackgroundRefresh = false) {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }

      try {
        const data = await fetchLatestAverage(effectiveNodeId, DISPLAY_AVERAGE_MINUTES);
        if (!cancelled) {
          setReading(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Data temporarily unavailable");
          if (!isBackgroundRefresh) {
            setReading(null);
          }
        }
      } finally {
        if (!cancelled && !isBackgroundRefresh) {
          setLoading(false);
        }
      }
    }

    loadReading();

    const timer = window.setInterval(() => loadReading(true), KPI_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [effectiveNodeId]);

  useEffect(() => {
    if (!isFullscreen || !isAutoPlay || !isAuthenticatedMode) return undefined;

    const timer = window.setInterval(() => {
      setSelectedNodeId((currentId) => {
        const currentIndex = AUTHENTICATED_NODE_ORDER.indexOf(currentId);
        const nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + 1) % AUTHENTICATED_NODE_ORDER.length;
        return AUTHENTICATED_NODE_ORDER[nextIndex];
      });
    }, SLIDESHOW_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isFullscreen, isAutoPlay, isAuthenticatedMode]);

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
    if (!isAuthenticatedMode || !AUTHENTICATED_NODE_ORDER.includes(nodeId)) {
      return;
    }

    setReading(null);
    setLoading(true);
    setError(null);
    setSelectedNodeId(nodeId);
  }

  function handleAutoPlayFullscreen() {
    if (!isAuthenticatedMode) return;

    setSelectedNodeId((currentId) =>
      AUTHENTICATED_NODE_ORDER.includes(currentId) ? currentId : AUTHENTICATED_NODE_ORDER[0],
    );
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

  function renderBoardContent() {
    if (loading && !reading) {
      return <div className="display-board-loading">Loading...</div>;
    }

    if (error && !reading) {
      return <div className="display-board-error display-board-error--stage">Data temporarily unavailable</div>;
    }

    if (!reading) {
      return <div className="display-board-loading">Loading...</div>;
    }

    return null;
  }

  function renderToolbar() {
    if (isFullscreen) {
      return null;
    }

    if (isAuthenticatedMode) {
      return (
        <div className="display-board-toolbar">
          <div className="display-board-toolbar__primary">
            <label className="display-board-toolbar__node-field" htmlFor="display-board-node-select">
              <span className="display-board-toolbar__node-label">Monitoring Location</span>
              <select
                id="display-board-node-select"
                className="display-board-toolbar__node-select"
                value={selectedNodeId}
                onChange={(event) => handleNodeChange(event.target.value)}
              >
                {NODE_LIST.map((node) => (
                  <option key={node.id} value={node.id}>
                    {formatNodeSelectOption(node)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="display-board-toolbar__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleAutoPlayFullscreen}>
              Auto Rotation
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleSingleFullscreen}>
              Full Screen
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="display-board-toolbar display-board-toolbar--public">
        <p className="display-board-toolbar__public-location">{formatNodeLocation(PUBLIC_NODE_ID)}</p>
        <div className="display-board-toolbar__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleSingleFullscreen}>
            Full Screen
          </button>
        </div>
      </div>
    );
  }

  if (isFullscreen) {
    const boardContent = renderBoardContent();

    return (
      <div className="display-board-fullscreen" ref={fullscreenRef} role="dialog" aria-modal="true">
        <div className="display-board-fullscreen__controls">
          {isAuthenticatedMode && isAutoPlay && (
            <span className="display-board-fullscreen__info">
              {formatNodeLocation(selectedNodeId)} · {autoPlayProgress}
            </span>
          )}
          <div className="display-board-fullscreen__actions">
            {isAuthenticatedMode && isAutoPlay && (
              <button type="button" className="btn btn--ghost btn--xs" onClick={handleStopAutoPlay}>
                Stop Rotation
              </button>
            )}
            <button type="button" className="btn btn--ghost btn--xs" onClick={exitFullscreen}>
              Exit Fullscreen
            </button>
          </div>
        </div>

        {error && reading && (
          <p className="display-board-error display-board-error--banner">Data temporarily unavailable</p>
        )}

        {boardContent ?? (
          <DisplayBoardFullscreen
            key={`${reading.device_id}-${reading.time}`}
            reading={reading}
            averageLabel={DISPLAY_AVERAGE_LABEL}
          />
        )}
      </div>
    );
  }

  const boardContent = renderBoardContent();

  return (
    <div className="page-shell display-board-page">
      {renderToolbar()}

      {error && reading && (
        <p className="display-board-error display-board-error--banner">Data temporarily unavailable</p>
      )}

      <section className="panel display-board-stage">
        {boardContent ?? (
          <DisplayBoardPanel
            key={`${reading.device_id}-${reading.time}`}
            reading={reading}
            averageLabel={DISPLAY_AVERAGE_LABEL}
          />
        )}
      </section>
    </div>
  );
}
