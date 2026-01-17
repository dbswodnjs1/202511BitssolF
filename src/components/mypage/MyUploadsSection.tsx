// src/components/mypage/MyUploadsSection.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyUploads, type SoundDto } from "../../api/mypage";

export default function MyUploadsSection(): React.ReactElement {
  const [items, setItems] = useState<SoundDto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ 마이페이지 미리보기 2개
    // ✅ 백엔드 List여도 api에서 PageRes처럼 포장 → d.content 유지
    getMyUploads(0, 2)
      .then((d) => setItems(d.content ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return (
      <div className="mypage-wire__uploadBox">
        <div className="mypage-wire__uploadIcon">≡</div>
        <div className="mypage-wire__uploadText">아직 업로드한 콘텐츠가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="mypage-wire__grid2">
      {items.map((it) => (
        <div
          key={it.soundId}
          className="mypage-wire__box"
          onClick={() => navigate("/mypage/uploads")}
        >
          <img src={it.thumbnailUrl} alt={it.title} />
          <div>{it.title}</div>
        </div>
      ))}
    </div>
  );
}
