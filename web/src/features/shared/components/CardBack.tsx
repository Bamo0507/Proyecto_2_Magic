import type { CSSProperties, Ref } from "react"

import { cn } from "@/lib/utils"
import { texts } from "@/i18n/texts"

const LABEL_CLASS_NAME =
  "absolute font-sans text-[8cqi] font-bold tracking-[0.18em] [font-variant-caps:all-small-caps]"
const TITLE_CLASS_NAME = "font-display text-[30cqi] leading-none font-extrabold tracking-[-0.03em]"

interface CardBackProps {
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLDivElement>
}

export function CardBack({ className, style, ref }: CardBackProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "@container card-corners relative grid aspect-[63/88] place-items-center overflow-hidden bg-card-paper text-card-ink shadow-card ring-1 ring-card-ink/10 ring-inset",
        className
      )}
      style={style}
      aria-hidden
    >
      <span className="absolute inset-[5cqi] rounded-[2.5cqi] shadow-[inset_0_0_0_max(1px,0.8cqi)_var(--card-ink)]" />
      <span className={cn(LABEL_CLASS_NAME, "top-[10cqi]")}>{texts.cardBack.label}</span>
      <span className={cn(LABEL_CLASS_NAME, "bottom-[10cqi] rotate-180")}>{texts.cardBack.label}</span>
      <span className="flex flex-col items-center gap-[2cqi]">
        <span className={TITLE_CLASS_NAME}>{texts.cardBack.title}</span>
        <span className="h-[max(1px,0.8cqi)] w-[42cqi] bg-card-ink" />
        <span className={cn(TITLE_CLASS_NAME, "rotate-180")}>{texts.cardBack.title}</span>
      </span>
    </div>
  )
}
