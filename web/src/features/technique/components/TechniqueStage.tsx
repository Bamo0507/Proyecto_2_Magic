"use client"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { SectionTabs } from "@/features/shared/components/SectionTabs"
import { BoxProbabilityPanel } from "@/features/technique/components/BoxProbabilityPanel"
import { IdeaPanel } from "@/features/technique/components/IdeaPanel"
import { RuleInActionPanel } from "@/features/technique/components/RuleInActionPanel"
import { WhyItWorksPanel } from "@/features/technique/components/WhyItWorksPanel"
import { useTechniqueData } from "@/features/technique/hooks/useTechniqueData"
import { texts } from "@/i18n/texts"

export function TechniqueStage() {
  const { state, retry } = useTechniqueData()
  const labels = texts.technique

  if (state.status !== "ready") {
    return (
      <div className="m-auto py-6">
        <CardBackState status={state.status} onRetry={retry} />
      </div>
    )
  }

  const technique = state.data
  return (
    <SectionTabs
      label={labels.tabsLabel}
      tabs={[
        { value: "idea", label: labels.tabs.idea, content: <IdeaPanel technique={technique} /> },
        { value: "probability", label: labels.tabs.probability, content: <BoxProbabilityPanel technique={technique} /> },
        { value: "action", label: labels.tabs.action, content: <RuleInActionPanel technique={technique} /> },
        { value: "why", label: labels.tabs.why, content: <WhyItWorksPanel technique={technique} /> },
      ]}
    />
  )
}
