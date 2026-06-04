"use client";

import { useEffect, useMemo, useState } from "react";

import { StageCard } from "@/components/student/StageCard";
import { getStages } from "@/lib/stageService";
import {
  getCompletedStageIds,
  getUnlockedStageIds,
  sortStagesForProgression,
} from "@/lib/studentProgress";
import type { Stage, StageDifficulty } from "@/types/stage";

type DifficultyFilter = "all" | StageDifficulty;
type SortOrder = "progress" | "newest" | "oldest";

const difficultyOptions: { label: string; value: DifficultyFilter }[] = [
  { label: "전체", value: "all" },
  { label: "쉬움", value: "easy" },
  { label: "보통", value: "medium" },
  { label: "어려움", value: "hard" },
];

export default function StudentStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [completedStageIds, setCompletedStageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("progress");

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

  useEffect(() => {
    const refreshProgress = () => {
      setCompletedStageIds(getCompletedStageIds());
    };

    refreshProgress();
    window.addEventListener("focus", refreshProgress);

    return () => {
      window.removeEventListener("focus", refreshProgress);
    };
  }, []);

  const unlockedStageIds = useMemo(
    () => getUnlockedStageIds(stages, completedStageIds),
    [completedStageIds, stages],
  );

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
  const completedCount = stages.filter((stage) =>
    completedStageIds.has(stage.id),
  ).length;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[8px] border border-emerald-100 bg-white px-5 py-6 shadow-soft sm:px-7">
          <p className="text-sm font-black text-emerald-700">
            학생 스테이지
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
                단계별 문제를 골라요
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                쉬운 문제부터 차례대로 클리어하면 다음 스테이지가 열립니다.
              </p>
            </div>
            <div className="rounded-[8px] bg-emerald-50 px-5 py-3 text-lg font-black text-emerald-800">
              {completedCount} / {stages.length} 클리어
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
        />

        {errorMessage ? (
          <section className="rounded-[8px] border-2 border-rose-200 bg-rose-50 p-5">
            <h2 className="text-lg font-black text-rose-800">
              문제 목록을 불러오지 못했습니다.
            </h2>
            <p className="mt-2 text-base font-bold text-rose-700">
              {errorMessage}
            </p>
          </section>
        ) : null}

        {isLoading ? (
          <LoadingState />
        ) : stages.length === 0 && !errorMessage ? (
          <section className="rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-soft">
            <h2 className="text-2xl font-black text-slate-950">
              아직 풀 수 있는 문제가 없습니다.
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              선생님이 문제를 만들면 여기에 나타납니다.
            </p>
          </section>
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
                isCompleted={completedStageIds.has(stage.id)}
                isLocked={!unlockedStageIds.has(stage.id)}
                key={stage.id}
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
  onDifficultyChange,
  onSearchChange,
  onSortOrderChange,
}: {
  difficultyFilter: DifficultyFilter;
  searchQuery: string;
  sortOrder: SortOrder;
  onDifficultyChange: (value: DifficultyFilter) => void;
  onSearchChange: (value: string) => void;
  onSortOrderChange: (value: SortOrder) => void;
}) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">검색</span>
          <input
            className={filterInputClass}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="제목이나 설명을 검색해요."
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
            <option value="progress">스테이지순</option>
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          className="min-h-[260px] animate-pulse rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft"
          key={item}
        >
          <div className="h-7 w-40 rounded-full bg-slate-200" />
          <div className="mt-6 h-8 w-3/4 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
          <div className="mt-10 h-14 rounded-[8px] bg-slate-200" />
        </div>
      ))}
    </section>
  );
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
  const sortedStages =
    sortOrder === "progress"
      ? sortStagesForProgression(stages)
      : [...stages].sort((a, b) => {
          const left = timestampToMilliseconds(a.createdAt);
          const right = timestampToMilliseconds(b.createdAt);

          return sortOrder === "newest" ? right - left : left - right;
        });

  return sortedStages.filter((stage) => {
    const matchesDifficulty =
      difficultyFilter === "all" || stage.difficulty === difficultyFilter;
    const searchableText = `${stage.title} ${stage.description}`.toLowerCase();
    const matchesSearch =
      !normalizedQuery || searchableText.includes(normalizedQuery);

    return matchesDifficulty && matchesSearch;
  });
}

function timestampToMilliseconds(timestamp: Stage["createdAt"]) {
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  if (timestamp?.toDate) {
    return timestamp.toDate().getTime();
  }

  if (
    typeof timestamp?.seconds === "number" &&
    typeof timestamp?.nanoseconds === "number"
  ) {
    return timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
  }

  return 0;
}

const filterInputClass =
  "min-h-12 rounded-[8px] border-2 border-slate-200 bg-white px-3 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const filterSelectClass =
  "min-h-12 rounded-[8px] border-2 border-slate-200 bg-white px-3 text-base font-black text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
