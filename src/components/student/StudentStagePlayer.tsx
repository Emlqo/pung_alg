"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isCheckLocked, setIsCheckLocked] = useState(false);
  const checkLockTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (checkLockTimeoutRef.current !== null) {
        window.clearTimeout(checkLockTimeoutRef.current);
      }
    },
    [],
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

  const handleSelectChoice = (choice: Choice) => {
    setSelectedChoice((current) =>
      current?.value === choice.value ? null : choice,
    );
  };

  const handleBlankClick = (blankId: string) => {
    if (!selectedChoice) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [blankId]: selectedChoice.value,
    }));
    setSelectedChoice(null);
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
    if (isCheckLocked) {
      return;
    }

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
    } else {
      setIsCheckLocked(true);
      checkLockTimeoutRef.current = window.setTimeout(() => {
        setIsCheckLocked(false);
        checkLockTimeoutRef.current = null;
      }, 5000);
    }

    setBlankResults(nextResults);
    setAnswerStatus(isAllCorrect ? "correct" : "incorrect");
  };

  const handleResetAnswers = () => {
    setAnswers({});
    setSelectedChoice(null);
    setAnswerStatus("idle");
    setBlankResults({});
    setIsStageCleared(false);
    setNextStage(null);
    setShuffledChoices(shuffleChoices(stage.choices));
  };

  return (
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
                {stage.difficulty === "hard" ? (
                  <div className="mt-4 max-w-4xl rounded-[8px] border-2 border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="text-sm font-black text-amber-800">
                      문제 설명
                    </p>
                    <p className="mt-1 text-base font-bold leading-8 text-slate-800 sm:text-lg">
                      {stage.description}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                    {stage.description}
                  </p>
                )}
              </div>
              <div className="rounded-[8px] bg-emerald-50 px-5 py-3 text-lg font-black text-emerald-800">
                {filledCount} / {blankCount} 칸 채움
              </div>
            </div>
          </header>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <FlowchartCanvas
              answers={answers}
              blankResults={blankResults}
              defaultZoom={0.75}
              edges={stage.edges}
              hasSelectedChoice={Boolean(selectedChoice)}
              nodes={stage.nodes}
              onBlankClick={handleBlankClick}
              onRemoveAnswer={handleRemoveAnswer}
            />
            <ChoiceBank
              answerStatus={answerStatus}
              choices={shuffledChoices}
              isCheckDisabled={isCheckLocked}
              isStageCleared={isStageCleared}
              nextStageId={nextStage?.id}
              onCheckAnswers={handleCheckAnswers}
              onResetAnswers={handleResetAnswers}
              onSelectChoice={handleSelectChoice}
              selectedChoiceValue={selectedChoice?.value}
              usedChoiceValues={usedChoiceValues}
            />
          </section>

        </div>
    </main>
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
