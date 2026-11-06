import { SectionPage } from "@/features/shared/components/SectionPage"
import { SimulationStage } from "@/features/simulation/components/SimulationStage"

export function SimulationPage() {
  return (
    <SectionPage sectionKey="simulation" tallField>
      <SimulationStage />
    </SectionPage>
  )
}
