"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { useRouter } from "next/navigation";

import { createStage } from "@/lib/stageService";
import type {
  Blank,
  BlankAcceptedType,
  Choice,
  FlowEdge,
  FlowNode,
  FlowNodeType,
  FlowPoint,
  Stage,
  StageDifficulty,
} from "@/types/stage";

const nodeTypes: { label: string; type: FlowNodeType }[] = [
  { label: "시작", type: "start" },
  { label: "종료", type: "end" },
  { label: "입력", type: "input" },
  { label: "처리", type: "process" },
  { label: "조건", type: "condition" },
  { label: "출력", type: "output" },
];

const difficultyOptions: { label: string; value: StageDifficulty }[] = [
  { label: "쉬움", value: "easy" },
  { label: "보통", value: "medium" },
  { label: "어려움", value: "hard" },
];

const defaultNodes: FlowNode[] = [
  createNode("start", 120, 80, "시작", "node-start"),
  createNode("input", 120, 210, "온도 입력", "node-input"),
  createNode(
    "condition",
    120,
    360,
    "t > {{sample-condition}}?",
    "node-condition",
  ),
  createNode("output", 480, 290, "날씨가 {{sample-hot}}", "node-yes-output"),
  createNode(
    "output",
    480,
    440,
    "날씨가 {{sample-not-hot}}",
    "node-no-output",
  ),
  createNode("end", 840, 360, "종료", "node-end"),
].map((node) => {
  if (node.id === "node-condition") {
    return {
      ...node,
      blanks: [
        {
          id: "sample-condition",
          acceptedType: "number",
          answer: "30",
          placeholder: "30",
        },
      ],
    };
  }

  if (node.id === "node-yes-output") {
    return {
      ...node,
      blanks: [
        {
          id: "sample-hot",
          acceptedType: "text",
          answer: "덥다",
          placeholder: "덥다",
        },
      ],
    };
  }

  if (node.id === "node-no-output") {
    return {
      ...node,
      blanks: [
        {
          id: "sample-not-hot",
          acceptedType: "text",
          answer: "덥지 않다",
          placeholder: "덥지 않다",
        },
      ],
    };
  }

  return node;
});

const defaultEdges: FlowEdge[] = [
  { id: "edge-start-input", from: "node-start", to: "node-input" },
  { id: "edge-input-condition", from: "node-input", to: "node-condition" },
  {
    id: "edge-condition-yes",
    from: "node-condition",
    to: "node-yes-output",
    label: "예",
  },
  {
    id: "edge-condition-no",
    from: "node-condition",
    to: "node-no-output",
    label: "아니오",
  },
  { id: "edge-yes-end", from: "node-yes-output", to: "node-end" },
  { id: "edge-no-end", from: "node-no-output", to: "node-end" },
];

const defaultChoices: Choice[] = [
  { id: "choice-30", label: "30", value: "30" },
  { id: "choice-hot", label: "덥다", value: "덥다" },
  { id: "choice-not-hot", label: "덥지 않다", value: "덥지 않다" },
];

type DragState = {
  nodeId: string;
  offsetX: number;
  offsetY: number;
};

export function TeacherFlowEditor() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [title, setTitle] = useState("온도에 따른 날씨 판단");
  const [description, setDescription] = useState(
    "조건문과 출력문 빈칸을 채워 순서도를 완성해 봅니다.",
  );
  const [difficulty, setDifficulty] = useState<StageDifficulty>("easy");
  const [nodes, setNodes] = useState<FlowNode[]>(defaultNodes);
  const [edges, setEdges] = useState<FlowEdge[]>(defaultEdges);
  const [choices, setChoices] = useState<Choice[]>(defaultChoices);
  const [selectedNodeId, setSelectedNodeId] = useState(defaultNodes[0]?.id ?? "");
  const [edgeFromId, setEdgeFromId] = useState(defaultNodes[0]?.id ?? "");
  const [edgeToId, setEdgeToId] = useState(defaultNodes[1]?.id ?? "");
  const [edgeLabel, setEdgeLabel] = useState("");
  const [blankTarget, setBlankTarget] = useState("");
  const [blankAnswer, setBlankAnswer] = useState("");
  const [newChoice, setNewChoice] = useState("");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const edgesWithPoints = useMemo(
    () => edges.map((edge) => withEdgePoints(edge, nodes)),
    [edges, nodes],
  );
  const allBlanks = nodes.flatMap((node) =>
    node.blanks.map((blank) => ({ ...blank, nodeId: node.id, nodeText: node.text })),
  );
  const canvasSize = useMemo(() => getCanvasSize(nodes), [nodes]);
  const zoomPercent = Math.round(zoom * 100);

  const handleZoomIn = () => {
    setZoom((current) => Math.min(1.6, Number((current + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((current) => Math.max(0.6, Number((current - 0.1).toFixed(2))));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const handleAddNode = (type: FlowNodeType) => {
    const index = nodes.length;
    const node = createNode(
      type,
      120 + (index % 4) * 220,
      90 + Math.floor(index / 4) * 150,
      getDefaultNodeText(type),
    );

    setNodes((current) => [...current, node]);
    setSelectedNodeId(node.id);
    setMessage("노드가 추가되었습니다.");
    setErrorMessage("");
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLButtonElement>,
    node: FlowNode,
  ) => {
    if (!canvasRef.current) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    setSelectedNodeId(node.id);
    setDragState({
      nodeId: node.id,
      offsetX: (event.clientX - rect.left) / zoom - node.x,
      offsetY: (event.clientY - rect.top) / zoom - node.y,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!dragState || !canvasRef.current) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const nextX = (event.clientX - rect.left) / zoom - dragState.offsetX;
    const nextY = (event.clientY - rect.top) / zoom - dragState.offsetY;

    setNodes((current) =>
      current.map((node) =>
        node.id === dragState.nodeId
          ? {
              ...node,
              x: Math.max(24, Math.round(nextX)),
              y: Math.max(24, Math.round(nextY)),
            }
          : node,
      ),
    );
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  const updateSelectedNode = (updates: Partial<FlowNode>) => {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId ? { ...node, ...updates } : node,
      ),
    );
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) {
      return;
    }

    const nextNodes = nodes.filter((node) => node.id !== selectedNode.id);
    setNodes(nextNodes);
    setEdges((current) =>
      current.filter(
        (edge) => edge.from !== selectedNode.id && edge.to !== selectedNode.id,
      ),
    );
    setSelectedNodeId(nextNodes[0]?.id ?? "");
    setEdgeFromId((current) =>
      current === selectedNode.id ? (nextNodes[0]?.id ?? "") : current,
    );
    setEdgeToId((current) =>
      current === selectedNode.id ? (nextNodes[1]?.id ?? nextNodes[0]?.id ?? "") : current,
    );
  };

  const handleAddEdge = () => {
    setErrorMessage("");

    if (!edgeFromId || !edgeToId || edgeFromId === edgeToId) {
      setErrorMessage("서로 다른 두 노드를 선택해 주세요.");
      return;
    }

    const fromNode = nodes.find((node) => node.id === edgeFromId);
    const label = fromNode?.type === "condition" ? edgeLabel.trim() : "";

    setEdges((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        from: edgeFromId,
        to: edgeToId,
        ...(label ? { label } : {}),
      },
    ]);
    setMessage("연결선이 추가되었습니다.");
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((current) => current.filter((edge) => edge.id !== edgeId));
  };

  const handleAddChoice = () => {
    const value = newChoice.trim();

    if (!value) {
      return;
    }

    setChoices((current) => [
      ...current,
      { id: crypto.randomUUID(), label: value, value },
    ]);
    setNewChoice("");
  };

  const handleUpdateChoice = (
    choiceId: string,
    key: "label" | "value",
    value: string,
  ) => {
    setChoices((current) =>
      current.map((choice) =>
        choice.id === choiceId ? { ...choice, [key]: value } : choice,
      ),
    );
  };

  const handleDeleteChoice = (choiceId: string) => {
    setChoices((current) => current.filter((choice) => choice.id !== choiceId));
  };

  const handleAddBlank = () => {
    setErrorMessage("");

    if (!selectedNode) {
      setErrorMessage("빈칸을 넣을 노드를 먼저 선택해 주세요.");
      return;
    }

    const target = blankTarget.trim();
    const answer = blankAnswer.trim();

    if (!target || !answer) {
      setErrorMessage("빈칸으로 만들 텍스트와 정답을 모두 입력해 주세요.");
      return;
    }

    if (!selectedNode.text.includes(target)) {
      setErrorMessage("선택한 노드 문장 안에 빈칸으로 만들 텍스트가 없습니다.");
      return;
    }

    const blank: Blank = {
      id: crypto.randomUUID(),
      acceptedType: inferAcceptedType(answer),
      answer,
      placeholder: target,
    };
    const nextText = selectedNode.text.replace(target, `{{${blank.id}}}`);

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode.id
          ? { ...node, text: nextText, blanks: [...node.blanks, blank] }
          : node,
      ),
    );
    setBlankTarget("");
    setBlankAnswer("");
    setMessage("빈칸이 추가되었습니다.");
  };

  const handleDeleteBlank = (nodeId: string, blank: Blank) => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,
          blanks: node.blanks.filter((item) => item.id !== blank.id),
          text: node.text.replace(`{{${blank.id}}}`, blank.placeholder),
        };
      }),
    );
  };

  const handleSave = async () => {
    setMessage("");
    setErrorMessage("");

    const validationError = validateStageInput({
      title,
      nodes,
      edges,
      choices,
    });

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date();
      const stage: Stage = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        difficulty,
        problemType: "flowchart-fill-blank",
        createdAt: now,
        updatedAt: now,
        nodes: nodes.map((node) => ({
          ...node,
          text: node.text.trim(),
          blanks: node.blanks.map((blank) => ({
            ...blank,
            answer: blank.answer.trim(),
            placeholder: blank.placeholder.trim(),
          })),
        })),
        edges: edgesWithPoints,
        choices: choices.map((choice) => ({
          ...choice,
          label: choice.label.trim(),
          value: choice.value.trim(),
        })),
      };

      await createStage(stage);
      setMessage("문제가 저장되었습니다.");
      router.push("/teacher");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "저장 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-700">
                자유 편집 방식
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-normal">
                순서도 문제 만들기
              </h1>
              <p className="mt-2 text-base font-semibold text-slate-600">
                노드를 추가하고 드래그해서 배치한 뒤, 연결선과 빈칸을 직접
                설정할 수 있습니다.
              </p>
            </div>
            <button
              className="rounded-[8px] bg-emerald-600 px-6 py-4 text-lg font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSaving}
              onClick={handleSave}
              type="button"
            >
              {isSaving ? "저장 중..." : "Firestore에 저장"}
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1.5fr_180px]">
            <label className="text-sm font-black text-slate-700">
              문제 제목
              <input
                className="mt-2 w-full rounded-[8px] border border-slate-300 bg-white px-4 py-3 text-base font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </label>
            <label className="text-sm font-black text-slate-700">
              문제 설명
              <input
                className="mt-2 w-full rounded-[8px] border border-slate-300 bg-white px-4 py-3 text-base font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </label>
            <label className="text-sm font-black text-slate-700">
              난이도
              <select
                className="mt-2 w-full rounded-[8px] border border-slate-300 bg-white px-4 py-3 text-base font-bold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                onChange={(event) =>
                  setDifficulty(event.target.value as StageDifficulty)
                }
                value={difficulty}
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {message ? (
            <p className="mt-4 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-black text-emerald-800">
              {message}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-base font-black text-rose-800">
              {errorMessage}
            </p>
          ) : null}
        </header>

        <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)_360px]">
          <aside className="space-y-4 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
            <section>
              <h2 className="text-lg font-black">노드 추가</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {nodeTypes.map((nodeType) => (
                  <button
                    className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-3 text-base font-black transition hover:border-emerald-400 hover:bg-emerald-50"
                    key={nodeType.type}
                    onClick={() => handleAddNode(nodeType.type)}
                    type="button"
                  >
                    {nodeType.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t border-slate-200 pt-4">
              <h2 className="text-lg font-black">선택지</h2>
              <div className="mt-3 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-[8px] border border-slate-300 px-3 py-2 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) => setNewChoice(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleAddChoice();
                    }
                  }}
                  placeholder="예: 30"
                  value={newChoice}
                />
                <button
                  className="rounded-[8px] bg-slate-900 px-4 py-2 font-black text-white"
                  onClick={handleAddChoice}
                  type="button"
                >
                  추가
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {choices.map((choice) => (
                  <div className="rounded-[8px] border border-slate-200 p-2" key={choice.id}>
                    <input
                      aria-label="선택지 라벨"
                      className="mb-2 w-full rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-bold"
                      onChange={(event) =>
                        handleUpdateChoice(choice.id, "label", event.target.value)
                      }
                      value={choice.label}
                    />
                    <div className="flex gap-2">
                      <input
                        aria-label="선택지 값"
                        className="min-w-0 flex-1 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-bold"
                        onChange={(event) =>
                          handleUpdateChoice(choice.id, "value", event.target.value)
                        }
                        value={choice.value}
                      />
                      <button
                        className="rounded-[8px] border border-rose-200 px-3 py-2 text-sm font-black text-rose-700"
                        onClick={() => handleDeleteChoice(choice.id)}
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">픽셀보드</h2>
                <p className="text-sm font-bold text-slate-500">
                  {zoomPercent}% 배율로 편집 중
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="축소"
                  className="h-10 w-10 rounded-[8px] border border-slate-200 bg-slate-50 text-xl font-black transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={zoom <= 0.6}
                  onClick={handleZoomOut}
                  type="button"
                >
                  -
                </button>
                <button
                  className="h-10 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-black transition hover:border-emerald-400 hover:bg-emerald-50"
                  onClick={handleZoomReset}
                  type="button"
                >
                  100%
                </button>
                <button
                  aria-label="확대"
                  className="h-10 w-10 rounded-[8px] border border-slate-200 bg-slate-50 text-xl font-black transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={zoom >= 1.6}
                  onClick={handleZoomIn}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
            <div className="overflow-auto rounded-[8px] border border-slate-100">
              <div
                style={{
                  width: canvasSize.width * zoom,
                  height: canvasSize.height * zoom,
                }}
              >
                <div
                  className="relative bg-slate-50"
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  ref={canvasRef}
                  style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
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
                viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              >
                <defs>
                  <marker
                    id="teacher-arrow"
                    markerHeight="12"
                    markerWidth="12"
                    orient="auto"
                    refX="10"
                    refY="6"
                  >
                    <path d="M1,1 L11,6 L1,11 Z" fill="#334155" />
                  </marker>
                </defs>
                {edgesWithPoints.map((edge) => (
                  <EditableEdge edge={edge} key={edge.id} />
                ))}
              </svg>

              {nodes.map((node) => (
                <button
                  className={[
                    "absolute flex cursor-grab items-center justify-center drop-shadow-sm active:cursor-grabbing",
                    selectedNodeId === node.id
                      ? "ring-4 ring-emerald-300"
                      : "ring-0",
                  ].join(" ")}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onPointerDown={(event) => handlePointerDown(event, node)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                  }}
                  type="button"
                >
                  <span className={getNodeFrameClass(node.type)} />
                  <span className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center text-xl font-black leading-8 text-slate-950">
                    <EditableNodeText node={node} />
                  </span>
                </button>
              ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
            <section>
              <h2 className="text-lg font-black">선택한 노드</h2>
              {selectedNode ? (
                <div className="mt-3 space-y-3">
                  <p className="rounded-[8px] bg-slate-100 px-3 py-2 text-sm font-black text-slate-700">
                    {getNodeTypeLabel(selectedNode.type)}
                  </p>
                  <label className="block text-sm font-black text-slate-700">
                    노드 문장
                    <textarea
                      className="mt-2 min-h-28 w-full rounded-[8px] border border-slate-300 px-3 py-2 text-base font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      onChange={(event) =>
                        updateSelectedNode({ text: event.target.value })
                      }
                      value={selectedNode.text}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-sm font-black text-slate-700">
                      너비
                      <input
                        className="mt-1 w-full rounded-[8px] border border-slate-300 px-3 py-2 font-bold"
                        min={120}
                        onChange={(event) =>
                          updateSelectedNode({
                            width: Number(event.target.value) || selectedNode.width,
                          })
                        }
                        type="number"
                        value={selectedNode.width}
                      />
                    </label>
                    <label className="text-sm font-black text-slate-700">
                      높이
                      <input
                        className="mt-1 w-full rounded-[8px] border border-slate-300 px-3 py-2 font-bold"
                        min={70}
                        onChange={(event) =>
                          updateSelectedNode({
                            height:
                              Number(event.target.value) || selectedNode.height,
                          })
                        }
                        type="number"
                        value={selectedNode.height}
                      />
                    </label>
                  </div>
                  <button
                    className="w-full rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 font-black text-rose-700"
                    onClick={handleDeleteSelectedNode}
                    type="button"
                  >
                    노드 삭제
                  </button>
                </div>
              ) : (
                <p className="mt-3 rounded-[8px] bg-slate-100 px-3 py-3 font-bold text-slate-600">
                  편집할 노드를 선택해 주세요.
                </p>
              )}
            </section>

            <section className="border-t border-slate-200 pt-4">
              <h2 className="text-lg font-black">빈칸 만들기</h2>
              <div className="mt-3 space-y-3">
                <input
                  className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) => setBlankTarget(event.target.value)}
                  placeholder="빈칸으로 만들 텍스트"
                  value={blankTarget}
                />
                <input
                  className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) => setBlankAnswer(event.target.value)}
                  placeholder="정답"
                  value={blankAnswer}
                />
                <button
                  className="w-full rounded-[8px] bg-amber-500 px-4 py-3 font-black text-white"
                  onClick={handleAddBlank}
                  type="button"
                >
                  선택 노드에 빈칸 추가
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {allBlanks.map((blank) => (
                  <div
                    className="rounded-[8px] border border-amber-200 bg-amber-50 p-3"
                    key={blank.id}
                  >
                    <p className="text-sm font-black text-amber-900">
                      {blank.placeholder} → {blank.answer}
                    </p>
                    <button
                      className="mt-2 text-sm font-black text-rose-700"
                      onClick={() => handleDeleteBlank(blank.nodeId, blank)}
                      type="button"
                    >
                      빈칸 삭제
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-slate-200 pt-4">
              <h2 className="text-lg font-black">연결선</h2>
              <div className="mt-3 space-y-2">
                <select
                  className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-bold"
                  onChange={(event) => setEdgeFromId(event.target.value)}
                  value={edgeFromId}
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      출발: {getNodeSummary(node)}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded-[8px] border border-slate-300 px-3 py-2 font-bold"
                  onChange={(event) => setEdgeToId(event.target.value)}
                  value={edgeToId}
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      도착: {getNodeSummary(node)}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <input
                    className="min-w-0 rounded-[8px] border border-slate-300 px-3 py-2 font-bold"
                    onChange={(event) => setEdgeLabel(event.target.value)}
                    placeholder="라벨"
                    value={edgeLabel}
                  />
                  <button
                    className="rounded-[8px] border border-emerald-200 px-3 py-2 font-black text-emerald-700"
                    onClick={() => setEdgeLabel("예")}
                    type="button"
                  >
                    예
                  </button>
                  <button
                    className="rounded-[8px] border border-sky-200 px-3 py-2 font-black text-sky-700"
                    onClick={() => setEdgeLabel("아니오")}
                    type="button"
                  >
                    아니오
                  </button>
                </div>
                <button
                  className="w-full rounded-[8px] bg-slate-900 px-4 py-3 font-black text-white"
                  onClick={handleAddEdge}
                  type="button"
                >
                  연결선 추가
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {edges.map((edge) => (
                  <div
                    className="flex items-center justify-between gap-2 rounded-[8px] border border-slate-200 p-2 text-sm font-bold"
                    key={edge.id}
                  >
                    <span className="min-w-0 truncate">
                      {getNodeSummaryById(edge.from, nodes)} →{" "}
                      {getNodeSummaryById(edge.to, nodes)}
                      {edge.label ? ` (${edge.label})` : ""}
                    </span>
                    <button
                      className="shrink-0 text-sm font-black text-rose-700"
                      onClick={() => handleDeleteEdge(edge.id)}
                      type="button"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function EditableNodeText({ node }: { node: FlowNode }) {
  const parts = node.text.split(/(\{\{[^}]+\}\})/g);

  return (
    <span className="flex flex-wrap items-center justify-center gap-2">
      {parts.map((part, index) => {
        const blankId = part.match(/^\{\{([^}]+)\}\}$/)?.[1];

        if (!blankId) {
          return <span key={`${node.id}-text-${index}`}>{part}</span>;
        }

        const blank = node.blanks.find((item) => item.id === blankId);

        return (
          <span
            className="inline-flex min-h-10 min-w-20 items-center justify-center rounded-[8px] border-2 border-dashed border-amber-500 bg-white px-3 py-1 text-base font-black text-amber-800"
            key={`${node.id}-blank-${blankId}`}
          >
            {blank?.placeholder ?? "빈칸"}
          </span>
        );
      })}
    </span>
  );
}

function EditableEdge({ edge }: { edge: FlowEdge }) {
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
        markerEnd="url(#teacher-arrow)"
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

function createNode(
  type: FlowNodeType,
  x: number,
  y: number,
  text: string,
  id = crypto.randomUUID(),
): FlowNode {
  return {
    id,
    type,
    x,
    y,
    text,
    blanks: [],
    width: type === "condition" ? 230 : 220,
    height: type === "condition" ? 140 : 96,
  };
}

function getDefaultNodeText(type: FlowNodeType) {
  switch (type) {
    case "start":
      return "시작";
    case "end":
      return "종료";
    case "input":
      return "값 입력";
    case "condition":
      return "조건?";
    case "output":
      return "결과 출력";
    case "process":
    default:
      return "처리";
  }
}

function getNodeFrameClass(type: FlowNode["type"]) {
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

function getNodeTypeLabel(type: FlowNodeType) {
  return nodeTypes.find((nodeType) => nodeType.type === type)?.label ?? type;
}

function getNodeSummary(node: FlowNode) {
  const plainText = node.text.replace(/\{\{[^}]+\}\}/g, "빈칸");
  return `${getNodeTypeLabel(node.type)} - ${plainText.slice(0, 18)}`;
}

function getNodeSummaryById(nodeId: string, nodes: FlowNode[]) {
  const node = nodes.find((item) => item.id === nodeId);

  return node ? getNodeSummary(node) : "삭제된 노드";
}

function withEdgePoints(edge: FlowEdge, nodes: FlowNode[]): FlowEdge {
  const from = nodes.find((node) => node.id === edge.from);
  const to = nodes.find((node) => node.id === edge.to);

  if (!from || !to) {
    return { ...edge, points: [] };
  }

  return {
    ...edge,
    points: getEdgePoints(from, to),
  };
}

function getEdgePoints(from: FlowNode, to: FlowNode): FlowPoint[] {
  const fromCenter = getNodeCenter(from);
  const toCenter = getNodeCenter(to);
  const horizontalDistance = Math.abs(toCenter.x - fromCenter.x);
  const verticalDistance = Math.abs(toCenter.y - fromCenter.y);

  if (horizontalDistance > verticalDistance) {
    const startX = toCenter.x > fromCenter.x ? from.x + from.width : from.x;
    const endX = toCenter.x > fromCenter.x ? to.x : to.x + to.width;
    const midX = (startX + endX) / 2;

    return [
      { x: startX, y: fromCenter.y },
      { x: midX, y: fromCenter.y },
      { x: midX, y: toCenter.y },
      { x: endX, y: toCenter.y },
    ];
  }

  const startY = toCenter.y > fromCenter.y ? from.y + from.height : from.y;
  const endY = toCenter.y > fromCenter.y ? to.y : to.y + to.height;
  const midY = (startY + endY) / 2;

  return [
    { x: fromCenter.x, y: startY },
    { x: fromCenter.x, y: midY },
    { x: toCenter.x, y: midY },
    { x: toCenter.x, y: endY },
  ];
}

function getNodeCenter(node: FlowNode) {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

function getLabelPoint(points: FlowPoint[]) {
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

function getCanvasSize(nodes: FlowNode[]) {
  if (nodes.length === 0) {
    return {
      width: 1120,
      height: 720,
    };
  }

  return {
    width: Math.max(...nodes.map((node) => node.x + node.width), 1040) + 80,
    height: Math.max(...nodes.map((node) => node.y + node.height), 640) + 80,
  };
}

function inferAcceptedType(value: string): BlankAcceptedType {
  if (/^-?\d+(\.\d+)?$/.test(value.trim())) {
    return "number";
  }

  if (/^(==|===|!=|!==|>=|<=|>|<|\+|-|\*|\/|%)$/.test(value.trim())) {
    return "operator";
  }

  return "text";
}

function validateStageInput({
  title,
  nodes,
  edges,
  choices,
}: {
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  choices: Choice[];
}) {
  const trimmedChoices = choices.map((choice) => choice.value.trim()).filter(Boolean);
  const blanks = nodes.flatMap((node) => node.blanks);

  if (!title.trim()) {
    return "제목을 입력해 주세요.";
  }

  if (nodes.length < 2) {
    return "노드를 2개 이상 만들어 주세요.";
  }

  if (edges.length < 1) {
    return "연결선을 1개 이상 만들어 주세요.";
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const hasMissingEdgeNode = edges.some(
    (edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to),
  );

  if (hasMissingEdgeNode) {
    return "삭제된 노드와 연결된 연결선이 있습니다. 연결선을 다시 확인해 주세요.";
  }

  if (trimmedChoices.length < 1) {
    return "학생에게 제공할 선택지를 1개 이상 입력해 주세요.";
  }

  if (blanks.length < 1) {
    return "빈칸을 1개 이상 만들어 주세요.";
  }

  const missingAnswer = blanks.find(
    (blank) => !trimmedChoices.includes(blank.answer.trim()),
  );

  if (missingAnswer) {
    return `빈칸 정답 "${missingAnswer.answer}"이 선택지 목록에 없습니다.`;
  }

  return "";
}
