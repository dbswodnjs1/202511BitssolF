// src/pages/option/ChangePassword.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";
import { changeMyPassword } from "../../api/user";
import { validatePassword } from "../../utils/validators";

// ✅ wire CSS 제거
// import "./ChangePassword.wire.css";

const APP_MAX_WIDTH = 420;
const BOTTOM_SPACER = "110px"; // ✅ 하단바 겹침 방지(대략)

export default function ChangePassword(): React.ReactElement {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg("현재 비밀번호와 새 비밀번호를 입력해 주세요.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    const pwMsg = validatePassword(newPassword);
    if (pwMsg) {
      setErrorMsg(pwMsg);
      return;
    }

    setIsSubmitting(true);
    try {
      await changeMyPassword(currentPassword, newPassword);

      // 변경 후 로그아웃
      localStorage.removeItem("token");
      window.location.hash = "#/login";
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "비밀번호 변경에 실패했습니다.";
      setErrorMsg(
        typeof serverMsg === "string" ? serverMsg : "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ✅ MyPage처럼 폰 프레임 폭 + 배경색 유지 */}
      <div
        className="page-screen mx-auto d-flex flex-column text-white"
        style={{
          maxWidth: APP_MAX_WIDTH,
          height: "100dvh",
          backgroundColor: "#444",
          overflow: "hidden",
        }}
      >
        <div className="flex-shrink-0">
          <StatusBar />
        </div>

        {/* ✅ overflow-auto가 정상 동작하도록 minHeight:0 */}
        <div className="flex-grow-1 d-flex flex-column px-3 pt-2" style={{ minHeight: 0 }}>
          {/* ✅ 즐겨찾기/마이페이지 카드 느낌의 상단 헤더 */}
          <header className="d-flex align-items-center justify-content-between p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-3"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              style={{ width: 40, height: 40 }}
            >
              ←
            </button>

            <h3 className="m-0 fw-bold fs-5">비밀번호 변경</h3>

            {/* 오른쪽 정렬 맞추기용 스페이서 */}
            <div style={{ width: 40, height: 40 }} />
          </header>

          {/* ✅ 본문만 스크롤 */}
          <main
            className="flex-grow-1 overflow-auto"
            style={{ paddingBottom: BOTTOM_SPACER }}
          >
            <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
              <div className="fw-bold mb-3">비밀번호 입력</div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">현재 비밀번호</label>
                  <input
                    className="form-control bg-transparent text-white border border-light border-opacity-25"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">새 비밀번호</label>
                  <input
                    className="form-control bg-transparent text-white border border-light border-opacity-25"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">새 비밀번호 확인</label>
                  <input
                    className="form-control bg-transparent text-white border border-light border-opacity-25"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 mb-3" role="alert">
                    {errorMsg}
                  </div>
                )}

                <button
                  className="btn btn-outline-light w-100 rounded-3"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "변경중..." : "변경하기"}
                </button>

                <div className="mt-3 small text-white-50">
                  비밀번호가 변경되면 보안을 위해 자동 로그아웃됩니다.
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>

      {/* ✅ 하단바는 MyPage와 동일한 방식으로 폭/위치 고정 */}
      <div
        className="position-fixed start-50 translate-middle-x"
        style={{
          width: `min(100vw, ${APP_MAX_WIDTH}px)`,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          paddingLeft: 12,
          paddingRight: 12,
          zIndex: 1030,
        }}
      >
        <BottomNav />
      </div>
    </>
  );
}
