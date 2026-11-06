import { cn } from "@/lib/utils"
import { formatPercent } from "@/features/shared/format"
import { CATEGORY_CHIP_CLASS, CATEGORY_ORDER } from "@/features/model/packSlots"
import type { CardCategory } from "@/features/model/types/modelData"
import { texts } from "@/i18n/texts"

const STACK_HEIGHT_REM = 8.5
const MIN_STACK_REM = 0.5

interface RarityChipStacksProps {
  mix: Partial<Record<CardCategory, number>>
  label: string
}

export function categoryLabel(category: CardCategory) {
  return category === "outOfSet" ? texts.cards.outOfSet : texts.cards.rarities[category]
}

// The rarity mix of a pool as stacks of poker chips: the taller the stack, the more often that kind of card comes out.
// Every stack carries its share as text, so the color is never the only way to read it
export function RarityChipStacks({ mix, label }: RarityChipStacksProps) {
  const categories = CATEGORY_ORDER.filter((category) => (mix[category] ?? 0) > 0)

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-sans text-base font-bold text-foreground/80">{label}</figcaption>
      <ul className="flex items-end gap-5" style={{ height: `${STACK_HEIGHT_REM + 4.5}rem` }}>
        {categories.map((category) => {
          const share = mix[category] ?? 0
          return (
            <li key={category} className="flex w-20 flex-col items-center gap-1.5">
              <span className="nums font-display text-xl leading-none font-extrabold">{formatPercent(share)}</span>
              <span
                className={cn(
                  "chip-stack w-14 rounded-sm shadow-chip transition-[height] duration-300 ease-out motion-reduce:transition-none",
                  CATEGORY_CHIP_CLASS[category]
                )}
                style={{ height: `${Math.max(share * STACK_HEIGHT_REM, MIN_STACK_REM)}rem` }}
                aria-hidden
              />
              <span className="text-center font-sans text-base leading-tight font-bold">{categoryLabel(category)}</span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
