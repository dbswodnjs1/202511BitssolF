// src/pages/user/Signup.tsx

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import {
  signup,
  checkUsername,
  checkNickname,
  checkEmail,
  checkPhone,
} from "../../api/user";
import { normalizePhone, validatePassword } from "../../utils/validators";

type CheckState = "idle" | "ok" | "bad";

export default function Signup(): React.ReactElement {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameState, setNameState] = useState<CheckState>("idle");
  const [nickState, setNickState] = useState<CheckState>("idle");
  const [emailState, setEmailState] = useState<CheckState>("idle");
  const [phoneState, setPhoneState] = useState<CheckState>("idle");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onBlurName = async () => {
    const v = name.trim();
    if (!v) return;
    try {
      const ok = await checkUsername(v);
      setNameState(ok ? "ok" : "bad");
      if (!ok) setErrorMsg("이미 존재하는 아이디입니다.");
    } catch {
      setErrorMsg("아이디 중복 확인 실패");
    }
  };

  const onBlurNickname = async () => {
    const v = nickname.trim();
    if (!v) { setNickState("idle"); return; }
    try {
      const ok = await checkNickname(v);
      setNickState(ok ? "ok" : "bad");
      if (!ok) setErrorMsg("이미 사용 중인 닉네임입니다.");
    } catch {}
  };

  const onBlurEmail = async () => {
    const v = email.trim();
    if (!v) { setEmailState("idle"); return; }
    try {
      const ok = await checkEmail(v);
      setEmailState(ok ? "ok" : "bad");
      if (!ok) setErrorMsg("이미 사용 중인 이메일입니다.");
    } catch {}
  };

  const onBlurPhone = async () => {
    const v = normalizePhone(phone);
    if (!v) { setPhoneState("idle"); return; }
    try {
      const ok = await checkPhone(v);
      setPhoneState(ok ? "ok" : "bad");
      if (!ok) setErrorMsg("이미 사용 중인 전화번호입니다.");
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const n = name.trim();
    if (!n) { setErrorMsg("아이디를 입력해 주세요."); return; }

    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    const pwMsg = validatePassword(password);
    if (pwMsg) { setErrorMsg(pwMsg); return; }

    // ✅ 제출 직전에 한번 더 중복확인(프론트 신뢰하지 않음)
    try {
      const okName = await checkUsername(n);
      if (!okName) { setNameState("bad"); setErrorMsg("이미 존재하는 아이디입니다."); return; }

      if (nickname.trim()) {
        const okNick = await checkNickname(nickname.trim());
        if (!okNick) { setNickState("bad"); setErrorMsg("이미 사용 중인 닉네임입니다."); return; }
      }

      if (email.trim()) {
        const okEmail = await checkEmail(email.trim());
        if (!okEmail) { setEmailState("bad"); setErrorMsg("이미 사용 중인 이메일입니다."); return; }
      }

      const p = normalizePhone(phone);
      if (p) {
        const okPhone = await checkPhone(p);
        if (!okPhone) { setPhoneState("bad"); setErrorMsg("이미 사용 중인 전화번호입니다."); return; }
      }
    } catch {
      setErrorMsg("중복 확인 중 오류가 발생했습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: n,
        password,
        nickname: nickname.trim() || null,
        email: email.trim() || null,
        phone: normalizePhone(phone) || null,
      });
      navigate("/login");
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "회원가입에 실패했습니다.";
      setErrorMsg(typeof serverMsg === "string" ? serverMsg : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const badge = (s: CheckState) =>
    s === "ok" ? "사용 가능" : s === "bad" ? "이미 사용 중" : "";

  return (
    <div className="auth-container">
      <h1>회원가입</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">아이디</label>
          <input
            id="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameState("idle"); }}
            onBlur={onBlurName}
            placeholder="아이디"
            required
          />
          {badge(nameState) && <div className="hint">{badge(nameState)}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="nickname">닉네임(선택)</label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setNickState("idle"); }}
            onBlur={onBlurNickname}
            placeholder="닉네임"
          />
          {badge(nickState) && <div className="hint">{badge(nickState)}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일(선택)</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailState("idle"); }}
            onBlur={onBlurEmail}
            placeholder="email@example.com"
          />
          {badge(emailState) && <div className="hint">{badge(emailState)}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">전화번호(선택)</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneState("idle"); }}
            onBlur={onBlurPhone}
            placeholder="01012345678"
          />
          {badge(phoneState) && <div className="hint">{badge(phoneState)}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8~16, 영문/숫자/특수 포함"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {errorMsg && <div className="error">{errorMsg}</div>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "처리중..." : "회원가입"}
        </button>
      </form>

      <div className="auth-link">
        <p>이미 계정이 있으신가요?</p>
        <NavLink to="/login">로그인</NavLink>
      </div>

      <BottomNav />
    </div>
  );
}
