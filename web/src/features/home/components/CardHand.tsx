"use client"

import Link from "next/link"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { CardDeck } from "@/features/shared/components/CardDeck"
import { useDealAnimation } from "@/features/home/hooks/useDealAnimation"
import { SectionCard } from "@/features/shared/components/SectionCard"
import { formatSectionPosition, SECTIONS } from "@/features/shared/sections"
import { texts } from "@/i18n/texts"

const FAN_ROTATION_DEGREES = 5
const FAN_ARC_REM = 0.45

function fanOffset(index: number) {
  return index - (SECTIONS.length - 1) / 2
}

function fanTransform(index: number) {
  const offsetFromCenter = fanOffset(index)
  const drop = offsetFromCenter * offsetFromCenter * FAN_ARC_REM
  return `translateX(calc(${offsetFromCenter} * var(--card-step))) translateY(${drop}rem) rotate(${offsetFromCenter * FAN_ROTATION_DEGREES}deg)`
}

function cardLabel(index: number) {
  return `${texts.sections[SECTIONS[index].key].title}, ${formatSectionPosition(index + 1)}`
}

const cardLinkClassName =
  "group card-corners block outline-none transition-transform duration-300 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-felt motion-reduce:transition-none"

export function CardHand() {
  const handRef = useRef<HTMLUListElement>(null)
  const deckRef = useRef<HTMLSpanElement>(null)
  useDealAnimation(handRef, deckRef)

  return (
    <nav aria-label={texts.home.handLabel} className="flex w-full flex-col items-center gap-8 md:min-h-0 md:flex-1 md:gap-3">
      <div className="hidden min-h-0 w-full flex-1 [container-type:size] md:block">
      <ul ref={handRef} className="card-fan-slots relative mx-auto h-full w-full">
        {SECTIONS.map((section, index) => (
          <li
            key={section.key}
            className="group/slot absolute bottom-[4.5rem] left-1/2 ml-[calc(var(--card-width)/-2)] w-[var(--card-width)] origin-bottom hover:z-50 focus-within:z-50"
            style={{ transform: fanTransform(index) }}
          >
            <div
              data-dealt-card
              data-section-key={section.key}
              data-fan-rotation={fanOffset(index) * FAN_ROTATION_DEGREES}
            >
              <Link
                href={section.href}
                aria-label={cardLabel(index)}
                className={cn(
                  cardLinkClassName,
                  "group-hover/slot:-translate-y-10 group-hover/slot:scale-105 focus-visible:-translate-y-10 focus-visible:scale-105"
                )}
              >
                <SectionCard section={section} position={index + 1} />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      </div>

      <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:hidden">
        {SECTIONS.map((section, index) => (
          <li
            key={section.key}
            className="last:col-span-2 last:mx-auto last:w-1/2 sm:last:col-span-1 sm:last:col-start-2 sm:last:w-full"
          >
            <Link href={section.href} aria-label={cardLabel(index)} className={cn(cardLinkClassName, "active:scale-[0.96]")}>
              <SectionCard section={section} position={index + 1} />
            </Link>
          </li>
        ))}
      </ul>

      <CardDeck deckRef={deckRef} href="/problem" title={texts.home.deckTitle} subtitle={texts.home.deckSubtitle} />
    </nav>
  )
}
