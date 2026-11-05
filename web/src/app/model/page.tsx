import type { Metadata } from "next"

import { ModelPage } from "@/features/model/components/ModelPage"
import { texts } from "@/i18n/texts"

export const metadata: Metadata = {
  title: texts.sections.model.title,
  description: texts.sections.model.text,
}

export default function Page() {
  return <ModelPage />
}
