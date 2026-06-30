export const ROLES = {
  admin: {
    id: "admin",
    label: "관리자",
    permissions: ["read", "write", "export", "settings"],
  },
  manager: {
    id: "manager",
    label: "매니저",
    permissions: ["read", "write", "export"],
  },
  viewer: {
    id: "viewer",
    label: "뷰어",
    permissions: ["read"],
  },
};

export const MOCK_USERS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "manager", password: "manager123", role: "manager" },
  { username: "viewer", password: "viewer123", role: "viewer" },
];
