import type { Metadata } from "next"

import { ProblemPage } from "@/features/problem/components/ProblemPage"
import { texts } from "@/i18n/texts"

export const metadata: Metadata = {
  title: texts.sections.problem.title,
  description: texts.sections.problem.text,
}

export default function Page() {
  return <ProblemPage />
}
