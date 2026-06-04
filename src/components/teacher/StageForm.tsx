"use client";

import { useMemo, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { useRouter } from "next/navigation";

import { FlowchartCanvas } from "@/components/flowchart/FlowchartCanvas";
import type {
  Blank,
  BlankAcceptedType,
  Choice,
  FlowEdge,
  FlowNode,
  Stage,
  StageDifficulty,
} from "@/types/stage";

type BlankLocation = "condition" | "yesOutput" | "noOutput";

type ChoiceDraft = {
  id: string;
  value: string;
};

type BlankDraft = {
  id: string;
  location: BlankLocation;
  target: string;
  answer: string;
};

type StageFormState = {
  title: string;
  description: string;
  difficulty: StageDifficulty;
  inputText: string;
  conditionText: string;
  yesOutputText: string;
  noOutputText: string;
  choices: ChoiceDraft[];
  blanks: BlankDraft[];
};

type TemplateIds = {
  stage: string;
  nodes: {
    start: string;
    input: string;
    condition: string;
    yesOutput: string;
    noOutput: string;
    end: string;
  };
  edges: {
    startToInput: string;
    inputToCondition: string;
    conditionToYes: string;
    conditionToNo: string;
    yesToEnd: string;
    noToEnd: string;
  };
  choices: Record<string, string>;
  blanks: Record<string, string>;
};

type StageFormProps = {
  heading: string;
  helperText: string;
  initialStage?: Stage;
  onSubmit: (stage: Stage) => Promise<unknown>;
  submitLabel: string;
  successMessage: string;
};

const initialForm: StageFormState = {
  title: "온도에 따른 날씨 출력",
  description:
    "입력된 온도 t가 기준보다 큰지 확인하고, 조건에 따라 알맞은 문장을 출력하는 순서도입니다.",
  difficulty: "easy",
  inputText: "온도 입력",
  conditionText: "t > 30?",
  yesOutputText: "날씨가 덥다.",
  noOutputText: "날씨가 덥지 않다.",
  choices: [
    { id: "draft-choice-30", value: "30" },
    { id: "draft-choice-hot", value: "덥다" },
    { id: "draft-choice-not-hot", value: "덥지 않다" },
    { id: "draft-choice-20", value: "20" },
    { id: "draft-choice-cold", value: "춥다" },
  ],
  blanks: [
    {
      id: "draft-blank-condition",
      location: "condition",
      target: "30",
      answer: "30",
    },
    {
      id: "draft-blank-yes",
      location: "yesOutput",
      target: "덥다",
      answer: "덥다",
    },
    {
      id: "draft-blank-no",
      location: "noOutput",
      target: "덥지 않다",
      answer: "덥지 않다",
    },
  ],
};

const previewIds: TemplateIds = {
  stage: "preview-stage",
  nodes: {
    start: "preview-node-start",
    input: "preview-node-input",
    condition: "preview-node-condition",
    yesOutput: "preview-node-yes-output",
    noOutput: "preview-node-no-output",
    end: "preview-node-end",
  },
  edges: {
    startToInput: "preview-edge-start-input",
    inputToCondition: "preview-edge-input-condition",
    conditionToYes: "preview-edge-condition-yes",
    conditionToNo: "preview-edge-condition-no",
    yesToEnd: "preview-edge-yes-end",
    noToEnd: "preview-edge-no-end",
  },
  choices: {},
  blanks: {},
};

const difficultyLabels: Record<StageDifficulty, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

const blankLocationLabels: Record<BlankLocation, string> = {
  condition: "조건문",
  yesOutput: "예 방향 출력문",
  noOutput: "아니오 방향 출력문",
};

const previewTimestamp = new Date("2026-01-01T00:00:00.000Z");

export function StageForm({
  heading,
  helperText,
  initialStage,
  onSubmit,
  submitLabel,
  successMessage,
}: StageFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<StageFormState>(() =>
    initialStage ? stageToForm(initialStage) : initialForm,
  );
  const [savedStage, setSavedStage] = useState<Stage | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  const previewStage = useMemo(
    () => buildStage(form, createPreviewIds(form, initialStage), previewTimestamp),
    [form, initialStage],
  );
  const visibleStage = savedStage ?? previewStage;

  const handleTextChange =
    (
      key: Extract<
        keyof StageFormState,
        | "title"
        | "description"
        | "difficulty"
        | "inputText"
        | "conditionText"
        | "yesOutputText"
        | "noOutputText"
      >,
    ) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>,
    ) => {
      clearSavedResult();
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
      }));
    };

  const handleChoiceChange = (id: string, value: string) => {
    clearSavedResult();
    setForm((current) => ({
      ...current,
      choices: current.choices.map((choice) =>
        choice.id === id ? { ...choice, value } : choice,
      ),
    }));
  };

  const handleAddChoice = () => {
    clearSavedResult();
    setForm((current) => ({
      ...current,
      choices: [
        ...current.choices,
        { id: `draft-choice-${crypto.randomUUID()}`, value: "" },
      ],
    }));
  };

  const handleDeleteChoice = (id: string) => {
    clearSavedResult();
    setForm((current) => ({
      ...current,
      choices: current.choices.filter((choice) => choice.id !== id),
    }));
  };

  const handleBlankChange = (
    id: string,
    field: keyof Omit<BlankDraft, "id">,
    value: string,
  ) => {
    clearSavedResult();
    setForm((current) => ({
      ...current,
      blanks: current.blanks.map((blank) =>
        blank.id === id ? { ...blank, [field]: value } : blank,
      ),
    }));
  };

  const handleAddBlank = () => {
    clearSavedResult();
    setForm((current) => ({
      ...current,
      blanks: [
        ...current.blanks,
        {
          id: `draft-blank-${crypto.randomUUID()}`,
          location: "condition",
          target: "",
          answer: "",
        },
      ],
    }));
  };

  const handleDeleteBlank = (id: string) => {
    clearSavedResult();
    setForm((current) => ({
      ...current,
      blanks: current.blanks.filter((blank) => blank.id !== id),
    }));
  };

  const handleSave = async () => {
    const errors = validateForm(form);
    setValidationErrors(errors);
    setSaveSuccessMessage("");
    setSaveErrorMessage("");

    if (errors.length > 0) {
      setSavedStage(null);
      return;
    }

    setIsSaving(true);

    try {
      const finalStage = removeUndefinedValues(
        buildStage(form, createFinalIds(form, initialStage), new Date()),
      );

      await onSubmit(finalStage);
      setSavedStage(finalStage);
      setSaveSuccessMessage(successMessage);
      window.setTimeout(() => {
        router.push("/teacher");
      }, 800);
    } catch (error) {
      setSaveErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const clearSavedResult = () => {
    setSavedStage(null);
    setValidationErrors([]);
    setSaveSuccessMessage("");
    setSaveErrorMessage("");
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[8px] border border-emerald-100 bg-white px-5 py-6 shadow-soft sm:px-7">
          <p className="text-sm font-black text-emerald-700">교사용 제작기</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
                {heading}
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
                {helperText}
              </p>
            </div>
            <button
              className="min-h-14 rounded-[8px] bg-emerald-600 px-6 text-lg font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isSaving}
              onClick={handleSave}
              type="button"
            >
              {isSaving ? "저장 중..." : submitLabel}
            </button>
          </div>
        </header>

        {saveSuccessMessage ? (
          <section className="rounded-[8px] border-2 border-emerald-200 bg-emerald-50 p-5">
            <p className="text-lg font-black text-emerald-800">
              {saveSuccessMessage}
            </p>
          </section>
        ) : null}

        {saveErrorMessage ? (
          <section className="rounded-[8px] border-2 border-rose-200 bg-rose-50 p-5">
            <h2 className="text-lg font-black text-rose-800">
              저장에 실패했습니다
            </h2>
            <p className="mt-2 text-base font-bold text-rose-700">
              {saveErrorMessage}
            </p>
          </section>
        ) : null}

        {validationErrors.length > 0 ? (
          <section className="rounded-[8px] border-2 border-rose-200 bg-rose-50 p-5">
            <h2 className="text-lg font-black text-rose-800">
              저장 전에 확인해 주세요
            </h2>
            <ul className="mt-3 grid gap-2 text-base font-bold text-rose-700">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[470px_minmax(0,1fr)]">
          <form className="min-w-0 rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
            <div className="grid gap-5">
              <Field label="문제 제목">
                <input
                  className={inputClass}
                  onChange={handleTextChange("title")}
                  value={form.title}
                />
              </Field>

              <Field label="문제 설명">
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  onChange={handleTextChange("description")}
                  value={form.description}
                />
              </Field>

              <Field label="난이도">
                <select
                  className={inputClass}
                  onChange={handleTextChange("difficulty")}
                  value={form.difficulty}
                >
                  {Object.entries(difficultyLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="입력 노드 문장">
                <input
                  className={inputClass}
                  onChange={handleTextChange("inputText")}
                  value={form.inputText}
                />
              </Field>

              <Field label="조건 노드 문장">
                <input
                  className={inputClass}
                  onChange={handleTextChange("conditionText")}
                  value={form.conditionText}
                />
              </Field>

              <Field label="예 방향 출력 문장">
                <input
                  className={inputClass}
                  onChange={handleTextChange("yesOutputText")}
                  value={form.yesOutputText}
                />
              </Field>

              <Field label="아니오 방향 출력 문장">
                <input
                  className={inputClass}
                  onChange={handleTextChange("noOutputText")}
                  value={form.noOutputText}
                />
              </Field>

              <EditableChoiceList
                choices={form.choices}
                onAdd={handleAddChoice}
                onChange={handleChoiceChange}
                onDelete={handleDeleteChoice}
              />

              <EditableBlankList
                blanks={form.blanks}
                onAdd={handleAddBlank}
                onChange={handleBlankChange}
                onDelete={handleDeleteBlank}
              />
            </div>
          </form>

          <section className="flex min-w-0 flex-col gap-4">
            <div className="min-w-0 rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-sky-700">
                    순서도 미리보기
                  </p>
                  <h2 className="text-2xl font-black text-slate-950">
                    {visibleStage.title}
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
                  {difficultyLabels[visibleStage.difficulty]}
                </span>
              </div>
              <DndContext>
                <FlowchartCanvas
                  answers={{}}
                  blankResults={{}}
                  edges={visibleStage.edges}
                  nodes={visibleStage.nodes}
                />
              </DndContext>
            </div>
          </section>
        </section>

        <section className="min-w-0 rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-700">
                생성된 Stage JSON
              </p>
              <h2 className="text-2xl font-black text-slate-950">
                {savedStage ? "저장 버튼으로 생성된 결과" : "실시간 미리보기"}
              </h2>
            </div>
            {!savedStage ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800">
                아직 저장 전
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">
                저장 완료
              </span>
            )}
          </div>
          <pre className="mt-4 max-h-[560px] overflow-auto rounded-[8px] bg-slate-950 p-4 text-sm leading-6 text-slate-100">
            {JSON.stringify(visibleStage, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}

function EditableChoiceList({
  choices,
  onAdd,
  onChange,
  onDelete,
}: {
  choices: ChoiceDraft[];
  onAdd: () => void;
  onChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-[8px] border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">선택지 목록</h2>
        <button className={smallButtonClass} onClick={onAdd} type="button">
          선택지 추가
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {choices.map((choice, index) => (
          <div className="grid grid-cols-[1fr_auto] gap-2" key={choice.id}>
            <input
              aria-label={`선택지 ${index + 1}`}
              className={inputClass}
              onChange={(event) => onChange(choice.id, event.target.value)}
              placeholder="선택지 값을 입력하세요."
              value={choice.value}
            />
            <button
              className={deleteButtonClass}
              onClick={() => onDelete(choice.id)}
              type="button"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function EditableBlankList({
  blanks,
  onAdd,
  onChange,
  onDelete,
}: {
  blanks: BlankDraft[];
  onAdd: () => void;
  onChange: (
    id: string,
    field: keyof Omit<BlankDraft, "id">,
    value: string,
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-[8px] border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">빈칸 목록</h2>
        <button className={smallButtonClass} onClick={onAdd} type="button">
          빈칸 추가
        </button>
      </div>
      <div className="mt-3 grid gap-4">
        {blanks.map((blank, index) => (
          <fieldset
            className="rounded-[8px] border border-slate-200 bg-slate-50 p-3"
            key={blank.id}
          >
            <legend className="px-2 text-sm font-black text-slate-700">
              빈칸 {index + 1}
            </legend>
            <div className="grid gap-3">
              <Field label="적용할 문장">
                <select
                  className={inputClass}
                  onChange={(event) =>
                    onChange(blank.id, "location", event.target.value)
                  }
                  value={blank.location}
                >
                  {Object.entries(blankLocationLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="빈칸으로 만들 값">
                <input
                  className={inputClass}
                  onChange={(event) =>
                    onChange(blank.id, "target", event.target.value)
                  }
                  placeholder="문장 안의 값을 입력하세요."
                  value={blank.target}
                />
              </Field>
              <Field label="정답">
                <input
                  className={inputClass}
                  onChange={(event) =>
                    onChange(blank.id, "answer", event.target.value)
                  }
                  placeholder="선택지 중 정답 값을 입력하세요."
                  value={blank.answer}
                />
              </Field>
              <button
                className={deleteButtonClass}
                onClick={() => onDelete(blank.id)}
                type="button"
              >
                빈칸 삭제
              </button>
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function stageToForm(stage: Stage): StageFormState {
  const conditionNode = findConditionNode(stage);
  const yesOutputNode = findOutputNode(stage, conditionNode?.id, "예") ?? findOutputNodeByIndex(stage, 0);
  const noOutputNode =
    findOutputNode(stage, conditionNode?.id, "아니오") ?? findOutputNodeByIndex(stage, 1);
  const inputNode = stage.nodes.find((node) => node.type === "input");
  const blanks = [
    ...blanksFromNode(conditionNode, "condition"),
    ...blanksFromNode(yesOutputNode, "yesOutput"),
    ...blanksFromNode(noOutputNode, "noOutput"),
  ];

  return {
    title: stage.title,
    description: stage.description,
    difficulty: stage.difficulty,
    inputText: inputNode?.text ?? "",
    conditionText: detokenizeText(conditionNode),
    yesOutputText: detokenizeText(yesOutputNode),
    noOutputText: detokenizeText(noOutputNode),
    choices: stage.choices.map((choice) => ({
      id: choice.id,
      value: choice.value,
    })),
    blanks,
  };
}

function buildStage(form: StageFormState, ids: TemplateIds, timestamp: Date): Stage {
  const choices = buildChoices(form.choices, ids.choices);
  const blanksByLocation = buildBlanksByLocation(form.blanks, ids.blanks);

  return {
    id: ids.stage,
    title: form.title.trim() || "새 순서도 문제",
    description: form.description.trim(),
    difficulty: form.difficulty,
    problemType: "flowchart-fill-blank",
    createdAt: timestamp,
    updatedAt: timestamp,
    nodes: buildNodes({
      ids: ids.nodes,
      inputText: form.inputText,
      conditionText: applyBlanksToText(
        form.conditionText,
        form.blanks.filter((blank) => blank.location === "condition"),
        ids.blanks,
      ),
      yesOutputText: applyBlanksToText(
        form.yesOutputText,
        form.blanks.filter((blank) => blank.location === "yesOutput"),
        ids.blanks,
      ),
      noOutputText: applyBlanksToText(
        form.noOutputText,
        form.blanks.filter((blank) => blank.location === "noOutput"),
        ids.blanks,
      ),
      conditionBlanks: blanksByLocation.condition,
      yesOutputBlanks: blanksByLocation.yesOutput,
      noOutputBlanks: blanksByLocation.noOutput,
    }),
    edges: buildEdges(ids),
    choices,
  };
}

function buildChoices(drafts: ChoiceDraft[], ids: Record<string, string>): Choice[] {
  return drafts
    .map((choice) => choice.value.trim())
    .filter(Boolean)
    .map((value, index) => {
      const draft = drafts.filter((choice) => choice.value.trim())[index];

      return {
        id: ids[draft.id],
        label: value,
        value,
      };
    });
}

function buildBlanksByLocation(
  drafts: BlankDraft[],
  ids: Record<string, string>,
): Record<BlankLocation, Blank[]> {
  return drafts.reduce<Record<BlankLocation, Blank[]>>(
    (result, draft) => {
      result[draft.location].push({
        id: ids[draft.id],
        answer: draft.answer.trim(),
        placeholder: draft.target.trim() || "빈칸",
        acceptedType: inferAcceptedType(draft.answer.trim()),
      });
      return result;
    },
    {
      condition: [],
      yesOutput: [],
      noOutput: [],
    },
  );
}

function buildNodes({
  ids,
  inputText,
  conditionText,
  yesOutputText,
  noOutputText,
  conditionBlanks,
  yesOutputBlanks,
  noOutputBlanks,
}: {
  ids: TemplateIds["nodes"];
  inputText: string;
  conditionText: string;
  yesOutputText: string;
  noOutputText: string;
  conditionBlanks: Blank[];
  yesOutputBlanks: Blank[];
  noOutputBlanks: Blank[];
}): FlowNode[] {
  return [
    {
      id: ids.start,
      type: "start",
      x: 360,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: ids.input,
      type: "input",
      x: 340,
      y: 140,
      text: inputText.trim() || "입력",
      blanks: [],
      width: 200,
      height: 72,
    },
    {
      id: ids.condition,
      type: "condition",
      x: 320,
      y: 260,
      text: conditionText.trim() || "조건",
      blanks: conditionBlanks,
      width: 280,
      height: 120,
    },
    {
      id: ids.yesOutput,
      type: "output",
      x: 80,
      y: 440,
      text: yesOutputText.trim() || "예 방향 출력",
      blanks: yesOutputBlanks,
      width: 280,
      height: 84,
    },
    {
      id: ids.noOutput,
      type: "output",
      x: 560,
      y: 440,
      text: noOutputText.trim() || "아니오 방향 출력",
      blanks: noOutputBlanks,
      width: 300,
      height: 84,
    },
    {
      id: ids.end,
      type: "end",
      x: 360,
      y: 620,
      text: "종료",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];
}

function buildEdges(ids: TemplateIds): FlowEdge[] {
  return [
    {
      id: ids.edges.startToInput,
      from: ids.nodes.start,
      to: ids.nodes.input,
      direction: "bottom",
      points: [
        { x: 440, y: 104 },
        { x: 440, y: 140 },
      ],
    },
    {
      id: ids.edges.inputToCondition,
      from: ids.nodes.input,
      to: ids.nodes.condition,
      direction: "bottom",
      points: [
        { x: 440, y: 212 },
        { x: 440, y: 260 },
      ],
    },
    {
      id: ids.edges.conditionToYes,
      from: ids.nodes.condition,
      to: ids.nodes.yesOutput,
      label: "예",
      direction: "bottom-left",
      points: [
        { x: 320, y: 340 },
        { x: 220, y: 340 },
        { x: 220, y: 440 },
      ],
    },
    {
      id: ids.edges.conditionToNo,
      from: ids.nodes.condition,
      to: ids.nodes.noOutput,
      label: "아니오",
      direction: "bottom-right",
      points: [
        { x: 600, y: 340 },
        { x: 710, y: 340 },
        { x: 710, y: 440 },
      ],
    },
    {
      id: ids.edges.yesToEnd,
      from: ids.nodes.yesOutput,
      to: ids.nodes.end,
      direction: "bottom-right",
      points: [
        { x: 220, y: 524 },
        { x: 220, y: 652 },
        { x: 360, y: 652 },
      ],
    },
    {
      id: ids.edges.noToEnd,
      from: ids.nodes.noOutput,
      to: ids.nodes.end,
      direction: "bottom-left",
      points: [
        { x: 710, y: 524 },
        { x: 710, y: 652 },
        { x: 520, y: 652 },
      ],
    },
  ];
}

function applyBlanksToText(
  text: string,
  blanks: BlankDraft[],
  blankIds: Record<string, string>,
) {
  return blanks.reduce((result, blank) => {
    const target = blank.target.trim();

    if (!target || !result.includes(target)) {
      return result;
    }

    return result.replace(target, `{{${blankIds[blank.id]}}}`);
  }, text);
}

function validateForm(form: StageFormState) {
  const errors: string[] = [];
  const choices = form.choices
    .map((choice) => choice.value.trim())
    .filter(Boolean);
  const choiceValues = new Set(choices);
  const validBlanks = form.blanks.filter(
    (blank) => blank.target.trim() && blank.answer.trim(),
  );

  if (!form.title.trim()) {
    errors.push("제목은 필수입니다.");
  }

  if (!form.conditionText.trim()) {
    errors.push("조건문은 필수입니다.");
  }

  if (!form.yesOutputText.trim() || !form.noOutputText.trim()) {
    errors.push("예 방향과 아니오 방향 출력문은 모두 필수입니다.");
  }

  if (choices.length < 1) {
    errors.push("선택지는 최소 1개 이상 필요합니다.");
  }

  if (validBlanks.length < 1) {
    errors.push("빈칸은 최소 1개 이상 필요합니다.");
  }

  form.blanks.forEach((blank, index) => {
    const answer = blank.answer.trim();

    if (!blank.target.trim() || !answer) {
      errors.push(`빈칸 ${index + 1}의 값과 정답을 모두 입력해 주세요.`);
      return;
    }

    if (!choiceValues.has(answer)) {
      errors.push(`빈칸 ${index + 1}의 정답 "${answer}"이 선택지에 없습니다.`);
    }
  });

  return errors;
}

function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefinedValues(item)) as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefinedValues(item)]),
    ) as T;
  }

  return value;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function createPreviewIds(form: StageFormState, stage?: Stage): TemplateIds {
  const existingIds = stage ? extractTemplateIds(stage) : previewIds;

  return {
    ...existingIds,
    choices: Object.fromEntries(
      form.choices.map((choice) => [
        choice.id,
        isDraftId(choice.id) ? `preview-${choice.id}` : choice.id,
      ]),
    ),
    blanks: Object.fromEntries(
      form.blanks.map((blank) => [
        blank.id,
        isDraftId(blank.id) ? `preview-${blank.id}` : blank.id,
      ]),
    ),
  };
}

function createFinalIds(form: StageFormState, stage?: Stage): TemplateIds {
  const existingIds = stage ? extractTemplateIds(stage) : undefined;

  return {
    stage: stage?.id ?? crypto.randomUUID(),
    nodes: {
      start: existingIds?.nodes.start ?? crypto.randomUUID(),
      input: existingIds?.nodes.input ?? crypto.randomUUID(),
      condition: existingIds?.nodes.condition ?? crypto.randomUUID(),
      yesOutput: existingIds?.nodes.yesOutput ?? crypto.randomUUID(),
      noOutput: existingIds?.nodes.noOutput ?? crypto.randomUUID(),
      end: existingIds?.nodes.end ?? crypto.randomUUID(),
    },
    edges: {
      startToInput: existingIds?.edges.startToInput ?? crypto.randomUUID(),
      inputToCondition:
        existingIds?.edges.inputToCondition ?? crypto.randomUUID(),
      conditionToYes: existingIds?.edges.conditionToYes ?? crypto.randomUUID(),
      conditionToNo: existingIds?.edges.conditionToNo ?? crypto.randomUUID(),
      yesToEnd: existingIds?.edges.yesToEnd ?? crypto.randomUUID(),
      noToEnd: existingIds?.edges.noToEnd ?? crypto.randomUUID(),
    },
    choices: Object.fromEntries(
      form.choices.map((choice) => [
        choice.id,
        isDraftId(choice.id) ? crypto.randomUUID() : choice.id,
      ]),
    ),
    blanks: Object.fromEntries(
      form.blanks.map((blank) => [
        blank.id,
        isDraftId(blank.id) ? crypto.randomUUID() : blank.id,
      ]),
    ),
  };
}

function extractTemplateIds(stage: Stage): TemplateIds {
  const conditionNode = findConditionNode(stage);
  const yesOutputNode = findOutputNode(stage, conditionNode?.id, "예") ?? findOutputNodeByIndex(stage, 0);
  const noOutputNode =
    findOutputNode(stage, conditionNode?.id, "아니오") ?? findOutputNodeByIndex(stage, 1);
  const inputNode = stage.nodes.find((node) => node.type === "input");
  const startNode = stage.nodes.find((node) => node.type === "start");
  const endNode = stage.nodes.find((node) => node.type === "end");

  return {
    stage: stage.id,
    nodes: {
      start: startNode?.id ?? "preview-node-start",
      input: inputNode?.id ?? "preview-node-input",
      condition: conditionNode?.id ?? "preview-node-condition",
      yesOutput: yesOutputNode?.id ?? "preview-node-yes-output",
      noOutput: noOutputNode?.id ?? "preview-node-no-output",
      end: endNode?.id ?? "preview-node-end",
    },
    edges: {
      startToInput:
        findEdge(stage, startNode?.id, inputNode?.id)?.id ??
        "preview-edge-start-input",
      inputToCondition:
        findEdge(stage, inputNode?.id, conditionNode?.id)?.id ??
        "preview-edge-input-condition",
      conditionToYes:
        findEdge(stage, conditionNode?.id, yesOutputNode?.id)?.id ??
        "preview-edge-condition-yes",
      conditionToNo:
        findEdge(stage, conditionNode?.id, noOutputNode?.id)?.id ??
        "preview-edge-condition-no",
      yesToEnd:
        findEdge(stage, yesOutputNode?.id, endNode?.id)?.id ??
        "preview-edge-yes-end",
      noToEnd:
        findEdge(stage, noOutputNode?.id, endNode?.id)?.id ??
        "preview-edge-no-end",
    },
    choices: Object.fromEntries(stage.choices.map((choice) => [choice.id, choice.id])),
    blanks: Object.fromEntries(
      stage.nodes
        .flatMap((node) => node.blanks)
        .map((blank) => [blank.id, blank.id]),
    ),
  };
}

function findConditionNode(stage: Stage) {
  return stage.nodes.find((node) => node.type === "condition");
}

function findOutputNode(stage: Stage, conditionNodeId: string | undefined, label: string) {
  const edge = stage.edges.find(
    (item) => item.from === conditionNodeId && item.label === label,
  );

  return stage.nodes.find((node) => node.id === edge?.to);
}

function findOutputNodeByIndex(stage: Stage, index: number) {
  return stage.nodes.filter((node) => node.type === "output")[index];
}

function findEdge(stage: Stage, from: string | undefined, to: string | undefined) {
  return stage.edges.find((edge) => edge.from === from && edge.to === to);
}

function blanksFromNode(
  node: FlowNode | undefined,
  location: BlankLocation,
): BlankDraft[] {
  return (
    node?.blanks.map((blank) => ({
      id: blank.id,
      location,
      target: blank.placeholder || blank.answer,
      answer: blank.answer,
    })) ?? []
  );
}

function detokenizeText(node: FlowNode | undefined) {
  if (!node) {
    return "";
  }

  return node.blanks.reduce(
    (text, blank) =>
      text.replace(`{{${blank.id}}}`, blank.placeholder || blank.answer),
    node.text,
  );
}

function isDraftId(id: string) {
  return id.startsWith("draft-");
}

function inferAcceptedType(answer: string): BlankAcceptedType {
  if (/^-?\d+(\.\d+)?$/.test(answer)) {
    return "number";
  }

  if (/^[+\-*/%<>=!&|]+$/.test(answer)) {
    return "operator";
  }

  return "text";
}

const inputClass =
  "min-h-12 w-full rounded-[8px] border-2 border-slate-200 bg-white px-3 py-2 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const smallButtonClass =
  "min-h-10 rounded-[8px] bg-slate-900 px-3 text-sm font-black text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200";

const deleteButtonClass =
  "min-h-12 rounded-[8px] border-2 border-rose-200 bg-white px-3 text-sm font-black text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100";
