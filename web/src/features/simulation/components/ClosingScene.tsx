import { CardButton } from "@/features/simulation/components/CardButton"
import type { SelectedCard } from "@/features/simulation/components/CardDetailDialog"
import { CardImage } from "@/features/simulation/components/CardImage"
import { fillTemplate, formatMoney, formatPercent } from "@/features/shared/format"
import type { SimulationRun } from "@/features/simulation/types/simulationRun"
import { ScoreSheet } from "@/features/shared/components/ScoreSheet"
import { texts } from "@/i18n/texts"

const COLUMN_TITLE_CLASS_NAME = "font-display text-2xl leading-tight font-bold"

interface ClosingSceneProps {
  run: SimulationRun
  onSelectCard?: (card: SelectedCard) => void
}

// Both columns open with a title of the same size and start on the same line, so the accounts and the cards bought
// loose read as one row instead of two blocks floating at different heights
export function ClosingScene({ run, onSelectCard }: ClosingSceneProps) {
  const labels = texts.simulation.closing
  const { closing } = run
  const savings = closing.buyAllLooseCost - closing.netCost

  const rows = [
    { concept: labels.sealed, amount: formatMoney(closing.sealedSpend) },
    { concept: fillTemplate(labels.looseTemplate, { count: closing.missingCards.length }), amount: formatMoney(closing.looseCost) },
    { concept: labels.sale, amount: formatMoney(-closing.saleIncome) },
    { concept: labels.net, amount: formatMoney(closing.netCost) },
  ]

  return (
    <div className="grid min-h-0 w-full flex-1 content-center items-start gap-x-8 gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="flex flex-col gap-4 motion-safe:animate-rise-in">
        <h3 className={COLUMN_TITLE_CLASS_NAME}>{labels.title}</h3>
        <ScoreSheet
          caption={labels.caption}
          columns={[
            { key: "concept", label: labels.concept },
            { key: "amount", label: labels.amount, numeric: true },
          ]}
          rows={rows}
        />
        <p className="font-sans text-base">
          {fillTemplate(labels.buyAllTemplate, { amount: formatMoney(closing.buyAllLooseCost) })}.{" "}
          <span className="font-bold text-primary">
            {fillTemplate(labels.savingsTemplate, {
              amount: formatMoney(savings),
              percent: formatPercent(savings / closing.buyAllLooseCost),
            })}
          </span>
        </p>
      </section>

      <section className="flex min-h-0 flex-col gap-4 motion-safe:animate-rise-in motion-safe:[animation-delay:120ms]">
        <h3 className={COLUMN_TITLE_CLASS_NAME}>
          {fillTemplate(labels.missingTemplate, { count: closing.missingCards.length })}
        </h3>
        <ul className="grid grid-cols-5 content-start gap-x-2 gap-y-3 sm:grid-cols-7">
          {closing.missingCards.map((cardId) => {
            const card = run.cards[cardId]
            return (
              <li key={cardId} className="flex flex-col items-center gap-1">
                <CardButton
                  label={fillTemplate(texts.simulation.cardDetail.openTemplate, { name: card?.name ?? cardId })}
                  onSelect={onSelectCard && (() => onSelectCard({ cardId, foil: false, status: "bought" }))}
                >
                  <CardImage cardId={cardId} card={card} size="small" backImage={run.cardBack.imageSmall} className="w-full" />
                </CardButton>
                <span className="nums font-sans text-sm font-bold">{formatMoney(card?.buyPrice ?? 0)}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
