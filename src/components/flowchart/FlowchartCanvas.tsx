"use client";

import { useState } from "react";

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
  hasSelectedChoice?: boolean;
  defaultZoom?: number;
  onBlankClick?: (blankId: string) => void;
  onRemoveAnswer?: (blankId: string) => void;
};

export function FlowchartCanvas({
  nodes,
  edges,
  answers,
  blankResults,
  hasSelectedChoice = false,
  defaultZoom = 1,
  onBlankClick,
  onRemoveAnswer,
}: FlowchartCanvasProps) {
  const [zoom, setZoom] = useState(defaultZoom);
  const edgePoints = edges.flatMap((edge) => edge.points ?? []);
  const canvasWidth =
    Math.max(
      ...nodes.map((node) => node.x + node.width),
      ...edgePoints.map((point) => point.x),
      860,
    ) + 80;
  const canvasHeight =
    Math.max(
      ...nodes.map((node) => node.y + node.height),
      ...edgePoints.map((point) => point.y),
      680,
    ) + 80;
  const zoomPercent = Math.round(zoom * 100);

  const handleZoomOut = () => {
    setZoom((current) => Math.max(0.65, Number((current - 0.1).toFixed(2))));
  };

  const handleZoomIn = () => {
    setZoom((current) => Math.min(1.15, Number((current + 0.1).toFixed(2))));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-3 shadow-soft sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">순서도</h2>
          <p className="text-sm font-bold text-slate-500">
            보기 배율 {zoomPercent}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="순서도 축소"
            className="h-10 w-10 rounded-[8px] border border-slate-200 bg-slate-50 text-xl font-black text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={zoom <= 0.65}
            onClick={handleZoomOut}
            type="button"
          >
            -
          </button>
          <button
            className="h-10 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"
            onClick={handleZoomReset}
            type="button"
          >
            100%
          </button>
          <button
            aria-label="순서도 확대"
            className="h-10 w-10 rounded-[8px] border border-slate-200 bg-slate-50 text-xl font-black text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={zoom >= 1.15}
            onClick={handleZoomIn}
            type="button"
          >
            +
          </button>
        </div>
      </div>
      <div
        className="overflow-auto rounded-[8px] border border-slate-100 bg-white"
        style={{
          maxHeight: "calc(100vh - 220px)",
        }}
      >
        <div
          style={{
            width: canvasWidth * zoom,
            height: canvasHeight * zoom,
          }}
        >
          <div
            className="relative rounded-[8px] border border-slate-100 bg-slate-50"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
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
                hasSelectedChoice={hasSelectedChoice}
                key={node.id}
                node={node}
                onBlankClick={onBlankClick}
                onRemoveAnswer={onRemoveAnswer}
              />
            ))}
          </div>
        </div>
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
