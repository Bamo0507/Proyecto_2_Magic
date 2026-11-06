import { SectionPage } from "@/features/shared/components/SectionPage"
import { TechniqueStage } from "@/features/technique/components/TechniqueStage"

export function TechniquePage() {
  return (
    <SectionPage sectionKey="technique" tallField>
      <TechniqueStage />
    </SectionPage>
  )
}
