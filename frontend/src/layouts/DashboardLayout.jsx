import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import NavIcon from "../components/NavIcon";
import { ROLES } from "../data/roles";
import { ROUTES } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

function formatTopbarDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTopbarTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const visibleRoutes = ROUTES.filter(
    (route) => route.path !== "/settings" || user?.role === "admin",
  );

  const currentRoute =
    visibleRoutes.find((route) => route.path === location.pathname) ??
    ROUTES.find((route) => route.path === location.pathname) ??
    ROUTES[0];
  const roleLabel = ROLES[user?.role]?.label ?? user?.role;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">EIMS</div>
          <div className="sidebar__brand-text">
            <span className="sidebar__title">환경 모니터링</span>
            <span className="sidebar__subtitle">Environmental Monitoring</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {visibleRoutes.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon type={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__status">
            <span className="status-dot status-dot--pulse" />
            시스템 정상 운영 중
          </div>
          <span className="sidebar__version">
            v2.4.1 · {user?.username} · {roleLabel}
          </span>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle navigation"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
            <h1 className="topbar__title">{currentRoute.title}</h1>
          </div>
          <div className="topbar__right">
            <span className="topbar__role">{roleLabel}</span>
            <button type="button" className="btn btn--ghost" onClick={handleLogout}>
              로그아웃
            </button>
            <div className="topbar__datetime">
              <span className="topbar__date">{formatTopbarDate(now)}</span>
              <span className="topbar__time">{formatTopbarTime(now)}</span>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
