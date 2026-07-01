import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, authReady, login } = useAuth();
  const navigate = useNavigate();

  if (!authReady) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const ok = await login(username, password);
      if (ok) {
        navigate("/dashboard", { replace: true });
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <div className="sidebar__logo">EIMS</div>
          <div>
            <h1 className="login-card__title">환경 모니터링 시스템</h1>
            <p className="login-card__subtitle">Environmental Monitoring System</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-field__label">아이디</span>
            <input
              className="form-field__input"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) setError("");
              }}
              placeholder="아이디"
              autoComplete="username"
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">비밀번호</span>
            <input
              className="form-field__input"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
