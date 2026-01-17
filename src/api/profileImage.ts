// src/api/profileImage.ts
import api from "./index";

export type ProfileImageResponse = {
  profileImageUrl: string | null;
};

const PATH = "/v1/users/me/profile-image";

export function resolveProfileImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

export async function getMyProfileImage(): Promise<ProfileImageResponse> {
  const res = await api.get(PATH);
  return res.data as ProfileImageResponse;
}

export async function uploadMyProfileImage(file: File): Promise<ProfileImageResponse> {
  if (!file) throw new Error("업로드할 파일이 없습니다.");
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 업로드할 수 있습니다.");

  const MAX = 2 * 1024 * 1024;
  if (file.size > MAX) throw new Error("이미지 용량은 2MB 이하만 가능합니다.");

  const form = new FormData();
  form.append("file", file);

  const res = await api.post(PATH, form);
  return res.data as ProfileImageResponse;
}

export async function resetMyProfileImage(): Promise<ProfileImageResponse> {
  const res = await api.delete(PATH);
  return res.data as ProfileImageResponse;
}
