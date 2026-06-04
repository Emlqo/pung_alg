"use client";

import type { Choice } from "@/types/stage";

type DraggableChoiceProps = {
  choice: Choice;
  disabled?: boolean;
  selected?: boolean;
  onSelect?: (choice: Choice) => void;
};

export function DraggableChoice({
  choice,
  disabled = false,
  selected = false,
  onSelect,
}: DraggableChoiceProps) {
  return (
    <button
      aria-pressed={selected}
      className={[
        "min-h-16 rounded-[8px] border-2 border-slate-200 bg-white px-4 py-3 text-left text-xl font-black text-slate-900 shadow-sm transition",
        "hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-200",
        selected
          ? "border-emerald-500 bg-emerald-100 text-emerald-950 ring-4 ring-emerald-200"
          : "",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70 hover:border-slate-200 hover:bg-slate-100"
          : "",
      ].join(" ")}
      disabled={disabled}
      onClick={() => onSelect?.(choice)}
      type="button"
    >
      <span>{choice.label}</span>
      {selected ? (
        <span className="ml-2 rounded-full bg-emerald-600 px-2 py-1 text-sm font-black text-white">
          선택됨
        </span>
      ) : null}
      {disabled ? (
        <span className="ml-2 text-sm font-black text-slate-400">사용 중</span>
      ) : null}
    </button>
  );
}
