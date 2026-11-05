import type { Metadata } from "next"

import { ResultsPage } from "@/features/results/components/ResultsPage"
import { texts } from "@/i18n/texts"

export const metadata: Metadata = {
  title: texts.sections.results.title,
  description: texts.sections.results.text,
}

export default function Page() {
  return <ResultsPage />
}
