import { PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatSignedMoney } from "@/features/shared/format"
import type { TechniqueData } from "@/features/technique/types/techniqueData"
import { texts } from "@/i18n/texts"

const CHART = { width: 640, height: 330, left: 24, right: 32, top: 34, bottom: 40 }
interface WhyItWorksPanelProps {
  technique: TechniqueData
}

export function WhyItWorksPanel({ technique }: WhyItWorksPanelProps) {
  const labels = texts.technique.why
  const actionLabels = texts.technique.action
  const boxGains = technique.decisions.map((decision) => decision.box.gain)
  const highest = Math.max(...boxGains, 0)
  // Extra room below zero so the stop zone reads as an area and not a thin line
  const lowest = Math.min(...boxGains, 0) - (highest - Math.min(...boxGains, 0)) * 0.28
  const xOf = (index: number) => CHART.left + 40 + (index / Math.max(boxGains.length - 1, 1)) * (CHART.width - CHART.left - CHART.right - 80)
  const yOf = (gain: number) => CHART.top + ((highest - gain) / (highest - lowest)) * (CHART.height - CHART.top - CHART.bottom)
  const path = boxGains.map((gain, index) => `${index === 0 ? "M" : "L"}${xOf(index).toFixed(1)},${yOf(gain).toFixed(1)}`).join(" ")
  const zeroY = yOf(0)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      <div className="grid flex-1 content-center items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <figure className="flex flex-col gap-1">
          <figcaption className="font-sans text-base font-bold text-foreground/80">{labels.chartTitle}</figcaption>
          <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="h-auto w-full" role="img" aria-label={labels.chartTitle}>
            <rect x={CHART.left} y={zeroY} width={CHART.width - CHART.left - CHART.right} height={CHART.height - CHART.bottom - zeroY} className="fill-mana-red/15" />
            <line x1={CHART.left} x2={CHART.width - CHART.right} y1={zeroY} y2={zeroY} strokeWidth={2} strokeDasharray="7 6" className="stroke-foreground/60" />
            <text x={CHART.left + 10} y={zeroY + 24} className="fill-foreground font-sans text-[16px] font-bold">
              {labels.stopZone}
            </text>
            <path d={path} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
            {boxGains.map((gain, index) => {
              const negative = gain < 0
              return (
                <g key={index}>
                  <circle cx={xOf(index)} cy={yOf(gain)} r={8} strokeWidth={3} className={negative ? "fill-mana-red stroke-felt" : "fill-primary stroke-felt"} />
                  <text
                    x={xOf(index)}
                    y={yOf(gain) + (negative ? 30 : -16)}
                    textAnchor="middle"
                    className="nums fill-foreground font-sans text-[18px] font-bold"
                  >
                    {formatSignedMoney(gain)}
                  </text>
                  <text x={xOf(index)} y={CHART.height - 10} textAnchor="middle" className="nums fill-foreground/80 font-sans text-[16px]">
                    {fillTemplate(actionLabels.missingTemplate, { missing: technique.decisions[index].missingBefore })}
                  </text>
                </g>
              )
            })}
          </svg>
        </figure>

        <div className="flex flex-col gap-4 lg:pt-7">
          <p className="font-sans text-base leading-snug">{labels.monotoneText}</p>
          <div className="flex flex-col items-center gap-2 border-y border-foreground/25 py-3 text-center">
            <p className="font-serif text-base leading-snug text-foreground/85 italic">{labels.analogy}</p>
            <p className="font-sans text-sm font-bold tracking-[0.12em] text-foreground/70 [font-variant-caps:all-small-caps]">
              {labels.reference}
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
