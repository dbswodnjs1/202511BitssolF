// src/api/user.ts
import api from "./index";

export type SignupRequest = {
  name: string;
  password: string;
  nickname?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type UserMeResponse = {
  name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  profileImageUrl: string | null;
};

const normalizePhone = (v?: string | null) => (v ? v.replace(/\D/g, "") : null);

export async function signup(dto: SignupRequest): Promise<void> {
  await api.post("/v1/users/signup", { ...dto, phone: normalizePhone(dto.phone) });
}

export async function login(name: string, password: string): Promise<string> {
  const res = await api.post("/v1/users/login", { name, password });
  return res.data as string;
}

export async function getMe(): Promise<UserMeResponse> {
  const res = await api.get("/v1/users/me");
  return res.data as UserMeResponse;
}

// ✅ 중복확인: true = 사용 가능
export async function checkUsername(name: string): Promise<boolean> {
  const res = await api.get("/v1/users/check/username", { params: { name } });
  return Boolean(res.data?.available);
}
export async function checkNickname(nickname: string): Promise<boolean> {
  const res = await api.get("/v1/users/check/nickname", { params: { nickname } });
  return Boolean(res.data?.available);
}
export async function checkEmail(email: string): Promise<boolean> {
  const res = await api.get("/v1/users/check/email", { params: { email } });
  return Boolean(res.data?.available);
}
export async function checkPhone(phone: string): Promise<boolean> {
  const digits = normalizePhone(phone) ?? "";
  const res = await api.get("/v1/users/check/phone", { params: { phone: digits } });
  return Boolean(res.data?.available);
}

// ✅ 프로필 변경
export async function changeMyNickname(nickname: string): Promise<void> {
  await api.patch("/v1/users/me/nickname", { nickname });
}
export async function changeMyEmail(email: string): Promise<void> {
  await api.patch("/v1/users/me/email", { email });
}
export async function changeMyPhone(phone: string): Promise<void> {
  await api.patch("/v1/users/me/phone", { phone });
}

// ✅ 비밀번호 변경
export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.patch("/v1/users/me/password", { currentPassword, newPassword });
}
