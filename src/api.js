// Address of the backend. Empty on your computer (the Vite proxy handles it);
// set VITE_API_URL when deploying, e.g. https://my-api.onrender.com
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Every request (after login) carries the token so the backend knows who's asking.
export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && !path.startsWith("/auth/")) {
    // A saved token was missing/expired on a request that needed one — send the
    // user back to the login screen. Login/signup calls handle their own 401s
    // below (wrong email or password) instead of being caught by this branch.
    localStorage.removeItem("token");
    window.location.reload();
    throw new Error("Session expired, please log in again");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Request failed");
  }
  return res.status === 204 ? null : res.json();
}
