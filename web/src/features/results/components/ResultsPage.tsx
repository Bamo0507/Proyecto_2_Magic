import { SectionPage } from "@/features/shared/components/SectionPage"
import { ResultsContent } from "@/features/results/components/ResultsContent"

export function ResultsPage() {
  return (
    <SectionPage sectionKey="results" tallField>
      <ResultsContent />
    </SectionPage>
  )
}
