import type { Choice } from "@/types/stage";

import { DraggableChoice } from "./DraggableChoice";

type ChoiceBankProps = {
  choices: Choice[];
};

export function ChoiceBank({ choices }: ChoiceBankProps) {
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
          <DraggableChoice choice={choice} key={choice.id} />
        ))}
      </div>
    </aside>
  );
}
