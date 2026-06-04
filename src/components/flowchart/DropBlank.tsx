"use client";

import type { Blank } from "@/types/stage";

type DropBlankProps = {
  blank: Blank;
  hasSelectedChoice?: boolean;
  onBlankClick?: (blankId: string) => void;
  onRemove?: (blankId: string) => void;
  result?: "correct" | "incorrect";
  value?: string;
};

export function DropBlank({
  blank,
  hasSelectedChoice = false,
  onBlankClick,
  onRemove,
  result,
  value,
}: DropBlankProps) {
  const handleClick = () => {
    if (hasSelectedChoice) {
      onBlankClick?.(blank.id);
      return;
    }

    if (value) {
      onRemove?.(blank.id);
    }
  };

  return (
    <button
      aria-label={value ? `${value} 제거` : `${blank.placeholder} 빈칸`}
      className={[
        "inline-flex min-h-12 min-w-28 items-center justify-center rounded-[8px] border-2 border-dashed px-4 py-1 align-middle text-xl font-black transition",
        getBlankClass({ hasSelectedChoice, result, value }),
        hasSelectedChoice || value
          ? "cursor-pointer hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-sky-200"
          : "cursor-default",
      ].join(" ")}
      onClick={handleClick}
      type="button"
    >
      {value ? (
        <span className="inline-flex items-center gap-2">
          {value}
          <span className="text-base font-black opacity-70">x</span>
        </span>
      ) : (
        blank.placeholder
      )}
    </button>
  );
}

function getBlankClass({
  hasSelectedChoice,
  result,
  value,
}: {
  hasSelectedChoice: boolean;
  result?: "correct" | "incorrect";
  value?: string;
}) {
  if (result === "correct") {
    return "border-solid border-emerald-600 bg-emerald-100 text-emerald-900 shadow-sm";
  }

  if (result === "incorrect") {
    return "border-solid border-rose-600 bg-rose-100 text-rose-900 shadow-sm";
  }

  if (value) {
    return "rounded-full border-solid border-sky-500 bg-sky-100 text-sky-900 shadow-sm";
  }

  if (hasSelectedChoice) {
    return "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
  }

  return "border-slate-400 bg-white text-slate-500";
}
