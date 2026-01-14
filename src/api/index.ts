// src/api/index.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// ✅ 요청 인터셉터: Bearer 자동 보정
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers ?? {};

    // ✅ token이 이미 Bearer 포함이면 그대로, 아니면 Bearer 붙이기
    const authValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    config.headers.Authorization = authValue;
  }

  return config;
});

// ✅ 응답 인터셉터: HashRouter 기준 로그인 이동
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    // 401/403 모두 토큰 문제일 가능성이 높으니 같이 처리
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.hash = "#/login";
    }

    return Promise.reject(error);
  }
);

export default api;
