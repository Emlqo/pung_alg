import Link from "next/link";

import type { Stage, StageDifficulty, StageProblemType } from "@/types/stage";

type StageCardProps = {
  isCompleted: boolean;
  isLocked: boolean;
  stage: Stage;
};

const difficultyLabels: Record<StageDifficulty, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

const difficultyClasses: Record<StageDifficulty, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-rose-100 text-rose-800",
};

const problemTypeLabels: Record<StageProblemType, string> = {
  "flowchart-fill-blank": "순서도 빈칸 채우기",
};

export function StageCard({ isCompleted, isLocked, stage }: StageCardProps) {
  const blankCount = stage.nodes.reduce(
    (count, node) => count + node.blanks.length,
    0,
  );

  return (
    <article
      className={[
        "flex min-h-[280px] flex-col rounded-[8px] border bg-white p-5 shadow-soft transition",
        isLocked
          ? "border-slate-200 opacity-75"
          : "border-slate-200 hover:-translate-y-1 hover:border-emerald-200",
        isCompleted ? "ring-4 ring-emerald-100" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap gap-2">
        {isCompleted ? (
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-black text-white">
            클리어
          </span>
        ) : null}
        {isLocked ? (
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-black text-slate-700">
            잠김
          </span>
        ) : null}
        <span
          className={[
            "rounded-full px-3 py-1 text-sm font-black",
            difficultyClasses[stage.difficulty],
          ].join(" ")}
        >
          난이도 {difficultyLabels[stage.difficulty]}
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-800">
          {problemTypeLabels[stage.problemType]}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-black leading-8 text-slate-950">
        {stage.title}
      </h2>
      <p className="mt-3 line-clamp-3 text-base leading-7 text-slate-600">
        {stage.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-[8px] bg-slate-50 px-3 py-3">
          <p className="text-sm font-bold text-slate-500">빈칸</p>
          <p className="mt-1 text-xl font-black text-slate-900">{blankCount}</p>
        </div>
        <div className="rounded-[8px] bg-slate-50 px-3 py-3">
          <p className="text-sm font-bold text-slate-500">선택지</p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {stage.choices.length}
          </p>
        </div>
      </div>

      {isLocked ? (
        <div className="mt-auto flex min-h-14 items-center justify-center rounded-[8px] bg-slate-200 px-5 text-center text-base font-black text-slate-600">
          이전 문제를 먼저 클리어
        </div>
      ) : (
        <Link
          className="mt-auto flex min-h-14 items-center justify-center rounded-[8px] bg-emerald-600 px-5 text-lg font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          href={`/student/stage/${stage.id}`}
        >
          {isCompleted ? "다시 풀기" : "풀러가기"}
        </Link>
      )}
    </article>
  );
}
