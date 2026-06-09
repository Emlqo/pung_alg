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
        "inline-flex min-h-12 max-w-[92%] items-center justify-center rounded-[8px] border-2 border-dashed px-3 py-2 align-middle text-center text-base font-black leading-6 transition sm:text-lg",
        getBlankClass({ hasSelectedChoice, result, value }),
        hasSelectedChoice || value
          ? "cursor-pointer hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-sky-200"
          : "cursor-default",
      ].join(" ")}
      onClick={handleClick}
      type="button"
    >
      {value ? (
        <span className="flex max-w-full items-center justify-center gap-2">
          <span className="break-keep">{value}</span>
          <span
            aria-hidden="true"
            className="shrink-0 text-sm font-black opacity-60"
          >
            x
          </span>
        </span>
      ) : (
        <span className="break-keep">{blank.placeholder}</span>
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
    return "border-solid border-sky-500 bg-sky-100 text-sky-900 shadow-sm";
  }

  if (hasSelectedChoice) {
    return "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
  }

  return "border-slate-400 bg-white text-slate-500";
}
