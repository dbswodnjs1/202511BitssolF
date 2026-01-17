// src/pages/option/ProfileSettings.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";

import {
  getMe,
  checkNickname,
  checkEmail,
  checkPhone,
  changeMyNickname,
  changeMyEmail,
  changeMyPhone,
} from "../../api/user";

import {
  uploadMyProfileImage,
  resetMyProfileImage,
  resolveProfileImageUrl,
} from "../../api/profileImage";

import { normalizePhone } from "../../utils/validators";

type CheckState = "idle" | "checking" | "ok" | "dup" | "invalid";

export default function ProfileSettings(): React.ReactElement {
  const navigate = useNavigate();

  // 서버 값
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // 이미지 업로드용
  const [file, setFile] = useState<File | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  // 중복확인 상태
  const [nickCheck, setNickCheck] = useState<CheckState>("idle");
  const [emailCheck, setEmailCheck] = useState<CheckState>("idle");
  const [phoneCheck, setPhoneCheck] = useState<CheckState>("idle");

  // 저장 상태/메시지
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const resolvedServerUrl = useMemo(() => resolveProfileImageUrl(profileImageUrl), [profileImageUrl]);
  const imgSrc = useMemo(() => (previewUrl ? previewUrl : resolvedServerUrl || ""), [previewUrl, resolvedServerUrl]);

  const refresh = async () => {
    const me = await getMe();
    setNickname(me.nickname ?? "");
    setEmail(me.email ?? "");
    setPhone(me.phone ?? "");
    setProfileImageUrl(me.profileImageUrl ?? null);

    // 값이 새로 세팅되면 체크 상태는 초기화
    setNickCheck("idle");
    setEmailCheck("idle");
    setPhoneCheck("idle");
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {
        // 토큰 만료/미인증 등
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // ----------------------------
  // 중복 확인
  // ----------------------------
  const runCheckNickname = async () => {
    const v = nickname.trim();
    if (!v) return setNickCheck("invalid");
    setNickCheck("checking");
    try {
      const ok = await checkNickname(v);
      setNickCheck(ok ? "ok" : "dup");
    } catch {
      setNickCheck("idle");
    }
  };

  const runCheckEmail = async () => {
    const v = email.trim().toLowerCase();
    if (!v) return setEmailCheck("invalid");
    setEmailCheck("checking");
    try {
      const ok = await checkEmail(v);
      setEmailCheck(ok ? "ok" : "dup");
    } catch {
      setEmailCheck("idle");
    }
  };

  const runCheckPhone = async () => {
    const v = normalizePhone(phone) || "";
    if (!v) return setPhoneCheck("invalid");
    setPhoneCheck("checking");
    try {
      const ok = await checkPhone(v);
      setPhoneCheck(ok ? "ok" : "dup");
    } catch {
      setPhoneCheck("idle");
    }
  };

  const checkLabel = (s: CheckState) => {
    if (s === "checking") return "확인중...";
    if (s === "ok") return "사용 가능";
    if (s === "dup") return "이미 사용 중";
    if (s === "invalid") return "값을 입력하세요";
    return "";
  };

  // ----------------------------
  // 저장(PATCH)
  // ----------------------------
  const saveNickname = async () => {
    setMsg(null);
    const v = nickname.trim();
    if (!v) return setMsg("닉네임을 입력해 주세요.");
    setSaving(true);
    try {
      await changeMyNickname(v);
      setMsg("닉네임이 변경되었습니다.");
      await refresh();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data || "닉네임 변경 실패";
      setMsg(typeof serverMsg === "string" ? serverMsg : "닉네임 변경 실패");
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    setMsg(null);
    const v = email.trim().toLowerCase();
    if (!v) return setMsg("이메일을 입력해 주세요.");
    setSaving(true);
    try {
      await changeMyEmail(v);
      setMsg("이메일이 변경되었습니다.");
      await refresh();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data || "이메일 변경 실패";
      setMsg(typeof serverMsg === "string" ? serverMsg : "이메일 변경 실패");
    } finally {
      setSaving(false);
    }
  };

  const savePhone = async () => {
    setMsg(null);
    const v = normalizePhone(phone) || "";
    if (!v) return setMsg("전화번호를 입력해 주세요.");
    setSaving(true);
    try {
      await changeMyPhone(v);
      setMsg("전화번호가 변경되었습니다.");
      await refresh();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data || "전화번호 변경 실패";
      setMsg(typeof serverMsg === "string" ? serverMsg : "전화번호 변경 실패");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------
  // 이미지 업로드/초기화
  // ----------------------------
  const onUploadImage = async () => {
    if (!file) return;
    setMsg(null);
    setSaving(true);
    try {
      const data = await uploadMyProfileImage(file);
      setProfileImageUrl(data.profileImageUrl ?? null);
      setFile(null);
      setMsg("프로필 이미지가 변경되었습니다.");
      await refresh();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data || "이미지 업로드 실패";
      setMsg(typeof serverMsg === "string" ? serverMsg : "이미지 업로드 실패");
    } finally {
      setSaving(false);
    }
  };

  const onResetImage = async () => {
    setMsg(null);
    setSaving(true);
    try {
      await resetMyProfileImage();
      setProfileImageUrl(null);
      setFile(null);
      setMsg("기본 이미지로 변경되었습니다.");
      await refresh();
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data || "이미지 초기화 실패";
      setMsg(typeof serverMsg === "string" ? serverMsg : "이미지 초기화 실패");
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
          <h3 className="settings-wire__title">프로필 설정</h3>
          <div className="settings-wire__spacer" />
        </header>

        <main className="settings-wire__content">
          {loading ? (
            <div style={{ padding: 12 }}>불러오는 중...</div>
          ) : (
            <>
              {/* 프로필 이미지 섹션 */}
              <section className="settings-wire__section">
                <div className="settings-wire__sectionTitle">프로필 이미지</div>

                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt="profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/default-profile.png";
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 28, fontWeight: 700, color: "#666" }}>P</span>
                    )}
                  </div>

                  <input
                    id="profileFile"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor="profileFile"
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      border: "1px solid #999",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    파일 선택
                  </label>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button type="button" disabled={!file || saving} onClick={onUploadImage}>
                      업로드
                    </button>
                    <button type="button" disabled={saving} onClick={onResetImage}>
                      기본 이미지로 되돌리기
                    </button>
                  </div>
                </div>
              </section>

              {/* 닉네임 섹션 */}
              <section className="settings-wire__section">
                <div className="settings-wire__sectionTitle">닉네임</div>
                <div style={{ padding: 12 }}>
                  <input
                    className="form-control"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNickCheck("idle");
                    }}
                    placeholder="닉네임"
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    <button type="button" disabled={saving || nickCheck === "checking"} onClick={runCheckNickname}>
                      중복확인
                    </button>
                    <span>{checkLabel(nickCheck)}</span>
                  </div>
                  <button style={{ marginTop: 10, width: "100%" }} disabled={saving} onClick={saveNickname}>
                    저장
                  </button>
                </div>
              </section>

              {/* 이메일 섹션 */}
              <section className="settings-wire__section">
                <div className="settings-wire__sectionTitle">이메일</div>
                <div style={{ padding: 12 }}>
                  <input
                    className="form-control"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailCheck("idle");
                    }}
                    placeholder="email@example.com"
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    <button type="button" disabled={saving || emailCheck === "checking"} onClick={runCheckEmail}>
                      중복확인
                    </button>
                    <span>{checkLabel(emailCheck)}</span>
                  </div>
                  <button style={{ marginTop: 10, width: "100%" }} disabled={saving} onClick={saveEmail}>
                    저장
                  </button>
                </div>
              </section>

              {/* 전화번호 섹션 */}
              <section className="settings-wire__section">
                <div className="settings-wire__sectionTitle">전화번호</div>
                <div style={{ padding: 12 }}>
                  <input
                    className="form-control"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneCheck("idle");
                    }}
                    placeholder="01012345678"
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    <button type="button" disabled={saving || phoneCheck === "checking"} onClick={runCheckPhone}>
                      중복확인
                    </button>
                    <span>{checkLabel(phoneCheck)}</span>
                  </div>
                  <button style={{ marginTop: 10, width: "100%" }} disabled={saving} onClick={savePhone}>
                    저장
                  </button>
                </div>
              </section>

              {msg && (
                <section className="settings-wire__section">
                  <div style={{ padding: 12 }}>{msg}</div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </>
  );
}
