"use client"

import { CardBackState } from "@/features/shared/components/CardBackState"
import { PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatMoney } from "@/features/shared/format"
import type { ModelData } from "@/features/model/types/modelData"
import { useProblemData } from "@/features/problem/hooks/useProblemData"
import { texts } from "@/i18n/texts"

const CHART = { width: 640, height: 300, left: 56, right: 20, top: 20, bottom: 50 }
const DECIMAL_FORMAT = new Intl.NumberFormat("es-GT", { maximumFractionDigits: 1 })
const WHOLE_FORMAT = new Intl.NumberFormat("es-GT", { maximumFractionDigits: 0 })

// Expected missing cards after n packs, treating each card of a rarity as appearing with that rarity's average chance
// per pack and the packs as independent: the coupon collector curve of the set
function expectedMissing(model: ModelData, packs: number) {
  return Object.values(model.probabilityByRarity).reduce(
    (sum, rarity) => sum + rarity.cards * Math.pow(1 - rarity.probabilityPerPack, packs),
    0
  )
}

function cardsPerPack(model: ModelData) {
  const first = model.compositions[0]
  return first ? Object.values(first.cardsBySlot).reduce((sum, count) => sum + count, 0) : 0
}

interface CostCardProps {
  title: string
  detail: string
  net: number
  className?: string
}

function CostCard({ title, detail, net, className }: CostCardProps) {
  return (
    <section className={`rounded-md bg-card-paper px-5 py-4 text-card-ink shadow-card-lifted ${className ?? ""}`}>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="font-sans text-base leading-snug text-card-ink/75">{detail}</p>
      <p className="mt-2 flex items-baseline justify-between gap-3 border-t-4 border-double border-card-ink/60 pt-2">
        <span className="font-display text-lg font-bold">{texts.problem.netLabel}</span>
        <span className="nums font-display text-3xl font-extrabold">{formatMoney(net)}</span>
      </p>
    </section>
  )
}

export function ProblemStage() {
  const { state, retry } = useProblemData()
  const labels = texts.problem

  if (state.status !== "ready") {
    return (
      <div className="m-auto py-6">
        <CardBackState status={state.status} onRetry={retry} />
      </div>
    )
  }

  const { model, results } = state.data
  const packsOnly = results.strategies.find((strategy) => strategy.key === "solo_sobres")
  const loose = results.strategies.find((strategy) => strategy.key === "comprar_sueltas")
  if (!packsOnly || !loose) return null

  const lastPacks = Math.ceil(packsOnly.averagePacks / 100) * 100
  const markers = [model.products.box.packs, 100, Math.round(packsOnly.averagePacks)]
  const xOf = (packs: number) => CHART.left + (packs / lastPacks) * (CHART.width - CHART.left - CHART.right)
  const yOf = (missing: number) => CHART.top + (1 - missing / model.baseSetSize) * (CHART.height - CHART.top - CHART.bottom)
  const steps = 120
  const path = Array.from({ length: steps + 1 }, (_, index) => {
    const packs = (index / steps) * lastPacks
    return `${index === 0 ? "M" : "L"}${xOf(packs).toFixed(1)},${yOf(expectedMissing(model, packs)).toFixed(1)}`
  }).join(" ")
  const xTicks = Array.from({ length: lastPacks / 100 + 1 }, (_, index) => index * 100)
  const yTicks = [0, Math.round(model.baseSetSize / 2), model.baseSetSize]
  const plotMiddle = (CHART.top + CHART.height - CHART.bottom) / 2

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm font-bold tracking-[0.12em] text-foreground/70 [font-variant-caps:all-small-caps]">{labels.label}</p>
        <h2 className={PANEL_HEADING_CLASS_NAME}>{fillTemplate(labels.questionTemplate, { size: model.baseSetSize })}</h2>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <figure className="flex flex-col gap-1">
          <figcaption className="font-sans text-base font-bold text-foreground/80">{labels.curveTitle}</figcaption>
          <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="h-auto w-full" role="img" aria-label={labels.curveTitle}>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line x1={CHART.left} x2={CHART.width - CHART.right} y1={yOf(tick)} y2={yOf(tick)} strokeDasharray="3 5" className="stroke-foreground/25" />
                <text x={CHART.left - 8} y={yOf(tick) + 5} textAnchor="end" className="nums fill-foreground/80 font-sans text-[15px]">
                  {tick}
                </text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <text key={tick} x={xOf(tick)} y={CHART.height - CHART.bottom + 22} textAnchor="middle" className="nums fill-foreground/80 font-sans text-[15px]">
                {tick}
              </text>
            ))}
            <path d={path} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
            {markers.map((packs, index) => {
              const missing = expectedMissing(model, packs)
              const last = index === markers.length - 1
              return (
                <g key={packs}>
                  <line x1={xOf(packs)} x2={xOf(packs)} y1={yOf(missing)} y2={yOf(0)} strokeDasharray="4 4" className="stroke-foreground/40" />
                  <circle cx={xOf(packs)} cy={yOf(missing)} r={7} strokeWidth={3} className="fill-primary stroke-felt" />
                  <text
                    x={xOf(packs) + (last ? -12 : 12)}
                    y={yOf(missing) - 12}
                    textAnchor={last ? "end" : "start"}
                    className="nums fill-foreground font-sans text-[16px] font-bold"
                  >
                    {fillTemplate(labels.markerTemplate, { packs, missing: WHOLE_FORMAT.format(missing) })}
                  </text>
                </g>
              )
            })}
            <text x={(CHART.left + CHART.width - CHART.right) / 2} y={CHART.height - 6} textAnchor="middle" className="fill-foreground/80 font-sans text-[15px]">
              {labels.curveAxis}
            </text>
            <text x={16} y={plotMiddle} transform={`rotate(-90 16 ${plotMiddle})`} textAnchor="middle" className="fill-foreground/80 font-sans text-[15px]">
              {labels.curveYAxis}
            </text>
          </svg>
          <p className="max-w-[60ch] font-sans text-base leading-snug text-foreground/85">
            {fillTemplate(labels.curveNoteTemplate, {
              cards: cardsPerPack(model),
              packs: WHOLE_FORMAT.format(model.probabilityByRarity.mythic.packsPerCopy),
            })}
          </p>
        </figure>

        <div className="flex flex-col gap-5">
          <CostCard
            title={labels.packsOnly}
            detail={fillTemplate(labels.packsOnlyDetailTemplate, {
              packs: DECIMAL_FORMAT.format(packsOnly.averagePacks),
              spent: formatMoney(packsOnly.averageSealedSpend),
              resale: formatMoney(packsOnly.averageResale),
            })}
            net={packsOnly.mean}
            className="-rotate-1"
          />
          <CostCard title={labels.loose} detail={labels.looseDetail} net={loose.mean} className="rotate-1" />
          <p className="font-serif text-xl leading-snug text-pretty text-foreground">
            {fillTemplate(labels.takeawayTemplate, { ratio: DECIMAL_FORMAT.format(packsOnly.mean / loose.mean) })}
          </p>
        </div>
      </div>
    </div>
  )
}
