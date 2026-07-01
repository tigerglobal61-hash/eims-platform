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
