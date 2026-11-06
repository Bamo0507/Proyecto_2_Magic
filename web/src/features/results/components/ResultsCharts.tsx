import { formatMoney } from "@/features/shared/format"
import type { ResultReplica, SensitivityPoint, StrategySummary } from "@/features/results/types/resultsData"
import { texts } from "@/i18n/texts"

const RESULT_LABELS = texts.results

interface DispersionChartProps {
  strategies: StrategySummary[]
  replicas: ResultReplica[]
}

export function DispersionChart({ strategies, replicas }: DispersionChartProps) {
  const maximum = Math.ceil(Math.max(...replicas.map((replica) => replica.netCost)) / 500) * 500
  const plotTop = 20
  const plotBottom = 275
  const plotHeight = plotBottom - plotTop
  const yPosition = (amount: number) => plotBottom - (amount / maximum) * plotHeight
  const xPosition = (index: number) => 85 + index * 100
  const ticks = Array.from({ length: 5 }, (_, index) => (maximum * index) / 4)

  return (
    <div className="rounded-lg bg-card-paper p-3 text-card-ink shadow-card">
      <h2 className="font-display text-2xl font-bold">{RESULT_LABELS.dispersion.title}</h2>
      <p className="font-sans text-sm">{RESULT_LABELS.dispersion.subtitle}</p>
      <div className="mt-3 flex items-center gap-4 font-sans text-sm">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted ring-1 ring-card-ink" />{RESULT_LABELS.dispersion.replicaLegend}</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-primary ring-1 ring-card-ink" />{RESULT_LABELS.dispersion.meanLegend}</span>
      </div>
      <svg viewBox="0 0 550 325" className="mx-auto mt-2 w-full max-w-[42rem]" role="img" aria-label={`${RESULT_LABELS.dispersion.title}. ${RESULT_LABELS.dispersion.axis}`}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1="55" x2="535" y1={yPosition(tick)} y2={yPosition(tick)} className="stroke-card-ink/15" strokeDasharray="3 5" />
            <text x="50" y={yPosition(tick) + 4} textAnchor="end" className="fill-card-ink font-sans text-[13px]">{Math.round(tick)}</text>
          </g>
        ))}
        {strategies.map((strategy, index) => {
          const center = xPosition(index)
          const isOptimal = strategy.key === "parada_optima"
          return (
            <g key={strategy.key}>
              {replicas.filter((replica) => replica.strategy === strategy.key).map((replica) => {
                const jitter = ((replica.seed * 13) % 17) - 8
                return (
                  <circle key={replica.seed} cx={center + jitter * 1.6} cy={yPosition(replica.netCost)} r={isOptimal ? 3.5 : 2.8} className={isOptimal ? "fill-primary stroke-card-ink" : "fill-muted stroke-card-ink/70"} strokeWidth="0.8">
                    <title>{`${RESULT_LABELS.strategyNames[strategy.key as keyof typeof RESULT_LABELS.strategyNames]} · ${RESULT_LABELS.dispersion.seed} ${replica.seed}: ${formatMoney(replica.netCost)}`}</title>
                  </circle>
                )
              })}
              <line x1={center} x2={center} y1={yPosition(strategy.ci95[1])} y2={yPosition(strategy.ci95[0])} className="stroke-card-ink" strokeWidth="2" />
              <line x1={center - 12} x2={center + 12} y1={yPosition(strategy.mean)} y2={yPosition(strategy.mean)} className="stroke-primary" strokeWidth="5" />
              <text x={center} y="299" textAnchor="middle" className="fill-card-ink font-sans text-[15px]">{index + 1}</text>
            </g>
          )
        })}
        <text x="17" y="160" transform="rotate(-90 17 160)" textAnchor="middle" className="fill-card-ink font-sans text-[14px]">{RESULT_LABELS.dispersion.axis}</text>
      </svg>
      <ol className="nums grid grid-cols-2 gap-x-4 gap-y-1 font-sans text-sm sm:grid-cols-3">
        {strategies.map((strategy, index) => <li key={strategy.key}>{index + 1}. {RESULT_LABELS.strategyNames[strategy.key as keyof typeof RESULT_LABELS.strategyNames]}</li>)}
      </ol>
      <div className="sr-only"><table>
        <caption>{RESULT_LABELS.dispersion.tableCaption}</caption>
        <thead><tr><th>{RESULT_LABELS.comparison.strategy}</th><th>{RESULT_LABELS.dispersion.seed}</th><th>{RESULT_LABELS.dispersion.value}</th></tr></thead>
        <tbody>{replicas.map((replica) => <tr key={`${replica.strategy}-${replica.seed}`}><td>{RESULT_LABELS.strategyNames[replica.strategy as keyof typeof RESULT_LABELS.strategyNames]}</td><td>{replica.seed}</td><td>{formatMoney(replica.netCost)}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}

interface SensitivityChartProps {
  title: string
  axis: string
  points: SensitivityPoint[]
  valueLabel: (point: SensitivityPoint) => string
}

export function SensitivityChart({ title, axis, points, valueLabel }: SensitivityChartProps) {
  const sorted = [...points].sort((first, second) => first.value - second.value)
  const values = sorted.flatMap((point) => [point.baselineCost, point.optimalCost])
  const minimum = Math.floor(Math.min(...values) / 200) * 200
  const maximum = Math.ceil(Math.max(...values) / 200) * 200
  const span = maximum - minimum || 1
  const xPosition = (index: number) => 54 + index * (340 / Math.max(sorted.length - 1, 1))
  const yPosition = (amount: number) => 177 - ((amount - minimum) / span) * 150
  const pathFor = (select: (point: SensitivityPoint) => number) => sorted.map((point, index) => `${index === 0 ? "M" : "L"}${xPosition(index)},${yPosition(select(point))}`).join(" ")
  const profitableCount = sorted.filter((point) => point.boxProfitableFromResale).length

  return (
    <div className="min-w-0 rounded-lg bg-card-paper p-3 text-card-ink shadow-card">
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <svg viewBox="0 0 420 235" className="w-full" role="img" aria-label={`${title}. ${RESULT_LABELS.sensitivity.axis}`}>
        {profitableCount > 0 && <rect x="45" y="20" width={xPosition(profitableCount - 1) - 45 + 12} height="160" className="fill-muted/60" />}
        {[minimum, (minimum + maximum) / 2, maximum].map((tick) => <g key={tick}><line x1="50" x2="405" y1={yPosition(tick)} y2={yPosition(tick)} className="stroke-card-ink/20" strokeDasharray="3 4" /><text x="45" y={yPosition(tick) + 4} textAnchor="end" className="fill-card-ink font-sans text-[12px]">{Math.round(tick)}</text></g>)}
        <path d={pathFor((point) => point.baselineCost)} fill="none" className="stroke-muted-foreground" strokeWidth="3" strokeDasharray="6 4" />
        <path d={pathFor((point) => point.optimalCost)} fill="none" className="stroke-primary" strokeWidth="4" />
        {sorted.map((point, index) => <g key={point.value}>
          <rect x={xPosition(index) - 4} y={yPosition(point.baselineCost) - 4} width="8" height="8" className="fill-muted-foreground stroke-card-ink" strokeWidth="0.7"><title>{`${valueLabel(point)} · ${RESULT_LABELS.sensitivity.baseline}: ${formatMoney(point.baselineCost)}`}</title></rect>
          <circle cx={xPosition(index)} cy={yPosition(point.optimalCost)} r="4.5" className="fill-primary stroke-card-ink" strokeWidth="0.7"><title>{`${valueLabel(point)} · ${RESULT_LABELS.sensitivity.optimal}: ${formatMoney(point.optimalCost)}`}</title></circle>
          <text x={xPosition(index)} y="200" textAnchor="middle" className="fill-card-ink font-sans text-[12px]">{valueLabel(point)}</text>
        </g>)}
        <text x="225" y="226" textAnchor="middle" className="fill-card-ink font-sans text-[13px]">{axis}</text>
        <text x="12" y="105" transform="rotate(-90 12 105)" textAnchor="middle" className="fill-card-ink font-sans text-[12px]">{RESULT_LABELS.sensitivity.axis}</text>
      </svg>
      {profitableCount > 0 && <p className="font-sans text-sm">▧ {RESULT_LABELS.sensitivity.resaleZone}</p>}
      <div className="sr-only"><table>
        <caption>{title} · {RESULT_LABELS.sensitivity.tableCaption}</caption>
        <thead><tr><th>{axis}</th><th>{RESULT_LABELS.sensitivity.baseline}</th><th>{RESULT_LABELS.sensitivity.optimal}</th></tr></thead>
        <tbody>{sorted.map((point) => <tr key={point.value}><td>{valueLabel(point)}</td><td>{formatMoney(point.baselineCost)}</td><td>{formatMoney(point.optimalCost)}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}
