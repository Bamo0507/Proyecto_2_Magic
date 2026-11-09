import { cn } from "@/lib/utils"
import { CARD_STYLES_BY_COLOR, PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatPercent } from "@/features/shared/format"
import type { ValidationData } from "@/features/validation/types/validationData"
import { texts } from "@/i18n/texts"

const DECIMAL_FORMAT = new Intl.NumberFormat("es-GT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const WHOLE_FORMAT = new Intl.NumberFormat("es-GT")

interface CheckCardProps {
  title: string
  value: string
  valueLabel?: string
  detail: string
}

function CheckCard({ title, value, valueLabel, detail }: CheckCardProps) {
  return (
    <li
      className={cn(
        "card-corners relative flex flex-col gap-2 bg-card-paper p-4 text-card-ink shadow-card ring-1 ring-card-ink/10 ring-inset transition-transform duration-200 ease-out hover:z-10 hover:-translate-y-2 motion-reduce:transition-none",
        CARD_STYLES_BY_COLOR.colorless.suit
      )}
    >
      <span className="pointer-events-none absolute inset-1.5 rounded-[0.35rem] opacity-40 shadow-[inset_0_0_0_1px_var(--card-suit-ink)]" aria-hidden />
      <span className="relative font-display text-lg leading-tight font-bold">{title}</span>
      <span className="relative flex flex-col">
        <span className="nums font-display text-5xl leading-none font-extrabold text-card-suit-ink">{value}</span>
        {valueLabel && <span className="font-sans text-sm font-bold">{valueLabel}</span>}
      </span>
      <span className="relative mt-auto border-t border-card-suit-ink/25 pt-2 font-sans text-base leading-snug">{detail}</span>
    </li>
  )
}

export function VerificationPanel({ validation }: { validation: ValidationData }) {
  const labels = texts.validation.verification
  const { couponCollector: collector, perCard, rarity, consistency } = validation
  const cases = consistency.reduce((sum, check) => sum + check.cases, 0)
  const failures = consistency.reduce((sum, check) => sum + check.failures, 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>
      <ol className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CheckCard
          title={labels.collector.title}
          value={formatPercent(collector.relativeError)}
          valueLabel={labels.collector.valueLabel}
          detail={fillTemplate(labels.collector.detailTemplate, {
            formula: DECIMAL_FORMAT.format(collector.formulaMean),
            simulated: DECIMAL_FORMAT.format(collector.simulatedMean),
          })}
        />
        <CheckCard
          title={labels.rarity.title}
          value={formatPercent(Math.max(...rarity.map((row) => row.relativeError)))}
          valueLabel={labels.rarity.valueLabel}
          detail={labels.rarity.detail}
        />
        <CheckCard
          title={labels.perCard.title}
          value={formatPercent(perCard.shareInsideCi)}
          valueLabel={labels.perCard.valueLabel}
          detail={fillTemplate(labels.perCard.detailTemplate, { cards: perCard.cards, packs: WHOLE_FORMAT.format(perCard.packs) })}
        />
        <CheckCard
          title={labels.consistency.title}
          value={fillTemplate(labels.consistency.valueTemplate, { failures })}
          detail={fillTemplate(labels.consistency.detailTemplate, { tests: consistency.length, cases: WHOLE_FORMAT.format(cases) })}
        />
      </ol>
    </div>
  )
}
