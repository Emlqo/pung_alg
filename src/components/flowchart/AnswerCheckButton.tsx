"use client";

import Link from "next/link";

export type AnswerCheckStatus = "idle" | "incomplete" | "correct" | "incorrect";

type AnswerCheckButtonProps = {
  status: AnswerCheckStatus;
  onCheck: () => void;
  onReset: () => void;
  isStageCleared?: boolean;
  nextStageId?: string;
};

const resultMessages: Record<Exclude<AnswerCheckStatus, "idle">, string> = {
  incomplete: "아직 빈칸이 남아 있어요.",
  correct: "정답입니다!",
  incorrect: "다시 확인해보세요.",
};

export function AnswerCheckButton({
  status,
  onCheck,
  onReset,
  isStageCleared = false,
  nextStageId,
}: AnswerCheckButtonProps) {
  const message = status === "idle" ? null : resultMessages[status];

  return (
    <div className="mt-4 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
      {message ? (
        <p className={getMessageClass(status)} aria-live="polite">
          {message}
        </p>
      ) : (
        <p className="text-base font-bold text-slate-600" aria-live="polite">
          빈칸을 모두 채운 뒤 정답을 확인해 보세요.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <button
          className="min-h-14 rounded-[8px] bg-emerald-600 px-5 text-lg font-black text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          onClick={onCheck}
          type="button"
        >
          정답 확인
        </button>
        <button
          className="min-h-14 rounded-[8px] border-2 border-slate-300 bg-white px-5 text-lg font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200"
          onClick={onReset}
          type="button"
        >
          다시 풀기
        </button>
      </div>

      {isStageCleared ? (
        nextStageId ? (
          <Link
            className="mt-3 inline-flex min-h-14 w-full items-center justify-center rounded-[8px] bg-sky-600 px-5 text-lg font-black text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
            href={`/student/stage/${nextStageId}`}
          >
            다음 스테이지 가기
          </Link>
        ) : (
          <p className="mt-3 rounded-[8px] bg-emerald-100 px-4 py-3 text-center text-base font-black text-emerald-800">
            모든 스테이지를 클리어했어요
          </p>
        )
      ) : null}
    </div>
  );
}

function getMessageClass(status: AnswerCheckStatus) {
  const base = "text-lg font-black";

  switch (status) {
    case "correct":
      return `${base} text-emerald-700`;
    case "incorrect":
      return `${base} text-rose-700`;
    case "incomplete":
      return `${base} text-amber-700`;
    default:
      return `${base} text-slate-600`;
  }
}
