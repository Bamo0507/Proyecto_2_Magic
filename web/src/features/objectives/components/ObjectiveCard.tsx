import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { CARD_STYLES_BY_COLOR } from "@/features/shared/components/cardStyles"
import { cn } from "@/lib/utils"
import { texts } from "@/i18n/texts"

interface ObjectiveCardProps {
  objective: (typeof texts.objectives.items)[number]
  position: number
}

export function ObjectiveCard({ objective, position }: ObjectiveCardProps) {
  const labels = texts.objectives

  return (
    <li className={cn("flex min-w-0 flex-col rounded-lg bg-card-paper p-3 text-card-ink shadow-card ring-1 ring-card-ink/10 short:p-2", CARD_STYLES_BY_COLOR.blue.suit)}>
      <div className="flex items-start gap-2 border-b border-card-suit-ink/25 pb-2 short:pb-1">
        <span className="nums font-display text-3xl leading-none font-extrabold text-card-suit-ink short:text-2xl" aria-hidden>
          {position}
        </span>
        <h3 className="font-display text-lg leading-tight font-bold">{objective.title}</h3>
      </div>
      <p className="mt-2 font-sans text-sm leading-snug short:mt-1">
        <span className="font-bold text-card-suit-ink">{labels.measureLabel}: </span>
        {objective.measure}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 font-sans text-sm short:pt-1">
        <span className="font-bold text-card-suit-ink">{labels.answeredIn}:</span>
        {objective.sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="inline-flex items-center gap-0.5 rounded-sm font-bold text-card-suit-ink underline underline-offset-2 hover:text-card-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card-suit-ink"
          >
            {section.label}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        ))}
      </div>
    </li>
  )
}
