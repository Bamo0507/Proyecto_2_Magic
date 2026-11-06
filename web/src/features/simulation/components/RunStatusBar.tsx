import type { ReactNode } from "react"

import { fillTemplate, formatMoney } from "@/features/shared/format"
import type { RunStatus } from "@/features/simulation/simulationScenes"
import type { SimulationRun } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

interface RunStatusBarProps {
  run: SimulationRun
  status: RunStatus
  action?: ReactNode
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="font-sans text-sm font-bold text-muted-foreground">{label}</dt>
      <dd className="nums font-display text-2xl leading-tight font-extrabold whitespace-nowrap">{value}</dd>
    </div>
  )
}

export function RunStatusBar({ run, status, action }: RunStatusBarProps) {
  const labels = texts.simulation

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 rounded-2xl bg-card px-4 py-3 shadow-card ring-1 ring-border md:px-5">
      <div className="flex flex-col">
        <p className="font-sans text-sm font-bold text-muted-foreground">{labels.stageLabel}</p>
        <p className="font-display text-xl leading-tight font-bold">{fillTemplate(labels.seedTemplate, { seed: run.seed })}</p>
      </div>
      <div className="flex items-end gap-4 sm:gap-6">
        <dl className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6" aria-live="polite">
          <Stat label={labels.missingLabel} value={fillTemplate(labels.missingTemplate, { missing: status.missing, total: run.baseSetSize })} />
          <Stat label={labels.packsLabel} value={String(status.packsOpened)} />
          <Stat label={labels.spendLabel} value={formatMoney(status.spend)} />
        </dl>
        {action}
      </div>
    </div>
  )
}
