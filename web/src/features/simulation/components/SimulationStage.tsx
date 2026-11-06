"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { PlaymatBackground } from "@/features/shared/components/PlaymatBackground"
import { SimulationPlayer } from "@/features/simulation/components/SimulationPlayer"
import { useSimulationRun } from "@/features/simulation/hooks/useSimulationRun"
import { texts } from "@/i18n/texts"

export function SimulationStage() {
  const { state, retry } = useSimulationRun()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = previousOverflow
    }
  }, [expanded])

  if (state.status !== "ready") {
    return (
      <div className="m-auto py-6">
        <CardBackState status={state.status} onRetry={retry} />
      </div>
    )
  }

  const player = (
    <SimulationPlayer run={state.data} expanded={expanded} onToggleExpanded={() => setExpanded((current) => !current)} />
  )

  if (!expanded) return <div className="flex min-h-0 flex-1 flex-col">{player}</div>

  // Mounted on the body because the section field animates with a transform, which would trap a fixed overlay inside it
  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label={texts.simulation.expandedLabel}
      data-captures-arrow-keys
      className="fixed inset-0 isolate z-50 flex flex-col p-4 md:p-8"
    >
      <PlaymatBackground />
      {player}
    </div>,
    document.body
  )
}
