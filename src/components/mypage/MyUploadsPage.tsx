// src/pages/option/mypage/MyUploadsPage.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ 경로 주의:
// 이 파일이 정말 src/pages/option/mypage/MyUploadsPage.tsx 라면
// 보통은 ../../../api 가 맞습니다.
// 지금 프로젝트에서 실제로 빌드되는 경로를 우선으로 유지하세요.
import api from "../../api";
// import api from "../../../api";

import BottomNav from "../../components/layout/BottomNav";
// import BottomNav from "../../../components/layout/BottomNav";

import StatusBar from "../../components/layout/StatusBar";
// import StatusBar from "../../../components/layout/StatusBar";

import { usePlayer } from "../../hooks/usePlayer";
// import { usePlayer } from "../../../hooks/usePlayer";

// import "./MyUploadsPage.css"; // ✅ 부트스트랩 버전에서는 제거(필요하면 남겨도 됨)

type SoundDto = {
  soundId: number;
  title: string;
  thumbnailUrl: string;
  uploader?: string;
};

const PAGE_SIZE = 20;

const APP_MAX_WIDTH = 420;
const BOTTOM_SPACER = "110px";

// 하단바 폭 줄이고 싶으면 조절
const NAV_SIDE_GAP = 28;
const NAV_MAX_WIDTH = 380;

/**
 * ✅ 내 업로드 삭제 API
 * - 백엔드: DELETE /v1/me/uploads/{soundId}
 */
async function deleteMyUpload(soundId: number) {
  await api.delete(`/v1/me/uploads/${soundId}`);
}

export default function MyUploadsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { playSound } = usePlayer();

  const [all, setAll] = useState<SoundDto[]>([]);
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // ✅ 내부 스크롤 컨테이너(IntersectionObserver root로 사용)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ✅ 삭제 확인 모달
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ soundId: number; title?: string } | null>(
    null
  );

  const uiLocked = loading || removingId !== null;

  // ESC로 모달 닫기(삭제 중이면 닫기 막음)
  useEffect(() => {
    if (!showConfirm) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (removingId !== null) return;
        setShowConfirm(false);
        setPendingDelete(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showConfirm, removingId]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErrMsg(null);
      try {
        const res = await api.get<SoundDto[]>("/v1/me/uploads");
        if (!mounted) return;
        setAll(res.data ?? []);
      } catch {
        if (!mounted) return;
        setAll([]);
        setErrMsg("내 업로드 목록을 불러오지 못했습니다.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => all.slice(0, page * PAGE_SIZE), [all, page]);

  useEffect(() => {
    const rootEl = scrollRef.current;
    const sentinelEl = sentinelRef.current;
    if (!rootEl || !sentinelEl) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        const maxPage = Math.ceil(all.length / PAGE_SIZE);
        setPage((p) => (p < maxPage ? p + 1 : p));
      },
      {
        root: rootEl,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    io.observe(sentinelEl);
    return () => io.disconnect();
  }, [all.length]);

  // ✅ 카드 클릭: 재생
  const onClickCard = (soundId: number) => {
    Promise.resolve((playSound as any)(soundId)).finally(() => {
      navigate("/soundplayer");
    });
  };

  // ✅ 모달 오픈
  const openDeleteConfirm = (soundId: number, title?: string) => {
    if (uiLocked) return;
    setErrMsg(null);
    setPendingDelete({ soundId, title });
    setShowConfirm(true);
  };

  // ✅ 모달 닫기
  const closeDeleteConfirm = () => {
    if (removingId !== null) return; // 삭제 중이면 닫기 막기
    setShowConfirm(false);
    setPendingDelete(null);
  };

  // ✅ 모달에서 삭제 확정 → 실제 삭제 수행
  const confirmDelete = async () => {
    const target = pendingDelete;
    if (!target) return;

    if (removingId !== null) return;
    setRemovingId(target.soundId);
    setErrMsg(null);

    try {
      await deleteMyUpload(target.soundId);

      setAll((prev) => {
        const next = prev.filter((x) => x.soundId !== target.soundId);

        // ✅ next 길이 기준으로 page 보정
        const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, maxPage));

        return next;
      });

      // ✅ 성공 시 모달 닫기
      setShowConfirm(false);
      setPendingDelete(null);
    } catch (e) {
      console.error("내 업로드 삭제 실패", e);
      setErrMsg("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      // 실패 시 모달은 유지(재시도/취소 선택 가능)
    } finally {
      setRemovingId(null);
    }
  };

  const deletingThis =
    pendingDelete?.soundId != null && removingId === pendingDelete.soundId;

  return (
    <>
      {/* ✅ 이 파일에서만 스크롤바 숨김 + 썸네일 고정 */}
      <style>{`
        .upl-no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .upl-no-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .upl-thumb {
          width: 64px;
          height: 64px;
          object-fit: cover;
          display: block;
          border-radius: 14px;
        }
      `}</style>

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

        <div className="flex-grow-1 d-flex flex-column px-3 pt-2" style={{ minHeight: 0 }}>
          {/* 헤더 */}
          <header className="d-flex align-items-center justify-content-between p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-3"
              aria-label="뒤로가기"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/mypage"))}
              style={{ width: 40, height: 40 }}
              disabled={loading}
            >
              ←
            </button>

            <h3 className="m-0 fw-bold fs-5">내 업로드</h3>
            <div style={{ width: 40, height: 40 }} />
          </header>

          {/* 본문(내부 스크롤) */}
          <main
            ref={scrollRef}
            className="flex-grow-1 overflow-auto upl-no-scrollbar"
            style={{
              paddingBottom: BOTTOM_SPACER,
              WebkitOverflowScrolling: "touch",
              minHeight: 0,
            }}
          >
            {loading ? (
              <div className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
                불러오는 중...
              </div>
            ) : (
              <>
                {errMsg && (
                  <div className="alert alert-dark text-white border border-light border-opacity-25 rounded-4">
                    {errMsg}
                  </div>
                )}

                {visible.length === 0 ? (
                  <div className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
                    아직 업로드한 콘텐츠가 없습니다.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {visible.map((s) => (
                      <div
                        key={s.soundId}
                        className="p-2 rounded-4 border border-light border-opacity-25 shadow-sm d-flex align-items-center gap-3"
                        role="button"
                        onClick={() => onClickCard(s.soundId)}
                      >
                        <img
                          className="upl-thumb"
                          src={s.thumbnailUrl}
                          alt={s.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/default-thumb.png";
                          }}
                        />

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-bold text-truncate">{s.title}</div>
                          <div className="small text-white-50 text-truncate">
                            {s.uploader ?? ""}
                          </div>
                        </div>

                        {/* ✅ 삭제 버튼: 클릭 시 재생 이벤트 전파 막기 */}
                        <button
                          type="button"
                          className="btn btn-outline-light btn-sm rounded-3"
                          aria-label="내 업로드 삭제"
                          disabled={uiLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(s.soundId, s.title);
                          }}
                          style={{ width: 44, height: 36 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 무한 스크롤 센티넬 */}
                <div ref={sentinelRef} style={{ height: 1 }} />
              </>
            )}
          </main>
        </div>
      </div>

      {/* ✅ 하단바 고정(폭 제한) */}
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

      {/* ✅ 삭제 확인 모달 */}
      {showConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,.55)",
            zIndex: 2500,
            padding: 16,
          }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteConfirm();
          }}
        >
          <div className="w-100" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div className="bg-dark text-white border border-light border-opacity-25 rounded-4 shadow-sm p-3">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div className="fw-bold fs-5">업로드 삭제</div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={closeDeleteConfirm}
                  disabled={removingId !== null}
                />
              </div>

              <div className="text-white-50 mb-3" style={{ whiteSpace: "pre-line" }}>
                정말 삭제하시겠습니까?
                {"\n"}
                업로드한 콘텐츠가 삭제되며, 되돌릴 수 없습니다.
                {pendingDelete?.title ? `\n\n대상: ${pendingDelete.title}` : ""}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-light w-100 rounded-4"
                  onClick={closeDeleteConfirm}
                  disabled={removingId !== null}
                >
                  취소
                </button>

                <button
                  type="button"
                  className="btn btn-light w-100 rounded-4 fw-bold"
                  onClick={confirmDelete}
                  disabled={removingId !== null}
                  autoFocus
                >
                  {deletingThis ? "삭제중..." : "삭제"}
                </button>
              </div>

              <div className="small text-white-50 mt-2">
                삭제는 되돌릴 수 없습니다(내 업로드 콘텐츠 기준).
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
