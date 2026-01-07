// src/pages/option/MyPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import StatusBar from "../../components/layout/StatusBar";
import "./MyPage.wire.css";

export default function MyPage(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ mypage-wire: 빨간선(하단바) 위까지만 화면 높이 고정 */}
      <div className="page-screen mypage-wire">
        {/* ✅ StatusBar는 “좌우 끝 정렬”이 필요하니
            mypage-wire의 내부 패딩 영향을 받지 않게 별도 래퍼로 분리 */}
        <div className="mypage-wire__status">
          <StatusBar />
        </div>

        {/* ✅ 실제 페이지 내용만 패딩 적용 */}
        <div className="mypage-wire__inner">
          {/* 상단 타이틀 + 톱니 */}
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

          {/* 구역들 */}
          <main className="mypage-wire__content">
            {/* 1) 최근 재생 콘텐츠 */}
            <section className="mypage-wire__section">
              <div className="mypage-wire__sectionHead">
                <div className="mypage-wire__sectionTitle">최근 재생 콘텐츠</div>
                <button type="button" className="mypage-wire__moreBtn">
                  전체보기
                </button>
              </div>

              <div className="mypage-wire__grid2">
                <div className="mypage-wire__box">[카드1]</div>
                <div className="mypage-wire__box">[카드2]</div>
              </div>
            </section>

            {/* 2) 즐겨찾기 */}
            <section className="mypage-wire__section">
              <div className="mypage-wire__sectionHead">
                <div className="mypage-wire__sectionTitle">즐겨찾기</div>
                <button type="button" className="mypage-wire__moreBtn">
                  전체보기
                </button>
              </div>

              <div className="mypage-wire__grid2">
                <div className="mypage-wire__box">[카드1]</div>
                <div className="mypage-wire__box">[카드2]</div>
              </div>
            </section>

            {/* 3) 내가 업로드한 콘텐츠 */}
            <section className="mypage-wire__section">
              <div className="mypage-wire__sectionHead">
                <div className="mypage-wire__sectionTitle">내가 업로드한 콘텐츠</div>
                <button type="button" className="mypage-wire__moreBtn">
                  전체보기
                </button>
              </div>

              <div className="mypage-wire__uploadBox">
                <div className="mypage-wire__uploadIcon">≡</div>
                <div className="mypage-wire__uploadText">아직 업로드한 콘텐츠가 없습니다.</div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ✅ 하단 네비(고정) */}
      <BottomNav />
    </>
  );
}
