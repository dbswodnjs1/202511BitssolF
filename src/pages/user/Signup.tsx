// src/pages/user/Signup.tsx

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import StatusBar from "../../components/layout/StatusBar";
import BottomNav from "../../components/layout/BottomNav";

import {
  signup,
  checkUsername,
  checkNickname,
  checkEmail,
  checkPhone,
} from "../../api/user";
import { normalizePhone, validatePassword } from "../../utils/validators";

type CheckState = "idle" | "checking" | "ok" | "bad" | "invalid";

const APP_MAX_WIDTH = 420;
const BOTTOM_SPACER = "110px";

// 하단바 폭 줄이고 싶으면 조절
const NAV_SIDE_GAP = 28;
const NAV_MAX_WIDTH = 380;

/** ----------------------------
 * ✅ 로컬 형식 검증(프론트 1차)
 * ---------------------------- */
function validateId(v: string): string | null {
  const s = v.trim();
  if (!s) return "아이디를 입력해 주세요.";
  if (s.length < 4 || s.length > 20) return "아이디는 4~20자로 입력해 주세요.";
  const re = /^[A-Za-z0-9_]+$/;
  if (!re.test(s)) return "아이디는 영문/숫자/_ 만 가능합니다.";
  return null;
}

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
function stateLabel(
  state: CheckState,
  value: string,
  kind: "id" | "nick" | "email" | "phone"
): string {
  if (state === "checking") return "확인중...";
  if (state === "ok") return "사용 가능";
  if (state === "bad") return "이미 사용 중";
  if (state === "invalid") {
    if (kind === "id") return validateId(value) ?? "형식을 확인해 주세요.";
    if (kind === "nick") return validateNickname(value) ?? "형식을 확인해 주세요.";
    if (kind === "email") return validateEmailLite(value) ?? "형식을 확인해 주세요.";
    return validateKoreanMobile(value) ?? "형식을 확인해 주세요.";
  }
  return "";
}

type FieldKey =
  | "name"
  | "nickname"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "common";

export default function Signup(): React.ReactElement {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ 중복확인/형식 상태
  const [nameState, setNameState] = useState<CheckState>("idle");
  const [nickState, setNickState] = useState<CheckState>("idle");
  const [emailState, setEmailState] = useState<CheckState>("idle");
  const [phoneState, setPhoneState] = useState<CheckState>("idle");

  // ✅ "중복확인 OK 받은 값" 저장 (아이디/닉네임만)
  const [nameCheckedValue, setNameCheckedValue] = useState<string | null>(null);
  const [nickCheckedValue, setNickCheckedValue] = useState<string | null>(null);

  // ✅ 필드별 에러(각 섹션 아래로)
  const [fieldErr, setFieldErr] = useState<Partial<Record<FieldKey, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 회원가입 완료 모달
  const [showSuccess, setShowSuccess] = useState(false);

  const uiLocked = isSubmitting || showSuccess;

  // ✅ 현재 입력이 "중복확인 OK" 받은 값인지
  const isNameVerified = nameState === "ok" && nameCheckedValue === name.trim();
  const isNickVerified = nickState === "ok" && nickCheckedValue === nickname.trim();

  const clearErr = (key?: FieldKey) => {
    setFieldErr((prev) => {
      if (!key) return {};
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const setErr = (key: FieldKey, msg: string) => {
    setFieldErr((prev) => ({ ...prev, [key]: msg }));
  };

  // ----------------------------
  // ✅ 중복확인 버튼은 "아이디/닉네임"만 유지
  // - 레이스 컨디션 방지: snapshot 방식
  // ----------------------------
  const runCheckName = async () => {
    if (uiLocked) return;

    clearErr("common");
    clearErr("name");

    const snapshot = name.trim();
    const err = validateId(snapshot);
    if (err) {
      setNameState("invalid");
      setNameCheckedValue(null);
      setErr("name", err);
      return;
    }

    setNameState("checking");
    try {
      const ok = await checkUsername(snapshot);

      // ✅ 사용자가 입력을 바꾸면 결과 반영 X
      if (name.trim() !== snapshot) return;

      setNameState(ok ? "ok" : "bad");
      if (ok) {
        setNameCheckedValue(snapshot); // ✅ OK 스냅샷 저장
      } else {
        setNameCheckedValue(null);
        setErr("name", "이미 존재하는 아이디입니다.");
      }
    } catch {
      setNameState("idle");
      setNameCheckedValue(null);
      setErr("name", "아이디 중복 확인 실패");
    }
  };

  const runCheckNickname = async () => {
    if (uiLocked) return;

    clearErr("common");
    clearErr("nickname");

    const snapshot = nickname.trim();
    const err = validateNickname(snapshot);
    if (err) {
      setNickState("invalid");
      setNickCheckedValue(null);
      setErr("nickname", err);
      return;
    }

    setNickState("checking");
    try {
      const ok = await checkNickname(snapshot);

      if (nickname.trim() !== snapshot) return;

      setNickState(ok ? "ok" : "bad");
      if (ok) {
        setNickCheckedValue(snapshot); // ✅ OK 스냅샷 저장
      } else {
        setNickCheckedValue(null);
        setErr("nickname", "이미 사용 중인 닉네임입니다.");
      }
    } catch {
      setNickState("idle");
      setNickCheckedValue(null);
      setErr("nickname", "닉네임 중복 확인 실패");
    }
  };

  // ----------------------------
  // ✅ 회원가입 완료 모달 확인 → 로그인 이동
  // ----------------------------
  const goLogin = () => {
    setShowSuccess(false);
    navigate("/login", { replace: true });
  };

  // ----------------------------
  // ✅ 제출
  // - 이메일/전화번호: 버튼 없음 (제출 시 서버 중복확인)
  // - 에러는 각 섹션 아래로
  // ----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uiLocked) return;

    // 제출 시 기존 에러 초기화
    clearErr();

    const n = name.trim();
    const nick = nickname.trim();
    const em = email.trim().toLowerCase();
    const pRaw = phone.trim();
    const p = normalizePhone(pRaw) || "";

    // 1) 형식 검증(전부 필수)
    const errId = validateId(n);
    if (errId) {
      setNameState("invalid");
      setNameCheckedValue(null);
      setErr("name", errId);
      return;
    }

    const errNick = validateNickname(nick);
    if (errNick) {
      setNickState("invalid");
      setNickCheckedValue(null);
      setErr("nickname", errNick);
      return;
    }

    const errEmail = validateEmailLite(em);
    if (errEmail) {
      setEmailState("invalid");
      setErr("email", errEmail);
      return;
    }

    const errPhone = validateKoreanMobile(pRaw);
    if (errPhone) {
      setPhoneState("invalid");
      setErr("phone", errPhone);
      return;
    }

    if (password !== confirmPassword) {
      setErr("confirmPassword", "비밀번호가 일치하지 않습니다.");
      return;
    }

    const pwMsg = validatePassword(password);
    if (pwMsg) {
      setErr("password", pwMsg);
      return;
    }

    // ✅ 2) "중복확인 버튼" 강제 (아이디/닉네임)
    if (!(nameState === "ok" && nameCheckedValue === n)) {
      setErr("name", "아이디 중복확인을 먼저 해주세요.");
      return;
    }
    if (!(nickState === "ok" && nickCheckedValue === nick)) {
      setErr("nickname", "닉네임 중복확인을 먼저 해주세요.");
      return;
    }

    // 3) 네트워크 시작 전에 잠금(연타 방지)
    setIsSubmitting(true);

    try {
      // 4) 제출 직전 서버 중복확인(레이스 컨디션 방지)
      setNameState("checking");
      const okName = await checkUsername(n);
      if (!okName) {
        setNameState("bad");
        setNameCheckedValue(null);
        setErr("name", "이미 존재하는 아이디입니다.");
        return;
      }
      setNameState("ok");
      setNameCheckedValue(n);

      setNickState("checking");
      const okNick = await checkNickname(nick);
      if (!okNick) {
        setNickState("bad");
        setNickCheckedValue(null);
        setErr("nickname", "이미 사용 중인 닉네임입니다.");
        return;
      }
      setNickState("ok");
      setNickCheckedValue(nick);

      setEmailState("checking");
      const okEmail = await checkEmail(em);
      if (!okEmail) {
        setEmailState("bad");
        setErr("email", "이미 사용 중인 이메일입니다.");
        return;
      }
      setEmailState("ok");

      setPhoneState("checking");
      const okPhone = await checkPhone(p);
      if (!okPhone) {
        setPhoneState("bad");
        setErr("phone", "이미 사용 중인 전화번호입니다.");
        return;
      }
      setPhoneState("ok");

      // 5) 가입
      await signup({
        name: n,
        password,
        nickname: nick,
        email: em,
        phone: p,
      });

      // ✅ 성공 시: 바로 이동 X → 완료 모달
      setShowSuccess(true);
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        data?.message ||
        (typeof data === "string" ? data : null) ||
        "회원가입에 실패했습니다.";

      const field = data?.field as FieldKey | undefined;
      if (field && typeof msg === "string") {
        setErr(field, msg);
        return;
      }

      if (typeof msg === "string") {
        if (msg.includes("이메일")) setErr("email", msg);
        else if (msg.includes("전화") || msg.includes("휴대")) setErr("phone", msg);
        else if (msg.includes("닉네임")) setErr("nickname", msg);
        else if (msg.includes("아이디") || msg.includes("username")) setErr("name", msg);
        else setErr("common", msg);
      } else {
        setErr("common", "회원가입에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ✅ 이 파일에서만 스크롤바 숨김 */}
      <style>{`
        .su-no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .su-no-scrollbar::-webkit-scrollbar {
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
              disabled={uiLocked}
            >
              ←
            </button>

            <h3 className="m-0 fw-bold fs-5">회원가입</h3>
            <div style={{ width: 40, height: 40 }} />
          </header>

          <main
            className="flex-grow-1 overflow-auto su-no-scrollbar"
            style={{
              paddingBottom: BOTTOM_SPACER,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <form onSubmit={handleSubmit}>
              {fieldErr.common && (
                <div className="alert alert-dark text-white border border-light border-opacity-25 rounded-4">
                  {fieldErr.common}
                </div>
              )}

              {/* 아이디 */}
              <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                <div className="fw-bold mb-3">아이디</div>

                <input
                  className="form-control bg-transparent text-white border border-light border-opacity-25"
                  value={name}
                  maxLength={20}
                  required
                  disabled={uiLocked}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameState("idle");
                    setNameCheckedValue(null); // ✅ 값 변경 시 중복확인 무효
                    clearErr("name");
                    clearErr("common");
                  }}
                  placeholder="4~20자 / 영문·숫자·_"
                  autoComplete="username"
                />

                <div className="d-flex flex-column gap-1 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm rounded-3 text-nowrap px-3 align-self-start"
                    style={{ minWidth: 96 }}
                    disabled={!name.trim() || uiLocked || nameState === "checking"}
                    onClick={runCheckName}
                  >
                    중복확인
                  </button>

                  <div className="small text-white-50 ms-1 mt-1" style={{ overflowWrap: "anywhere" }}>
                    {fieldErr.name || (isNameVerified ? "중복확인 완료" : stateLabel(nameState, name, "id"))}
                  </div>
                </div>
              </section>

              {/* 닉네임 */}
              <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                <div className="fw-bold mb-3">닉네임</div>

                <input
                  className="form-control bg-transparent text-white border border-light border-opacity-25"
                  value={nickname}
                  maxLength={12}
                  required
                  disabled={uiLocked}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNickState("idle");
                    setNickCheckedValue(null); // ✅ 값 변경 시 중복확인 무효
                    clearErr("nickname");
                    clearErr("common");
                  }}
                  placeholder="2~12자 / 한글·영문·숫자·_"
                  autoComplete="nickname"
                />

                <div className="d-flex flex-column gap-1 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm rounded-3 text-nowrap px-3 align-self-start"
                    style={{ minWidth: 96 }}
                    disabled={!nickname.trim() || uiLocked || nickState === "checking"}
                    onClick={runCheckNickname}
                  >
                    중복확인
                  </button>

                  <div className="small text-white-50 ms-1 mt-1" style={{ overflowWrap: "anywhere" }}>
                    {fieldErr.nickname ||
                      (isNickVerified ? "중복확인 완료" : stateLabel(nickState, nickname, "nick"))}
                  </div>
                </div>
              </section>

              {/* 이메일 */}
              <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                <div className="fw-bold mb-3">이메일</div>

                <input
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  maxLength={254}
                  required
                  disabled={uiLocked}
                  className="form-control bg-transparent text-white border border-light border-opacity-25"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailState("idle");
                    clearErr("email");
                    clearErr("common");
                  }}
                  placeholder="email@example.com"
                />

                <div className="small text-white-50 ms-1 mt-2" style={{ overflowWrap: "anywhere" }}>
                  {fieldErr.email || stateLabel(emailState, email, "email")}
                </div>
              </section>

              {/* 전화번호 */}
              <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                <div className="fw-bold mb-3">전화번호</div>

                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  disabled={uiLocked}
                  className="form-control bg-transparent text-white border border-light border-opacity-25"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneState("idle");
                    clearErr("phone");
                    clearErr("common");
                  }}
                  placeholder="01012345678"
                />

                <div className="small text-white-50 ms-1 mt-2" style={{ overflowWrap: "anywhere" }}>
                  {fieldErr.phone || stateLabel(phoneState, phone, "phone")}
                </div>
              </section>

              {/* 비밀번호 */}
              <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                <div className="fw-bold mb-3">비밀번호</div>

                <input
                  type="password"
                  disabled={uiLocked}
                  className="form-control bg-transparent text-white border border-light border-opacity-25"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearErr("password");
                    clearErr("common");
                  }}
                  placeholder="8~16, 영문/숫자/특수 포함"
                  autoComplete="new-password"
                  required
                />

                <div className="small text-white-50 ms-1 mt-2" style={{ overflowWrap: "anywhere" }}>
                  {fieldErr.password || ""}
                </div>
              </section>

              {/* 비밀번호 확인 */}
              <section className="p-3 rounded-4 border border-light border-opacity-25 shadow-sm mb-3">
                <div className="fw-bold mb-3">비밀번호 확인</div>

                <input
                  type="password"
                  disabled={uiLocked}
                  className="form-control bg-transparent text-white border border-light border-opacity-25"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearErr("confirmPassword");
                    clearErr("common");
                  }}
                  autoComplete="new-password"
                  required
                />

                <div className="small text-white-50 ms-1 mt-2" style={{ overflowWrap: "anywhere" }}>
                  {fieldErr.confirmPassword || ""}
                </div>
              </section>

              <button
                type="submit"
                className="btn btn-light w-100 rounded-4 fw-bold shadow-sm"
                disabled={uiLocked}
              >
                {isSubmitting ? "처리중..." : "회원가입"}
              </button>

              <div className="text-center mt-3">
                <div className="small text-white-50">이미 계정이 있으신가요?</div>
                <NavLink to="/login" className={`link-light fw-bold ${uiLocked ? "disabled" : ""}`}>
                  로그인
                </NavLink>
              </div>
            </form>
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

      {/* ✅ 회원가입 완료 모달 */}
      {showSuccess && (
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
            if (e.target === e.currentTarget) goLogin();
          }}
        >
          <div className="w-100" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div className="bg-dark text-white border border-light border-opacity-25 rounded-4 shadow-sm p-3">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div className="fw-bold fs-5">회원가입 완료</div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={goLogin}
                />
              </div>

              <div className="text-white-50 mb-3">
                회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.
              </div>

              <button
                type="button"
                className="btn btn-light w-100 rounded-4 fw-bold"
                onClick={goLogin}
                autoFocus
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
