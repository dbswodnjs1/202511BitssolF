// src/components/mypage/RecentPlaysSection.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentPlays, type SoundDto } from "../../api/mypage";

export default function RecentPlaysSection(): React.ReactElement {
  const [items, setItems] = useState<SoundDto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ 2개 미리보기
    getRecentPlays(0, 2)
      .then((d) => setItems(d.content ?? []))
      .catch(() => setItems([]));
  }, []);

  const goRecent = () => navigate("/mypage/recent");

  if (items.length === 0) {
    return <div className="fw-semibold">최근 재생 콘텐츠가 없습니다.</div>;
  }

  return (
    <div className="row row-cols-2 g-2">
      {items.map((it) => (
        <div className="col" key={it.soundId}>
          <div
            role="button"
            tabIndex={0}
            onClick={goRecent}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goRecent();
            }}
            className="position-relative rounded-4 overflow-hidden border border-light border-opacity-25 shadow-sm"
            style={{ height: 140, cursor: "pointer" }}
          >
            <img
              src={it.thumbnailUrl}
              alt={it.title}
              className="w-100 h-100"
              style={{ objectFit: "cover", objectPosition: "center top", display: "block" }}
            />

            {/* ✅ 텍스트 오버레이 */}
            <div
              className="position-absolute start-0 end-0 bottom-0 p-2"
              style={{ background: "rgba(0,0,0,0.35)" }}
            >
              <div className="fw-bold text-truncate" style={{ fontSize: 12 }}>
                {it.title}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
