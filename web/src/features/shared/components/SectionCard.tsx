import { cn } from "@/lib/utils"
import { CardArt, SuitGlyph } from "@/features/shared/components/CardArt"
import { CARD_STYLES_BY_COLOR } from "@/features/shared/components/cardStyles"
import type { Section } from "@/features/shared/types/section"
import { texts } from "@/i18n/texts"

interface SectionCardProps {
  section: Section
  position: number
  className?: string
}

interface CardIndexProps {
  section: Section
  position: number
  className?: string
}

function CardIndex({ section, position, className }: CardIndexProps) {
  return (
    <span aria-hidden className={cn("absolute flex w-[12cqi] flex-col items-center gap-[1.5cqi] text-card-suit-ink", className)}>
      <span className="nums font-display text-[16cqi] leading-[0.78] font-extrabold tracking-[-0.03em]">{position}</span>
      <SuitGlyph color={section.color} className="size-[6.5cqi]" />
    </span>
  )
}

export function SectionCard({ section, position, className }: SectionCardProps) {
  const content = texts.sections[section.key]
  const styles = CARD_STYLES_BY_COLOR[section.color]

  return (
    <article
      className={cn(
        "@container card-corners relative isolate aspect-[63/88] w-full overflow-hidden bg-card-paper text-card-ink shadow-card ring-1 ring-card-ink/10 ring-inset transition-shadow duration-300 ease-out group-hover/slot:shadow-card-lifted group-focus-visible:shadow-card-lifted motion-reduce:transition-none",
        styles.suit,
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-[3.5cqi] rounded-[1.3cqi] shadow-[inset_0_0_0_0.45cqi_var(--card-suit-ink)]"
        aria-hidden
      />

      <CardIndex section={section} position={position} className="top-[7cqi] left-[6.5cqi]" />

      <header className="absolute top-[7.5cqi] right-[7cqi] left-[21cqi] flex flex-col gap-[1.2cqi]">
        <p className="font-display text-[max(0.8125rem,10.5cqi)] leading-[0.95] font-bold tracking-[-0.012em]">
          {content.title}
        </p>
        <p className="hidden font-serif text-[max(0.75rem,5.8cqi)] leading-tight text-card-suit-ink italic @[11rem]:block">
          {content.type}
        </p>
      </header>

      <CardArt sectionKey={section.key} className="absolute top-[36cqi] left-[10cqi] w-[80cqi]" />

      <CardIndex section={section} position={position} className="right-[6.5cqi] bottom-[7cqi] rotate-180" />
    </article>
  )
}
