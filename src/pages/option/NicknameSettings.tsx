// src/pages/option/NicknameSettings.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";
import { changeMyNickname, getMe, checkNickname } from "../../api/user";

export default function NicknameSettings(): React.ReactElement {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe()
      .then((me) => setNickname(me.nickname ?? ""))
      .catch(() => {});
  }, []);

  const onBlurCheck = async () => {
    const v = nickname.trim();
    if (!v) return;
    try {
      const ok = await checkNickname(v);
      if (!ok) setErrorMsg("이미 사용 중인 닉네임입니다.");
    } catch {}
  };

  const save = async () => {
    setErrorMsg(null);
    const v = nickname.trim();
    if (!v) {
      setErrorMsg("닉네임을 입력해 주세요.");
      return;
    }

    setSaving(true);
    try {
      await changeMyNickname(v);
      navigate(-1);
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "닉네임 변경에 실패했습니다.";
      setErrorMsg(typeof serverMsg === "string" ? serverMsg : "닉네임 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-screen settings-wire">
        <StatusBar />

        <header className="settings-wire__top">
          <button
            type="button"
            className="settings-wire__back"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h3 className="settings-wire__title">닉네임 변경</h3>
          <div className="settings-wire__spacer" />
        </header>

        <main className="settings-wire__content">
          <section className="settings-wire__section">
            <div className="settings-wire__sectionTitle">닉네임</div>

            <div style={{ padding: 12 }}>
              <input
                className="form-control"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={onBlurCheck}
                placeholder="닉네임 입력"
              />

              {errorMsg && <div style={{ marginTop: 8 }} className="pw-wire__error">{errorMsg}</div>}

              <button
                className="btn btn-primary"
                style={{ marginTop: 12, width: "100%" }}
                onClick={save}
                disabled={saving}
              >
                {saving ? "저장중..." : "저장"}
              </button>
            </div>
          </section>
        </main>
      </div>

      <BottomNav />
    </>
  );
}
