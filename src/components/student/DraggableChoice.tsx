"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { Choice } from "@/types/stage";

type DraggableChoiceProps = {
  choice: Choice;
  disabled?: boolean;
};

export function DraggableChoice({ choice, disabled = false }: DraggableChoiceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: choice.id,
      data: {
        choice,
      },
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <button
      className={[
        "min-h-16 touch-none rounded-[8px] border-2 border-slate-200 bg-white px-4 py-3 text-left text-xl font-black text-slate-900 shadow-sm transition",
        "hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-200",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70 hover:border-slate-200 hover:bg-slate-100"
          : "",
        isDragging ? "z-50 scale-105 border-emerald-500 shadow-soft" : "",
      ].join(" ")}
      disabled={disabled}
      ref={setNodeRef}
      style={style}
      type="button"
      {...listeners}
      {...attributes}
    >
      <span>{choice.label}</span>
      {disabled ? (
        <span className="ml-2 text-sm font-black text-slate-400">사용 중</span>
      ) : null}
    </button>
  );
}
