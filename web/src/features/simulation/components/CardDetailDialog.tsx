"use client"

import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardImage } from "@/features/simulation/components/CardImage"
import { fillTemplate, formatMoney } from "@/features/shared/format"
import type { CardInfo, OpenedCard, SimulationRun } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

export type CardStatus = "new" | "repeated" | "outOfSet" | "bought"

export interface SelectedCard {
  cardId: string
  foil: boolean
  status: CardStatus
  slot?: string
}

export function statusOf(opened: OpenedCard, card: CardInfo | undefined): CardStatus {
  if (card && !card.inBaseSet) return "outOfSet"
  return opened.isNew ? "new" : "repeated"
}

export function selectionOf(opened: OpenedCard, card: CardInfo | undefined): SelectedCard {
  return { cardId: opened.id, foil: opened.foil, status: statusOf(opened, card), slot: opened.slot }
}

interface CardDetailDialogProps {
  run: SimulationRun
  selected: SelectedCard | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="font-sans text-base text-muted-foreground">{label}</dt>
      <dd className="nums text-right font-sans text-base font-bold">{value}</dd>
    </div>
  )
}

export function CardDetailDialog({ run, selected, onClose }: CardDetailDialogProps) {
  const labels = texts.simulation.cardDetail
  const card = selected ? run.cards[selected.cardId] : undefined
  const statusLabel = selected
    ? selected.status === "bought"
      ? labels.bought
      : texts.simulation.badges[selected.status]
    : ""
  const rarity = card ? (texts.cards.rarities[card.rarity as keyof typeof texts.cards.rarities] ?? card.rarity) : ""
  const slot = selected?.slot ? (texts.cards.slots[selected.slot as keyof typeof texts.cards.slots] ?? selected.slot) : null

  return (
    <Dialog.Root open={selected !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          data-captures-arrow-keys
          className="fixed top-1/2 left-1/2 z-[60] max-h-[calc(100dvh-2rem)] w-[min(48rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] bg-card p-5 text-card-foreground shadow-2xl ring-1 ring-border outline-none transition-[opacity,scale] duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none md:p-7"
        >
          {selected && (
            <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
              <CardImage
                cardId={selected.cardId}
                card={card}
                size="normal"
                backImage={run.cardBack.imageNormal}
                foil={selected.foil}
                className="mx-auto w-[min(20rem,72vw)]"
              />
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Dialog.Title className="font-display text-2xl leading-tight font-bold text-balance">
                      {card?.name ?? selected.cardId}
                    </Dialog.Title>
                    <Dialog.Description className="nums font-sans text-base text-muted-foreground">
                      {selected.cardId}
                      {selected.foil && ` · ${texts.simulation.badges.foil}`}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close render={<Button variant="ghost" size="icon-lg" aria-label={labels.close} />}>
                    <X />
                  </Dialog.Close>
                </div>

                <dl className="flex flex-col">
                  <DetailRow label={labels.status} value={statusLabel} />
                  {rarity && <DetailRow label={labels.rarity} value={rarity} />}
                  {slot && <DetailRow label={labels.slot} value={slot} />}
                  {card && <DetailRow label={labels.marketPrice} value={formatMoney(card.price)} />}
                  {card && <DetailRow label={labels.foilPrice} value={formatMoney(card.foilPrice)} />}
                  {card?.buyPrice != null && <DetailRow label={labels.buyPrice} value={formatMoney(card.buyPrice)} />}
                </dl>

                <div className="flex flex-col gap-1 font-sans text-sm text-muted-foreground">
                  {card?.buyPrice != null && <p>{labels.buyPriceNote}</p>}
                  {selected.status === "outOfSet" && <p>{labels.outOfSetNote}</p>}
                  <p>{fillTemplate(labels.sourceTemplate, { date: run.pricesDate })}</p>
                </div>
              </div>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
