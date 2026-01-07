// src/api/authApi.ts
import axios from "axios";

const authApi = axios.create({
  baseURL: "/api",
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    // 핵심: Bearer 붙이기
    //config.headers.Authorization = `Bearer ${token}`;
    // token이 이미 Bearer 포함이면 그대로, 아니면 Bearer 붙이기
    const authValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    config.headers.Authorization = authValue;
  }
  return config;
});

authApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    // 401/403 둘 다 처리 권장 (현재 네 상황이 403)
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.hash = "#/login"; // HashRouter면 이걸로 통일
    }
    return Promise.reject(error);
  }
);

export default authApi;
