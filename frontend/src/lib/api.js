import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  withCredentials: true,
});

function redirectToLogin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("token");
  window.location.replace("/login?reason=session-expired");
}

let refreshPromise = null;

async function refreshAppToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .then((response) => {
        const token = response.data?.token;
        if (!token) {
          throw new Error("Missing refreshed token");
        }

        window.localStorage.setItem("token", token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

    if (typeof window !== "undefined" && error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        const token = await refreshAppToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (_refreshError) {
        redirectToLogin();
      }
    }

    if (typeof window !== "undefined" && error.response?.status === 401 && isRefreshRequest) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export async function getMe() {
  return api.get("/users/me");
}

export async function getMedia() {
  return api.get("/users/media");
}

export async function getAutomations() {
  return api.get("/automations");
}

export async function getAutomationByMedia(mediaId) {
  return api.get(`/automations/by-media/${mediaId}`);
}

export async function createAutomation(payload) {
  return api.post("/automations", payload);
}

export async function updateAutomation(id, payload) {
  return api.patch(`/automations/${id}`, payload);
}

export async function toggleAutomation(id) {
  return api.patch(`/automations/${id}/toggle`);
}

export async function deleteAutomation(id) {
  return api.delete(`/automations/${id}`);
}

export async function logoutSession() {
  return api.post("/auth/logout");
}

export async function getPlans() {
  return api.get("/payments/plans");
}

export async function getUsage() {
  return api.get("/payments/usage");
}

export async function createCheckoutSession(planId) {
  return api.post("/payments/checkout", { planId });
}

export async function createPortalSession() {
  return api.post("/payments/portal");
}

export default api;
