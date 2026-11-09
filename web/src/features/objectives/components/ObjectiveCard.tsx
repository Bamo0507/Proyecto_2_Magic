import { CARD_STYLES_BY_COLOR } from "@/features/shared/components/cardStyles"
import { cn } from "@/lib/utils"

interface ObjectiveCardProps {
  objective: string
  position: number
}

export function ObjectiveCard({ objective, position }: ObjectiveCardProps) {
  return (
    <li
      className={cn(
        "flex min-w-0 items-start gap-3 rounded-lg bg-card-paper p-5 text-card-ink shadow-card ring-1 ring-card-ink/10",
        CARD_STYLES_BY_COLOR.blue.suit
      )}
    >
      <span className="nums font-display text-5xl leading-none font-extrabold text-card-suit-ink" aria-hidden>
        {position}
      </span>
      <p className="font-display text-xl leading-snug font-bold">{objective}</p>
    </li>
  )
}
