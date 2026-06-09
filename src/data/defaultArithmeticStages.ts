import type { Choice, FlowEdge, FlowNode, Stage } from "@/types/stage";

const now = new Date("2026-05-30T00:00:00.000Z");

type ArithmeticStageInput = {
  id: string;
  title: string;
  description: string;
  inputText: string;
  processText: string;
  operatorAnswer: string;
  outputAnswer: string;
  extraChoices: Choice[];
};

export const defaultArithmeticStages: Stage[] = [
  createArithmeticStage({
    id: "default-arithmetic-addition",
    title: "더하기 순서도",
    description: "두 수를 입력받아 더한 뒤 결과를 출력하는 순서도입니다.",
    inputText: "a = 10, b = 5 입력",
    processText: "sum = a {{operator}} b",
    operatorAnswer: "+",
    outputAnswer: "sum",
    extraChoices: [
      { id: "choice-add-minus", label: "-", value: "-" },
      { id: "choice-add-product", label: "product", value: "product" },
    ],
  }),
  createArithmeticStage({
    id: "default-arithmetic-subtraction",
    title: "빼기 순서도",
    description: "두 수를 입력받아 뺀 뒤 결과를 출력하는 순서도입니다.",
    inputText: "a = 10, b = 5 입력",
    processText: "diff = a {{operator}} b",
    operatorAnswer: "-",
    outputAnswer: "diff",
    extraChoices: [
      { id: "choice-sub-plus", label: "+", value: "+" },
      { id: "choice-sub-sum", label: "sum", value: "sum" },
    ],
  }),
  createArithmeticStage({
    id: "default-arithmetic-multiplication",
    title: "곱하기 순서도",
    description: "두 수를 입력받아 곱한 뒤 결과를 출력하는 순서도입니다.",
    inputText: "a = 6, b = 4 입력",
    processText: "product = a {{operator}} b",
    operatorAnswer: "*",
    outputAnswer: "product",
    extraChoices: [
      { id: "choice-mul-plus", label: "+", value: "+" },
      { id: "choice-mul-diff", label: "diff", value: "diff" },
    ],
  }),
  createArithmeticStage({
    id: "default-arithmetic-square",
    title: "제곱 순서도",
    description: "한 수를 입력받아 자기 자신과 곱한 값을 출력하는 순서도입니다.",
    inputText: "n = 4 입력",
    processText: "square = n {{operator}} n",
    operatorAnswer: "*",
    outputAnswer: "square",
    extraChoices: [
      { id: "choice-square-plus", label: "+", value: "+" },
      { id: "choice-square-sum", label: "sum", value: "sum" },
    ],
  }),
  createRamenStage(),
  createSafeStage(),
  createEvenOddStage(),
  createDeliveryFeeStage(),
  createVendingMachineStage(),
  createPasswordLimitStage(),
  createScoreGradeStage(),
  createLibraryLoanHardStage(),
  createRideSafetyHardStage(),
  createOnlineOrderHardStage(),
];

function createArithmeticStage({
  id,
  title,
  description,
  inputText,
  processText,
  operatorAnswer,
  outputAnswer,
  extraChoices,
}: ArithmeticStageInput): Stage {
  const operatorBlankId = `${id}-blank-operator`;
  const outputBlankId = `${id}-blank-output`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 360,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 320,
      y: 150,
      text: inputText,
      blanks: [],
      width: 260,
      height: 76,
    },
    {
      id: `${id}-process`,
      type: "process",
      x: 300,
      y: 270,
      text: processText.replace("{{operator}}", `{{${operatorBlankId}}}`),
      blanks: [
        {
          id: operatorBlankId,
          answer: operatorAnswer,
          placeholder: "연산자",
          acceptedType: "operator",
        },
      ],
      width: 300,
      height: 92,
    },
    {
      id: `${id}-output`,
      type: "output",
      x: 320,
      y: 410,
      text: `{{${outputBlankId}}} 출력`,
      blanks: [
        {
          id: outputBlankId,
          answer: outputAnswer,
          placeholder: "결과",
          acceptedType: "text",
        },
      ],
      width: 260,
      height: 76,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 360,
      y: 540,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];
  const edges: FlowEdge[] = [
    createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
    createVerticalEdge(`${id}-edge-input-process`, nodes[1], nodes[2]),
    createVerticalEdge(`${id}-edge-process-output`, nodes[2], nodes[3]),
    createVerticalEdge(`${id}-edge-output-end`, nodes[3], nodes[4]),
  ];

  return {
    id,
    title,
    description,
    difficulty: "easy",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges,
    choices: [
      {
        id: `${id}-choice-operator`,
        label: operatorAnswer,
        value: operatorAnswer,
      },
      {
        id: `${id}-choice-output`,
        label: outputAnswer,
        value: outputAnswer,
      },
      ...extraChoices,
    ],
  };
}

function createRamenStage(): Stage {
  const id = "default-life-ramen";
  const soupBlankId = `${id}-blank-soup`;
  const timeBlankId = `${id}-blank-time`;
  const outputBlankId = `${id}-blank-output`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 560,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 500,
      y: 160,
      text: "물, 면, 스프 준비",
      blanks: [],
      width: 280,
      height: 76,
    },
    {
      id: `${id}-boil`,
      type: "process",
      x: 510,
      y: 300,
      text: "물을 끓인다",
      blanks: [],
      width: 260,
      height: 82,
    },
    {
      id: `${id}-add`,
      type: "process",
      x: 490,
      y: 440,
      text: `면과 {{${soupBlankId}}}를 넣는다`,
      blanks: [
        {
          id: soupBlankId,
          answer: "스프",
          placeholder: "재료",
          acceptedType: "text",
        },
      ],
      width: 300,
      height: 88,
    },
    {
      id: `${id}-condition`,
      type: "condition",
      x: 495,
      y: 600,
      text: `{{${timeBlankId}}}분 지났나요?`,
      blanks: [
        {
          id: timeBlankId,
          answer: "3",
          placeholder: "시간",
          acceptedType: "number",
        },
      ],
      width: 270,
      height: 130,
    },
    {
      id: `${id}-more`,
      type: "process",
      x: 80,
      y: 630,
      text: "조금 더 끓인다",
      blanks: [],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-output`,
      type: "output",
      x: 920,
      y: 630,
      text: `{{${outputBlankId}}} 완성`,
      blanks: [
        {
          id: outputBlankId,
          answer: "라면",
          placeholder: "음식",
          acceptedType: "text",
        },
      ],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 960,
      y: 820,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];

  return {
    id,
    title: "라면 끓이기 순서도",
    description:
      "라면을 끓이는 과정을 순서도 기호로 표현하고 재료와 시간을 빈칸으로 채우는 문제입니다.",
    difficulty: "easy",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-boil`, nodes[1], nodes[2]),
      createVerticalEdge(`${id}-edge-boil-add`, nodes[2], nodes[3]),
      createVerticalEdge(`${id}-edge-add-condition`, nodes[3], nodes[4]),
      createLabeledEdge(`${id}-edge-condition-more`, nodes[4], nodes[5], "아니오"),
      createLabeledEdge(`${id}-edge-condition-output`, nodes[4], nodes[6], "예"),
      createVerticalEdge(`${id}-edge-output-end`, nodes[6], nodes[7]),
    ],
    choices: [
      { id: `${id}-choice-soup`, label: "스프", value: "스프" },
      { id: `${id}-choice-time`, label: "3", value: "3" },
      { id: `${id}-choice-output`, label: "라면", value: "라면" },
      { id: `${id}-choice-water`, label: "물", value: "물" },
      { id: `${id}-choice-five`, label: "5", value: "5" },
      { id: `${id}-choice-rice`, label: "밥", value: "밥" },
    ],
  };
}

function createSafeStage(): Stage {
  const id = "default-life-safe";
  const passwordBlankId = `${id}-blank-password`;
  const openBlankId = `${id}-blank-open`;
  const retryBlankId = `${id}-blank-retry`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 560,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 510,
      y: 170,
      text: "비밀번호 입력",
      blanks: [],
      width: 260,
      height: 76,
    },
    {
      id: `${id}-condition`,
      type: "condition",
      x: 490,
      y: 320,
      text: `비밀번호 == {{${passwordBlankId}}}?`,
      blanks: [
        {
          id: passwordBlankId,
          answer: "1234",
          placeholder: "번호",
          acceptedType: "number",
        },
      ],
      width: 300,
      height: 140,
    },
    {
      id: `${id}-open`,
      type: "output",
      x: 920,
      y: 570,
      text: `금고 {{${openBlankId}}}`,
      blanks: [
        {
          id: openBlankId,
          answer: "열림",
          placeholder: "상태",
          acceptedType: "text",
        },
      ],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-retry`,
      type: "output",
      x: 60,
      y: 570,
      text: `{{${retryBlankId}}}하세요`,
      blanks: [
        {
          id: retryBlankId,
          answer: "다시 입력",
          placeholder: "행동",
          acceptedType: "text",
        },
      ],
      width: 260,
      height: 82,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 560,
      y: 790,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];

  return {
    id,
    title: "금고 여는 방법 순서도",
    description:
      "비밀번호가 맞는지 판단한 뒤 금고를 열거나 다시 입력하게 하는 생활 속 조건문 문제입니다.",
    difficulty: "easy",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-condition`, nodes[1], nodes[2]),
      createLabeledEdge(`${id}-edge-condition-open`, nodes[2], nodes[3], "예"),
      createLabeledEdge(`${id}-edge-condition-retry`, nodes[2], nodes[4], "아니오"),
      createLabeledEdge(`${id}-edge-open-end`, nodes[3], nodes[5]),
      createLabeledEdge(`${id}-edge-retry-end`, nodes[4], nodes[5]),
    ],
    choices: [
      { id: `${id}-choice-password`, label: "1234", value: "1234" },
      { id: `${id}-choice-open`, label: "열림", value: "열림" },
      { id: `${id}-choice-retry`, label: "다시 입력", value: "다시 입력" },
      { id: `${id}-choice-wrong-password`, label: "5678", value: "5678" },
      { id: `${id}-choice-close`, label: "닫힘", value: "닫힘" },
    ],
  };
}

function createEvenOddStage(): Stage {
  const id = "default-medium-even-odd";
  const modBlankId = `${id}-blank-mod`;
  const divisorBlankId = `${id}-blank-divisor`;
  const evenBlankId = `${id}-blank-even`;
  const oddBlankId = `${id}-blank-odd`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 560,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 510,
      y: 170,
      text: "n = 7 입력",
      blanks: [],
      width: 260,
      height: 76,
    },
    {
      id: `${id}-condition`,
      type: "condition",
      x: 475,
      y: 320,
      text: `n {{${modBlankId}}} {{${divisorBlankId}}} == 0?`,
      blanks: [
        {
          id: modBlankId,
          answer: "%",
          placeholder: "연산자",
          acceptedType: "operator",
        },
        {
          id: divisorBlankId,
          answer: "2",
          placeholder: "수",
          acceptedType: "number",
        },
      ],
      width: 330,
      height: 140,
    },
    {
      id: `${id}-even`,
      type: "output",
      x: 940,
      y: 570,
      text: `{{${evenBlankId}}} 출력`,
      blanks: [
        {
          id: evenBlankId,
          answer: "짝수",
          placeholder: "결과",
          acceptedType: "text",
        },
      ],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-odd`,
      type: "output",
      x: 60,
      y: 570,
      text: `{{${oddBlankId}}} 출력`,
      blanks: [
        {
          id: oddBlankId,
          answer: "홀수",
          placeholder: "결과",
          acceptedType: "text",
        },
      ],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 560,
      y: 790,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];

  return {
    id,
    title: "짝수 홀수 판별 순서도",
    description:
      "나머지 연산을 사용해 입력한 수가 짝수인지 홀수인지 판단하는 중급 문제입니다.",
    difficulty: "medium",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-condition`, nodes[1], nodes[2]),
      createLabeledEdge(`${id}-edge-condition-even`, nodes[2], nodes[3], "예"),
      createLabeledEdge(`${id}-edge-condition-odd`, nodes[2], nodes[4], "아니오"),
      createLabeledEdge(`${id}-edge-even-end`, nodes[3], nodes[5]),
      createLabeledEdge(`${id}-edge-odd-end`, nodes[4], nodes[5]),
    ],
    choices: [
      { id: `${id}-choice-mod`, label: "%", value: "%" },
      { id: `${id}-choice-two`, label: "2", value: "2" },
      { id: `${id}-choice-even`, label: "짝수", value: "짝수" },
      { id: `${id}-choice-odd`, label: "홀수", value: "홀수" },
      { id: `${id}-choice-plus`, label: "+", value: "+" },
      { id: `${id}-choice-three`, label: "3", value: "3" },
    ],
  };
}

function createDeliveryFeeStage(): Stage {
  const id = "default-medium-delivery-fee";
  const limitBlankId = `${id}-blank-limit`;
  const freeBlankId = `${id}-blank-free`;
  const feeBlankId = `${id}-blank-fee`;
  const totalBlankId = `${id}-blank-total`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 560,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 480,
      y: 170,
      text: "주문금액 = 18000 입력",
      blanks: [],
      width: 320,
      height: 76,
    },
    {
      id: `${id}-condition`,
      type: "condition",
      x: 475,
      y: 320,
      text: `주문금액 >= {{${limitBlankId}}}?`,
      blanks: [
        {
          id: limitBlankId,
          answer: "20000",
          placeholder: "기준",
          acceptedType: "number",
        },
      ],
      width: 330,
      height: 140,
    },
    {
      id: `${id}-free`,
      type: "process",
      x: 940,
      y: 570,
      text: `배달비 = {{${freeBlankId}}}`,
      blanks: [
        {
          id: freeBlankId,
          answer: "0",
          placeholder: "금액",
          acceptedType: "number",
        },
      ],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-fee`,
      type: "process",
      x: 60,
      y: 570,
      text: `배달비 = {{${feeBlankId}}}`,
      blanks: [
        {
          id: feeBlankId,
          answer: "3000",
          placeholder: "금액",
          acceptedType: "number",
        },
      ],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-output`,
      type: "output",
      x: 480,
      y: 800,
      text: `{{${totalBlankId}}} 출력`,
      blanks: [
        {
          id: totalBlankId,
          answer: "총 결제 금액",
          placeholder: "결과",
          acceptedType: "text",
        },
      ],
      width: 320,
      height: 82,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 560,
      y: 960,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];

  return {
    id,
    title: "배달비 계산 순서도",
    description:
      "주문 금액에 따라 배달비가 무료인지 아닌지 판단하고 총 결제 금액을 출력하는 문제입니다.",
    difficulty: "medium",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-condition`, nodes[1], nodes[2]),
      createLabeledEdge(`${id}-edge-condition-free`, nodes[2], nodes[3], "예"),
      createLabeledEdge(`${id}-edge-condition-fee`, nodes[2], nodes[4], "아니오"),
      createLabeledEdge(`${id}-edge-free-output`, nodes[3], nodes[5]),
      createLabeledEdge(`${id}-edge-fee-output`, nodes[4], nodes[5]),
      createVerticalEdge(`${id}-edge-output-end`, nodes[5], nodes[6]),
    ],
    choices: [
      { id: `${id}-choice-limit`, label: "20000", value: "20000" },
      { id: `${id}-choice-free`, label: "0", value: "0" },
      { id: `${id}-choice-fee`, label: "3000", value: "3000" },
      {
        id: `${id}-choice-total`,
        label: "총 결제 금액",
        value: "총 결제 금액",
      },
      { id: `${id}-choice-10000`, label: "10000", value: "10000" },
      { id: `${id}-choice-change`, label: "거스름돈", value: "거스름돈" },
    ],
  };
}

function createVendingMachineStage(): Stage {
  const id = "default-medium-vending-machine";
  const enoughBlankId = `${id}-blank-enough`;
  const operatorBlankId = `${id}-blank-operator`;
  const drinkBlankId = `${id}-blank-drink`;
  const shortageBlankId = `${id}-blank-shortage`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 560,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 470,
      y: 170,
      text: "돈 = 1500, 가격 = 1200 입력",
      blanks: [],
      width: 340,
      height: 76,
    },
    {
      id: `${id}-condition`,
      type: "condition",
      x: 475,
      y: 320,
      text: `돈 >= {{${enoughBlankId}}}?`,
      blanks: [
        {
          id: enoughBlankId,
          answer: "가격",
          placeholder: "비교값",
          acceptedType: "text",
        },
      ],
      width: 330,
      height: 140,
    },
    {
      id: `${id}-change`,
      type: "process",
      x: 900,
      y: 550,
      text: `거스름돈 = 돈 {{${operatorBlankId}}} 가격`,
      blanks: [
        {
          id: operatorBlankId,
          answer: "-",
          placeholder: "연산자",
          acceptedType: "operator",
        },
      ],
      width: 320,
      height: 82,
    },
    {
      id: `${id}-drink`,
      type: "output",
      x: 940,
      y: 710,
      text: `{{${drinkBlankId}}} 출력`,
      blanks: [
        {
          id: drinkBlankId,
          answer: "음료",
          placeholder: "물건",
          acceptedType: "text",
        },
      ],
      width: 240,
      height: 82,
    },
    {
      id: `${id}-shortage`,
      type: "output",
      x: 60,
      y: 550,
      text: `{{${shortageBlankId}}} 출력`,
      blanks: [
        {
          id: shortageBlankId,
          answer: "돈 부족",
          placeholder: "메시지",
          acceptedType: "text",
        },
      ],
      width: 260,
      height: 82,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 560,
      y: 910,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];

  return {
    id,
    title: "자판기 음료 구매 순서도",
    description:
      "돈이 충분한지 판단한 뒤 음료와 거스름돈을 처리하거나 부족 메시지를 출력하는 문제입니다.",
    difficulty: "medium",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-condition`, nodes[1], nodes[2]),
      createLabeledEdge(`${id}-edge-condition-change`, nodes[2], nodes[3], "예"),
      createLabeledEdge(`${id}-edge-condition-shortage`, nodes[2], nodes[5], "아니오"),
      createVerticalEdge(`${id}-edge-change-drink`, nodes[3], nodes[4]),
      createLabeledEdge(`${id}-edge-drink-end`, nodes[4], nodes[6]),
      createLabeledEdge(`${id}-edge-shortage-end`, nodes[5], nodes[6]),
    ],
    choices: [
      { id: `${id}-choice-price`, label: "가격", value: "가격" },
      { id: `${id}-choice-minus`, label: "-", value: "-" },
      { id: `${id}-choice-drink`, label: "음료", value: "음료" },
      { id: `${id}-choice-shortage`, label: "돈 부족", value: "돈 부족" },
      { id: `${id}-choice-plus`, label: "+", value: "+" },
      { id: `${id}-choice-snack`, label: "과자", value: "과자" },
    ],
  };
}

function createPasswordLimitStage(): Stage {
  const id = "default-medium-password-limit";
  const passwordBlankId = `${id}-blank-password`;
  const plusBlankId = `${id}-blank-plus`;
  const limitBlankId = `${id}-blank-limit`;
  const successBlankId = `${id}-blank-success`;
  const lockBlankId = `${id}-blank-lock`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 560,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 500,
      y: 170,
      text: "비밀번호 입력, count = 0",
      blanks: [],
      width: 300,
      height: 76,
    },
    {
      id: `${id}-check-password`,
      type: "condition",
      x: 490,
      y: 320,
      text: `비밀번호 == {{${passwordBlankId}}}?`,
      blanks: [
        {
          id: passwordBlankId,
          answer: "1234",
          placeholder: "번호",
          acceptedType: "number",
        },
      ],
      width: 320,
      height: 140,
    },
    {
      id: `${id}-success`,
      type: "output",
      x: 940,
      y: 350,
      text: `{{${successBlankId}}} 출력`,
      blanks: [
        {
          id: successBlankId,
          answer: "로그인 성공",
          placeholder: "결과",
          acceptedType: "text",
        },
      ],
      width: 280,
      height: 82,
    },
    {
      id: `${id}-count`,
      type: "process",
      x: 500,
      y: 560,
      text: `count = count {{${plusBlankId}}} 1`,
      blanks: [
        {
          id: plusBlankId,
          answer: "+",
          placeholder: "연산자",
          acceptedType: "operator",
        },
      ],
      width: 300,
      height: 82,
    },
    {
      id: `${id}-check-count`,
      type: "condition",
      x: 490,
      y: 720,
      text: `count < {{${limitBlankId}}}?`,
      blanks: [
        {
          id: limitBlankId,
          answer: "3",
          placeholder: "횟수",
          acceptedType: "number",
        },
      ],
      width: 320,
      height: 140,
    },
    {
      id: `${id}-lock`,
      type: "output",
      x: 940,
      y: 750,
      text: `{{${lockBlankId}}} 출력`,
      blanks: [
        {
          id: lockBlankId,
          answer: "계정 잠금",
          placeholder: "결과",
          acceptedType: "text",
        },
      ],
      width: 260,
      height: 82,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 560,
      y: 990,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];

  return {
    id,
    title: "비밀번호 3회 제한 순서도",
    description:
      "비밀번호가 틀릴 때마다 횟수를 늘리고 3회가 되면 계정을 잠그는 반복 구조 문제입니다.",
    difficulty: "medium",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-check`, nodes[1], nodes[2]),
      createLabeledEdge(`${id}-edge-check-success`, nodes[2], nodes[3], "예"),
      createVerticalEdge(`${id}-edge-check-count`, nodes[2], nodes[4]),
      createVerticalEdge(`${id}-edge-count-check-count`, nodes[4], nodes[5]),
      createLoopEdge(`${id}-edge-retry-input`, nodes[5], nodes[1], "예"),
      createLabeledEdge(`${id}-edge-count-lock`, nodes[5], nodes[6], "아니오"),
      createOuterMergeEdge(
        `${id}-edge-success-end`,
        nodes[3],
        nodes[7],
        "right",
      ),
      createVerticalEdge(`${id}-edge-lock-end`, nodes[6], nodes[7]),
    ],
    choices: [
      { id: `${id}-choice-password`, label: "1234", value: "1234" },
      { id: `${id}-choice-plus`, label: "+", value: "+" },
      { id: `${id}-choice-limit`, label: "3", value: "3" },
      {
        id: `${id}-choice-success`,
        label: "로그인 성공",
        value: "로그인 성공",
      },
      { id: `${id}-choice-lock`, label: "계정 잠금", value: "계정 잠금" },
      { id: `${id}-choice-minus`, label: "-", value: "-" },
      { id: `${id}-choice-five`, label: "5", value: "5" },
    ],
  };
}

function createScoreGradeStage(): Stage {
  const id = "default-medium-score-grade";
  const aLimitBlankId = `${id}-blank-a-limit`;
  const bLimitBlankId = `${id}-blank-b-limit`;
  const aBlankId = `${id}-blank-a`;
  const bBlankId = `${id}-blank-b`;
  const cBlankId = `${id}-blank-c`;
  const nodes: FlowNode[] = [
    {
      id: `${id}-start`,
      type: "start",
      x: 560,
      y: 40,
      text: "시작",
      blanks: [],
      width: 160,
      height: 64,
    },
    {
      id: `${id}-input`,
      type: "input",
      x: 510,
      y: 170,
      text: "score = 85 입력",
      blanks: [],
      width: 260,
      height: 76,
    },
    {
      id: `${id}-check-a`,
      type: "condition",
      x: 490,
      y: 320,
      text: `score >= {{${aLimitBlankId}}}?`,
      blanks: [
        {
          id: aLimitBlankId,
          answer: "90",
          placeholder: "점수",
          acceptedType: "number",
        },
      ],
      width: 300,
      height: 140,
    },
    {
      id: `${id}-a`,
      type: "output",
      x: 940,
      y: 350,
      text: `{{${aBlankId}}} 등급 출력`,
      blanks: [
        {
          id: aBlankId,
          answer: "A",
          placeholder: "등급",
          acceptedType: "text",
        },
      ],
      width: 260,
      height: 82,
    },
    {
      id: `${id}-check-b`,
      type: "condition",
      x: 490,
      y: 580,
      text: `score >= {{${bLimitBlankId}}}?`,
      blanks: [
        {
          id: bLimitBlankId,
          answer: "80",
          placeholder: "점수",
          acceptedType: "number",
        },
      ],
      width: 300,
      height: 140,
    },
    {
      id: `${id}-b`,
      type: "output",
      x: 940,
      y: 610,
      text: `{{${bBlankId}}} 등급 출력`,
      blanks: [
        {
          id: bBlankId,
          answer: "B",
          placeholder: "등급",
          acceptedType: "text",
        },
      ],
      width: 260,
      height: 82,
    },
    {
      id: `${id}-c`,
      type: "output",
      x: 60,
      y: 610,
      text: `{{${cBlankId}}} 등급 출력`,
      blanks: [
        {
          id: cBlankId,
          answer: "C",
          placeholder: "등급",
          acceptedType: "text",
        },
      ],
      width: 260,
      height: 82,
    },
    {
      id: `${id}-end`,
      type: "end",
      x: 560,
      y: 860,
      text: "끝",
      blanks: [],
      width: 160,
      height: 64,
    },
  ];

  return {
    id,
    title: "시험 점수 등급 판정 순서도",
    description:
      "점수를 입력받아 A, B, C 등급 중 어디에 해당하는지 여러 조건으로 판단하는 문제입니다.",
    difficulty: "medium",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-check-a`, nodes[1], nodes[2]),
      createLabeledEdge(`${id}-edge-check-a-output`, nodes[2], nodes[3], "예"),
      createVerticalEdge(`${id}-edge-check-a-check-b`, nodes[2], nodes[4]),
      createLabeledEdge(`${id}-edge-check-b-output`, nodes[4], nodes[5], "예"),
      createLabeledEdge(`${id}-edge-check-b-c`, nodes[4], nodes[6], "아니오"),
      createOuterMergeEdge(
        `${id}-edge-a-end`,
        nodes[3],
        nodes[7],
        "right",
      ),
      createLabeledEdge(`${id}-edge-b-end`, nodes[5], nodes[7]),
      createLabeledEdge(`${id}-edge-c-end`, nodes[6], nodes[7]),
    ],
    choices: [
      { id: `${id}-choice-90`, label: "90", value: "90" },
      { id: `${id}-choice-80`, label: "80", value: "80" },
      { id: `${id}-choice-a`, label: "A", value: "A" },
      { id: `${id}-choice-b`, label: "B", value: "B" },
      { id: `${id}-choice-c`, label: "C", value: "C" },
      { id: `${id}-choice-70`, label: "70", value: "70" },
    ],
  };
}

function createLibraryLoanHardStage(): Stage {
  const id = "default-hard-library-loan";
  const nodes: FlowNode[] = [
    createFullBlankNode({
      stageId: id,
      key: "start",
      type: "start",
      x: 560,
      y: 40,
      answer: "시작",
      width: 180,
      height: 72,
    }),
    createFullBlankNode({
      stageId: id,
      key: "input",
      type: "input",
      x: 480,
      y: 180,
      answer: "학생증과 책 정보를 입력한다",
      width: 340,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "condition",
      type: "condition",
      x: 460,
      y: 350,
      answer: "책을 대출할 수 있는가?",
      width: 380,
      height: 170,
    }),
    createFullBlankNode({
      stageId: id,
      key: "register",
      type: "process",
      x: 920,
      y: 590,
      answer: "대출 정보를 등록한다",
      width: 340,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "success",
      type: "output",
      x: 920,
      y: 760,
      answer: "대출 완료를 안내한다",
      width: 340,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "failure",
      type: "output",
      x: 40,
      y: 590,
      answer: "대출 불가를 안내한다",
      width: 340,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "end",
      type: "end",
      x: 560,
      y: 940,
      answer: "끝",
      width: 180,
      height: 72,
    }),
  ];

  return {
    id,
    title: "도서관 책 대출 절차 완성",
    description:
      "시작한 뒤 학생증과 책 정보를 입력한다. 책을 대출할 수 있는지 확인하고, 예이면 대출 정보를 등록한 뒤 대출 완료를 안내한다. 아니오이면 대출 불가를 안내한다. 마지막에는 절차를 끝낸다.",
    difficulty: "hard",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-condition`, nodes[1], nodes[2]),
      createLabeledEdge(
        `${id}-edge-condition-register`,
        nodes[2],
        nodes[3],
        "예",
      ),
      createLabeledEdge(
        `${id}-edge-condition-failure`,
        nodes[2],
        nodes[5],
        "아니오",
      ),
      createVerticalEdge(`${id}-edge-register-success`, nodes[3], nodes[4]),
      createLabeledEdge(`${id}-edge-success-end`, nodes[4], nodes[6]),
      createLabeledEdge(`${id}-edge-failure-end`, nodes[5], nodes[6]),
    ],
    choices: createFullBlankChoices(id, nodes, [
      "책을 책장에 다시 꽂는다",
      "교실로 돌아간다",
    ]),
  };
}

function createRideSafetyHardStage(): Stage {
  const id = "default-hard-ride-safety";
  const nodes: FlowNode[] = [
    createFullBlankNode({
      stageId: id,
      key: "start",
      type: "start",
      x: 560,
      y: 40,
      answer: "시작",
      width: 180,
      height: 72,
    }),
    createFullBlankNode({
      stageId: id,
      key: "input",
      type: "input",
      x: 490,
      y: 180,
      answer: "키와 나이를 입력한다",
      width: 320,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "height-condition",
      type: "condition",
      x: 460,
      y: 350,
      answer: "키가 140cm 이상인가?",
      width: 380,
      height: 170,
    }),
    createFullBlankNode({
      stageId: id,
      key: "age-condition",
      type: "condition",
      x: 460,
      y: 620,
      answer: "나이가 12세 이상인가?",
      width: 380,
      height: 170,
    }),
    createFullBlankNode({
      stageId: id,
      key: "ride",
      type: "output",
      x: 920,
      y: 650,
      answer: "탑승 가능을 안내한다",
      width: 340,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "height-failure",
      type: "output",
      x: 40,
      y: 380,
      answer: "키 부족을 안내한다",
      width: 340,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "guardian",
      type: "output",
      x: 40,
      y: 650,
      answer: "보호자 동반을 안내한다",
      width: 340,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "end",
      type: "end",
      x: 560,
      y: 900,
      answer: "끝",
      width: 180,
      height: 72,
    }),
  ];

  return {
    id,
    title: "놀이기구 탑승 조건 완성",
    description:
      "시작한 뒤 키와 나이를 입력한다. 먼저 키가 140cm 이상인지 확인한다. 아니오이면 키 부족을 안내한다. 예이면 나이가 12세 이상인지 다시 확인한다. 두 번째 조건이 예이면 탑승 가능을 안내하고, 아니오이면 보호자 동반을 안내한다. 모든 경우의 마지막에는 절차를 끝낸다.",
    difficulty: "hard",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-height`, nodes[1], nodes[2]),
      {
        ...createVerticalEdge(`${id}-edge-height-age`, nodes[2], nodes[3]),
        label: "예",
      },
      createLabeledEdge(
        `${id}-edge-height-failure`,
        nodes[2],
        nodes[5],
        "아니오",
      ),
      createLabeledEdge(`${id}-edge-age-ride`, nodes[3], nodes[4], "예"),
      createLabeledEdge(
        `${id}-edge-age-guardian`,
        nodes[3],
        nodes[6],
        "아니오",
      ),
      createLabeledEdge(`${id}-edge-ride-end`, nodes[4], nodes[7]),
      createOuterMergeEdge(
        `${id}-edge-height-failure-end`,
        nodes[5],
        nodes[7],
        "left",
      ),
      createLabeledEdge(`${id}-edge-guardian-end`, nodes[6], nodes[7]),
    ],
    choices: createFullBlankChoices(id, nodes, [
      "몸무게를 입력한다",
      "매표소로 돌아간다",
    ]),
  };
}

function createOnlineOrderHardStage(): Stage {
  const id = "default-hard-online-order";
  const nodes: FlowNode[] = [
    createFullBlankNode({
      stageId: id,
      key: "start",
      type: "start",
      x: 560,
      y: 40,
      answer: "시작",
      width: 180,
      height: 72,
    }),
    createFullBlankNode({
      stageId: id,
      key: "input",
      type: "input",
      x: 470,
      y: 180,
      answer: "주문 금액을 입력한다",
      width: 360,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "condition",
      type: "condition",
      x: 450,
      y: 350,
      answer: "주문 금액이 20000원 이상인가?",
      width: 400,
      height: 180,
    }),
    createFullBlankNode({
      stageId: id,
      key: "free-shipping",
      type: "process",
      x: 920,
      y: 600,
      answer: "배송비를 0원으로 정한다",
      width: 360,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "paid-shipping",
      type: "process",
      x: 20,
      y: 600,
      answer: "배송비를 3000원으로 정한다",
      width: 360,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "calculate",
      type: "process",
      x: 470,
      y: 820,
      answer: "최종 결제 금액을 계산한다",
      width: 360,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "output",
      type: "output",
      x: 470,
      y: 990,
      answer: "최종 결제 금액을 출력한다",
      width: 360,
      height: 96,
    }),
    createFullBlankNode({
      stageId: id,
      key: "end",
      type: "end",
      x: 560,
      y: 1160,
      answer: "끝",
      width: 180,
      height: 72,
    }),
  ];

  return {
    id,
    title: "온라인 주문 배송비 계산 완성",
    description:
      "시작한 뒤 주문 금액을 입력한다. 주문 금액이 20000원 이상인지 확인한다. 예이면 배송비를 0원으로 정하고, 아니오이면 배송비를 3000원으로 정한다. 이후 최종 결제 금액을 계산하고 그 금액을 출력한 뒤 절차를 끝낸다.",
    difficulty: "hard",
    problemType: "flowchart-fill-blank",
    createdAt: now,
    updatedAt: now,
    nodes,
    edges: [
      createVerticalEdge(`${id}-edge-start-input`, nodes[0], nodes[1]),
      createVerticalEdge(`${id}-edge-input-condition`, nodes[1], nodes[2]),
      createLabeledEdge(
        `${id}-edge-condition-free`,
        nodes[2],
        nodes[3],
        "예",
      ),
      createLabeledEdge(
        `${id}-edge-condition-paid`,
        nodes[2],
        nodes[4],
        "아니오",
      ),
      createLabeledEdge(`${id}-edge-free-calculate`, nodes[3], nodes[5]),
      createLabeledEdge(`${id}-edge-paid-calculate`, nodes[4], nodes[5]),
      createVerticalEdge(`${id}-edge-calculate-output`, nodes[5], nodes[6]),
      createVerticalEdge(`${id}-edge-output-end`, nodes[6], nodes[7]),
    ],
    choices: createFullBlankChoices(id, nodes, [
      "상품 가격을 할인한다",
      "주문을 바로 취소한다",
    ]),
  };
}

function createFullBlankNode({
  stageId,
  key,
  type,
  x,
  y,
  answer,
  width,
  height,
}: {
  stageId: string;
  key: string;
  type: FlowNode["type"];
  x: number;
  y: number;
  answer: string;
  width: number;
  height: number;
}): FlowNode {
  const nodeId = `${stageId}-${key}`;
  const blankId = `${nodeId}-blank`;

  return {
    id: nodeId,
    type,
    x,
    y,
    text: `{{${blankId}}}`,
    blanks: [
      {
        id: blankId,
        answer,
        placeholder: "내용 선택",
        acceptedType: "text",
      },
    ],
    width,
    height,
  };
}

function createFullBlankChoices(
  stageId: string,
  nodes: FlowNode[],
  distractors: string[],
): Choice[] {
  const answerChoices = nodes.flatMap((node) =>
    node.blanks.map((blank) => ({
      id: `${blank.id}-choice`,
      label: blank.answer,
      value: blank.answer,
    })),
  );
  const distractorChoices = distractors.map((value, index) => ({
    id: `${stageId}-distractor-${index + 1}`,
    label: value,
    value,
  }));

  return [...answerChoices, ...distractorChoices];
}

function createLabeledEdge(
  id: string,
  from: FlowNode,
  to: FlowNode,
  label?: string,
): FlowEdge {
  const fromCenter = {
    x: from.x + from.width / 2,
    y: from.y + from.height / 2,
  };
  const toCenter = {
    x: to.x + to.width / 2,
    y: to.y + to.height / 2,
  };
  const startX = toCenter.x > fromCenter.x ? from.x + from.width : from.x;
  const endX = toCenter.x > fromCenter.x ? to.x : to.x + to.width;
  const midX = (startX + endX) / 2;

  return {
    id,
    from: from.id,
    to: to.id,
    label,
    direction: toCenter.x > fromCenter.x ? "bottom-right" : "bottom-left",
    points: [
      { x: startX, y: fromCenter.y },
      { x: midX, y: fromCenter.y },
      { x: midX, y: toCenter.y },
      { x: endX, y: toCenter.y },
    ],
  };
}

function createLoopEdge(
  id: string,
  from: FlowNode,
  to: FlowNode,
  label: string,
): FlowEdge {
  const fromCenter = {
    x: from.x + from.width / 2,
    y: from.y + from.height / 2,
  };
  const toCenter = {
    x: to.x + to.width / 2,
    y: to.y + to.height / 2,
  };
  const leftX = Math.min(from.x, to.x) - 90;

  return {
    id,
    from: from.id,
    to: to.id,
    label,
    direction: "top-left",
    points: [
      { x: from.x, y: fromCenter.y },
      { x: leftX, y: fromCenter.y },
      { x: leftX, y: toCenter.y },
      { x: to.x, y: toCenter.y },
    ],
  };
}

function createOuterMergeEdge(
  id: string,
  from: FlowNode,
  to: FlowNode,
  side: "left" | "right",
): FlowEdge {
  const fromCenterY = from.y + from.height / 2;
  const toCenterY = to.y + to.height / 2;
  const isRight = side === "right";
  const startX = isRight ? from.x + from.width : from.x;
  const endX = isRight ? to.x + to.width : to.x;
  const laneX = isRight
    ? Math.max(from.x + from.width, to.x + to.width) + 100
    : Math.max(20, Math.min(from.x, to.x) - 100);

  return {
    id,
    from: from.id,
    to: to.id,
    direction: isRight ? "bottom-right" : "bottom-left",
    points: [
      { x: startX, y: fromCenterY },
      { x: laneX, y: fromCenterY },
      { x: laneX, y: toCenterY },
      { x: endX, y: toCenterY },
    ],
  };
}

function createVerticalEdge(id: string, from: FlowNode, to: FlowNode): FlowEdge {
  const fromX = from.x + from.width / 2;
  const toX = to.x + to.width / 2;
  const fromY = from.y + from.height;
  const toY = to.y;
  const midY = (fromY + toY) / 2;

  return {
    id,
    from: from.id,
    to: to.id,
    direction: "bottom",
    points: [
      { x: fromX, y: fromY },
      { x: fromX, y: midY },
      { x: toX, y: midY },
      { x: toX, y: toY },
    ],
  };
}
