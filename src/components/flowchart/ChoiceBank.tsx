import type { Choice } from "@/types/stage";

import { DraggableChoice } from "../student/DraggableChoice";
import { AnswerCheckButton, type AnswerCheckStatus } from "./AnswerCheckButton";

type ChoiceBankProps = {
  choices: Choice[];
  answerStatus: AnswerCheckStatus;
  onCheckAnswers: () => void;
  onResetAnswers: () => void;
  onSelectChoice: (choice: Choice) => void;
  selectedChoiceValue?: string;
  usedChoiceValues: Set<string>;
  isStageCleared?: boolean;
  nextStageId?: string;
};

export function ChoiceBank({
  choices,
  answerStatus,
  onCheckAnswers,
  onResetAnswers,
  onSelectChoice,
  selectedChoiceValue,
  usedChoiceValues,
  isStageCleared = false,
  nextStageId,
}: ChoiceBankProps) {
  const selectedChoice = choices.find(
    (choice) => choice.value === selectedChoiceValue,
  );

  return (
    <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft xl:sticky xl:top-5 xl:flex xl:max-h-[calc(100vh-2.5rem)] xl:flex-col xl:self-start">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">선택지</h2>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">
          먼저 선택
        </span>
      </div>

      <p className="mt-3 rounded-[8px] bg-slate-50 px-3 py-3 text-sm font-bold leading-6 text-slate-600">
        선택지를 누른 뒤 순서도에서 알맞은 빈칸을 클릭하세요.
      </p>

      {selectedChoice ? (
        <div
          aria-live="polite"
          className="mt-3 rounded-[8px] border-2 border-emerald-400 bg-emerald-50 px-3 py-3"
        >
          <p className="text-xs font-black text-emerald-700">현재 선택</p>
          <p className="mt-1 break-keep text-base font-black leading-6 text-emerald-950">
            {selectedChoice.label}
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:min-h-0 xl:flex-1 xl:grid-cols-1 xl:overflow-y-auto xl:pr-1">
        {choices.map((choice) => (
          <DraggableChoice
            choice={choice}
            disabled={usedChoiceValues.has(choice.value)}
            key={choice.id}
            onSelect={onSelectChoice}
            selected={selectedChoiceValue === choice.value}
          />
        ))}
      </div>

      <div className="xl:shrink-0">
        <AnswerCheckButton
          isStageCleared={isStageCleared}
          nextStageId={nextStageId}
          onCheck={onCheckAnswers}
          onReset={onResetAnswers}
          status={answerStatus}
        />
      </div>
    </aside>
  );
}
