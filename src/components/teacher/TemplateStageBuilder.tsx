"use client";

import { StageForm } from "@/components/teacher/StageForm";
import { createStage } from "@/lib/stageService";

export function TemplateStageBuilder() {
  return (
    <StageForm
      heading="순서도 문제 만들기"
      helperText="문장, 선택지, 빈칸 목록을 입력하면 오른쪽 순서도가 바로 갱신됩니다."
      onSubmit={createStage}
      submitLabel="Firestore에 저장"
      successMessage="문제가 저장되었습니다."
    />
  );
}
