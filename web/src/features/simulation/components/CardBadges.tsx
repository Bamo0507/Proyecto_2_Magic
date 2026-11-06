import { cn } from "@/lib/utils"
import type { CardInfo, OpenedCard } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

const CHIP_CLASS_NAME = "rounded-full px-2 py-0.5 font-sans text-xs leading-tight font-bold whitespace-nowrap"

interface CardBadgesProps {
  opened: OpenedCard
  card: CardInfo | undefined
  className?: string
}

export function CardBadges({ opened, card, className }: CardBadgesProps) {
  const badges = texts.simulation.badges
  const outOfSet = card ? !card.inBaseSet : false

  return (
    <span className={cn("flex flex-wrap justify-center gap-1", className)}>
      {outOfSet ? (
        <span className={cn(CHIP_CLASS_NAME, "bg-card text-foreground ring-1 ring-border ring-inset")}>{badges.outOfSet}</span>
      ) : opened.isNew ? (
        <span className={cn(CHIP_CLASS_NAME, "bg-primary text-primary-foreground")}>{badges.new}</span>
      ) : (
        <span className={cn(CHIP_CLASS_NAME, "bg-card text-muted-foreground")}>{badges.repeated}</span>
      )}
      {opened.foil && <span className={cn(CHIP_CLASS_NAME, "bg-mana-gold text-mana-gold-foreground")}>{badges.foil}</span>}
    </span>
  )
}
