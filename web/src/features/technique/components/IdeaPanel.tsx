"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { SuitGlyph } from "@/features/shared/components/CardArt"
import { SELECTED_OBJECT_CLASS_NAME, UNSELECTED_OBJECT_CLASS_NAME } from "@/features/shared/components/PaperOption"
import { CARD_STYLES_BY_COLOR, PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatMoney, formatSignedMoney } from "@/features/shared/format"
import type { ManaColor } from "@/features/shared/types/section"
import type { TechniqueAction, TechniqueData } from "@/features/technique/types/techniqueData"
import { texts } from "@/i18n/texts"

const OPTIONS: { action: TechniqueAction; color: ManaColor }[] = [
  { action: "stop", color: "red" },
  { action: "pack", color: "blue" },
  { action: "box", color: "gold" },
]

interface IdeaPanelProps {
  technique: TechniqueData
}

interface LedgerRowProps {
  sign: string
  label: string
  detail: string
  amount: number
}

function LedgerRow({ sign, label, detail, amount }: LedgerRowProps) {
  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-card-ink/15 py-2">
      <span className="font-display text-xl leading-none font-extrabold" aria-hidden>
        {sign}
      </span>
      <span className="flex flex-col">
        <span className="font-sans text-base font-bold">{label}</span>
        <span className="font-sans text-base leading-snug text-card-ink/75">{detail}</span>
      </span>
      <span className="nums font-display text-xl font-extrabold">{formatMoney(amount)}</span>
    </div>
  )
}

export function IdeaPanel({ technique }: IdeaPanelProps) {
  const labels = texts.technique.idea
  const firstDecision = technique.decisions[0]
  const [viewed, setViewed] = useState<TechniqueAction>(firstDecision.action)
  const example = technique.exampleCard
  const gainOf = (action: TechniqueAction) => (action === "stop" ? 0 : firstDecision[action].gain)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-7">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      <div className="grid flex-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
        <section className="flex flex-col gap-5">
          <h3 className="font-sans text-base font-bold text-foreground/80">{labels.optionsLabel}</h3>
          <div className="flex flex-wrap items-end gap-4 pt-3">
            {OPTIONS.map(({ action, color }) => {
              const gain = gainOf(action)
              const isWinner = action === firstDecision.action
              const isViewed = action === viewed
              return (
                <button
                  key={action}
                  type="button"
                  aria-pressed={isViewed}
                  onClick={() => setViewed(action)}
                  className={cn(
                    "@container card-corners relative flex aspect-[63/88] w-36 cursor-pointer flex-col justify-between bg-card-paper p-3 text-left text-card-ink ring-1 ring-card-ink/10 ring-inset transition-[translate,box-shadow,color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt focus-visible:outline-none motion-reduce:transition-none",
                    CARD_STYLES_BY_COLOR[color].suit,
                    isViewed ? SELECTED_OBJECT_CLASS_NAME : UNSELECTED_OBJECT_CLASS_NAME
                  )}
                >
                  <span className="pointer-events-none absolute inset-[5cqi] rounded-[2.5cqi] shadow-[inset_0_0_0_max(1px,1cqi)_var(--card-suit-ink)]" aria-hidden />
                  <span className="relative font-display text-lg leading-tight font-bold">{labels.optionNames[action]}</span>
                  <SuitGlyph color={color} className="relative mx-auto size-[34cqi] text-card-suit-ink" />
                  <span className="relative flex items-end justify-between gap-1">
                    <span className="nums font-display text-xl leading-none font-extrabold">{formatSignedMoney(gain)}</span>
                    {isWinner && (
                      <span className="rounded-sm bg-card-suit-ink px-1.5 py-0.5 font-sans text-sm font-bold text-card-paper">
                        {labels.winner}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="max-w-[44ch] font-serif text-xl leading-snug text-foreground">{labels.ruleLine}</p>
        </section>

        <section aria-live="polite" className="-rotate-1 rounded-md lg:mt-9 bg-card-paper px-6 py-5 text-card-ink shadow-card-lifted">
          <h3 className="font-display text-xl font-bold">{labels.ledgerTitles[viewed]}</h3>
          <p className="mb-2 font-sans text-sm text-card-ink/75">{labels.formulaCaption}</p>
          {viewed === "stop" ? (
            <p className="border-t border-card-ink/15 pt-3 font-sans text-base leading-snug">{labels.stopLedger}</p>
          ) : (
            <>
              <LedgerRow
                sign="+"
                label={labels.terms.sale.label}
                detail={fillTemplate(labels.terms.sale.detailTemplate, {
                  packs: technique.products[viewed].packs,
                  perPack: formatMoney(technique.expectedSalePerPack),
                })}
                amount={firstDecision[viewed].expectedSale}
              />
              <LedgerRow
                sign="+"
                label={labels.terms.savings.label}
                detail={fillTemplate(labels.savingsNoteTemplate, {
                  name: example.name,
                  buy: formatMoney(example.buyPrice),
                  sale: formatMoney(example.keptCopySale),
                  savings: formatMoney(example.savings),
                })}
                amount={firstDecision[viewed].missingSavings}
              />
              <LedgerRow sign="−" label={labels.terms.price.label} detail={labels.terms.price.detail} amount={firstDecision[viewed].price} />
            </>
          )}
          <p className="mt-1 flex items-baseline justify-between gap-3 border-t-4 border-double border-card-ink/60 pt-2">
            <span className="font-display text-lg font-bold">{labels.terms.gain.label}</span>
            <span className="nums font-display text-4xl font-extrabold">{formatSignedMoney(gainOf(viewed))}</span>
          </p>
        </section>
      </div>
    </div>
  )
}
