import type {
  FlowEdge,
  FlowNode as FlowNodeType,
  StudentBlankAnswers,
} from "@/types/stage";

import { FlowNode } from "./FlowNode";

type FlowchartCanvasProps = {
  nodes: FlowNodeType[];
  edges: FlowEdge[];
  answers: StudentBlankAnswers;
  blankResults: Record<string, "correct" | "incorrect">;
  onRemoveAnswer?: (blankId: string) => void;
};

export function FlowchartCanvas({
  nodes,
  edges,
  answers,
  blankResults,
  onRemoveAnswer,
}: FlowchartCanvasProps) {
  const canvasWidth =
    Math.max(...nodes.map((node) => node.x + node.width), 860) + 80;
  const canvasHeight =
    Math.max(...nodes.map((node) => node.y + node.height), 680) + 80;

  return (
    <section className="overflow-x-auto overflow-y-hidden rounded-[8px] border border-slate-200 bg-white p-3 shadow-soft sm:p-5">
      <div
        className="relative rounded-[8px] border border-slate-100 bg-slate-50"
        style={{
          minWidth: canvasWidth,
          height: canvasHeight,
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        >
          <defs>
            <marker
              id="arrow"
              markerHeight="12"
              markerWidth="12"
              orient="auto"
              refX="10"
              refY="6"
            >
              <path d="M1,1 L11,6 L1,11 Z" fill="#334155" />
            </marker>
          </defs>
          {edges.map((edge) => (
            <EdgePath edge={edge} key={edge.id} />
          ))}
        </svg>

        {nodes.map((node) => (
          <FlowNode
            answers={answers}
            blankResults={blankResults}
            key={node.id}
            node={node}
            onRemoveAnswer={onRemoveAnswer}
          />
        ))}
      </div>
    </section>
  );
}

function EdgePath({ edge }: { edge: FlowEdge }) {
  if (!edge.points || edge.points.length < 2) {
    return null;
  }

  const points = edge.points.map((point) => `${point.x},${point.y}`).join(" ");
  const labelPoint = getLabelPoint(edge.points);
  const labelWidth = edge.label ? Math.max(54, edge.label.length * 22 + 24) : 0;

  return (
    <g>
      <polyline
        fill="none"
        points={points}
        stroke="#cbd5e1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="9"
      />
      <polyline
        fill="none"
        markerEnd="url(#arrow)"
        points={points}
        stroke="#334155"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.5"
      />
      {edge.label ? (
        <g transform={`translate(${labelPoint.x}, ${labelPoint.y})`}>
          <rect
            fill="#ffffff"
            height="34"
            rx="17"
            stroke="#10b981"
            strokeWidth="2"
            width={labelWidth}
            x={-labelWidth / 2}
            y="-17"
          />
          <text
            dominantBaseline="middle"
            fill="#047857"
            fontSize="18"
            fontWeight="900"
            textAnchor="middle"
          >
            {edge.label}
          </text>
        </g>
      ) : null}
    </g>
  );
}

function getLabelPoint(points: { x: number; y: number }[]) {
  let bestSegment = {
    from: points[0],
    to: points[1],
    length: 0,
  };

  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    const length = Math.hypot(to.x - from.x, to.y - from.y);

    if (length > bestSegment.length) {
      bestSegment = { from, to, length };
    }
  }

  const midX = (bestSegment.from.x + bestSegment.to.x) / 2;
  const midY = (bestSegment.from.y + bestSegment.to.y) / 2;
  const isHorizontal =
    Math.abs(bestSegment.to.x - bestSegment.from.x) >
    Math.abs(bestSegment.to.y - bestSegment.from.y);

  return {
    x: midX,
    y: isHorizontal ? midY - 24 : midY,
  };
}
