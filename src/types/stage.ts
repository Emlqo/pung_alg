export type StageDifficulty = "easy" | "medium" | "hard";

export type StageProblemType = "flowchart-fill-blank";

export type FlowNodeType =
  | "start"
  | "end"
  | "input"
  | "process"
  | "condition"
  | "output";

export type BlankAcceptedType = "text" | "number" | "operator";

export type EdgeDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export type FirestoreTimestampLike = {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
};

export type StageTimestamp = Date | FirestoreTimestampLike;

export type FlowPoint = {
  x: number;
  y: number;
};

export type Blank = {
  id: string;
  answer: string;
  placeholder: string;
  acceptedType: BlankAcceptedType;
};

export type FlowNode = {
  id: string;
  type: FlowNodeType;
  x: number;
  y: number;
  text: string;
  blanks: Blank[];
  width: number;
  height: number;
};

export type FlowEdge = {
  id: string;
  from: FlowNode["id"];
  to: FlowNode["id"];
  label?: string;
  points?: FlowPoint[];
  direction?: EdgeDirection;
};

export type Choice = {
  id: string;
  label: string;
  value: string;
};

export type Stage = {
  id: string;
  teacherId?: string;
  title: string;
  description: string;
  difficulty: StageDifficulty;
  problemType: StageProblemType;
  createdAt: StageTimestamp;
  updatedAt: StageTimestamp;
  nodes: FlowNode[];
  edges: FlowEdge[];
  choices: Choice[];
};

export type StudentBlankAnswers = Record<Blank["id"], Choice["value"]>;

export type StudentStageAttempt = {
  stageId: Stage["id"];
  answers: StudentBlankAnswers;
};
