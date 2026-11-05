import Link from "next/link"

import { cn } from "@/lib/utils"
import { PILE_ZONE_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { MiniCard } from "@/features/shared/components/MiniCard"
import { SECTIONS } from "@/features/shared/sections"
import type { Section } from "@/features/shared/types/section"
import { texts } from "@/i18n/texts"

interface DiscardPileProps {
  section: Section
  className?: string
}

export function DiscardPile({ section, className }: DiscardPileProps) {
  const title = texts.sections[section.key].title

  return (
    <Link
      href={section.href}
      aria-label={`${texts.section.previousCard}, ${title}`}
      className={cn("group/discard", PILE_ZONE_CLASS_NAME, className)}
    >
      <span className="relative block h-24 w-[4.3rem] shrink-0 short:h-16 short:w-[2.9rem]" aria-hidden>
        <span className="card-corners absolute inset-0 rotate-[5deg] bg-card-paper shadow-card ring-1 ring-card-ink/10 ring-inset" />
        <MiniCard
          section={section}
          position={SECTIONS.indexOf(section) + 1}
          className="absolute inset-0 w-full -rotate-[6deg] transition-[rotate,translate] duration-200 ease-out group-hover/discard:-translate-y-1 group-hover/discard:-rotate-[2deg] motion-reduce:transition-none"
        />
      </span>
      <span className="flex flex-col gap-0.5 text-left">
        <span className="font-display text-lg leading-tight font-bold">{texts.section.previousCard}</span>
        <span className="font-sans text-sm font-medium text-muted-foreground">{title}</span>
      </span>
    </Link>
  )
}
