// src/pages/option/MyPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import StatusBar from "../../components/layout/StatusBar";
import RecentPlaysSection from "../../components/mypage/RecentPlaysSection";
import MyUploadsSection from "../../components/mypage/MyUploadsSection";
import FavoritesSection from "../../components/mypage/FavoritesSection";
import "./MyPage.wire.css";

export default function MyPage(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ 마이페이지는 mypage-wire에서 이미 하단바 공간을 빼고 있음 */}
      <div className="page-screen mypage-wire">
        <div className="mypage-wire__status">
          <StatusBar />
        </div>

        <div className="mypage-wire__inner">
          <header className="mypage-wire__top">
            <h3 className="mypage-wire__title">마이페이지</h3>

            <button
              type="button"
              className="mypage-wire__gear"
              aria-label="설정"
              onClick={() => navigate("/option/settings")}
            >
              ⚙
            </button>
          </header>

          <main className="mypage-wire__content">
            {/* 1) 최근 재생 콘텐츠 */}
            <section className="mypage-wire__section">
              <div className="mypage-wire__sectionHead">
                <div className="mypage-wire__sectionTitle">최근 재생 콘텐츠</div>
                <button
                  type="button"
                  className="mypage-wire__moreBtn"
                  onClick={() => navigate("/mypage/recent")}
                >
                  전체보기
                </button>
              </div>

              <RecentPlaysSection />
            </section>

            {/* 2) 즐겨찾기(미리보기) */}
            <FavoritesSection />

            {/* 3) 내가 업로드한 콘텐츠 */}
            <section className="mypage-wire__section">
              <div className="mypage-wire__sectionHead">
                <div className="mypage-wire__sectionTitle">내가 업로드한 콘텐츠</div>
                <button
                  type="button"
                  className="mypage-wire__moreBtn"
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

      {/* ✅ 하단바는 폰 프레임 폭으로 고정 */}
      <div className="bottom-nav-fixed">
        <BottomNav />
      </div>
    </>
  );
}
