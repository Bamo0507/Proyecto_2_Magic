import { SectionPage } from "@/features/shared/components/SectionPage"
import { ModelStage } from "@/features/model/components/ModelStage"

export function ModelPage() {
  return (
    <SectionPage sectionKey="model" tallField>
      <ModelStage />
    </SectionPage>
  )
}
