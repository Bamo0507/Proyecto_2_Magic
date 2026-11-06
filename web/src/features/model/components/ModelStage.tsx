"use client"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { SectionTabs } from "@/features/shared/components/SectionTabs"
import { AssumptionsPanel } from "@/features/model/components/AssumptionsPanel"
import { MarketPanel } from "@/features/model/components/MarketPanel"
import { PackAnatomyPanel } from "@/features/model/components/PackAnatomyPanel"
import { ProbabilityPanel } from "@/features/model/components/ProbabilityPanel"
import { useModelData } from "@/features/model/hooks/useModelData"
import { texts } from "@/i18n/texts"

export function ModelStage() {
  const { state, retry } = useModelData()
  const labels = texts.model

  if (state.status !== "ready") {
    return (
      <div className="m-auto py-6">
        <CardBackState status={state.status} onRetry={retry} />
      </div>
    )
  }

  const model = state.data
  return (
    <SectionTabs
      label={labels.tabsLabel}
      tabs={[
        { value: "pack", label: labels.tabs.pack, content: <PackAnatomyPanel model={model} /> },
        { value: "probability", label: labels.tabs.probability, content: <ProbabilityPanel model={model} /> },
        { value: "market", label: labels.tabs.market, content: <MarketPanel model={model} /> },
        { value: "assumptions", label: labels.tabs.assumptions, content: <AssumptionsPanel model={model} /> },
      ]}
    />
  )
}
