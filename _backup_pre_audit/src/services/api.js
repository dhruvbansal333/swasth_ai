/**
 * Swasth AI - Centralized HTTP API Client
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  const token = localStorage.getItem("token");
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email, password, full_name) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),

  getMe: () => request("/api/auth/me"),

  updateProfile: (profileData) =>
    request("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  // Predictions
  predictBasic: (vitals) =>
    request("/api/predict/basic", {
      method: "POST",
      body: JSON.stringify(vitals),
    }),

  predictAdvanced: (data) =>
    request("/api/predict/advanced", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  extractReport: (formData) =>
    request("/api/report/extract", {
      method: "POST",
      body: formData,
    }),

  // History & Analytics
  getAssessments: () => request("/api/assessments"),
  getAssessment: (id) => request(`/api/assessments/${id}`),
  deleteAssessment: (id) => request(`/api/assessments/${id}`, { method: "DELETE" }),
  getTrends: () => request("/api/analytics/trends"),
  deleteAllData: () => request("/api/user/data", { method: "DELETE" }),

  // Guidance & Habits
  getGuidance: () => request("/api/guidance"),
  getHabits: () => request("/api/habits"),
  toggleHabit: (habit_key) =>
    request("/api/habits/toggle", {
      method: "POST",
      body: JSON.stringify({ habit_key }),
    }),
};

export default api;
