// src/utils/validators.ts
export function normalizePhone(input: string): string {
  return (input ?? "").replace(/\D/g, "");
}

export function validatePassword(pw: string): string | null {
  const ok = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/.test(pw);
  return ok ? null : "비밀번호는 8~16자, 영문/숫자/특수문자를 각각 1자 이상 포함해야 합니다.";
}
