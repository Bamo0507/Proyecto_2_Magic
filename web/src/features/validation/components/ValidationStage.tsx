"use client"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { SectionTabs } from "@/features/shared/components/SectionTabs"
import { RealPanel } from "@/features/validation/components/RealPanel"
import { VerificationPanel } from "@/features/validation/components/VerificationPanel"
import { useValidationData } from "@/features/validation/hooks/useValidationData"
import { texts } from "@/i18n/texts"

export function ValidationStage() {
  const { state, retry } = useValidationData()
  const labels = texts.validation

  if (state.status !== "ready") {
    return (
      <div className="m-auto py-6">
        <CardBackState status={state.status} onRetry={retry} />
      </div>
    )
  }

  const validation = state.data
  return (
    <SectionTabs
      label={labels.tabsLabel}
      tabs={[
        ...(validation.realReference
          ? [{ value: "real", label: labels.tabs.real, content: <RealPanel validation={validation} reference={validation.realReference} /> }]
          : []),
        { value: "verification", label: labels.tabs.verification, content: <VerificationPanel validation={validation} /> },
      ]}
    />
  )
}
