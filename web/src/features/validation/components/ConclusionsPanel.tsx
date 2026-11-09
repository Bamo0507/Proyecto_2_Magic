import { cn } from "@/lib/utils"
import { CARD_STYLES_BY_COLOR, PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatMoney, formatPercent } from "@/features/shared/format"
import type { ResultsSummary, ValidationData } from "@/features/validation/types/validationData"
import { texts } from "@/i18n/texts"

interface ConclusionsPanelProps {
  validation: ValidationData
  results: ResultsSummary
}

interface Conclusion {
  title: string
  text: string
}

// One answer per specific objective, in the same order and blue cards as the Objectives section, so the talk closes
// on what it promised at the start
export function ConclusionsPanel({ validation, results }: ConclusionsPanelProps) {
  const labels = texts.validation.conclusions
  const meanOf = (key: string) => results.strategies.find((strategy) => strategy.key === key)?.mean
  const loose = meanOf("comprar_sueltas")
  const boxes = meanOf(results.baselineStrategy)
  const packs = meanOf("solo_sobres")
  const optimal = meanOf("parada_optima")
  const savings = results.improvements.find((item) => item.reference === results.baselineStrategy)
  if (loose === undefined || boxes === undefined || packs === undefined || optimal === undefined || !savings) return null

  const base = validation.realComparison.find((row) => row.key === "modelo_base")
  const reference = validation.realReference
  let realSentence = ""
  if (reference && base?.ci95) {
    const inside = reference.priceUsd >= base.ci95[0] && reference.priceUsd <= base.ci95[1]
    realSentence = fillTemplate(inside ? labels.baseline.realInsideTemplate : labels.baseline.realOutsideTemplate, {
      price: formatMoney(reference.priceUsd),
    })
  }

  const conclusions: Conclusion[] = [
    {
      title: labels.simulator.title,
      text: fillTemplate(labels.simulator.template, {
        collector: formatPercent(validation.couponCollector.relativeError),
        rarity: formatPercent(Math.max(...validation.rarity.map((row) => row.relativeError))),
      }),
    },
    {
      title: labels.baseline.title,
      text: fillTemplate(labels.baseline.template, {
        loose: formatMoney(loose),
        boxes: formatMoney(boxes),
        packs: formatMoney(packs),
        real: realSentence,
      }).trim(),
    },
    {
      title: labels.optimal.title,
      text: fillTemplate(labels.optimal.template, { optimal: formatMoney(optimal), rate: formatPercent(savings.rate) }),
    },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      <ol className="my-auto grid gap-4 md:grid-cols-3">
        {conclusions.map((conclusion, index) => (
          <li
            key={conclusion.title}
            className={cn(
              "flex min-w-0 flex-col gap-3 rounded-lg bg-card-paper p-5 text-card-ink shadow-card ring-1 ring-card-ink/10",
              CARD_STYLES_BY_COLOR.blue.suit
            )}
          >
            <div className="flex items-start gap-3 border-b border-card-suit-ink/25 pb-3">
              <span className="nums font-display text-5xl leading-none font-extrabold text-card-suit-ink" aria-hidden>
                {index + 1}
              </span>
              <h3 className="font-display text-xl leading-snug font-bold">{conclusion.title}</h3>
            </div>
            <p className="nums font-sans text-base leading-snug">{conclusion.text}</p>
          </li>
        ))}
      </ol>

      <section aria-labelledby="limits-title" className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-foreground/25 pt-3">
        <h3 id="limits-title" className="font-sans text-sm font-bold tracking-[0.12em] text-foreground/70 [font-variant-caps:all-small-caps]">
          {labels.limitsTitle}
        </h3>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 font-sans text-base text-foreground/85">
          {labels.limits.map((limit) => (
            <li key={limit}>· {limit}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
