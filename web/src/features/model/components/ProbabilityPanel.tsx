"use client"

import Image from "next/image"
import { useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"
import { ScoreSheet } from "@/features/shared/components/ScoreSheet"
import { fillTemplate, formatPercent, formatPrecisePercent } from "@/features/shared/format"
import { CATEGORY_SWATCH_CLASS } from "@/features/model/packSlots"
import type { CardCategory, ModelData, RareSlotCategory } from "@/features/model/types/modelData"
import { PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { texts } from "@/i18n/texts"

gsap.registerPlugin(useGSAP)

const TICKETS_DRAWN = 100
const RARITY_ORDER = ["common", "uncommon", "rare", "mythic"] as const
// The rare slot categories map onto the shared card colors: variants are cards outside the base set
const RARE_SLOT_CATEGORY: Record<RareSlotCategory["key"], CardCategory> = {
  rara: "rare",
  mitica: "mythic",
  variante: "outOfSet",
}

interface ProbabilityPanelProps {
  model: ModelData
}

// Splits the drawn tickets among the categories so they always add up to exactly one hundred
function ticketsByCategory(categories: RareSlotCategory[]) {
  const counts = categories.map((category) => Math.floor(category.dataRate * TICKETS_DRAWN))
  const remainders = categories.map((category, index) => category.dataRate * TICKETS_DRAWN - counts[index])
  let missing = TICKETS_DRAWN - counts.reduce((total, count) => total + count, 0)
  const byRemainder = remainders.map((remainder, index) => ({ remainder, index })).sort((first, second) => second.remainder - first.remainder)
  for (const { index } of byRemainder) {
    if (missing <= 0) break
    counts[index] += 1
    missing -= 1
  }
  return categories.flatMap((category, index) => Array.from({ length: counts[index] }, () => category.key))
}

function PulledCardImage({ source, name }: { source: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  if (!source || failed) return null
  return (
    <Image
      src={source}
      alt={name}
      width={488}
      height={680}
      unoptimized
      onError={() => setFailed(true)}
      className="card-corners aspect-[488/680] w-20 shrink-0 shadow-card"
    />
  )
}

export function ProbabilityPanel({ model }: ProbabilityPanelProps) {
  const labels = texts.model.probability
  const scopeRef = useRef<HTMLDivElement>(null)
  const { rareSlot } = model
  const example = rareSlot.example
  const tickets = useMemo(() => ticketsByCategory(rareSlot.categories), [rareSlot.categories])

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .from("[data-ticket]", { opacity: 0, scale: 0.4, duration: 0.25, ease: "back.out(2)", stagger: 0.006 })
          .from("[data-pulled-ticket]", { opacity: 0, y: -36, rotation: -9, duration: 0.5, ease: "power3.out" }, "-=0.1")
      })
      return () => media.revert()
    },
    { scope: scopeRef }
  )

  const frequencyRows = RARITY_ORDER.filter((rarity) => model.probabilityByRarity[rarity]).map((rarity) => {
    const stats = model.probabilityByRarity[rarity]
    return {
      rarity: texts.cards.rarities[rarity],
      cards: stats.cards,
      chance: formatPrecisePercent(stats.probabilityPerPack),
      every: fillTemplate(labels.everyTemplate, { packs: Math.round(stats.packsPerCopy) }),
    }
  })

  return (
    <div ref={scopeRef} className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      <div className="grid flex-1 items-start gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="flex flex-col">
          <div className="rounded-[1.25rem] border-2 border-dashed border-playmat-stitch px-4 pt-3 pb-3">
            <h3 className="mb-2 font-sans text-base font-bold text-foreground/80">{labels.raffleTitle}</h3>
            <ol className="grid grid-cols-20 gap-1" aria-hidden>
              {tickets.map((category, index) => (
                <li
                  key={index}
                  data-ticket
                  className={cn("h-4 rounded-[2px]", CATEGORY_SWATCH_CLASS[RARE_SLOT_CATEGORY[category]])}
                />
              ))}
            </ol>
            <p className="mt-2 font-sans text-base text-foreground/85">
              {fillTemplate(labels.ticketCaptionTemplate, {
                per: rareSlot.totalWeight / TICKETS_DRAWN,
                total: rareSlot.totalWeight.toLocaleString("es-GT"),
              })}
            </p>
          </div>

          <div className="mt-3">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 font-sans text-base">
              {rareSlot.categories.map((category) => (
                <li key={category.key} className="flex items-center gap-2 whitespace-nowrap">
                  <span className={cn("h-3 w-5 rounded-[2px]", CATEGORY_SWATCH_CLASS[RARE_SLOT_CATEGORY[category.key]])} aria-hidden />
                  <span className="font-bold">{labels.categories[category.key]}</span>
                  <span className="nums text-foreground/80">
                    {fillTemplate(labels.categoryRateTemplate, {
                      data: formatPercent(category.dataRate),
                      official: formatPercent(category.officialRate),
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div data-pulled-ticket className="relative z-10 mt-3 w-fit self-end rotate-2 drop-shadow-xl">
            <div className="torn-edges flex w-[22rem] items-center gap-4 bg-card-paper px-4 py-4 text-card-ink">
              <PulledCardImage source={example.image} name={example.name} />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-sans text-sm font-bold tracking-wide text-card-ink/75 uppercase">{labels.pulledLabel}</p>
                <p className="font-sans text-base leading-snug">
                  {fillTemplate(labels.exampleTemplate, { name: example.name, weight: example.weight, total: rareSlot.totalWeight })}
                </p>
                <p className="nums font-display text-2xl leading-tight font-extrabold whitespace-nowrap">
                  {fillTemplate(labels.exampleFormulaTemplate, {
                    weight: example.weight,
                    total: rareSlot.totalWeight,
                    probability: formatPrecisePercent(example.probability),
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <ScoreSheet
            caption={labels.frequencyCaption}
            columns={[
              { key: "rarity", label: labels.rarityColumn },
              { key: "cards", label: labels.cardsColumn, numeric: true },
              { key: "chance", label: labels.chanceColumn, numeric: true },
              { key: "every", label: labels.everyColumn, numeric: true, emphasis: true },
            ]}
            rows={frequencyRows}
          />
          <p className="nums font-sans text-base leading-snug text-foreground/85">
            {fillTemplate(labels.duplicatesTemplate, {
              share: formatPercent(model.duplicates.anyFinishShare),
              normalShare: formatPercent(model.duplicates.bothNormalShare),
            })}
          </p>
        </section>
      </div>
    </div>
  )
}
