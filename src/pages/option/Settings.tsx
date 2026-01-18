// src/pages/option/Setting.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";


const APP_MAX_WIDTH = 420;
const BOTTOM_SPACER = "110px"; // ✅ 하단바 겹침 방지(대략)

// ✅ 하단바 폭 조금 줄이기(원하면 숫자만 조절)
const NAV_SIDE_GAP = 28;   // 양쪽 여백(px)
const NAV_MAX_WIDTH = 380; // 최대 폭(px)

export default function Settings(): React.ReactElement {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ 로그아웃 처리: 토큰 제거 -> 로그인 화면으로 이동
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* ✅ MyPage랑 동일한 프레임(배경/폭/스크롤 구조) */}
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

        {/* ✅ flex 내부 스크롤 필수 옵션 */}
        <div className="flex-grow-1 d-flex flex-column px-3 pt-2" style={{ minHeight: 0 }}>
          {/* 상단 헤더 카드 */}
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

            <h3 className="m-0 fw-bold fs-5">설정</h3>

            {/* 오른쪽 정렬 맞추기용 */}
            <div style={{ width: 40, height: 40 }} />
          </header>

          {/* 본문만 스크롤 */}
          <main className="flex-grow-1 overflow-auto" style={{ paddingBottom: BOTTOM_SPACER }}>
            {/* 1) 계정 */}
            <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
              <div className="fw-bold mb-3">계정</div>

              <button
                type="button"
                className="btn btn-outline-light w-100 text-start rounded-3 mb-2"
                onClick={() => navigate("/option/profile")}
              >
                프로필 설정
              </button>

              <button
                type="button"
                className="btn btn-outline-light w-100 text-start rounded-3"
                onClick={() => navigate("/option/password")}
              >
                비밀번호 변경
              </button>
            </section>

            {/* 2) 이용안내 */}
            <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
              <div className="fw-bold mb-3">이용안내</div>

              <button type="button" className="btn btn-outline-light w-100 text-start rounded-3 mb-2">
                앱 안내
              </button>

              <button type="button" className="btn btn-outline-light w-100 text-start rounded-3 mb-2">
                문의하기
              </button>

              <button type="button" className="btn btn-outline-light w-100 text-start rounded-3">
                공지사항
              </button>
            </section>

            {/* 3) 기타 */}
            <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
              <div className="fw-bold mb-3">기타</div>

              <button
                type="button"
                className="btn btn-outline-light w-100 text-start rounded-3"
                onClick={() => setShowLogoutModal(true)}
              >
                로그아웃
              </button>
            </section>
          </main>
        </div>
      </div>

      {/* ✅ 하단바 고정(폭 조금 줄인 버전) */}
      <div
        className="position-fixed start-50 translate-middle-x"
        style={{
          width: `min(calc(100vw - ${NAV_SIDE_GAP * 2}px), ${NAV_MAX_WIDTH}px)`,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          zIndex: 1030,
        }}
      >
        <BottomNav />
      </div>

      {/* ✅ 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <>
          <div className="modal-backdrop fade show" />

          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logoutModalTitle"
            onClick={() => setShowLogoutModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              style={{ maxWidth: 360 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content bg-dark text-white border border-light border-opacity-25 rounded-4">
                <div className="modal-header border-0 py-2">
                  <h5 className="modal-title" id="logoutModalTitle">
                    로그아웃
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="닫기"
                    onClick={() => setShowLogoutModal(false)}
                  />
                </div>

                <div className="modal-body py-2">정말 로그아웃 하시겠습니까?</div>

                <div className="modal-footer border-0 py-2 d-flex gap-2 justify-content-end flex-nowrap">
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => setShowLogoutModal(false)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setShowLogoutModal(false);
                      handleLogout();
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
