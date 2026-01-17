// src/pages/option/mypage/RecentPlaysPage.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentPlaysAll, type SoundDto } from "../../api/mypage";
import { usePlayer } from "../../hooks/usePlayer";
import BottomNav from "../../components/layout/BottomNav";
import api from "../../api";
import "./RecentPlaysPage.css";

const PAGE_SIZE = 20;

/**
 * ✅ 최근 재생 삭제 API
 * - 백엔드: DELETE /v1/me/recent-plays/{soundId}
 * - 기존처럼 여러 URL을 "찍어보는 방식"은 유지보수/디버깅 난이도만 올림
 * - API가 확정되면 1개로 고정하는 게 정답
 */
async function deleteRecentPlay(soundId: number) {
  await api.delete(`/v1/me/recent-plays/${soundId}`);
}

/**
 * ✅ (추가-재원) 확인 문구: "삭제"지만 콘텐츠 삭제가 아니라 "내 기록 삭제"임
 * - 사용자가 '콘텐츠가 지워지는지' 오해할 수 있어서 문구로 방지
 */
const CONFIRM_DELETE_RECENT =
  "최근 재생 목록에서 삭제하시겠습니까?\n(콘텐츠는 삭제되지 않고, 내 최근 재생 기록만 제거됩니다.)";

export default function RecentPlaysPage(): React.ReactElement {
  const navigate = useNavigate();
  const { playSound } = usePlayer();

  const [all, setAll] = useState<SoundDto[]>([]);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // ✅ 백엔드가 "전체 리스트"를 내려주므로 프론트에서 PAGE_SIZE로 잘라 무한스크롤
    getRecentPlaysAll().then(setAll).catch(() => setAll([]));
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

  const onClickCard = (soundId: number) => {
    playSound(soundId);
    navigate("/soundplayer");
  };

  /**
   * ✅ 최근 재생 삭제 버튼
   * - 서버에서 내 기록(play_history 1건) 삭제
   * - 성공하면 프론트 상태에서도 즉시 제거(UX)
   */
  const onDelete = async (soundId: number) => {
    // ✅ (추가-재원) 삭제 확인: 취소하면 API 호출/상태 변경을 하지 않음
    const ok = window.confirm(CONFIRM_DELETE_RECENT);
    if (!ok) return;

    try {
      await deleteRecentPlay(soundId);

      // ✅ 화면에서 즉시 제거
      setAll((prev) => {
        const next = prev.filter((x) => x.soundId !== soundId);

        // ✅ 삭제 후 현재 page가 범위를 넘지 않도록 조정(무한스크롤 UX 안정화)
        const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, maxPage));
        return next;
      });
    } catch (e) {
      console.error("최근 재생 삭제 실패", e);
    }
  };

  return (
    <>
      <div className="page-screen recentplays-page page-has-bottom-nav">
        <header className="mypage-subheader">
          <button
            type="button"
            className="mypage-subheader__back"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/mypage"))}
            aria-label="뒤로가기"
          >
            &lt;
          </button>
          <h2 className="mypage-subheader__title">최근 재생</h2>
          <div className="mypage-subheader__spacer" />
        </header>

        {visible.length === 0 ? (
          <div style={{ padding: 16 }}>최근 재생한 콘텐츠가 없습니다.</div>
        ) : (
          <div className="sound-list">
            {visible.map((it) => (
              <div
                key={it.soundId}
                className="sound-card"
                onClick={() => onClickCard(it.soundId)}
                role="button"
              >
                <img src={it.thumbnailUrl} alt={it.title} />
                <div className="sound-card__meta">
                  <div className="sound-card__title">{it.title}</div>
                  <div className="sound-card__uploader">{it.uploader}</div>
                </div>

                <button
                  type="button"
                  className="sound-card__delete"
                  aria-label="최근 재생 삭제"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ 카드 클릭(재생) 이벤트 막기
                    onDelete(it.soundId);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      <div className="bottom-nav-fixed">
        <BottomNav />
      </div>
    </>
  );
}
