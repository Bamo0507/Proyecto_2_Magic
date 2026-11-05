import { cn } from "@/lib/utils"
import { SuitGlyph } from "@/features/shared/components/CardArt"
import { CARD_STYLES_BY_COLOR } from "@/features/shared/components/cardStyles"
import type { Section } from "@/features/shared/types/section"

interface MiniCardProps {
  section: Section
  position: number
  className?: string
}

export function MiniCard({ section, position, className }: MiniCardProps) {
  return (
    <span
      className={cn(
        "@container card-corners relative grid aspect-[63/88] place-items-center bg-card-paper text-card-suit-ink shadow-card ring-1 ring-card-ink/10 ring-inset",
        CARD_STYLES_BY_COLOR[section.color].suit,
        className
      )}
      aria-hidden
    >
      <span className="absolute inset-[7cqi] rounded-[3cqi] shadow-[inset_0_0_0_max(1px,1cqi)_var(--card-suit-ink)]" />
      <span className="flex flex-col items-center gap-[6cqi]">
        <span className="nums font-display text-[46cqi] leading-[0.8] font-extrabold tracking-[-0.03em]">{position}</span>
        <SuitGlyph color={section.color} className="size-[24cqi]" />
      </span>
    </span>
  )
}
