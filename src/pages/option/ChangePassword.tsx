import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // ✅ index.ts 통일 버전
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";
import "./ChangePassword.wire.css";

export default function ChangePassword(): React.ReactElement {
  const navigate = useNavigate();

  // ✅ 입력값 상태
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // ✅ UI 상태
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * ✅ 비밀번호 변경 요청
   * - 성공하면: 보안상 "무조건 로그아웃"
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1) 프론트 1차 검증
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg("현재 비밀번호와 새 비밀번호를 입력해 주세요.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 2) ✅ 백엔드 호출
      // baseURL이 "/api"면 실제 요청은 "/api/v1/users/me/password"
      await api.patch("/v1/users/me/password", {
        currentPassword,
        newPassword,
      });

      // 3) ✅ 요구사항: 변경 후 무조건 로그아웃
      localStorage.removeItem("token");

      // HashRouter 기준 이동 (팀에서 이 방식 쓰면 계속 유지)
      window.location.hash = "#/login";
      // 또는: navigate("/login", { replace: true });  // 팀에서 navigate로 통일할 때
    } catch (err: any) {
      // 4) 서버 메시지 우선 표시(있으면)
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "비밀번호 변경에 실패했습니다.";

      setErrorMsg(typeof serverMsg === "string" ? serverMsg : "비밀번호 변경에 실패했습니다.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-screen pw-wire">
        <StatusBar />

        {/* 상단: 뒤로가기 + 타이틀 */}
        <header className="pw-wire__top">
          <button
            type="button"
            className="pw-wire__back"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <h3 className="pw-wire__title">비밀번호 변경</h3>
          <div className="pw-wire__spacer" />
        </header>

        <main className="pw-wire__content">
          <section className="pw-wire__section">
            <div className="pw-wire__sectionTitle">비밀번호 입력</div>

            <form className="pw-wire__form" onSubmit={handleSubmit}>
              <label className="pw-wire__label">
                현재 비밀번호
                <input
                  className="pw-wire__input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>

              <label className="pw-wire__label">
                새 비밀번호
                <input
                  className="pw-wire__input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              <label className="pw-wire__label">
                새 비밀번호 확인
                <input
                  className="pw-wire__input"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>

              {errorMsg && <div className="pw-wire__error">{errorMsg}</div>}

              <button className="pw-wire__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "변경중..." : "변경하기"}
              </button>

              <div className="pw-wire__hint">
                비밀번호가 변경되면 보안을 위해 자동 로그아웃됩니다.
              </div>
            </form>
          </section>
        </main>
      </div>

      <BottomNav />
    </>
  );
}
