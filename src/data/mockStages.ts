import type { Stage } from "../types/stage";

const now = new Date("2026-05-28T00:00:00.000Z");

export const mockStages: Stage[] = [
  {
    id: "stage-temperature-flow",
    title: "온도에 따른 날씨 출력",
    description:
      "입력된 온도 t가 기준보다 큰지 확인하고, 조건에 따라 알맞은 문장을 출력하는 순서도입니다.",
    difficulty: "easy",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes: [
      {
        id: "node-start",
        type: "start",
        x: 360,
        y: 40,
        text: "시작",
        blanks: [],
        width: 160,
        height: 64,
      },
      {
        id: "node-input-temperature",
        type: "input",
        x: 340,
        y: 140,
        text: "온도 입력",
        blanks: [],
        width: 200,
        height: 72,
      },
      {
        id: "node-condition-temperature",
        type: "condition",
        x: 320,
        y: 260,
        text: "t > {{blank-temperature-limit}}?",
        blanks: [
          {
            id: "blank-temperature-limit",
            answer: "30",
            placeholder: "숫자",
            acceptedType: "number",
          },
        ],
        width: 240,
        height: 120,
      },
      {
        id: "node-output-hot",
        type: "output",
        x: 80,
        y: 440,
        text: "날씨가 {{blank-hot-word}}",
        blanks: [
          {
            id: "blank-hot-word",
            answer: "덥다",
            placeholder: "상태",
            acceptedType: "text",
          },
        ],
        width: 240,
        height: 80,
      },
      {
        id: "node-output-not-hot",
        type: "output",
        x: 560,
        y: 440,
        text: "날씨가 {{blank-not-hot-word}}",
        blanks: [
          {
            id: "blank-not-hot-word",
            answer: "덥지 않다",
            placeholder: "상태",
            acceptedType: "text",
          },
        ],
        width: 260,
        height: 80,
      },
      {
        id: "node-end",
        type: "end",
        x: 360,
        y: 620,
        text: "종료",
        blanks: [],
        width: 160,
        height: 64,
      },
    ],
    edges: [
      {
        id: "edge-start-to-input",
        from: "node-start",
        to: "node-input-temperature",
        direction: "bottom",
        points: [
          { x: 440, y: 104 },
          { x: 440, y: 140 },
        ],
      },
      {
        id: "edge-input-to-condition",
        from: "node-input-temperature",
        to: "node-condition-temperature",
        direction: "bottom",
        points: [
          { x: 440, y: 212 },
          { x: 440, y: 260 },
        ],
      },
      {
        id: "edge-condition-to-hot",
        from: "node-condition-temperature",
        to: "node-output-hot",
        label: "예",
        direction: "bottom-left",
        points: [
          { x: 320, y: 340 },
          { x: 200, y: 340 },
          { x: 200, y: 440 },
        ],
      },
      {
        id: "edge-condition-to-not-hot",
        from: "node-condition-temperature",
        to: "node-output-not-hot",
        label: "아니오",
        direction: "bottom-right",
        points: [
          { x: 560, y: 340 },
          { x: 690, y: 340 },
          { x: 690, y: 440 },
        ],
      },
      {
        id: "edge-hot-to-end",
        from: "node-output-hot",
        to: "node-end",
        direction: "bottom-right",
        points: [
          { x: 200, y: 520 },
          { x: 200, y: 652 },
          { x: 360, y: 652 },
        ],
      },
      {
        id: "edge-not-hot-to-end",
        from: "node-output-not-hot",
        to: "node-end",
        direction: "bottom-left",
        points: [
          { x: 690, y: 520 },
          { x: 690, y: 652 },
          { x: 520, y: 652 },
        ],
      },
    ],
    choices: [
      {
        id: "choice-30",
        label: "30",
        value: "30",
      },
      {
        id: "choice-hot",
        label: "덥다",
        value: "덥다",
      },
      {
        id: "choice-not-hot",
        label: "덥지 않다",
        value: "덥지 않다",
      },
      {
        id: "choice-20",
        label: "20",
        value: "20",
      },
      {
        id: "choice-cold",
        label: "춥다",
        value: "춥다",
      },
    ],
  },
];

export const mockStage = mockStages[0];
