// src/pages/option/mypage/MyUploadsPage.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import BottomNav from "../../components/layout/BottomNav";
import { usePlayer } from "../../hooks/usePlayer";
import "./MyUploadsPage.css";

type SoundDto = {
  soundId: number;
  title: string;
  thumbnailUrl: string;
  uploader?: string;
};

const PAGE_SIZE = 20;

/**
 * ✅ 내 업로드 삭제 API
 * - 백엔드: DELETE /v1/me/uploads/{soundId}
 * - "진짜 삭제"이므로 서버에서 FK 정리 + 파일 삭제까지 처리(백엔드 정책 기준)
 */
async function deleteMyUpload(soundId: number) {
  await api.delete(`/v1/me/uploads/${soundId}`);
}

/**
 * ✅ (추가-재원) 업로드 삭제 확인 문구
 * - "진짜 삭제"는 되돌리기 어려우니 confirm으로 실수 방지
 */
const CONFIRM_DELETE_UPLOAD =
  "정말 삭제하시겠습니까?\n업로드한 콘텐츠가 삭제되며, 되돌릴 수 없습니다.";

export default function MyUploadsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { playSound } = usePlayer();

  const [all, setAll] = useState<SoundDto[]>([]);
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // ✅ 백엔드: GET /v1/me/uploads (전체 리스트)
    api
      .get<SoundDto[]>("/v1/me/uploads")
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

  // ✅ 카드 클릭: 재생으로 보낼지 / 상세로 보낼지 정책에 따라 바꾸면 됨
  const onClickCard = (soundId: number) => {
    Promise.resolve((playSound as any)(soundId)).finally(() => {
      navigate("/soundplayer");
    });
  };

  /**
   * ✅ 업로드 삭제(진짜 삭제)
   * - 중복 클릭 방지(removingId)
   * - 성공 시 목록에서 즉시 제거
   */
  const onDelete = async (soundId: number) => {
    // ✅ (추가-재원) 삭제 확인: 취소하면 아무 것도 하지 않음
    const ok = window.confirm(CONFIRM_DELETE_UPLOAD);
    if (!ok) return;

    if (removingId !== null) return;
    setRemovingId(soundId);

    try {
      await deleteMyUpload(soundId);
      setAll((prev) => prev.filter((x) => x.soundId !== soundId));

      // ✅ 페이지 범위 조정(삭제 후 빈 페이지 방지)
      setPage((p) => {
        const nextLen = all.length - 1;
        const maxPage = Math.max(1, Math.ceil(nextLen / PAGE_SIZE));
        return Math.min(p, maxPage);
      });
    } catch (e) {
      console.error("내 업로드 삭제 실패", e);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <div className="page-screen uploads-page page-has-bottom-nav">
        <header className="mypage-subheader">
          <button
            type="button"
            className="mypage-subheader__back"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/mypage"))}
            aria-label="뒤로가기"
          >
            &lt;
          </button>

          <h2 className="mypage-subheader__title">내 업로드</h2>
          <div className="mypage-subheader__spacer" />
        </header>

        {visible.length === 0 ? (
          <div style={{ padding: 16 }}>아직 업로드한 콘텐츠가 없습니다.</div>
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

                {/* ✅ 삭제 버튼: 클릭 시 카드 클릭(재생) 전파 막기 */}
                <button
                  type="button"
                  className="sound-card__delete"
                  aria-label="내 업로드 삭제"
                  disabled={removingId === s.soundId}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.soundId);
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
