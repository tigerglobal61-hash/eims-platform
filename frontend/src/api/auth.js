const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://eims-api.onrender.com";

export async function loginWithBackend(username, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return { success: false };
  }

  const data = await response.json();
  return { success: true, data };
}
