"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { AnswerCheckStatus } from "@/components/flowchart/AnswerCheckButton";
import { ChoiceBank } from "@/components/flowchart/ChoiceBank";
import { FlowchartCanvas } from "@/components/flowchart/FlowchartCanvas";
import {
  getCompletedStageIds,
  getNextStage,
  markStageCompleted,
} from "@/lib/studentProgress";
import type { Blank, Choice, Stage, StudentBlankAnswers } from "@/types/stage";

type BlankResultMap = Record<string, "correct" | "incorrect">;

type StudentStagePlayerProps = {
  stage: Stage;
  stages: Stage[];
};

export function StudentStagePlayer({ stage, stages }: StudentStagePlayerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<StudentBlankAnswers>({});
  const [shuffledChoices, setShuffledChoices] = useState<Choice[]>(() =>
    shuffleChoices(stage.choices),
  );
  const [answerStatus, setAnswerStatus] =
    useState<AnswerCheckStatus>("idle");
  const [blankResults, setBlankResults] = useState<BlankResultMap>({});
  const [isStageCleared, setIsStageCleared] = useState(false);
  const [nextStage, setNextStage] = useState<Stage | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const blanks = useMemo(
    () => stage.nodes.flatMap((node) => node.blanks),
    [stage.nodes],
  );

  const filledCount = useMemo(
    () => blanks.filter((blank) => Boolean(answers[blank.id])).length,
    [answers, blanks],
  );

  const blankCount = blanks.length;

  const usedChoiceValues = useMemo(
    () => new Set(Object.values(answers).filter(Boolean)),
    [answers],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const blankId = event.over?.id;
    const choice = event.active.data.current?.choice as Choice | undefined;

    if (!blankId || !choice) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [String(blankId)]: choice.value,
    }));
    setAnswerStatus("idle");
    setBlankResults({});
    setIsStageCleared(false);
    setNextStage(null);
  };

  const handleRemoveAnswer = (blankId: string) => {
    setAnswers((current) => {
      const nextAnswers = { ...current };
      delete nextAnswers[blankId];
      return nextAnswers;
    });
    setAnswerStatus("idle");
    setBlankResults({});
    setIsStageCleared(false);
    setNextStage(null);
  };

  const handleCheckAnswers = () => {
    const hasEmptyBlank = blanks.some((blank) => !answers[blank.id]);

    if (hasEmptyBlank) {
      setAnswerStatus("incomplete");
      setBlankResults({});
      return;
    }

    const nextResults = blanks.reduce<BlankResultMap>((result, blank) => {
      result[blank.id] = isCorrectBlank(blank, answers[blank.id])
        ? "correct"
        : "incorrect";
      return result;
    }, {});
    const isAllCorrect = Object.values(nextResults).every(
      (result) => result === "correct",
    );

    if (isAllCorrect) {
      markStageCompleted(stage.id);
      setIsStageCleared(true);
      setNextStage(getNextStage(stage.id, stages, getCompletedStageIds()));
    }

    setBlankResults(nextResults);
    setAnswerStatus(isAllCorrect ? "correct" : "incorrect");
  };

  const handleResetAnswers = () => {
    setAnswers({});
    setAnswerStatus("idle");
    setBlankResults({});
    setIsStageCleared(false);
    setNextStage(null);
    setShuffledChoices(shuffleChoices(stage.choices));
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <header className="rounded-[8px] border border-emerald-100 bg-white px-5 py-5 shadow-soft">
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-[8px] border-2 border-slate-200 bg-white px-4 text-base font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                onClick={() => router.back()}
                type="button"
              >
                뒤로가기
              </button>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-[8px] bg-emerald-600 px-4 text-base font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                href="/student"
              >
                문제 고르러 가기
              </Link>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700">
                  학생용 순서도 문제
                </p>
                <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  {stage.title}
                </h1>
                <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  {stage.description}
                </p>
              </div>
              <div className="rounded-[8px] bg-emerald-50 px-5 py-3 text-lg font-black text-emerald-800">
                {filledCount} / {blankCount} 칸 채움
              </div>
            </div>
          </header>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <FlowchartCanvas
              answers={answers}
              blankResults={blankResults}
              edges={stage.edges}
              nodes={stage.nodes}
              onRemoveAnswer={handleRemoveAnswer}
            />
            <ChoiceBank
              answerStatus={answerStatus}
              choices={shuffledChoices}
              onCheckAnswers={handleCheckAnswers}
              onResetAnswers={handleResetAnswers}
              usedChoiceValues={usedChoiceValues}
            />
          </section>

          {isStageCleared ? (
            <section className="rounded-[8px] border-2 border-emerald-200 bg-emerald-50 p-5 text-center shadow-soft">
              <p className="text-xl font-black text-emerald-800">
                스테이지 클리어! 다음 문제로 바로 이어서 풀어볼까요?
              </p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                {nextStage ? (
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-emerald-600 px-5 text-base font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                    href={`/student/stage/${nextStage.id}`}
                  >
                    다음 스테이지 가기
                  </Link>
                ) : (
                  <span className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-emerald-100 px-5 text-base font-black text-emerald-800">
                    모든 스테이지를 클리어했어요
                  </span>
                )}
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-[8px] border-2 border-emerald-200 bg-white px-5 text-base font-black text-emerald-800 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  href="/student"
                >
                  문제 목록 보기
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </DndContext>
  );
}

function isCorrectBlank(blank: Blank, value?: string) {
  return value === blank.answer;
}

function shuffleChoices(choices: Choice[]) {
  const shuffled = [...choices];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}
