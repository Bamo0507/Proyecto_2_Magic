"use client"

import Link from "next/link"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { SuitGlyph } from "@/features/shared/components/CardArt"
import { CARD_STYLES_BY_COLOR, PANEL_HEADING_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatSignedMoney } from "@/features/shared/format"
import type { ManaColor } from "@/features/shared/types/section"
import type { TechniqueAction, TechniqueData } from "@/features/technique/types/techniqueData"
import { texts } from "@/i18n/texts"

gsap.registerPlugin(useGSAP)

const POSITIVE_AREA_REM = 8
const MIN_STACK_REM = 0.4
const ACTION_COLOR: Record<TechniqueAction, ManaColor> = { stop: "red", pack: "blue", box: "gold" }
const SERIES = [
  { product: "pack", chipClassName: "[--chip-color:var(--mana-blue)]" },
  { product: "box", chipClassName: "[--chip-color:var(--mana-gold)]" },
] as const

interface RuleInActionPanelProps {
  technique: TechniqueData
}

export function RuleInActionPanel({ technique }: RuleInActionPanelProps) {
  const labels = texts.technique.action
  const scopeRef = useRef<HTMLDivElement>(null)
  const highestGain = Math.max(...technique.decisions.flatMap((decision) => [decision.pack.gain, decision.box.gain]))
  const remPerDollar = POSITIVE_AREA_REM / highestGain
  const lowestGain = Math.min(0, ...technique.decisions.flatMap((decision) => [decision.pack.gain, decision.box.gain]))
  const negativeAreaRem = Math.max(Math.abs(lowestGain) * remPerDollar, MIN_STACK_REM) + 1.75
  const lastDecision = technique.decisions[technique.decisions.length - 1]

  // Each decision is a turn: its chips are stacked, then the card it plays is laid on top, one turn after another
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ delay: 0.15 })
        gsap.utils.toArray<HTMLElement>("[data-turn]").forEach((turn) => {
          timeline
            .from(turn.querySelectorAll("[data-stack]"), { scaleY: 0, duration: 0.45, ease: "power2.out", stagger: 0.08 })
            .from(turn.querySelector("[data-played-card]"), { y: -16, opacity: 0, duration: 0.3, ease: "power2.out" }, "-=0.15")
        })
      })
      return () => media.revert()
    },
    { scope: scopeRef }
  )

  return (
    <div ref={scopeRef} className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>
        <ul className="flex gap-5 font-sans text-base">
          {SERIES.map((series) => (
            <li key={series.product} className="flex items-center gap-2">
              <span className={cn("chip-stack h-4 w-5 rounded-sm", series.chipClassName)} aria-hidden />
              {series.product === "pack" ? labels.seriesPack : labels.seriesBox}
            </li>
          ))}
        </ul>
      </div>

      <ol className="relative grid grid-cols-2 gap-x-4 gap-y-8 rounded-[1.25rem] border-2 border-dashed border-playmat-stitch px-5 pt-5 pb-4 md:grid-cols-4">
        {technique.decisions.map((decision, index) => {
          const isLast = index === technique.decisions.length - 1
          return (
            <li
              key={index}
              data-turn
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl px-1 pt-5 pb-2",
                isLast && "bg-mana-red/10 outline-2 outline-offset-2 outline-dashed outline-mana-red/60"
              )}
            >
              {isLast && (
                <span className="absolute -top-3.5 right-2 rounded-sm bg-mana-red px-2 py-0.5 font-sans text-sm font-bold text-mana-red-foreground">
                  {labels.stopHere}
                </span>
              )}
              <span
                data-played-card
                className={cn(
                  "card-corners flex w-36 items-center justify-between gap-2 bg-card-paper px-3 py-2 text-card-ink shadow-card ring-1 ring-card-ink/10 ring-inset",
                  CARD_STYLES_BY_COLOR[ACTION_COLOR[decision.action]].suit
                )}
              >
                <span className="font-display text-base leading-tight font-bold">{labels.actions[decision.action]}</span>
                <SuitGlyph color={ACTION_COLOR[decision.action]} className="size-5 shrink-0 text-card-suit-ink" />
              </span>

              <div className="flex w-full flex-col">
                <div className="flex items-end justify-center gap-3" style={{ height: `${POSITIVE_AREA_REM + 1.75}rem` }}>
                  {SERIES.map((series) => {
                    const gain = decision[series.product].gain
                    return (
                      <span key={series.product} className="flex w-12 flex-col items-center gap-1">
                        {gain > 0 && <span className="nums font-display text-lg leading-none font-extrabold">{formatSignedMoney(gain)}</span>}
                        {gain > 0 && (
                          <span
                            data-stack
                            className={cn("chip-stack w-10 origin-bottom rounded-t-sm shadow-chip", series.chipClassName)}
                            style={{ height: `${Math.max(gain * remPerDollar, MIN_STACK_REM)}rem` }}
                          />
                        )}
                      </span>
                    )
                  })}
                </div>
                <span className="relative border-t-2 border-dashed border-foreground/60" aria-hidden>
                  {index === 0 && (
                    <span className="absolute -top-7 left-0 font-sans text-base text-foreground/85">{labels.zero}</span>
                  )}
                </span>
                <div className="flex items-start justify-center gap-3" style={{ height: `${negativeAreaRem}rem` }}>
                  {SERIES.map((series) => {
                    const gain = decision[series.product].gain
                    return (
                      <span key={series.product} className="flex w-12 flex-col items-center gap-1">
                        {gain < 0 && (
                          <span
                            data-stack
                            className={cn("chip-stack w-10 origin-top rounded-b-sm opacity-70", series.chipClassName)}
                            style={{ height: `${Math.max(Math.abs(gain) * remPerDollar, MIN_STACK_REM)}rem` }}
                          />
                        )}
                        {gain < 0 && <span className="nums font-display text-lg leading-none font-extrabold text-foreground/85">{formatSignedMoney(gain)}</span>}
                      </span>
                    )
                  })}
                </div>
              </div>

              <span className="flex flex-col items-center">
                <span className="nums font-display text-xl leading-tight font-bold">
                  {fillTemplate(labels.missingTemplate, { missing: decision.missingBefore })}
                </span>
                <span className="nums font-sans text-sm text-foreground/80">
                  {fillTemplate(labels.packsTemplate, { packs: decision.packsOpenedBefore })}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="nums font-sans text-base">{fillTemplate(labels.stopNoteTemplate, { missing: lastDecision.missingBefore })}</p>
        <Link
          href="/simulation"
          className="flex min-h-11 items-center gap-1.5 rounded-md px-1 font-sans text-base font-bold underline underline-offset-4 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {labels.simulationLink}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
