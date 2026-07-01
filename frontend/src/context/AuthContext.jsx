import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginWithBackend } from "../api/auth";
import { getTokenExpiryMs, isTokenExpired } from "../utils/jwt";

const AuthContext = createContext(null);

const TOKEN_KEY = "eims-token";
const USERNAME_KEY = "eims-username";
const ROLE_KEY = "eims-role";
const LEGACY_AUTH_KEY = "eims-auth";

const VALID_ROLES = new Set(["admin", "viewer"]);

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
}

function readSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const username = localStorage.getItem(USERNAME_KEY);
  const role = localStorage.getItem(ROLE_KEY);

  if (!token || !username || !role || !VALID_ROLES.has(role)) {
    clearSession();
    return null;
  }

  if (isTokenExpired(token)) {
    clearSession();
    return null;
  }

  return { token, username, role };
}

function persistSession({ token, username, role }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.removeItem(LEGACY_AUTH_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setAuthReady(true);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user?.token) return undefined;

    const msUntilExpiry = getTokenExpiryMs(user.token) - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return undefined;
    }

    const timer = window.setTimeout(logout, msUntilExpiry);
    return () => window.clearTimeout(timer);
  }, [user?.token, logout]);

  const login = useCallback(async (username, password) => {
    const result = await loginWithBackend(username.trim(), password);
    if (!result.success) return false;

    const { access_token: token, username: resolvedUsername, role } = result.data;
    if (!token || !resolvedUsername || !VALID_ROLES.has(role)) return false;

    const session = { token, username: resolvedUsername, role };
    persistSession(session);
    setUser(session);
    return true;
  }, []);

  const value = useMemo(
    () => ({ user, authReady, login, logout }),
    [user, authReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
