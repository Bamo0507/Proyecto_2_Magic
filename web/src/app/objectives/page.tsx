import type { Metadata } from "next"

import { ObjectivesPage } from "@/features/objectives/components/ObjectivesPage"
import { texts } from "@/i18n/texts"

export const metadata: Metadata = {
  title: texts.sections.objectives.title,
  description: texts.sections.objectives.text,
}

export default function Page() {
  return <ObjectivesPage />
}
