// src/api/mypage.ts
import api from "./index";

export type SoundDto = {
  soundId: number;
  uploader: string;
  title: string;
  description: string;
  fileUrl: string;
  thumbnailUrl: string;
  playCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PageRes<T> = {
  content: T[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
};

/**
 * ✅ 백엔드 응답이
 *  - List면 그대로 배열 반환
 *  - Page면 content만 뽑아서 배열 반환
 */
function normalizeToArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.content)) return data.content as T[];
  return [];
}

// ✅ 최근 재생 전체(형태 방어)
export async function getRecentPlaysAll() {
  const res = await api.get<any>("/v1/me/recent-plays");
  return normalizeToArray<SoundDto>(res.data);
}

// ✅ 내 업로드 전체(형태 방어)
export async function getMyUploadsAll() {
  const res = await api.get<any>("/v1/me/uploads");
  return normalizeToArray<SoundDto>(res.data);
}

// ✅ 기존 코드 호환: page/size는 프론트에서 slice로 처리
export async function getRecentPlays(page = 0, size = 20): Promise<PageRes<SoundDto>> {
  const all = await getRecentPlaysAll();

  const start = page * size;
  const content = all.slice(start, start + size);

  const totalElements = all.length;
  const totalPages = size > 0 ? Math.ceil(totalElements / size) : 0;

  return {
    content,
    number: page,
    size,
    totalPages,
    totalElements,
    first: page === 0,
    last: start + size >= totalElements,
  };
}

export async function getMyUploads(page = 0, size = 20): Promise<PageRes<SoundDto>> {
  const all = await getMyUploadsAll();

  const start = page * size;
  const content = all.slice(start, start + size);

  const totalElements = all.length;
  const totalPages = size > 0 ? Math.ceil(totalElements / size) : 0;

  return {
    content,
    number: page,
    size,
    totalPages,
    totalElements,
    first: page === 0,
    last: start + size >= totalElements,
  };
}

// ✅ 최근 재생 저장(그대로)
export async function recordRecentPlay(soundId: number) {
  await api.post(`/v1/me/recent-plays/${soundId}`);
}
