import { SectionPage } from "@/features/shared/components/SectionPage"
import { ProblemStage } from "@/features/problem/components/ProblemStage"

export function ProblemPage() {
  return (
    <SectionPage sectionKey="problem" tallField>
      <ProblemStage />
    </SectionPage>
  )
}
