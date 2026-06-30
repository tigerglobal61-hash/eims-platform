import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (login(username, password)) {
      navigate("/dashboard");
      return;
    }

    setError("아이디 또는 비밀번호가 올바르지 않습니다.");
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
              placeholder="admin"
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

          <button type="submit" className="btn btn--primary btn--full">
            로그인
          </button>
        </form>

        <p className="login-card__hint">Mock 계정: admin / admin123</p>
      </div>
    </div>
  );
}
