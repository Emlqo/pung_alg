"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { StageForm } from "@/components/teacher/StageForm";
import { getStageById, updateStage } from "@/lib/stageService";
import type { Stage } from "@/types/stage";

export default function TeacherEditStagePage() {
  const params = useParams<{ id: string }>();
  const [stage, setStage] = useState<Stage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStage() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const loadedStage = await getStageById(params.id);

        if (isMounted) {
          setStage(loadedStage);
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
    return <EditLoadingState />;
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
            주소를 다시 확인하거나 문제 목록에서 수정할 문제를 선택해 주세요.
          </p>
        </section>
      </main>
    );
  }

  return (
    <StageForm
      heading="순서도 문제 수정"
      helperText="기존 문제 데이터를 불러왔습니다. 내용을 수정하면 오른쪽 미리보기가 바로 갱신됩니다."
      initialStage={stage}
      onSubmit={(nextStage) => updateStage(params.id, nextStage)}
      submitLabel="수정 내용 저장"
      successMessage="문제가 수정되었습니다."
    />
  );
}

function EditLoadingState() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="animate-pulse rounded-[8px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="mt-4 h-10 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-5 w-full max-w-3xl rounded bg-slate-200" />
        </section>
        <section className="grid gap-5 xl:grid-cols-[470px_minmax(0,1fr)]">
          <div className="h-[760px] rounded-[8px] border border-slate-200 bg-white shadow-soft" />
          <div className="h-[760px] rounded-[8px] border border-slate-200 bg-white shadow-soft" />
        </section>
      </div>
    </main>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}
