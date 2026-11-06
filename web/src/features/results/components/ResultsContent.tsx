"use client"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { ScoreSheet, type ScoreSheetColumn } from "@/features/shared/components/ScoreSheet"
import { SectionTabs } from "@/features/shared/components/SectionTabs"
import { fillTemplate, formatMoney } from "@/features/shared/format"
import { DispersionChart, SensitivityChart } from "@/features/results/components/ResultsCharts"
import { useResultsData } from "@/features/results/hooks/useResultsData"
import type { Improvement, ResultsData, SensitivityPoint } from "@/features/results/types/resultsData"
import { texts } from "@/i18n/texts"

const labels = texts.results
const DECIMAL_FORMAT = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const PERCENT_FORMAT = new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 })

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
    strategy: `${strategyName(strategy.key)}${strategy.key === data.baselineStrategy ? ` · ${labels.baseBadge}` : strategy.key === "parada_optima" ? ` · ${labels.improvedBadge}` : ""}`,
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
        {strategy.key === data.baselineStrategy && <p className="font-sans text-sm font-bold">{labels.baseBadge}</p>}
        {strategy.key === "parada_optima" && <p className="font-sans text-sm font-bold">{labels.improvedBadge}</p>}
        <p className="nums mt-1 font-display text-2xl font-extrabold">{formatMoney(strategy.mean)}</p>
        <p className="nums font-sans text-sm">{labels.comparison.ci}: {formatMoney(strategy.ci95[0])}–{formatMoney(strategy.ci95[1])}</p>
        <p className="nums font-sans text-sm">{labels.comparison.packs}: {DECIMAL_FORMAT.format(strategy.averagePacks)} · {labels.comparison.boxes}: {DECIMAL_FORMAT.format(strategy.averageBoxes)}</p>
      </article>)}
      <p className="rounded-lg bg-card p-3 font-sans text-sm text-card-foreground">{labels.comparison.note}</p>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <p className="rounded-lg bg-card p-3 font-sans text-sm leading-snug text-card-foreground">{labels.comparison.tie}</p>
      <p className="rounded-lg bg-card p-3 font-sans text-sm leading-snug text-card-foreground">{labels.comparison.ciExplanation}</p>
    </div>
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {data.strategies.map((strategy) => <li key={strategy.key} className="rounded-lg border border-dashed border-playmat-stitch bg-felt-raised px-3 py-2 font-sans text-sm text-foreground">
        <span className="font-bold">{strategyName(strategy.key)}</span><br />
        {fillTemplate(labels.comparison.rangeTemplate, { min: formatMoney(strategy.min), max: formatMoney(strategy.max) })}
      </li>)}
    </ul>
  </div>
}

function improvementContent(data: ResultsData) {
  const headline = data.improvements.find((item) => item.reference === "comprar_sueltas")
  const againstBoxes = data.improvements.find((item) => item.reference === "solo_cajas")
  if (!headline || !againstBoxes) return null

  return <div className="flex flex-col gap-4">
    <article className="rounded-xl border-l-4 border-mana-gold bg-card-paper p-5 text-card-ink shadow-card">
      <h2 className="font-display text-2xl font-bold">{labels.improvement.title}</h2>
      <p className="nums mt-3 font-display text-[clamp(3rem,8vw,5rem)] leading-none font-extrabold text-card-ink">{percent(headline.rate)}</p>
      <p className="font-sans text-base font-bold">{labels.improvement.against}</p>
      <p className="nums mt-2 font-sans text-base">{fillTemplate(labels.improvement.ciTemplate, { low: percent(headline.ci95Rate[0]), high: percent(headline.ci95Rate[1]) })}</p>
      <p className="nums font-sans text-base">{fillTemplate(labels.improvement.winTemplate, { wins: Math.round(headline.winRate * 10), total: 10 })}</p>
    </article>
    <div className="grid gap-3 md:grid-cols-3">
      {data.improvements.filter((item) => item.reference !== headline.reference).map((item) => <ImprovementCard key={item.reference} item={item} />)}
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <p className="rounded-lg bg-card p-3 font-sans text-sm leading-snug text-card-foreground">{labels.improvement.paired}</p>
      <p className="rounded-lg bg-card p-3 font-sans text-sm leading-snug text-card-foreground">{labels.improvement.boxesCaveat}</p>
    </div>
  </div>
}

function ImprovementCard({ item }: { item: Improvement }) {
  return <article className="rounded-lg bg-card-paper p-4 text-card-ink shadow-card">
    <h3 className="font-display text-lg font-bold">{fillTemplate(labels.improvement.comparisonTemplate, { name: strategyName(item.reference).toLowerCase() })}</h3>
    <p className="nums font-display text-3xl font-extrabold">{percent(item.rate)}</p>
    <p className="nums font-sans text-sm">{fillTemplate(labels.improvement.ciTemplate, { low: percent(item.ci95Rate[0]), high: percent(item.ci95Rate[1]) })}</p>
  </article>
}

function sensitivityContent(data: ResultsData) {
  const boxPoints = data.sensitivity.filter((point) => point.parameter === "factor_precio_caja")
  const commissionPoints = data.sensitivity.filter((point) => point.parameter === "comision_venta")
  return <div className="flex flex-col gap-3">
    <h2 className="font-display text-2xl font-bold">{labels.sensitivity.title}</h2>
    <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-lg bg-card px-3 py-2 font-sans text-sm">
      <span>● {labels.sensitivity.optimal}</span><span>■ {labels.sensitivity.baseline}</span>
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      <SensitivityChart title={labels.sensitivity.boxTitle} axis={labels.sensitivity.boxAxis} points={boxPoints} valueLabel={(point) => formatMoney(point.boxPrice)} />
      <SensitivityChart title={labels.sensitivity.commissionTitle} axis={labels.sensitivity.commissionAxis} points={commissionPoints} valueLabel={(point) => percent(point.commission)} />
    </div>
    <div className="hidden overflow-x-auto rounded-lg bg-card-paper p-2 text-card-ink shadow-card sm:block">
      <table className="w-full font-sans text-sm">
        <caption className="px-2 py-1 text-left font-display text-lg font-bold">{labels.sensitivity.tableCaption}</caption>
        <thead><tr className="border-b border-card-ink/25"><th className="px-2 py-1 text-left">{labels.sensitivity.condition}</th><th className="px-2 py-1 text-right">{labels.sensitivity.baseline}</th><th className="px-2 py-1 text-right">{labels.sensitivity.optimal}</th><th className="px-2 py-1 text-right">{labels.sensitivity.reduction}</th></tr></thead>
        <tbody>{data.sensitivity.map((point) => <SensitivityRow key={`${point.parameter}-${point.value}`} point={point} />)}</tbody>
      </table>
    </div>
    <div className="flex flex-col gap-2 sm:hidden">
      <h3 className="font-display text-xl font-bold">{labels.sensitivity.tableCaption}</h3>
      {data.sensitivity.map((point) => <article key={`${point.parameter}-${point.value}`} className="rounded-lg bg-card-paper p-3 font-sans text-sm text-card-ink shadow-card">
        <h4 className="font-display text-lg font-bold">{point.parameter === "factor_precio_caja" ? `${labels.sensitivity.boxTitle}: ${formatMoney(point.boxPrice)}` : `${labels.sensitivity.commissionTitle}: ${percent(point.commission)}`}</h4>
        <p className="nums">{labels.sensitivity.baseline}: {formatMoney(point.baselineCost)}</p>
        <p className="nums">{labels.sensitivity.optimal}: {formatMoney(point.optimalCost)}</p>
        <p className="nums">{labels.sensitivity.reduction}: {point.reduction === null ? labels.sensitivity.undefined : percent(point.reduction)}</p>
        {point.boxProfitableFromResale && <p className="font-bold">{labels.sensitivity.resaleZone}</p>}
      </article>)}
    </div>
  </div>
}

function SensitivityRow({ point }: { point: SensitivityPoint }) {
  const condition = point.parameter === "factor_precio_caja" ? `${labels.sensitivity.boxTitle}: ${formatMoney(point.boxPrice)}` : `${labels.sensitivity.commissionTitle}: ${percent(point.commission)}`
  return <tr className="border-b border-card-ink/10 last:border-0">
    <td className="px-2 py-1">{condition}{point.boxProfitableFromResale && <span className="block font-bold text-card-ink">{labels.sensitivity.resaleZone}</span>}</td>
    <td className="nums px-2 py-1 text-right">{formatMoney(point.baselineCost)}</td>
    <td className="nums px-2 py-1 text-right">{formatMoney(point.optimalCost)}</td>
    <td className="nums px-2 py-1 text-right">{point.reduction === null ? labels.sensitivity.undefined : percent(point.reduction)}</td>
  </tr>
}

function answersContent(data: ResultsData) {
  const loose = data.improvements.find((item) => item.reference === "comprar_sueltas")
  const boxes = data.improvements.find((item) => item.reference === "solo_cajas")
  if (!loose || !boxes) return null
  const answers = [
    { title: labels.answers.what, text: labels.answers.whatText },
    { title: labels.answers.howMuch, text: fillTemplate(labels.answers.howMuchTemplate, { rate: percent(loose.rate), boxesRate: percent(boxes.rate) }) },
    { title: labels.answers.when, text: labels.answers.whenText },
    { title: labels.answers.trust, text: fillTemplate(labels.answers.trustTemplate, { count: boxes.replicates, low: percent(boxes.ci95Rate[0]), high: percent(boxes.ci95Rate[1]) }) },
  ]
  return <div className="flex flex-col gap-4">
    <h2 className="font-display text-2xl font-bold">{labels.answers.title}</h2>
    <div className="grid gap-3 md:grid-cols-2">
      {answers.map((answer) => <article key={answer.title} className="rounded-lg border-l-4 border-mana-gold bg-card-paper p-4 text-card-ink shadow-card">
        <h3 className="font-display text-xl font-bold">{answer.title}</h3>
        <p className="font-sans text-base leading-snug">{answer.text}</p>
      </article>)}
    </div>
  </div>
}

export function ResultsContent() {
  const { state, retry } = useResultsData()
  if (state.status !== "ready") return <div className="m-auto"><CardBackState status={state.status} onRetry={retry} /></div>

  const data = state.data
  return <SectionTabs label={labels.tabsLabel} tabs={[
    { value: "comparison", label: labels.tabs.comparison, content: comparisonContent(data) },
    { value: "dispersion", label: labels.tabs.dispersion, content: <DispersionChart strategies={data.strategies} replicas={data.replicas} /> },
    { value: "improvement", label: labels.tabs.improvement, content: improvementContent(data) },
    { value: "sensitivity", label: labels.tabs.sensitivity, content: sensitivityContent(data) },
    { value: "answers", label: labels.tabs.answers, content: answersContent(data) },
  ]} />
}
