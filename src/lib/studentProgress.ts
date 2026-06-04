import type { Stage } from "@/types/stage";

const STORAGE_KEY = "pung_alg_student_progress";

type StoredProgress = {
  completedStageIds: string[];
  updatedAt: string;
};

const difficultyOrder: Record<Stage["difficulty"], number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function getCompletedStageIds() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const rawProgress = window.localStorage.getItem(STORAGE_KEY);

    if (!rawProgress) {
      return new Set<string>();
    }

    const progress = JSON.parse(rawProgress) as StoredProgress;

    return new Set(progress.completedStageIds ?? []);
  } catch {
    return new Set<string>();
  }
}

export function markStageCompleted(stageId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const completedStageIds = getCompletedStageIds();
  completedStageIds.add(stageId);

  const progress: StoredProgress = {
    completedStageIds: [...completedStageIds],
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function sortStagesForProgression(stages: Stage[]) {
  return [...stages].sort((left, right) => {
    const difficultyDiff =
      difficultyOrder[left.difficulty] - difficultyOrder[right.difficulty];

    if (difficultyDiff !== 0) {
      return difficultyDiff;
    }

    return timestampToMilliseconds(left.createdAt) -
      timestampToMilliseconds(right.createdAt);
  });
}

export function getUnlockedStageIds(stages: Stage[], completedStageIds: Set<string>) {
  const sortedStages = sortStagesForProgression(stages);
  const unlockedStageIds = new Set<string>();

  for (const stage of sortedStages) {
    unlockedStageIds.add(stage.id);

    if (!completedStageIds.has(stage.id)) {
      break;
    }
  }

  return unlockedStageIds;
}

export function isStageUnlocked({
  stageId,
  stages,
  completedStageIds,
}: {
  stageId: string;
  stages: Stage[];
  completedStageIds: Set<string>;
}) {
  return getUnlockedStageIds(stages, completedStageIds).has(stageId);
}

export function getNextStage(
  currentStageId: string,
  stages: Stage[],
  completedStageIds: Set<string>,
) {
  const sortedStages = sortStagesForProgression(stages);
  const currentIndex = sortedStages.findIndex(
    (stage) => stage.id === currentStageId,
  );

  if (currentIndex < 0) {
    return null;
  }

  return (
    sortedStages
      .slice(currentIndex + 1)
      .find((stage) => !completedStageIds.has(stage.id)) ?? null
  );
}

function timestampToMilliseconds(timestamp: Stage["createdAt"]) {
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  if (timestamp?.toDate) {
    return timestamp.toDate().getTime();
  }

  if (
    typeof timestamp?.seconds === "number" &&
    typeof timestamp?.nanoseconds === "number"
  ) {
    return timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
  }

  return 0;
}
