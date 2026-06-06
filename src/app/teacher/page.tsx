"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { defaultArithmeticStages } from "@/data/defaultArithmeticStages";
import { createStage, deleteStage, getStages } from "@/lib/stageService";
import type { Stage, StageDifficulty, StageTimestamp } from "@/types/stage";

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

type DifficultyFilter = "all" | StageDifficulty;
type SortOrder = "newest" | "oldest";

const difficultyOptions: { label: string; value: DifficultyFilter }[] = [
  { label: "전체", value: "all" },
  { label: "쉬움", value: "easy" },
  { label: "보통", value: "medium" },
  { label: "어려움", value: "hard" },
];

export default function TeacherPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeedingDefaults, setIsSeedingDefaults] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  useEffect(() => {
    let isMounted = true;

    async function loadStages() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const loadedStages = await getStages();

        if (isMounted) {
          setStages(loadedStages);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStages();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStages = useMemo(
    () =>
      filterAndSortStages({
        difficultyFilter,
        searchQuery,
        sortOrder,
        stages,
      }),
    [difficultyFilter, searchQuery, sortOrder, stages],
  );

  const handleDelete = async (stage: Stage) => {
    const shouldDelete = window.confirm(
      `"${stage.title}" 문제를 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(stage.id);
      setErrorMessage("");
      await deleteStage(stage.id);
      setStages((current) => current.filter((item) => item.id !== stage.id));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeedDefaultStages = async () => {
    try {
      setIsSeedingDefaults(true);
      setErrorMessage("");
      setSuccessMessage("");

      await Promise.all(
        defaultArithmeticStages.map((stage) => createStage(stage)),
      );

      const loadedStages = await getStages();
      setStages(loadedStages);
      setSuccessMessage("기본 문제와 새 배치가 적용되었습니다.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSeedingDefaults(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[8px] border border-emerald-100 bg-white px-5 py-6 shadow-soft sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-700">교사용</p>
              <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                문제 관리
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                Firestore에 저장된 순서도 문제를 확인하고 관리합니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex min-h-14 items-center justify-center rounded-[8px] border-2 border-emerald-200 bg-emerald-50 px-6 text-lg font-black text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                disabled={isSeedingDefaults}
                onClick={handleSeedDefaultStages}
                type="button"
              >
                {isSeedingDefaults
                  ? "적용 중..."
                  : "기본 문제 추가/업데이트"}
              </button>
              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-[8px] bg-emerald-600 px-6 text-lg font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                href="/teacher/new"
              >
                새 문제 만들기
              </Link>
            </div>
          </div>
        </header>

        <FilterBar
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          onSearchChange={setSearchQuery}
          onSortOrderChange={setSortOrder}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          totalCount={stages.length}
          visibleCount={filteredStages.length}
        />

        {errorMessage ? (
          <section className="rounded-[8px] border-2 border-rose-200 bg-rose-50 p-5">
            <h2 className="text-lg font-black text-rose-800">
              문제 목록을 불러오지 못했습니다
            </h2>
            <p className="mt-2 text-base font-bold text-rose-700">
              {errorMessage}
            </p>
          </section>
        ) : null}

        {successMessage ? (
          <section className="rounded-[8px] border-2 border-emerald-200 bg-emerald-50 p-5">
            <p className="text-lg font-black text-emerald-800">
              {successMessage}
            </p>
          </section>
        ) : null}

        {isLoading ? (
          <LoadingState />
        ) : stages.length === 0 && !errorMessage ? (
          <EmptyState />
        ) : filteredStages.length === 0 && !errorMessage ? (
          <section className="rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-soft">
            <h2 className="text-2xl font-black text-slate-950">
              조건에 맞는 문제가 없습니다.
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              검색어나 난이도 필터를 바꿔 보세요.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredStages.map((stage) => (
              <StageCard
                deletingId={deletingId}
                key={stage.id}
                onDelete={handleDelete}
                stage={stage}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function FilterBar({
  difficultyFilter,
  searchQuery,
  sortOrder,
  totalCount,
  visibleCount,
  onDifficultyChange,
  onSearchChange,
  onSortOrderChange,
}: {
  difficultyFilter: DifficultyFilter;
  searchQuery: string;
  sortOrder: SortOrder;
  totalCount: number;
  visibleCount: number;
  onDifficultyChange: (value: DifficultyFilter) => void;
  onSearchChange: (value: string) => void;
  onSortOrderChange: (value: SortOrder) => void;
}) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">검색</span>
          <input
            className={filterInputClass}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="제목이나 설명을 검색하세요."
            value={searchQuery}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">난이도</span>
          <select
            className={filterSelectClass}
            onChange={(event) =>
              onDifficultyChange(event.target.value as DifficultyFilter)
            }
            value={difficultyFilter}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">정렬</span>
          <select
            className={filterSelectClass}
            onChange={(event) =>
              onSortOrderChange(event.target.value as SortOrder)
            }
            value={sortOrder}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </label>

        <div className="rounded-[8px] bg-emerald-50 px-4 py-3 text-center text-base font-black text-emerald-800">
          {visibleCount} / {totalCount}개
        </div>
      </div>
    </section>
  );
}

function StageCard({
  stage,
  deletingId,
  onDelete,
}: {
  stage: Stage;
  deletingId: string | null;
  onDelete: (stage: Stage) => void;
}) {
  const isDeleting = deletingId === stage.id;

  return (
    <article className="flex min-h-[300px] flex-col rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={[
            "rounded-full px-3 py-1 text-sm font-black",
            difficultyClasses[stage.difficulty],
          ].join(" ")}
        >
          {difficultyLabels[stage.difficulty]}
        </span>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-800">
          {formatStageDate(stage.createdAt)}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-black leading-8 text-slate-950">
        {stage.title}
      </h2>
      <p className="mt-3 line-clamp-3 text-base leading-7 text-slate-600">
        {stage.description || "설명이 없는 문제입니다."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-[8px] bg-slate-50 px-3 py-3">
          <p className="text-sm font-bold text-slate-500">노드</p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {stage.nodes.length}
          </p>
        </div>
        <div className="rounded-[8px] bg-slate-50 px-3 py-3">
          <p className="text-sm font-bold text-slate-500">선택지</p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {stage.choices.length}
          </p>
        </div>
      </div>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-3">
        <Link
          className={actionLinkClass}
          href={`/student/stage/${stage.id}`}
        >
          미리보기
        </Link>
        <Link className={actionLinkClass} href={`/teacher/edit/${stage.id}`}>
          수정
        </Link>
        <button
          className="min-h-12 rounded-[8px] border-2 border-rose-200 bg-white px-3 text-base font-black text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          disabled={isDeleting}
          onClick={() => onDelete(stage)}
          type="button"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          className="min-h-[300px] animate-pulse rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft"
          key={item}
        >
          <div className="h-7 w-32 rounded-full bg-slate-200" />
          <div className="mt-6 h-8 w-3/4 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
          <div className="mt-10 h-12 rounded-[8px] bg-slate-200" />
        </div>
      ))}
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-soft">
      <h2 className="text-2xl font-black text-slate-950">
        아직 만든 문제가 없습니다.
      </h2>
      <p className="mt-3 text-lg text-slate-600">
        첫 번째 순서도 빈칸 문제를 만들어 보세요.
      </p>
      <Link
        className="mt-6 inline-flex min-h-14 items-center justify-center rounded-[8px] bg-emerald-600 px-6 text-lg font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        href="/teacher/new"
      >
        새 문제 만들기
      </Link>
    </section>
  );
}

function formatStageDate(timestamp: StageTimestamp) {
  const date = timestampToDate(timestamp);

  if (!date) {
    return "생성일 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(date);
}

function timestampToDate(timestamp: StageTimestamp) {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (timestamp?.toDate) {
    return timestamp.toDate();
  }

  if (
    typeof timestamp?.seconds === "number" &&
    typeof timestamp?.nanoseconds === "number"
  ) {
    return new Date(
      timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000),
    );
  }

  return null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function filterAndSortStages({
  stages,
  difficultyFilter,
  searchQuery,
  sortOrder,
}: {
  stages: Stage[];
  difficultyFilter: DifficultyFilter;
  searchQuery: string;
  sortOrder: SortOrder;
}) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return [...stages]
    .filter((stage) => {
      const matchesDifficulty =
        difficultyFilter === "all" || stage.difficulty === difficultyFilter;
      const searchableText = `${stage.title} ${stage.description}`.toLowerCase();
      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesDifficulty && matchesSearch;
    })
    .sort((a, b) => {
      const left = timestampToMilliseconds(a.createdAt);
      const right = timestampToMilliseconds(b.createdAt);

      return sortOrder === "newest" ? right - left : left - right;
    });
}

function timestampToMilliseconds(timestamp: StageTimestamp) {
  const date = timestampToDate(timestamp);

  return date ? date.getTime() : 0;
}

const actionLinkClass =
  "flex min-h-12 items-center justify-center rounded-[8px] bg-slate-900 px-3 text-base font-black text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200";

const filterInputClass =
  "min-h-12 rounded-[8px] border-2 border-slate-200 bg-white px-3 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const filterSelectClass =
  "min-h-12 rounded-[8px] border-2 border-slate-200 bg-white px-3 text-base font-black text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
