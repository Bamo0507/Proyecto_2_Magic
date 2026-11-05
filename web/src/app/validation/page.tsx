import type { Metadata } from "next"

import { ValidationPage } from "@/features/validation/components/ValidationPage"
import { texts } from "@/i18n/texts"

export const metadata: Metadata = {
  title: texts.sections.validation.title,
  description: texts.sections.validation.text,
}

export default function Page() {
  return <ValidationPage />
}
