// src/pages/option/PhoneSettings.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";
import { getMe, checkPhone, changeMyPhone } from "../../api/user";
import { normalizePhone } from "../../utils/validators";

export default function PhoneSettings(): React.ReactElement {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe().then((me) => setPhone(me.phone ?? "")).catch(() => {});
  }, []);

  const onBlurCheck = async () => {
    const v = normalizePhone(phone);
    if (!v) return;
    try {
      const ok = await checkPhone(v);
      if (!ok) setErrorMsg("이미 사용 중인 전화번호입니다.");
      else setErrorMsg(null);
    } catch {}
  };

  const save = async () => {
    setErrorMsg(null);
    const v = normalizePhone(phone);
    if (!v) { setErrorMsg("전화번호를 입력해 주세요."); return; }

    setSaving(true);
    try {
      const ok = await checkPhone(v);
      if (!ok) { setErrorMsg("이미 사용 중인 전화번호입니다."); return; }

      await changeMyPhone(v);
      navigate(-1);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || "전화번호 변경 실패";
      setErrorMsg(typeof msg === "string" ? msg : "전화번호 변경 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-screen settings-wire">
        <StatusBar />
        <header className="settings-wire__top">
          <button type="button" className="settings-wire__back" onClick={() => navigate(-1)}>←</button>
          <h3 className="settings-wire__title">전화번호 변경</h3>
          <div className="settings-wire__spacer" />
        </header>

        <main className="settings-wire__content">
          <section className="settings-wire__section">
            <div style={{ padding: 12 }}>
              <input
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={onBlurCheck}
                placeholder="01012345678"
              />
              {errorMsg && <div style={{ marginTop: 8 }} className="pw-wire__error">{errorMsg}</div>}
              <button className="btn btn-primary" style={{ marginTop: 12, width: "100%" }} onClick={save} disabled={saving}>
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
