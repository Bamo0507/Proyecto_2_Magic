import { SectionPage } from "@/features/shared/components/SectionPage"
import { ValidationStage } from "@/features/validation/components/ValidationStage"

export function ValidationPage() {
  return (
    <SectionPage sectionKey="validation" tallField>
      <ValidationStage />
    </SectionPage>
  )
}
