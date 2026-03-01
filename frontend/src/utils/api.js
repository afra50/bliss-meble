import axios from "axios";

// Ustalenie adresu backendu
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Instancja axiosa z obsługą ciasteczek HttpOnly
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Zmienne do obsługi odświeżania tokena
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- INTERCEPTOR ODPOWIEDZI (Obsługa 401 i Refresh Tokena) ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Jeśli błąd to 401 (Unauthorized) i nie ponawialiśmy już tego zapytania
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Jeśli błąd wystąpił na logowaniu lub odświeżaniu - nie odświeżaj dalej
      if (
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Próba odświeżenia sesji na backendzie
        await api.post("/auth/refresh");

        processQueue(null);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ---- AUTH API (Tylko to, co masz gotowe) ----
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
  me: () => api.get("/auth/me"), // Sprawdzenie statusu zalogowania
};

export default api;
