import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const AUTH_KEY = "eims-auth";

const VALID_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  role: "admin",
};

function readStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      return { username: parsed, role: "admin" };
    }
    if (!parsed?.username || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const value = useMemo(
    () => ({
      user,
      login: (username, password) => {
        if (username.trim() !== VALID_CREDENTIALS.username || password !== VALID_CREDENTIALS.password) {
          return false;
        }

        const session = {
          username: VALID_CREDENTIALS.username,
          role: VALID_CREDENTIALS.role,
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        setUser(session);
        return true;
      },
      logout: () => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
      },
    }),
    [user],
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
