"use client"

import Link from "next/link"
import { useRef, type Ref } from "react"

import { cn } from "@/lib/utils"
import { CardBack } from "@/features/shared/components/CardBack"
import { PILE_ZONE_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { useDrawCard } from "@/features/shared/hooks/useDrawCard"

const STACKED_BACKS = [3, 2, 1, 0]
const TOP_OF_DECK = 0

interface CardDeckProps {
  href: string
  title: string
  subtitle: string
  deckRef?: Ref<HTMLSpanElement>
  className?: string
}

export function CardDeck({ href, title, subtitle, deckRef, className }: CardDeckProps) {
  const topCardRef = useRef<HTMLDivElement>(null)
  const drawCard = useDrawCard(href, topCardRef)

  return (
    <Link
      href={href}
      onClick={drawCard}
      className={cn(
        "group/deck",
        PILE_ZONE_CLASS_NAME,
        className
      )}
    >
      <span ref={deckRef} className="relative block h-24 w-[4.3rem] shrink-0 short:h-16 short:w-[2.9rem]" aria-hidden>
        {STACKED_BACKS.map((depth) => (
          <CardBack
            key={depth}
            ref={depth === TOP_OF_DECK ? topCardRef : undefined}
            className="absolute inset-0 transition-transform duration-200 ease-out group-hover/deck:-translate-y-1 motion-reduce:transition-none"
            style={{ translate: `${depth * 2}px ${depth * -2}px` }}
          />
        ))}
      </span>
      <span className="flex flex-col gap-0.5 text-left">
        <span className="font-display text-lg leading-tight font-bold">{title}</span>
        <span className="font-sans text-sm font-medium text-muted-foreground">{subtitle}</span>
      </span>
    </Link>
  )
}
