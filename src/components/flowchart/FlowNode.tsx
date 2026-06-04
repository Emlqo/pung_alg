import type {
  FlowNode as FlowNodeType,
  StudentBlankAnswers,
} from "@/types/stage";

import { DropBlank } from "./DropBlank";

type BlankResultMap = Record<string, "correct" | "incorrect">;

type FlowNodeProps = {
  node: FlowNodeType;
  answers: StudentBlankAnswers;
  blankResults: BlankResultMap;
  hasSelectedChoice?: boolean;
  onBlankClick?: (blankId: string) => void;
  onRemoveAnswer?: (blankId: string) => void;
};

export function FlowNode({
  node,
  answers,
  blankResults,
  hasSelectedChoice = false,
  onRemoveAnswer,
  onBlankClick,
}: FlowNodeProps) {
  return (
    <div
      className="absolute flex items-center justify-center drop-shadow-sm"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
    >
      <div className={getNodeFrameClass(node.type)} />
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center text-2xl font-black leading-9 text-slate-950">
        <NodeText
          answers={answers}
          blankResults={blankResults}
          hasSelectedChoice={hasSelectedChoice}
          node={node}
          onBlankClick={onBlankClick}
          onRemoveAnswer={onRemoveAnswer}
        />
      </div>
    </div>
  );
}

function NodeText({
  node,
  answers,
  blankResults,
  hasSelectedChoice,
  onRemoveAnswer,
  onBlankClick,
}: {
  node: FlowNodeType;
  answers: StudentBlankAnswers;
  blankResults: BlankResultMap;
  hasSelectedChoice: boolean;
  onBlankClick?: (blankId: string) => void;
  onRemoveAnswer?: (blankId: string) => void;
}) {
  const parts = node.text.split(/(\{\{[^}]+\}\})/g);

  return (
    <span className="flex flex-wrap items-center justify-center gap-2">
      {parts.map((part, index) => {
        const blankId = part.match(/^\{\{([^}]+)\}\}$/)?.[1];

        if (!blankId) {
          return <span key={`${node.id}-text-${index}`}>{part}</span>;
        }

        const blank = node.blanks.find((item) => item.id === blankId);

        if (!blank) {
          return (
            <span
              className="rounded-[8px] bg-rose-100 px-2 py-1 text-rose-700"
              key={`${node.id}-missing-${blankId}`}
            >
              빈칸 없음
            </span>
          );
        }

        return (
          <DropBlank
            blank={blank}
            hasSelectedChoice={hasSelectedChoice}
            key={blank.id}
            onBlankClick={onBlankClick}
            onRemove={onRemoveAnswer}
            result={blankResults[blank.id]}
            value={answers[blank.id]}
          />
        );
      })}
    </span>
  );
}

function getNodeFrameClass(type: FlowNodeType["type"]) {
  const base = "absolute inset-0 border-[5px] bg-white shadow-sm transition";

  switch (type) {
    case "start":
    case "end":
      return `${base} rounded-full border-emerald-500 bg-emerald-50`;
    case "input":
    case "output":
      return `${base} border-sky-500 bg-sky-50 [clip-path:polygon(16%_0,100%_0,84%_100%,0_100%)]`;
    case "condition":
      return `${base} border-amber-500 bg-amber-50 [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]`;
    case "process":
    default:
      return `${base} rounded-[8px] border-indigo-500 bg-indigo-50`;
  }
}
