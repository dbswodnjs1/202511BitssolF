// src/pages/option/ProfileImageSettings.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";
import {
  getMyProfileImage,
  uploadMyProfileImage,
  resetMyProfileImage,        // ✅ reset도 여기서 같이 import (중복 import 제거)
  resolveProfileImageUrl,
} from "../../api/profileImage";

export default function ProfileImageSettings(): React.ReactElement {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);               // ✅ 최초 로딩 상태
  const [profileImageUrl, setProfileImageUrl] = useState(""); // ✅ 서버/DB에 저장된 상대경로(/upload/...)
  const [file, setFile] = useState<File | null>(null);        // ✅ 사용자가 선택한 파일
  const [saving, setSaving] = useState(false);                // ✅ 업로드/초기화 중 버튼 비활성화
  const [imgError, setImgError] = useState(false);            // ✅ 이미지 로딩 실패 여부(깨진 아이콘 방지)

  // ✅ 파일 선택 시 브라우저 미리보기 URL 생성
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  // ✅ 미리보기 URL 해제(메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ✅ 서버에서 내려온 상대경로(/upload/...)를 절대경로로 보정
  const resolvedServerUrl = useMemo(() => {
    return resolveProfileImageUrl(profileImageUrl);
  }, [profileImageUrl]);

  // ✅ 최종 이미지 src: 미리보기 > 서버이미지 > 기본이미지
  const imgSrc = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (resolvedServerUrl) return resolvedServerUrl;
    return "/default-profile.png"; // (없으면 onError로 fallback UI로 전환됨)
  }, [previewUrl, resolvedServerUrl]);

  // ✅ 최초 진입 시 프로필 이미지 조회
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfileImage();
        setProfileImageUrl(data.profileImageUrl ?? "");
      } catch {
        // 토큰 만료/미인증 등
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // ✅ 파일/서버URL이 바뀌면 이미지 에러 상태 리셋 (새로 로딩 시도)
  useEffect(() => {
    setImgError(false);
  }, [file, profileImageUrl]);

  // ✅ 업로드 핸들러
  const onUpload = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const data = await uploadMyProfileImage(file);
      setProfileImageUrl(data.profileImageUrl ?? "");
      setFile(null); // ✅ 업로드 성공 후 미리보기 제거
      alert("프로필 이미지가 변경되었습니다.");
    } catch {
      alert("업로드 실패");
    } finally {
      setSaving(false);
    }
  };

  // ✅ 기본 이미지로 되돌리기(초기화) 핸들러
  const onReset = async () => {
    setSaving(true);
    try {
      await resetMyProfileImage(); // ✅ 백엔드 DELETE 호출
      setProfileImageUrl("");      // ✅ 서버 값 비움
      setFile(null);               // ✅ 미리보기 제거
      setImgError(false);          // ✅ fallback 재시도
      alert("기본 이미지로 변경되었습니다.");
    } catch {
      alert("초기화 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-screen">
        <StatusBar />

        {/* ✅ 상단 헤더 */}
        <header style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
          <button type="button" onClick={() => navigate(-1)}>←</button>
          <h3 style={{ margin: 0 }}>프로필 이미지 변경</h3>
        </header>

        <main style={{ padding: 12 }}>
          {loading ? (
            <div>불러오는 중...</div>
          ) : (
            <>
              {/* ✅ 원형 고정 영역: wrapper + overflow hidden으로 원 밖으로 튀는 현상 방지 */}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!imgError ? (
                  <img
                    src={imgSrc}
                    alt="profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={() => {
                      // ✅ 이미지 로딩 실패 시 깨진 아이콘 대신 fallback UI로 전환
                      setImgError(true);
                    }}
                  />
                ) : (
                  // ✅ fallback UI(기본 이미지가 없거나 로딩 실패 시)
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#666" }}>P</span>
                )}
              </div>

              {/* ✅ 파일명 표시 제거: input은 숨기고 label 버튼으로 대체 */}
              <div style={{ marginTop: 12 }}>
                <input
                  id="profileFile"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }} // ✅ 파일명 표시 UI 자체를 숨김
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="profileFile"
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    border: "1px solid #999",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  파일 선택
                </label>
              </div>

              {/* ✅ 업로드 버튼 */}
              <button
                type="button"
                disabled={!file || saving}
                onClick={onUpload}
                style={{ marginTop: 12 }}
              >
                업로드
              </button>

              {/* ✅ 기본 이미지로 되돌리기 버튼 */}
              <button
                type="button"
                disabled={saving}
                onClick={onReset}
                style={{ marginTop: 8 }}
              >
                기본 이미지로 되돌리기
              </button>
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </>
  );
}
