// src/pages/option/mypage/FavoritesPage.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ option/mypage 기준: src까지 3번 올라감
import api from "../../api";
import { usePlayer } from "../../hooks/usePlayer";
import BottomNav from "../../components/layout/BottomNav";

import "./FavoritesPage.css";

type SoundDto = {
  soundId: number;
  title: string;
  thumbnailUrl: string;
  uploader?: string;
};

const PAGE_SIZE = 20;

/**
 * ✅ (추가-재원) 즐겨찾기 해제 확인 문구
 * - "해제"는 삭제가 아니므로 문구를 분리해서 오해 방지
 */
const CONFIRM_UNFAVORITE =
  "즐겨찾기를 해제하시겠습니까?\n(콘텐츠는 삭제되지 않습니다.)";

export default function FavoritesPage(): React.ReactElement {
  const navigate = useNavigate();
  const { playSound } = usePlayer();

  const [all, setAll] = useState<SoundDto[]>([]);
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api
      .get<SoundDto[]>("/v1/favorites")
      .then((res) => setAll(res.data))
      .catch(() => setAll([]));
  }, []);

  const visible = useMemo(() => all.slice(0, page * PAGE_SIZE), [all, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;

      const maxPage = Math.ceil(all.length / PAGE_SIZE);
      setPage((p) => (p < maxPage ? p + 1 : p));
    });

    io.observe(el);
    return () => io.disconnect();
  }, [all.length]);

  // ✅ 카드 클릭: 재생
  const onClickCard = (soundId: number) => {
    Promise.resolve((playSound as any)(soundId)).finally(() => {
      navigate("/soundplayer");
    });
  };

  // ✅ 별 클릭: 해제 (같은 API 재사용)
  const onUnfavorite = async (soundId: number) => {
    // ✅ (추가-재원) 해제 확인: 취소하면 API 호출/상태 변경 없음
    const ok = window.confirm(CONFIRM_UNFAVORITE);
    if (!ok) return;

    if (removingId !== null) return;
    setRemovingId(soundId);

    try {
      await api.delete(`/v1/sounds/${soundId}/favorite`);
      // ✅ 즉시 목록에서 제거
      setAll((prev) => prev.filter((x) => x.soundId !== soundId));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <div className="page-screen favorites-page page-has-bottom-nav">
        <header className="mypage-subheader">
          <button
            type="button"
            className="mypage-subheader__back"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/mypage");
            }}
            aria-label="뒤로가기"
          >
            &lt;
          </button>

          <h2 className="mypage-subheader__title">즐겨찾기</h2>
          <div className="mypage-subheader__spacer" />
        </header>

        {visible.length === 0 ? (
          <div style={{ padding: 16 }}>즐겨찾기한 콘텐츠가 없습니다.</div>
        ) : (
          <div className="sound-list">
            {visible.map((s) => (
              <div
                key={s.soundId}
                className="sound-card"
                onClick={() => onClickCard(s.soundId)}
                role="button"
              >
                <img src={s.thumbnailUrl} alt={s.title} />

                <div className="sound-card__info">
                  <div className="sound-card__title">{s.title}</div>
                  <div className="sound-card__sub">{s.uploader ?? ""}</div>
                </div>

                {/* ✅ 별 버튼: 클릭 시 재생 이벤트 전파 막기 */}
                <button
                  type="button"
                  className="sound-card__favBtn"
                  aria-label="즐겨찾기 해제"
                  disabled={removingId === s.soundId}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnfavorite(s.soundId);
                  }}
                >
                  ★
                </button>
              </div>
            ))}
          </div>
        )}

        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      {/* ✅ 하단바 고정 */}
      <div className="bottom-nav-fixed">
        <BottomNav />
      </div>
    </>
  );
}
