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

const APP_MAX_WIDTH = 420;
const BOTTOM_SPACER = "110px";

// 하단바 폭 줄이고 싶으면 조절
const NAV_SIDE_GAP = 28;
const NAV_MAX_WIDTH = 380;

/** ----------------------------
 * ✅ 로컬 형식 검증(프론트 1차)
 * ---------------------------- */
function validateNickname(v: string): string | null {
  const s = v.trim();
  if (!s) return "닉네임을 입력해 주세요.";
  if (s.length < 2 || s.length > 12) return "닉네임은 2~12자로 입력해 주세요.";
  const re = /^[A-Za-z0-9가-힣_]+$/;
  if (!re.test(s)) return "닉네임은 한글/영문/숫자/_ 만 가능합니다.";
  return null;
}

function validateEmailLite(v: string): string | null {
  const s = v.trim().toLowerCase();
  if (!s) return "이메일을 입력해 주세요.";
  if (s.length > 254) return "이메일이 너무 깁니다.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(s)) return "이메일 형식이 아니에요. (예: email@example.com)";
  return null;
}

function validateKoreanMobile(v: string): string | null {
  const digits = (v || "").replace(/\D/g, "");
  if (!digits) return "전화번호를 입력해 주세요.";
  const re = /^01[016789]\d{7,8}$/;
  if (!re.test(digits)) return "휴대폰 번호 형식이 아니에요. (예: 01012345678)";
  return null;
}

/** ----------------------------
 * ✅ 상태 라벨(필드별)
 * ---------------------------- */
function nicknameStateLabel(state: CheckState, value: string): string {
  if (state === "checking") return "확인중...";
  if (state === "ok") return "사용 가능";
  if (state === "dup") return "이미 사용 중";
  if (state === "invalid") return validateNickname(value) ?? "형식을 확인해 주세요.";
  return "";
}

function emailStateLabel(state: CheckState, value: string): string {
  if (state === "checking") return "확인중...";
  if (state === "ok") return "사용 가능";
  if (state === "dup") return "이미 사용 중";
  if (state === "invalid") return validateEmailLite(value) ?? "형식을 확인해 주세요.";
  return "";
}

function phoneStateLabel(state: CheckState, value: string): string {
  if (state === "checking") return "확인중...";
  if (state === "ok") return "사용 가능";
  if (state === "dup") return "이미 사용 중";
  if (state === "invalid") return validateKoreanMobile(value) ?? "형식을 확인해 주세요.";
  return "";
}

export default function ProfileSettings(): React.ReactElement {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ 변경 여부 비교용(원본)
  const [orig, setOrig] = useState({ nickname: "", email: "", phone: "" });

  // ✅ 이미지 업로드 “예약” 상태
  const [file, setFile] = useState<File | null>(null);
  const [resetImagePending, setResetImagePending] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 중복확인 상태 (버튼은 닉네임만 유지, 이메일/전화는 저장 시에만 checking)
  const [nickCheck, setNickCheck] = useState<CheckState>("idle");
  const [emailCheck, setEmailCheck] = useState<CheckState>("idle");
  const [phoneCheck, setPhoneCheck] = useState<CheckState>("idle");

  // 저장 상태/메시지
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const resolvedServerUrl = useMemo(
    () => resolveProfileImageUrl(profileImageUrl),
    [profileImageUrl]
  );

  // ✅ reset 예약이면 기본 이미지로 미리보기(즉시 API 호출 X)
  const imgSrc = useMemo(() => {
    if (resetImagePending) return "/default-profile.png";
    return previewUrl ? previewUrl : resolvedServerUrl || "";
  }, [resetImagePending, previewUrl, resolvedServerUrl]);

  // ✅ 변경 감지(렌더링 안내문/저장 로직 공통에 사용)
  const vNick = nickname.trim();
  const vEmail = email.trim().toLowerCase();
  const vPhone = normalizePhone(phone) || "";

  const oNick = (orig.nickname ?? "").trim();
  const oEmail = (orig.email ?? "").trim().toLowerCase();
  const oPhone = normalizePhone(orig.phone) || "";

  const nickChanged = vNick !== oNick;
  const emailChanged = vEmail !== oEmail;
  const phoneChanged = vPhone !== oPhone;

  const imageChanged = resetImagePending || !!file;

  const refresh = async () => {
    const me = await getMe();

    const nextNick = me.nickname ?? "";
    const nextEmail = me.email ?? "";
    const nextPhone = me.phone ?? "";

    setNickname(nextNick);
    setEmail(nextEmail);
    setPhone(nextPhone);
    setProfileImageUrl(me.profileImageUrl ?? null);

    setOrig({ nickname: nextNick, email: nextEmail, phone: nextPhone });

    setNickCheck("idle");
    setEmailCheck("idle");
    setPhoneCheck("idle");

    // ✅ 새로고침 시 예약 상태 해제
    setFile(null);
    setResetImagePending(false);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // ----------------------------
  // ✅ 닉네임만 "중복확인 버튼" 유지(선택 기능)
  // ----------------------------
  const runCheckNickname = async () => {
    if (saving || loading) return;
    setMsg(null);

    // 변경이 없으면 굳이 API 안 탐
    if (!nickChanged) {
      setNickCheck("ok");
      setMsg("현재 닉네임입니다.");
      return;
    }

    const err = validateNickname(nickname);
    if (err) {
      setNickCheck("invalid");
      setMsg(err);
      return;
    }

    const snapshot = nickname.trim();
    setNickCheck("checking");
    try {
      const ok = await checkNickname(snapshot);
      // 입력이 바뀌면 결과 반영 X
      if (nickname.trim() !== snapshot) return;

      setNickCheck(ok ? "ok" : "dup");
      if (!ok) setMsg("이미 사용 중인 닉네임입니다.");
    } catch {
      setNickCheck("idle");
      setMsg("닉네임 중복 확인 실패");
    }
  };

  // ----------------------------
  // ✅ 하단(전화번호 아래) “변경사항 저장”
  // - 이미지(업로드/리셋)도 여기서 같이 처리
  // - 이메일/전화번호는 중복확인 버튼 없음 → 저장 시점에만 체크
  // ----------------------------
  const saveAll = async () => {
    if (saving || loading) return;

    setMsg(null);

    if (!nickChanged && !emailChanged && !phoneChanged && !imageChanged) {
      setMsg("변경된 내용이 없습니다.");
      return;
    }

    // ✅ 형식 검증(변경된 것만)
    if (nickChanged) {
      const err = validateNickname(vNick);
      if (err) {
        setNickCheck("invalid");
        setMsg(err);
        return;
      }
    }
    if (emailChanged) {
      const err = validateEmailLite(vEmail);
      if (err) {
        setEmailCheck("invalid");
        setMsg(err);
        return;
      }
    }
    if (phoneChanged) {
      const err = validateKoreanMobile(vPhone);
      if (err) {
        setPhoneCheck("invalid");
        setMsg(err);
        return;
      }
    }

    setSaving(true);

    try {
      // ✅ 1) 이미지 먼저 처리
      if (resetImagePending) {
        await resetMyProfileImage();
        setProfileImageUrl(null);
        setFile(null);
        setResetImagePending(false);
      } else if (file) {
        const data = await uploadMyProfileImage(file);
        setProfileImageUrl(data.profileImageUrl ?? null);
        setFile(null);
      }

      // ✅ 2) 닉네임/이메일/전화 변경 처리
      if (nickChanged) {
        setNickCheck("checking");
        const ok = await checkNickname(vNick);
        if (!ok) {
          setNickCheck("dup");
          setMsg("이미 사용 중인 닉네임입니다.");
          return;
        }
        setNickCheck("ok");
        await changeMyNickname(vNick);
      }

      if (emailChanged) {
        setEmailCheck("checking");
        const ok = await checkEmail(vEmail);
        if (!ok) {
          setEmailCheck("dup");
          setMsg("이미 사용 중인 이메일입니다.");
          return;
        }
        setEmailCheck("ok");
        await changeMyEmail(vEmail);
      }

      if (phoneChanged) {
        setPhoneCheck("checking");
        const ok = await checkPhone(vPhone);
        if (!ok) {
          setPhoneCheck("dup");
          setMsg("이미 사용 중인 전화번호입니다.");
          return;
        }
        setPhoneCheck("ok");
        await changeMyPhone(vPhone);
      }

      setMsg("저장되었습니다.");
      await refresh(); // ✅ 실제 서버 상태로 동기화
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message || err?.response?.data || "저장에 실패했습니다.";
      setMsg(typeof serverMsg === "string" ? serverMsg : "저장에 실패했습니다.");

      // ✅ 일부만 성공했을 수도 있으니 서버 상태로 맞추기
      try {
        await refresh();
      } catch {
        // refresh 실패는 로그인 만료 등일 수 있음
      }
    } finally {
      setSaving(false);
    }
  };

  // ✅ 저장 시점 중복확인 방식 안내문(UX용)
  const emailHint =
    emailCheck !== "idle"
      ? emailStateLabel(emailCheck, email)
      : emailChanged
      ? "저장 시 중복 여부를 확인합니다."
      : "";

  const phoneHint =
    phoneCheck !== "idle"
      ? phoneStateLabel(phoneCheck, phone)
      : phoneChanged
      ? "저장 시 중복 여부를 확인합니다."
      : "";

  return (
    <>
      {/* ✅ 이 파일에서만 스크롤바 숨김 */}
      <style>{`
        .ps-no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ps-no-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
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
          <header className="d-flex align-items-center justify-content-between p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-3"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              style={{ width: 40, height: 40 }}
              disabled={saving}
            >
              ←
            </button>

            <h3 className="m-0 fw-bold fs-5">프로필 설정</h3>
            <div style={{ width: 40, height: 40 }} />
          </header>

          <main
            className="flex-grow-1 overflow-auto ps-no-scrollbar"
            style={{
              paddingBottom: BOTTOM_SPACER,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {loading ? (
              <div className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
                불러오는 중...
              </div>
            ) : (
              <>
                {msg && (
                  <div className="alert alert-dark text-white border border-light border-opacity-25 rounded-4">
                    {msg}
                  </div>
                )}

                {/* 프로필 이미지 */}
                <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                  <div className="fw-bold mb-3">프로필 이미지</div>

                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div
                      className="rounded-circle overflow-hidden border border-light border-opacity-25"
                      style={{
                        width: 120,
                        height: 120,
                        background: "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt="profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/default-profile.png";
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 28, fontWeight: 700, color: "#666" }}>P</span>
                      )}
                    </div>

                    <div className="d-flex flex-column gap-2">
                      <input
                        className="form-control form-control-sm bg-transparent text-white border border-light border-opacity-25"
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setFile(f);
                          setResetImagePending(false);
                          setMsg(null);

                          // 같은 파일 다시 선택 가능하게 하고 싶으면(브라우저에 따라 필요)
                          e.currentTarget.value = "";
                        }}
                      />

                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-outline-light btn-sm rounded-3"
                          disabled={saving}
                          onClick={() => {
                            setResetImagePending(true);
                            setFile(null);
                            setMsg("기본 이미지로 변경이 예약되었습니다. 아래 저장 버튼을 눌러 반영하세요.");
                          }}
                        >
                          기본 이미지로
                        </button>

                        {(resetImagePending || file) && (
                          <button
                            type="button"
                            className="btn btn-outline-light btn-sm rounded-3"
                            disabled={saving}
                            onClick={() => {
                              setResetImagePending(false);
                              setFile(null);
                              setMsg("이미지 변경 예약이 취소되었습니다.");
                            }}
                          >
                            변경 취소
                          </button>
                        )}
                      </div>

                      {file && <div className="small text-white-50">선택됨: {file.name}</div>}
                      {resetImagePending && (
                        <div className="small text-white-50">기본 이미지로 변경 예약됨</div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 닉네임 (중복확인 버튼 유지) */}
                <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                  <div className="fw-bold mb-3">닉네임</div>

                  <input
                    className="form-control bg-transparent text-white border border-light border-opacity-25"
                    value={nickname}
                    maxLength={12}
                    disabled={saving}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNickCheck("idle");
                    }}
                    placeholder="2~12자 / 한글·영문·숫자·_"
                  />

                  <div className="d-flex flex-column gap-1 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm rounded-3 text-nowrap px-3 align-self-start"
                      style={{ minWidth: 96 }}
                      disabled={saving || nickCheck === "checking"}
                      onClick={runCheckNickname}
                    >
                      중복확인
                    </button>

                    <div className="small text-white-50 ms-1" style={{ overflowWrap: "anywhere" }}>
                      {nicknameStateLabel(nickCheck, nickname)}
                    </div>
                  </div>
                </section>

                {/* 이메일 (중복확인 버튼 제거: 저장 시 확인) */}
                <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                  <div className="fw-bold mb-3">이메일</div>

                  <input
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="email"
                    maxLength={254}
                    disabled={saving}
                    className="form-control bg-transparent text-white border border-light border-opacity-25"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailCheck("idle");
                    }}
                    placeholder="email@example.com"
                  />

                  <div className="small text-white-50 ms-1 mt-2" style={{ overflowWrap: "anywhere" }}>
                    {emailHint}
                  </div>
                </section>

                {/* 전화번호 (중복확인 버튼 제거: 저장 시 확인) */}
                <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm">
                  <div className="fw-bold mb-3">전화번호</div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    disabled={saving}
                    className="form-control bg-transparent text-white border border-light border-opacity-25"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneCheck("idle");
                    }}
                    placeholder="01012345678"
                  />

                  <div className="small text-white-50 ms-1 mt-2" style={{ overflowWrap: "anywhere" }}>
                    {phoneHint}
                  </div>
                </section>

                {/* ✅ 전화번호 아래 저장 버튼(고정 아님) */}
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-light w-100 rounded-4 fw-bold shadow-sm"
                    disabled={saving || loading}
                    onClick={saveAll}
                  >
                    {saving ? "저장중..." : "변경사항 저장"}
                  </button>

                  <div className="small text-white-50 mt-2">
                    변경한 항목만 저장됩니다.
                    {imageChanged ? " (이미지 변경도 함께 저장됩니다.)" : ""}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* ✅ 하단바 고정 */}
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
    </>
  );
}
