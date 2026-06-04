"use client";

import { FormEvent, useEffect, useState } from "react";

const TEACHER_PASSWORD = "0327";
const STORAGE_KEY = "pung_alg_teacher_unlocked";

type TeacherPasswordGateProps = {
  children: React.ReactNode;
};

export function TeacherPasswordGate({ children }: TeacherPasswordGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  useEffect(() => {
    setIsUnlocked(sessionStorage.getItem(STORAGE_KEY) === "true");
    setIsCheckingStorage(false);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === TEACHER_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setIsUnlocked(true);
      setErrorMessage("");
      return;
    }

    setErrorMessage("비밀번호가 맞지 않습니다.");
    setPassword("");
  };

  if (isCheckingStorage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="h-32 w-full max-w-md animate-pulse rounded-[8px] bg-white shadow-soft" />
      </main>
    );
  }

  if (isUnlocked) {
    return children;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-md rounded-[8px] border border-emerald-100 bg-white p-7 shadow-soft">
        <p className="text-sm font-black text-emerald-700">교사용 입장</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          비밀번호를 입력하세요
        </h1>
        <p className="mt-3 text-base font-bold leading-7 text-slate-600">
          문제 제작과 관리는 선생님만 사용할 수 있습니다.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            비밀번호
            <input
              autoFocus
              className="min-h-14 rounded-[8px] border-2 border-slate-200 bg-white px-4 text-xl font-black tracking-widest text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              inputMode="numeric"
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage("");
              }}
              type="password"
              value={password}
            />
          </label>

          {errorMessage ? (
            <p className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-base font-black text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="min-h-14 rounded-[8px] bg-emerald-600 px-5 text-lg font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            type="submit"
          >
            들어가기
          </button>
        </form>
      </section>
    </main>
  );
}
