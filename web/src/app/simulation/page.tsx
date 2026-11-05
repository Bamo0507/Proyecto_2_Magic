import type { Metadata } from "next"

import { SimulationPage } from "@/features/simulation/components/SimulationPage"
import { texts } from "@/i18n/texts"

export const metadata: Metadata = {
  title: texts.sections.simulation.title,
  description: texts.sections.simulation.text,
}

export default function Page() {
  return <SimulationPage />
}
