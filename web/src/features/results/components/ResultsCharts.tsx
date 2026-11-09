import { cn } from "@/lib/utils"
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
  // Each strategy gets an equal column between the axis (x = 55) and the right edge of the grid lines (x = 535)
  const columnWidth = 480 / strategies.length
  const xPosition = (index: number) => 55 + columnWidth * (index + 0.5)
  const ticks = Array.from({ length: 5 }, (_, index) => (maximum * index) / 4)

  return (
    <div className="rounded-lg bg-card-paper p-3 text-card-ink shadow-card">
      <h2 className="font-display text-2xl font-bold">{RESULT_LABELS.dispersion.title}</h2>
      <p className="font-sans text-sm">{RESULT_LABELS.dispersion.subtitle}</p>
      <div className="mt-3 flex items-center gap-4 font-sans text-sm">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted ring-1 ring-card-ink" />{RESULT_LABELS.dispersion.replicaLegend}</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-primary ring-1 ring-card-ink" />{RESULT_LABELS.dispersion.meanLegend}</span>
      </div>
      {/* The numbered strategy list sits beside the chart so the whole card fits the field on a laptop screen */}
      <div className="mt-2 grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <svg viewBox="0 0 550 325" className="mx-auto w-full max-w-[38rem]" role="img" aria-label={`${RESULT_LABELS.dispersion.title}. ${RESULT_LABELS.dispersion.axis}`}>
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
              <line x1={center - 12} x2={center + 12} y1={yPosition(strategy.mean)} y2={yPosition(strategy.mean)} className="stroke-primary" strokeWidth="5" />
              <text x={center} y="299" textAnchor="middle" className="fill-card-ink font-sans text-[15px]">{index + 1}</text>
            </g>
          )
        })}
        <text x="17" y="160" transform="rotate(-90 17 160)" textAnchor="middle" className="fill-card-ink font-sans text-[14px]">{RESULT_LABELS.dispersion.axis}</text>
      </svg>
      <ol className="nums grid grid-cols-2 gap-x-4 gap-y-1 font-sans text-base sm:grid-cols-3 lg:grid-cols-1">
        {strategies.map((strategy, index) => <li key={strategy.key}>{index + 1}. {RESULT_LABELS.strategyNames[strategy.key as keyof typeof RESULT_LABELS.strategyNames]}</li>)}
      </ol>
      </div>
      <div className="sr-only"><table>
        <caption>{RESULT_LABELS.dispersion.tableCaption}</caption>
        <thead><tr><th>{RESULT_LABELS.comparison.strategy}</th><th>{RESULT_LABELS.dispersion.seed}</th><th>{RESULT_LABELS.dispersion.value}</th></tr></thead>
        <tbody>{replicas.map((replica) => <tr key={`${replica.strategy}-${replica.seed}`}><td>{RESULT_LABELS.strategyNames[replica.strategy as keyof typeof RESULT_LABELS.strategyNames]}</td><td>{replica.seed}</td><td>{formatMoney(replica.netCost)}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}

interface SavingsBarsProps {
  title: string
  points: SensitivityPoint[]
  isReal: (point: SensitivityPoint) => boolean
  valueLabel: (point: SensitivityPoint) => string
  percentLabel: (ratio: number) => string
  // Shared across both charts so equal savings get equal bars
  highestSaving: number
}

// How much the optimal stopping rule saves against the best unoptimized strategy as one price moves. A tie means the
// box pays for itself through resale alone, so the rule opens until the set is complete, just like only boxes
export function SavingsBars({ title, points, isReal, valueLabel, percentLabel, highestSaving }: SavingsBarsProps) {
  const labels = RESULT_LABELS.sensitivity
  const sorted = [...points].sort((first, second) => first.value - second.value)
  const columns = { gridTemplateColumns: `repeat(${sorted.length}, minmax(0, 1fr))` }

  return (
    <figure className="flex min-w-0 flex-col gap-3 rounded-lg bg-card-paper p-4 text-card-ink shadow-card">
      <figcaption className="font-display text-xl font-bold">{title}</figcaption>
      <ol className="grid h-52 items-end gap-3 border-b-2 border-card-ink/30" style={columns} aria-hidden>
        {sorted.map((point) => {
          const saving = point.reduction ?? 0
          const tie = saving <= 0
          const real = isReal(point)
          return (
            <li key={point.value} className="flex h-full flex-col items-center justify-end gap-1">
              <span className={cn("nums text-center", tie ? "font-sans text-sm leading-tight font-bold text-card-ink/70" : "font-display text-2xl leading-none font-extrabold")}>
                {tie ? labels.tieLabel : percentLabel(saving)}
              </span>
              <span
                className={cn("w-full rounded-t-md", real ? "bg-mana-gold ring-2 ring-card-ink" : "bg-card-ink/25")}
                style={{ height: tie ? "0.25rem" : `${(saving / highestSaving) * 80}%` }}
              />
            </li>
          )
        })}
      </ol>
      <ol className="grid gap-3 text-center font-sans text-sm" style={columns} aria-hidden>
        {sorted.map((point) => (
          <li key={point.value} className="nums flex flex-col leading-tight">
            <span className={cn(isReal(point) && "font-bold")}>{valueLabel(point)}</span>
            {isReal(point) && <span className="font-bold">{labels.realLabel}</span>}
          </li>
        ))}
      </ol>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {sorted.map((point) => (
            <tr key={point.value}>
              <th scope="row">{valueLabel(point)}</th>
              <td>{(point.reduction ?? 0) <= 0 ? labels.tieLabel : percentLabel(point.reduction ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

