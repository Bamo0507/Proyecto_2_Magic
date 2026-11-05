import type { Metadata } from "next"

import { TechniquePage } from "@/features/technique/components/TechniquePage"
import { texts } from "@/i18n/texts"

export const metadata: Metadata = {
  title: texts.sections.technique.title,
  description: texts.sections.technique.text,
}

export default function Page() {
  return <TechniquePage />
}
