"use client"

import { useId, useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { PaperOption } from "@/features/shared/components/PaperOption"
import { fillTemplate, formatPercent, formatPrecisePercent } from "@/features/shared/format"
import type { TechniqueData } from "@/features/technique/types/techniqueData"
import { PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { texts } from "@/i18n/texts"

type CardChoice = "example" | "common"

const BOXES = 3
const CHART = { width: 1100, height: 180, left: 56, right: 170, top: 14, bottom: 34 }
const LABEL_GAP = 24

interface BoxProbabilityPanelProps {
  technique: TechniqueData
}

function chanceOfSeeing(perPack: number, packs: number) {
  return 1 - Math.pow(1 - perPack, packs)
}

export function BoxProbabilityPanel({ technique }: BoxProbabilityPanelProps) {
  const labels = texts.technique.probability
  const sliderId = useId()
  const hatchId = useId()
  const packsPerBox = technique.products.box.packs
  const maxPacks = packsPerBox * BOXES
  const [cardChoice, setCardChoice] = useState<CardChoice>("example")
  const [packs, setPacks] = useState(packsPerBox)
  const perPack = cardChoice === "example" ? technique.exampleCard.probabilityPerPack : technique.averageProbabilityPerPack.common
  const probability = chanceOfSeeing(perPack, packs)
  const naive = Math.min(perPack * packs, 1)
  const currentBox = Math.ceil(packs / packsPerBox) - 1
  // The vertical axis stops a little above the highest value drawn, so the curves use the whole height
  const yMax = Math.min(1, Math.ceil(Math.min(perPack * maxPacks, 1) * 10 + 0.5) / 10)

  const chart = useMemo(() => {
    const xOf = (count: number) => CHART.left + ((count - 1) / (maxPacks - 1)) * (CHART.width - CHART.left - CHART.right)
    const yOf = (value: number) => CHART.top + (1 - Math.min(value, yMax) / yMax) * (CHART.height - CHART.top - CHART.bottom)
    const counts = Array.from({ length: maxPacks }, (unusedValue, index) => index + 1)
    const correct = counts.map((count) => [xOf(count), yOf(chanceOfSeeing(perPack, count))] as const)
    const summed = counts.map((count) => [xOf(count), yOf(Math.min(perPack * count, 1))] as const)
    const toPath = (points: readonly (readonly [number, number])[]) =>
      points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
    const gap = `${toPath(summed)} ${[...correct].reverse().map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} Z`
    const yTicks = [0, yMax]
    // Each curve is named where it ends; when both ends meet, the labels are pushed apart so they do not overlap
    let correctLabelY = correct[correct.length - 1][1]
    let summedLabelY = summed[summed.length - 1][1]
    if (Math.abs(correctLabelY - summedLabelY) < LABEL_GAP) {
      const middle = Math.max((correctLabelY + summedLabelY) / 2, CHART.top + LABEL_GAP / 2)
      correctLabelY = middle + LABEL_GAP / 2
      summedLabelY = middle - LABEL_GAP / 2
    }
    return { xOf, yOf, correctPath: toPath(correct), summedPath: toPath(summed), gap, yTicks, correctLabelY, summedLabelY }
  }, [perPack, maxPacks, yMax])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            {Array.from({ length: BOXES }, (unusedValue, box) => {
              const boxes = box + 1
              const isCurrent = box === currentBox
              return (
                <button
                  key={box}
                  type="button"
                  aria-label={fillTemplate(labels.boxButtonTemplate, { boxes })}
                  aria-pressed={packs === boxes * packsPerBox}
                  onClick={() => setPacks(boxes * packsPerBox)}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 px-2 pt-2 pb-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none",
                    isCurrent ? "border-solid border-foreground/70" : "border-dashed border-playmat-stitch hover:border-foreground/50"
                  )}
                >
                  <span className="grid grid-cols-6 gap-1" aria-hidden>
                    {Array.from({ length: packsPerBox }, (unusedPack, index) => {
                      const packNumber = box * packsPerBox + index + 1
                      return (
                        <span
                          key={index}
                          className={cn(
                            "h-4 w-3 rounded-[2px] transition-colors duration-150",
                            packNumber <= packs ? "bg-card-paper shadow-sm" : "border border-dashed border-playmat-stitch"
                          )}
                        />
                      )
                    })}
                  </span>
                  <span className="nums font-sans text-base font-bold" aria-hidden>
                    {fillTemplate(boxes === 1 ? labels.xTickTemplate : labels.xTickPluralTemplate, { boxes })}
                  </span>
                </button>
              )
            })}
          </div>

          <label htmlFor={sliderId} className="flex max-w-xl items-center gap-4">
            <span className="nums shrink-0 font-sans text-base text-foreground/85">{fillTemplate(labels.packsCaptionTemplate, { packs })}</span>
            <input
              id={sliderId}
              type="range"
              min={1}
              max={maxPacks}
              value={packs}
              aria-valuetext={`${packs} · ${formatPercent(probability)}`}
              onChange={(event) => setPacks(Number(event.target.value))}
              className="chip-slider min-w-0 flex-1"
            />
          </label>
        </section>

        <section className="flex flex-col gap-3" aria-live="polite">
          <div className="flex flex-wrap gap-2">
            {(["example", "common"] as const).map((option) => (
              <PaperOption key={option} selected={cardChoice === option} onSelect={() => setCardChoice(option)}>
                <span className="font-sans text-base font-bold">{labels.cards[option]}</span>
              </PaperOption>
            ))}
          </div>
          <p className="nums font-display text-6xl leading-none font-extrabold text-primary">{formatPercent(probability)}</p>
          <p className="nums font-serif text-xl italic">
            {fillTemplate(labels.formulaBaseTemplate, { perPack: formatPrecisePercent(perPack) })}
            <sup className="text-sm not-italic">{packs}</sup> {fillTemplate(labels.formulaResultTemplate, { probability: formatPercent(probability) })}
          </p>
          <p className="nums font-sans text-base text-foreground/85">
            {fillTemplate(labels.complementTemplate, { packs, miss: formatPercent(1 - probability), hit: formatPercent(probability) })}{" "}
            {fillTemplate(labels.naiveTemplate, { naive: formatPercent(naive) })}
          </p>
        </section>
      </div>

      <figure className="flex flex-col gap-2">
        <figcaption className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-sans text-base">
          <span className="font-bold">{labels.chartTitle}</span>
          <span className="text-foreground/85">{labels.gapNote}</span>
        </figcaption>
        <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="h-auto w-full" role="img" aria-label={labels.chartTitle}>
          <defs>
            <pattern id={hatchId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" strokeWidth="3" className="stroke-mana-red/60" />
            </pattern>
          </defs>
          {chart.yTicks.map((tick) => (
            <g key={tick}>
              <line x1={CHART.left} x2={CHART.width - CHART.right} y1={chart.yOf(tick)} y2={chart.yOf(tick)} className="stroke-foreground/15" />
              <text x={CHART.left - 10} y={chart.yOf(tick) + 6} textAnchor="end" className="fill-foreground/80 font-sans text-[18px]">
                {formatPercent(tick)}
              </text>
            </g>
          ))}
          {Array.from({ length: BOXES }, (unusedValue, box) => {
            const boxes = box + 1
            return (
              <text key={boxes} x={chart.xOf(boxes * packsPerBox)} y={CHART.height - 8} textAnchor={boxes === BOXES ? "end" : "middle"} className="fill-foreground/80 font-sans text-[18px]">
                {fillTemplate(boxes === 1 ? labels.xTickTemplate : labels.xTickPluralTemplate, { boxes })}
              </text>
            )
          })}
          <path d={chart.gap} fill={`url(#${hatchId})`} />
          <path d={chart.summedPath} fill="none" strokeWidth={2.5} strokeDasharray="8 6" className="stroke-foreground/70" />
          <path d={chart.correctPath} fill="none" strokeWidth={3.5} className="stroke-primary" />
          <line x1={chart.xOf(packs)} x2={chart.xOf(packs)} y1={CHART.top} y2={CHART.height - CHART.bottom} strokeDasharray="4 5" className="stroke-foreground/40" />
          <text x={CHART.width - CHART.right + 12} y={chart.correctLabelY + 6} className="fill-primary font-sans text-[18px] font-bold">
            {labels.seriesCorrect}
          </text>
          <text x={CHART.width - CHART.right + 12} y={chart.summedLabelY + 6} className="fill-foreground/80 font-sans text-[18px]">
            {labels.seriesNaive}
          </text>
          <circle cx={chart.xOf(packs)} cy={chart.yOf(probability)} r={8} strokeWidth={3} className="fill-primary stroke-felt" />
        </svg>
      </figure>
    </div>
  )
}
