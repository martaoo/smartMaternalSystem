import axios from "axios"

export const http = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
})

// Inject the JWT token from localStorage on every request.
// The proxy route accepts it as Authorization: Bearer <token>.
http.interceptors.request.use((config) => {
  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("token")
      : null
    if (token) {
      config.headers = config.headers ?? {}
      config.headers["Authorization"] = `Bearer ${token}`
    }
  } catch {
    // localStorage unavailable (SSR or private browsing) — proceed without token
  }
  return config
})
