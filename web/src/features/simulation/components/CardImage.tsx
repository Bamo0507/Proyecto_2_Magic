"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { MagicCardBack } from "@/features/simulation/components/MagicCardBack"
import type { CardInfo } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

const IMAGE_SIZE = { width: 488, height: 680 }
// Glow drawn outside the card so the Scryfall image itself is never covered or color-shifted
const FOIL_GLOW_CLASS_NAME = "shadow-[0_0_0_2px_var(--mana-gold),0_0_1.25rem_-0.125rem_var(--mana-gold)]"

interface CardImageProps {
  cardId: string
  card: CardInfo | undefined
  size: "small" | "normal"
  backImage: string | null
  foil?: boolean
  className?: string
}

function rarityLabel(rarity: string | undefined) {
  if (!rarity) return ""
  return texts.simulation.rarities[rarity as keyof typeof texts.simulation.rarities] ?? rarity
}

// Printed face shown when the image fails, so a broken request never leaves a hole in the pack and the card can still
// be read by name
function PrintedFace({ cardId, card }: Pick<CardImageProps, "cardId" | "card">) {
  return (
    <span className="absolute inset-0 flex flex-col justify-between p-[8cqi]" aria-hidden>
      <span className="absolute inset-[4cqi] rounded-[2cqi] shadow-[inset_0_0_0_max(1px,0.8cqi)_var(--card-ink)]" />
      <span className="font-display text-[11cqi] leading-[1.05] font-bold text-balance">{card?.name ?? cardId}</span>
      <span className="flex flex-col gap-[1cqi] font-sans text-[8cqi] leading-tight">
        <span className="font-bold">{rarityLabel(card?.rarity)}</span>
        <span className="nums text-card-ink/70">{cardId}</span>
      </span>
    </span>
  )
}

export function CardImage({ cardId, card, size, backImage, foil = false, className }: CardImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const source = size === "small" ? card?.imageSmall : card?.imageNormal
  const showPrinted = !source || failed

  return (
    <span
      className={cn(
        "@container card-corners relative block aspect-[488/680] overflow-hidden bg-card-paper text-card-ink shadow-card ring-1 ring-card-ink/10 ring-inset",
        foil && FOIL_GLOW_CLASS_NAME,
        className
      )}
    >
      {showPrinted ? (
        <PrintedFace cardId={cardId} card={card} />
      ) : (
        !loaded && <MagicCardBack imageUrl={backImage} className="absolute inset-0 size-full" />
      )}
      {source && !failed && (
        <Image
          src={source}
          alt={card?.name ?? cardId}
          width={IMAGE_SIZE.width}
          height={IMAGE_SIZE.height}
          unoptimized
          loading="eager"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-300 ease-out motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </span>
  )
}
