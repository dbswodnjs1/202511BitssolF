// src/pages/option/ChangePassword.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";
import { changeMyPassword } from "../../api/user";
import { validatePassword } from "../../utils/validators";
import "./ChangePassword.wire.css";

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
      setErrorMsg(typeof serverMsg === "string" ? serverMsg : "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-screen pw-wire">
        <StatusBar />

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
