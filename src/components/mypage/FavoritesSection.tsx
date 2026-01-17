// src/components/mypage/FavoritesSection.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

type SoundDto = {
  soundId: number;
  title: string;
  thumbnailUrl: string;
  uploader?: string;
};

export default function FavoritesSection(): React.ReactElement {
  const [items, setItems] = useState<SoundDto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<SoundDto[]>("/v1/favorites")
      .then((res) => setItems((res.data ?? []).slice(0, 2))) // ✅ 기존 그대로(2개 미리보기)
      .catch(() => setItems([]));
  }, []);

  const goFavorites = () => navigate("/mypage/favorites"); // ✅ 기존 경로 그대로

  return (
    <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
      <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom border-light border-opacity-25">
        <div className="fw-bold">즐겨찾기</div>

        <button
          type="button"
          className="btn btn-outline-light btn-sm rounded-pill px-3"
          onClick={goFavorites}
        >
          전체보기
        </button>
      </div>

      {items.length === 0 ? (
        <div className="fw-semibold">즐겨찾기한 콘텐츠가 없습니다.</div>
      ) : (
        <div className="row row-cols-2 g-2">
          {items.map((s) => (
            <div className="col" key={s.soundId}>
              <div
                role="button"
                tabIndex={0}
                onClick={goFavorites}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goFavorites();
                }}
                className="position-relative rounded-4 overflow-hidden border border-light border-opacity-25 shadow-sm"
                style={{ height: 140, cursor: "pointer" }}
              >
                {/* ✅ 썸네일(있으면) */}
                <img
                  src={s.thumbnailUrl}
                  alt={s.title}
                  className="w-100 h-100"
                  style={{ objectFit: "cover", objectPosition: "center top", display: "block" }}
                />

                {/* ✅ 텍스트 오버레이 */}
                <div
                  className="position-absolute start-0 end-0 bottom-0 p-2"
                  style={{ background: "rgba(0,0,0,0.35)" }}
                >
                  <div className="fw-bold text-truncate" style={{ fontSize: 12 }}>
                    {s.title}
                  </div>
                  <div className="text-truncate" style={{ opacity: 0.85, fontSize: 11 }}>
                    {s.uploader ?? ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
