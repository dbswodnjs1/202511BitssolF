// src/pages/option/Setting.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";
import "./Settings.wire.css";

export default function Settings(): React.ReactElement {
  const navigate = useNavigate();

  // ✅ 로그아웃 처리: 토큰 제거 -> 로그인 화면으로 이동
  const handleLogout = () => {
    localStorage.removeItem("token");
    // 필요하면 추가로 지우기: refreshToken, user 등
    // localStorage.removeItem("refreshToken");

    // ✅ HashRouter에서도 정상 동작 (createHashRouter 사용 중)
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="page-screen settings-wire">
        <StatusBar />

        {/* 상단: 뒤로가기 + 타이틀 */}
        <header className="settings-wire__top">
          <button
            type="button"
            className="settings-wire__back"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h3 className="settings-wire__title">설정</h3>

          {/* 오른쪽 공간 맞추기용(정렬 유지) */}
          <div className="settings-wire__spacer" />
        </header>

        {/* 목록: 와이어프레임(구역 확인용) */}
        <main className="settings-wire__content">
          {/* 1) 계정 */}
          <section className="settings-wire__section">
            <div className="settings-wire__sectionTitle">계정</div>
            <button
              className="settings-wire__row"
              type="button"
              onClick={() => navigate("/option/profile-image")}
            >
              프로필 설정
            </button>
            {/*  비밀번호 변경 이동 */}
            <button
              className="settings-wire__row"
              type="button"
              onClick={() => navigate("/option/password")}
            >
              비밀번호 변경
            </button>
          </section>



          {/* 3) 이용안내 */}
          <section className="settings-wire__section">
            <div className="settings-wire__sectionTitle">이용안내</div>
            <button className="settings-wire__row" type="button">
              앱 안내
            </button>
            <button className="settings-wire__row" type="button">
              문의하기
            </button>
            <button className="settings-wire__row" type="button">
              공지사항
            </button>
          </section>

          {/* 4) 기타 */}
          <section className="settings-wire__section">
            <div className="settings-wire__sectionTitle">기타</div>
            {/* 로그아웃: 토큰 삭제 후 로그인 이동 */}
            <button
              className="settings-wire__row"
              type="button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </section>
        </main>
      </div>

      {/* 하단바 유지 */}
      <BottomNav />
    </>
  );
}
