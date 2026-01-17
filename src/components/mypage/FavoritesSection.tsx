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
      .then((res) => setItems((res.data ?? []).slice(0, 2)))
      .catch(() => setItems([]));
  }, []);

  // ✅ 미리보기 클릭은 전체보기로 이동
  const onClickPreviewCard = () => {
    navigate("/mypage/favorites");
  };

  return (
    <section className="mypage-wire__section">
      <div className="mypage-wire__sectionHead">
        <div className="mypage-wire__sectionTitle">즐겨찾기</div>
        <button
          type="button"
          className="mypage-wire__moreBtn"
          onClick={() => navigate("/mypage/favorites")}
        >
          전체보기
        </button>
      </div>

      {/* ✅ 0개면 박스(노란 네모) 자체를 렌더링하지 않음 */}
      {items.length === 0 ? (
        <div className="mypage-wire__empty">즐겨찾기한 콘텐츠가 없습니다.</div>
      ) : (
        <div className="mypage-wire__grid2">
          {items.map((s) => (
            <div
              key={s.soundId}
              className="mypage-wire__box"
              onClick={onClickPreviewCard}
              role="button"
            >
              <div>{s.title}</div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>{s.uploader ?? ""}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
