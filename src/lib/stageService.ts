import {
  collection,
  deleteDoc,
  doc,
  type DocumentSnapshot,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type FieldValue,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db, missingFirebaseEnvKeys } from "@/lib/firebase";
import type { Stage } from "@/types/stage";

const STAGES_COLLECTION = "stages";

type StageUpdateInput =
  | Stage
  | Partial<Omit<Stage, "id" | "createdAt" | "updatedAt">>;

type StageWriteData = Omit<Stage, "createdAt" | "updatedAt"> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export async function createStage(stage: Stage) {
  assertFirebaseConfig();

  const cleanStage = removeUndefinedValues(stage) as Stage;

  await setDoc(doc(db, STAGES_COLLECTION, stage.id), {
    ...cleanStage,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies StageWriteData);

  return cleanStage.id;
}

export async function getStages() {
  assertFirebaseConfig();

  const stagesQuery = query(
    collection(db, STAGES_COLLECTION),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(stagesQuery);

  return snapshot.docs.map(stageFromSnapshot);
}

export async function getStageById(id: string) {
  assertFirebaseConfig();

  const snapshot = await getDoc(doc(db, STAGES_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return stageFromSnapshot(snapshot);
}

export async function updateStage(id: string, stage: StageUpdateInput) {
  assertFirebaseConfig();

  const stageData = { ...(stage as Partial<Stage>) };
  delete stageData.id;
  delete stageData.createdAt;
  delete stageData.updatedAt;

  const cleanStage = removeUndefinedValues(stageData) as Partial<
    Omit<Stage, "id" | "createdAt" | "updatedAt">
  >;

  await updateDoc(doc(db, STAGES_COLLECTION, id), {
    ...cleanStage,
    updatedAt: serverTimestamp(),
  } satisfies Partial<Omit<Stage, "id" | "createdAt" | "updatedAt">> & {
    updatedAt: FieldValue;
  });
}

export async function deleteStage(id: string) {
  assertFirebaseConfig();

  await deleteDoc(doc(db, STAGES_COLLECTION, id));
}

function assertFirebaseConfig() {
  if (missingFirebaseEnvKeys.length > 0) {
    throw new Error(
      `Firebase 환경변수가 설정되지 않았습니다: ${missingFirebaseEnvKeys.join(
        ", ",
      )}`,
    );
  }
}

function stageFromSnapshot(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
): Stage {
  const data = snapshot.data() as Omit<Stage, "id">;

  return {
    ...data,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
    id: snapshot.id,
  };
}

function normalizeTimestamp(value: Stage["createdAt"]) {
  if (value instanceof Date) {
    return value;
  }

  if (value?.toDate) {
    return value.toDate();
  }

  if (
    typeof value?.seconds === "number" &&
    typeof value?.nanoseconds === "number"
  ) {
    return new Date(
      value.seconds * 1000 + Math.floor(value.nanoseconds / 1000000),
    );
  }

  return new Date(0);
}

function removeUndefinedValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefinedValues(item));
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefinedValues(item)]),
    );
  }

  return value;
}
