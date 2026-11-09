"use client"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { SectionTabs } from "@/features/shared/components/SectionTabs"
import { ConclusionsPanel } from "@/features/validation/components/ConclusionsPanel"
import { RealPanel } from "@/features/validation/components/RealPanel"
import { VerificationPanel } from "@/features/validation/components/VerificationPanel"
import { useResultsSummary } from "@/features/validation/hooks/useResultsSummary"
import { useValidationData } from "@/features/validation/hooks/useValidationData"
import { texts } from "@/i18n/texts"

export function ValidationStage() {
  const validationData = useValidationData()
  const resultsData = useResultsSummary()
  const labels = texts.validation

  if (validationData.state.status !== "ready" || resultsData.state.status !== "ready") {
    const failed = validationData.state.status === "error" || resultsData.state.status === "error"
    const retry = () => {
      if (validationData.state.status === "error") validationData.retry()
      if (resultsData.state.status === "error") resultsData.retry()
    }
    return (
      <div className="m-auto py-6">
        <CardBackState status={failed ? "error" : "loading"} onRetry={retry} />
      </div>
    )
  }

  const validation = validationData.state.data
  // The tabs follow the specific objectives: the simulator is checked, compared with the real price, then concluded
  return (
    <SectionTabs
      label={labels.tabsLabel}
      tabs={[
        { value: "verification", label: labels.tabs.verification, content: <VerificationPanel validation={validation} /> },
        ...(validation.realReference
          ? [{ value: "real", label: labels.tabs.real, content: <RealPanel validation={validation} reference={validation.realReference} /> }]
          : []),
        {
          value: "conclusions",
          label: labels.tabs.conclusions,
          content: <ConclusionsPanel validation={validation} results={resultsData.state.data} />,
        },
      ]}
    />
  )
}
