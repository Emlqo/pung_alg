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
  return (
    <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft xl:sticky xl:top-5 xl:self-start">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">선택지</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
          끌어 넣기
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
      <AnswerCheckButton
        isStageCleared={isStageCleared}
        nextStageId={nextStageId}
        onCheck={onCheckAnswers}
        onReset={onResetAnswers}
        status={answerStatus}
      />
    </aside>
  );
}
