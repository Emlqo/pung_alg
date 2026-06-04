"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { StudentStagePlayer } from "@/components/student/StudentStagePlayer";
import { getStageById, getStages } from "@/lib/stageService";
import {
  getCompletedStageIds,
  isStageUnlocked,
} from "@/lib/studentProgress";
import type { Stage } from "@/types/stage";

export default function StudentStagePage() {
  const params = useParams<{ id: string }>();
  const [stage, setStage] = useState<Stage | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStage() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const [loadedStage, loadedStages] = await Promise.all([
          getStageById(params.id),
          getStages(),
        ]);
        const completedStageIds = getCompletedStageIds();
        const nextIsLocked = loadedStage
          ? !isStageUnlocked({
              completedStageIds,
              stageId: loadedStage.id,
              stages: loadedStages,
            })
          : false;

        if (isMounted) {
          setStage(loadedStage);
          setStages(loadedStages);
          setIsLocked(nextIsLocked);
        }
      } catch (error) {
        if (isMounted) {
          setStage(null);
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (params.id) {
      loadStage();
    }

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <section className="animate-pulse rounded-[8px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-9 w-2/3 rounded bg-slate-200" />
            <div className="mt-4 h-5 w-full max-w-3xl rounded bg-slate-200" />
          </section>
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="h-[760px] rounded-[8px] border border-slate-200 bg-white shadow-soft" />
            <div className="h-80 rounded-[8px] border border-slate-200 bg-white shadow-soft" />
          </section>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="max-w-lg rounded-[8px] border-2 border-rose-200 bg-rose-50 p-8 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-rose-800">
            문제를 불러오지 못했습니다
          </h1>
          <p className="mt-3 text-rose-700">{errorMessage}</p>
        </section>
      </main>
    );
  }

  if (!stage) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="max-w-lg rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-slate-950">
            문제를 찾을 수 없습니다
          </h1>
          <p className="mt-3 text-slate-600">
            주소를 다시 확인하거나 스테이지 목록에서 문제를 선택해 주세요.
          </p>
        </section>
      </main>
    );
  }

  if (isLocked) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="max-w-lg rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-black text-slate-950">
            아직 잠긴 스테이지입니다
          </h1>
          <p className="mt-3 text-slate-600">
            이전 문제를 먼저 클리어하면 이 문제가 열립니다.
          </p>
          <Link
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[8px] bg-emerald-600 px-5 text-base font-black text-white transition hover:bg-emerald-700"
            href="/student"
          >
            문제 고르러 가기
          </Link>
        </section>
      </main>
    );
  }

  return <StudentStagePlayer stage={stage} stages={stages} />;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}
