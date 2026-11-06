"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { SuitGlyph } from "@/features/shared/components/CardArt"
import { CARD_STYLES_BY_COLOR, PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatPercent } from "@/features/shared/format"
import { RarityChipStacks } from "@/features/model/components/RarityChipStacks"
import {
  mainPoolOf,
  openingShares,
  SLOT_GROUPS,
  specialGuestShare,
  type SlotGroup,
  type SlotGroupName,
} from "@/features/model/packSlots"
import type { ModelData } from "@/features/model/types/modelData"
import { texts } from "@/i18n/texts"

interface PackAnatomyPanelProps {
  model: ModelData
}

function groupNote(model: ModelData, group: SlotGroup) {
  const labels = texts.model.pack
  if (group.name === "opening") {
    const shares = openingShares(model.compositions)
    return fillTemplate(labels.openingSharesTemplate, {
      land: formatPercent(shares.land),
      foilLand: formatPercent(shares.foilLand),
      extraCommon: formatPercent(shares.extraCommon),
    })
  }
  if (group.name === "common") {
    return fillTemplate(labels.specialGuestTemplate, { share: formatPercent(specialGuestShare(model.compositions)) })
  }
  return null
}

// One slot drawn as a playing card: no number, the suit and its mana color tell the groups apart
function SlotCard({ group, lifted, muted }: { group: SlotGroup; lifted: boolean; muted: boolean }) {
  return (
    <span
      className={cn(
        "@container card-corners relative grid aspect-[63/88] w-(--slot-card) place-items-center bg-card-paper text-card-suit-ink ring-1 ring-card-ink/10 ring-inset transition-[translate,box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none",
        CARD_STYLES_BY_COLOR[group.color].suit,
        lifted ? "-translate-y-3 shadow-card-lifted" : "shadow-card",
        muted && "[&_svg]:opacity-35 group-hover/slots:[&_svg]:opacity-80"
      )}
      aria-hidden
    >
      <span className="absolute inset-[7cqi] rounded-[3cqi] shadow-[inset_0_0_0_max(1px,1.2cqi)_var(--card-suit-ink)]" />
      <SuitGlyph color={group.color} className="size-[42cqi]" />
    </span>
  )
}

export function PackAnatomyPanel({ model }: PackAnatomyPanelProps) {
  const [selectedName, setSelectedName] = useState<SlotGroupName>("rare")
  const labels = texts.model.pack
  const selected = SLOT_GROUPS.find((group) => group.name === selectedName) ?? SLOT_GROUPS[0]
  const pool = mainPoolOf(model, selected)
  const topComposition = model.compositions[0]
  const note = groupNote(model, selected)
  const perPack = selected.count === 1 ? labels.perPackOne : fillTemplate(labels.perPackTemplate, { count: selected.count })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      {/* The card width follows the row width, so the 14 slots stay on one line from a narrow laptop up */}
      <div
        role="group"
        aria-label={labels.slotsLabel}
        className="@container flex flex-wrap items-end justify-between gap-x-3 gap-y-5 pt-2 [--slot-card:clamp(2.25rem,calc((100cqw-31rem)/9),3.5rem)] md:flex-nowrap"
      >
        {SLOT_GROUPS.map((group) => {
          const isSelected = group.name === selectedName
          return (
            <button
              key={group.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedName(group.name)}
              className="group/slots flex min-w-0 flex-none cursor-pointer flex-col gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-felt"
            >
              <span
                className={cn(
                  "flex min-h-[2.9rem] items-end justify-center gap-1 border-x-2 border-t-2 border-dashed px-1.5 pt-1 pb-1.5 text-center font-sans text-sm leading-tight font-bold text-balance transition-colors duration-200",
                  group.count === 1 && "max-w-[5.5rem]",
                  "rounded-t-lg",
                  isSelected ? "border-foreground/70 text-foreground" : "border-playmat-stitch text-foreground/70"
                )}
              >
                <span>{labels.groups[group.name].label}</span>
                {group.count > 1 && (
                  <span className="nums shrink-0">{fillTemplate(labels.groupCountTemplate, { count: group.count })}</span>
                )}
              </span>
              <span className="flex justify-center gap-1.5">
                {Array.from({ length: group.count }, (unusedValue, offset) => (
                  <SlotCard key={offset} group={group} lifted={isSelected} muted={!isSelected} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid items-center gap-x-10 gap-y-6 lg:grid-cols-[18rem_auto_minmax(0,1fr)]" aria-live="polite">
        <article
          className={cn(
            "card-corners flex w-72 flex-col gap-2 bg-card-paper p-4 text-card-ink shadow-card-lifted ring-1 ring-card-ink/10 ring-inset",
            CARD_STYLES_BY_COLOR[selected.color].suit
          )}
        >
          <header className="flex items-center justify-between gap-2 border-b-2 border-card-suit-ink pb-1.5">
            <h3 className="font-display text-xl leading-tight font-bold">{labels.groups[selected.name].label}</h3>
            <SuitGlyph color={selected.color} className="size-5 shrink-0 text-card-suit-ink" />
          </header>
          {pool && (
            <p className="flex items-baseline gap-2">
              <span className="nums font-display text-6xl leading-none font-extrabold">{pool.distinctCards}</span>
              <span className="font-sans text-base">{labels.distinctCaption}</span>
            </p>
          )}
          <p className="font-sans text-sm font-bold text-card-suit-ink">{fillTemplate(labels.poolTypeTemplate, { perPack })}</p>
          <p className="font-sans text-base leading-snug">{labels.groups[selected.name].text}</p>
          {pool && (
            <p className="nums mt-1 self-end rounded-sm bg-card-ink px-2 py-0.5 font-sans text-sm font-bold text-card-paper">
              {fillTemplate(labels.baseFooterTemplate, { base: pool.baseSetCards, outOfSet: pool.outOfSetCards })}
            </p>
          )}
        </article>

        {pool && <RarityChipStacks mix={pool.categoryMix} label={labels.mixLabel} />}

        <div className="flex max-w-[34ch] flex-col gap-3 font-sans text-lg leading-relaxed text-foreground/85">
          {note && <p className="nums">{note}</p>}
          <p className="nums">
            {fillTemplate(labels.compositionsTemplate, {
              count: model.compositions.length,
              share: formatPercent(topComposition.probability),
              commons: topComposition.cardsBySlot.common ?? 0,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
