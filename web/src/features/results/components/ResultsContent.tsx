"use client"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { ScoreSheet, type ScoreSheetColumn } from "@/features/shared/components/ScoreSheet"
import { SectionTabs } from "@/features/shared/components/SectionTabs"
import { fillTemplate, formatMoney, formatPrecisePercent } from "@/features/shared/format"
import { DispersionChart, SavingsBars } from "@/features/results/components/ResultsCharts"
import { useResultsData } from "@/features/results/hooks/useResultsData"
import type { ResultsData } from "@/features/results/types/resultsData"
import { texts } from "@/i18n/texts"

const labels = texts.results
const DECIMAL_FORMAT = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const PERCENT_FORMAT = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 })

// The talk compares the three unoptimized strategies with the optimal stopping rule; results.json also carries the
// rule without boxes, an extra experiment the report covers but the slides leave out
const PRESENTED_STRATEGIES = new Set(["comprar_sueltas", "solo_sobres", "solo_cajas", "parada_optima"])

function presentedResults(data: ResultsData): ResultsData {
  return {
    ...data,
    strategies: data.strategies.filter((strategy) => PRESENTED_STRATEGIES.has(strategy.key)),
    replicas: data.replicas.filter((replica) => PRESENTED_STRATEGIES.has(replica.strategy)),
    improvements: data.improvements.filter((item) => PRESENTED_STRATEGIES.has(item.reference)),
  }
}

function strategyName(key: string) {
  return labels.strategyNames[key as keyof typeof labels.strategyNames] ?? key
}

function percent(value: number) {
  return PERCENT_FORMAT.format(value)
}

function comparisonContent(data: ResultsData) {
  const headings: ScoreSheetColumn[] = [
    { key: "strategy", label: labels.comparison.strategy },
    { key: "mean", label: labels.comparison.mean, numeric: true, emphasis: true },
    { key: "ci", label: labels.comparison.ci, numeric: true },
    { key: "packs", label: labels.comparison.packs, numeric: true },
    { key: "boxes", label: labels.comparison.boxes, numeric: true },
  ]
  const rows = data.strategies.map((strategy) => ({
    strategy: strategyName(strategy.key),
    mean: formatMoney(strategy.mean),
    ci: `${formatMoney(strategy.ci95[0])}–${formatMoney(strategy.ci95[1])}`,
    packs: DECIMAL_FORMAT.format(strategy.averagePacks),
    boxes: DECIMAL_FORMAT.format(strategy.averageBoxes),
  }))

  return <div className="flex flex-col gap-3">
    <ScoreSheet caption={labels.comparison.caption} columns={headings} rows={rows} footnote={labels.comparison.note} className="hidden sm:block" />
    <div className="flex flex-col gap-2 sm:hidden">
      <h2 className="font-display text-xl font-bold">{labels.comparison.caption}</h2>
      {data.strategies.map((strategy) => <article key={strategy.key} className="rounded-lg bg-card-paper p-3 text-card-ink shadow-card">
        <h3 className="font-display text-lg font-bold">{strategyName(strategy.key)}</h3>
        <p className="nums mt-1 font-display text-2xl font-extrabold">{formatMoney(strategy.mean)}</p>
        <p className="nums font-sans text-sm">{labels.comparison.ci}: {formatMoney(strategy.ci95[0])}–{formatMoney(strategy.ci95[1])}</p>
        <p className="nums font-sans text-sm">{labels.comparison.packs}: {DECIMAL_FORMAT.format(strategy.averagePacks)} · {labels.comparison.boxes}: {DECIMAL_FORMAT.format(strategy.averageBoxes)}</p>
      </article>)}
      <p className="rounded-lg bg-card p-3 font-sans text-sm text-card-foreground">{labels.comparison.note}</p>
    </div>
    <p className="rounded-lg bg-card p-3 font-sans text-sm leading-snug text-card-foreground">{labels.comparison.tie}</p>
  </div>
}

// One card per unoptimized strategy: how much less the optimal stopping rule costs, and the two averages behind it
function improvementContent(data: ResultsData) {
  const optimal = data.strategies.find((strategy) => strategy.key === "parada_optima")
  if (!optimal) return null
  const cards = data.strategies.flatMap((strategy) => {
    const improvement = data.improvements.find((item) => item.reference === strategy.key)
    return improvement ? [{ strategy, improvement }] : []
  })

  return <div className="m-auto flex w-full flex-col gap-5">
    <h2 className="font-display text-2xl font-bold">{labels.improvement.title}</h2>
    <ol className="grid gap-4 md:grid-cols-3">
      {cards.map(({ strategy, improvement }) => <li key={strategy.key} className="flex flex-col gap-1 rounded-xl border-t-4 border-mana-gold bg-card-paper p-5 text-card-ink shadow-card">
        <h3 className="font-display text-xl font-bold">{strategyName(strategy.key)}</h3>
        <p className="nums mt-2 font-display text-6xl leading-none font-extrabold">{percent(improvement.rate)}</p>
        <p className="font-sans text-base font-bold">{labels.improvement.reductionLabel}</p>
        <p className="nums mt-3 border-t border-card-ink/20 pt-2 font-sans text-base">
          {fillTemplate(labels.improvement.costTemplate, { from: formatMoney(strategy.mean), to: formatMoney(optimal.mean) })}
        </p>
      </li>)}
    </ol>
  </div>
}

function sensitivityContent(data: ResultsData) {
  const boxPoints = data.sensitivity.filter((point) => point.parameter === "factor_precio_caja")
  const commissionPoints = data.sensitivity.filter((point) => point.parameter === "comision_venta")
  // The box sweep keeps the commission at its real value, and the real box price is the unscaled one
  const realCommission = boxPoints.find((point) => point.value === 1)?.commission
  const highestSaving = Math.max(...data.sensitivity.map((point) => point.reduction ?? 0))

  return <div className="m-auto flex w-full flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-display text-2xl font-bold">{labels.sensitivity.title}</h2>
      <p className="font-sans text-base text-foreground/85">{labels.sensitivity.subtitle}</p>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <SavingsBars title={labels.sensitivity.boxTitle} points={boxPoints} isReal={(point) => point.value === 1} valueLabel={(point) => formatMoney(point.boxPrice)} percentLabel={percent} highestSaving={highestSaving} />
      <SavingsBars title={labels.sensitivity.commissionTitle} points={commissionPoints} isReal={(point) => point.commission === realCommission} valueLabel={(point) => formatPrecisePercent(point.commission)} percentLabel={percent} highestSaving={highestSaving} />
    </div>
    <p className="font-sans text-sm leading-snug text-foreground/85">{labels.sensitivity.tieNote}</p>
  </div>
}

export function ResultsContent() {
  const { state, retry } = useResultsData()
  if (state.status !== "ready") return <div className="m-auto"><CardBackState status={state.status} onRetry={retry} /></div>

  const data = presentedResults(state.data)
  return <SectionTabs label={labels.tabsLabel} tabs={[
    { value: "comparison", label: labels.tabs.comparison, content: comparisonContent(data) },
    { value: "dispersion", label: labels.tabs.dispersion, content: <DispersionChart strategies={data.strategies} replicas={data.replicas} /> },
    { value: "improvement", label: labels.tabs.improvement, content: improvementContent(data) },
    { value: "sensitivity", label: labels.tabs.sensitivity, content: sensitivityContent(data) },
  ]} />
}
