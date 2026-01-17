// src/components/mypage/RecentPlaysSection.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentPlays, type SoundDto } from "../../api/mypage"; // ✅ 여기

export default function RecentPlaysSection(): React.ReactElement {
  const [items, setItems] = useState<SoundDto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ 2개 미리보기
    getRecentPlays(0, 2)
      .then((d) => setItems(d.content ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return (
      <div className="mypage-wire__uploadBox">
        <div className="mypage-wire__uploadText">최근 재생 콘텐츠가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="mypage-wire__grid2">
      {items.map((it) => (
        <div
          key={it.soundId}
          className="mypage-wire__box"
          onClick={() => navigate("/mypage/recent")}
        >
          <img src={it.thumbnailUrl} alt={it.title} />
          <div>{it.title}</div>
        </div>
      ))}
    </div>
  );
}
