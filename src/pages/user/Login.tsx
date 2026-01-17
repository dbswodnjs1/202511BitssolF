// src/pages/user/Login.tsx


import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import { getMe, login } from "../../api/user";

function Login(): React.ReactElement {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    getMe()
      .then(() => setIsLoggedIn(true))
      .catch(() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jwt = await login(name, password);
      localStorage.setItem("token", jwt); // ✅ 순수 JWT 저장
      setIsLoggedIn(true);
      navigate("/");
    } catch {
      alert("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <p>로딩중...</p>
        <BottomNav />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="auth-container">
        <h1>내 정보</h1>
        <div className="profile-info">
          <p>로그인 되어 있습니다.</p>
          <button onClick={handleLogout} className="btn btn-secondary">
            로그아웃
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">아이디</label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="아이디를 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          로그인
        </button>
      </form>

      <div className="auth-link">
        <p>계정이 없으신가요?</p>
        <NavLink to="/signup">회원가입</NavLink>
      </div>

      <BottomNav />
    </div>
  );
}

export default Login;
