// src/api/profileImage.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:9000";


export async function resetMyProfileImage() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/api/users/me/profile-image`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("프로필 이미지 초기화 실패");
  return res.json();
}


export type ProfileImageResponse = {
  profileImageUrl: string | null;
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

/**
 * DB/서버가 내려준 profileImageUrl(예: "/upload/profile/xxx.jpg")을
 * 브라우저가 실제로 로딩 가능한 절대 URL로 변환.
 *
 * - null/빈값이면 "" 반환
 * - 이미 "http"로 시작하면 그대로 반환
 * - "/upload/..." 처럼 슬래시로 시작하면 API_BASE를 붙여 반환
 */
export function resolveProfileImageUrl(profileImageUrl?: string | null): string {
  if (!profileImageUrl) return "";
  if (profileImageUrl.startsWith("http")) return profileImageUrl;
  if (profileImageUrl.startsWith("/")) return `${API_BASE}${profileImageUrl}`;
  // 혹시 "upload/..." 같이 슬래시 없이 올 경우까지 방어
  return `${API_BASE}/${profileImageUrl}`;
}

export async function getMyProfileImage(): Promise<ProfileImageResponse> {
  const res = await fetch(`${API_BASE}/api/users/me/profile-image`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`프로필 이미지 조회 실패: ${await readError(res)}`);
  }

  // 기대 응답: { profileImageUrl: "/upload/profile/xxx.jpg" }
  return (await res.json()) as ProfileImageResponse;
}

export async function uploadMyProfileImage(file: File): Promise<ProfileImageResponse> {
  if (!file) {
    throw new Error("업로드할 파일이 없습니다.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  // 백엔드 제한(예: 2MB) 맞추려면 여기서도 동일하게 제한 권장
  const MAX = 2 * 1024 * 1024;
  if (file.size > MAX) {
    throw new Error("이미지 용량은 2MB 이하만 가능합니다.");
  }

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/api/users/me/profile-image`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      // ⚠️ multipart/form-data는 Content-Type을 직접 넣지 마세요.
      // 브라우저가 boundary 포함해서 자동으로 세팅합니다.
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`프로필 이미지 업로드 실패: ${await readError(res)}`);
  }

  return (await res.json()) as ProfileImageResponse;

  
}
