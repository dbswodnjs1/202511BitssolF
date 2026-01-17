// src/pages/option/MyPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import StatusBar from "../../components/layout/StatusBar";
import RecentPlaysSection from "../../components/mypage/RecentPlaysSection";
import MyUploadsSection from "../../components/mypage/MyUploadsSection";
import FavoritesSection from "../../components/mypage/FavoritesSection";

const APP_MAX_WIDTH = 420;
const BOTTOM_SPACER = "110px";

const NAV_SIDE_GAP = 28;   // ✅ 양쪽 여백(px) - 숫자 키우면 더 좁아짐
const NAV_MAX_WIDTH = 380; // ✅ 바 최대 폭(px)

export default function MyPage(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <>
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

        <div
          className="flex-grow-1 d-flex flex-column px-3 pt-2"
          style={{ minHeight: 0 }}
        >
          <header className="d-flex align-items-center justify-content-between p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
            <h3 className="m-0 fw-bold fs-5">마이페이지</h3>

            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-3 d-inline-flex align-items-center justify-content-center"
              aria-label="설정"
              onClick={() => navigate("/option/settings")}
              style={{ width: 40, height: 40 }}
            >
              ⚙
            </button>
          </header>

          {/* ✅ main만 스크롤 + ✅ 스크롤바 숨김 */}
          <main
            className="d-flex flex-column gap-3 flex-grow-1 overflow-auto no-scrollbar"
            style={{ paddingBottom: BOTTOM_SPACER }}
          >
            <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
              <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom border-light border-opacity-25">
                <div className="fw-bold">최근 재생 콘텐츠</div>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm rounded-pill px-3"
                  onClick={() => navigate("/mypage/recent")}
                >
                  전체보기
                </button>
              </div>

              <RecentPlaysSection />
            </section>

            <FavoritesSection />

            <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
              <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom border-light border-opacity-25">
                <div className="fw-bold">내가 업로드한 콘텐츠</div>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm rounded-pill px-3"
                  onClick={() => navigate("/mypage/uploads")}
                >
                  전체보기
                </button>
              </div>

              <MyUploadsSection />
            </section>
          </main>
        </div>
      </div>

      <div
        className="position-fixed start-50 translate-middle-x"
        style={{
          width: `min(calc(100vw - ${NAV_SIDE_GAP * 2}px), ${NAV_MAX_WIDTH}px)`, // ✅ 핵심
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          zIndex: 1030,
        }}
      >
        <BottomNav />
      </div>
    </>
  );
}
