"use client";

import { useDroppable } from "@dnd-kit/core";

import type { Blank } from "@/types/stage";

type DropBlankProps = {
  blank: Blank;
  onRemove?: (blankId: string) => void;
  result?: "correct" | "incorrect";
  value?: string;
};

export function DropBlank({ blank, onRemove, result, value }: DropBlankProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: blank.id,
    data: {
      blank,
    },
  });

  const handleClick = () => {
    if (value) {
      onRemove?.(blank.id);
    }
  };

  return (
    <button
      aria-label={value ? `${value} 제거` : `${blank.placeholder} 빈칸`}
      className={[
        "inline-flex min-h-12 min-w-28 items-center justify-center rounded-[8px] border-2 border-dashed px-4 py-1 align-middle text-xl font-black transition",
        getBlankClass({ result, value }),
        isOver ? "scale-105 border-emerald-600 bg-emerald-200" : "",
        value ? "cursor-pointer hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-sky-200" : "cursor-default",
      ].join(" ")}
      onClick={handleClick}
      ref={setNodeRef}
      type="button"
    >
      {value ? (
        <span className="inline-flex items-center gap-2">
          {value}
          <span className="text-base font-black opacity-70">×</span>
        </span>
      ) : (
        blank.placeholder
      )}
    </button>
  );
}

function getBlankClass({
  result,
  value,
}: {
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

  return "border-slate-400 bg-white text-slate-500";
}
