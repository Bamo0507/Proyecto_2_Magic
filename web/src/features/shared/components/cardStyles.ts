import type { ManaColor } from "@/features/shared/types/section"

interface CardStyles {
  frame: string
  suit: string
}

export const CARD_STYLES_BY_COLOR: Record<ManaColor, CardStyles> = {
  white: {
    frame: "bg-mana-white text-mana-white-foreground",
    suit: "[--card-suit:var(--suit-white)] [--card-suit-ink:var(--suit-white-ink)]",
  },
  blue: {
    frame: "bg-mana-blue text-mana-blue-foreground",
    suit: "[--card-suit:var(--suit-blue)] [--card-suit-ink:var(--suit-blue-ink)]",
  },
  black: {
    frame: "bg-mana-black text-mana-black-foreground",
    suit: "[--card-suit:var(--suit-black)] [--card-suit-ink:var(--suit-black-ink)]",
  },
  red: {
    frame: "bg-mana-red text-mana-red-foreground",
    suit: "[--card-suit:var(--suit-red)] [--card-suit-ink:var(--suit-red-ink)]",
  },
  green: {
    frame: "bg-mana-green text-mana-green-foreground",
    suit: "[--card-suit:var(--suit-green)] [--card-suit-ink:var(--suit-green-ink)]",
  },
  colorless: {
    frame: "bg-mana-colorless text-mana-colorless-foreground",
    suit: "[--card-suit:var(--suit-colorless)] [--card-suit-ink:var(--suit-colorless-ink)]",
  },
  gold: {
    frame: "bg-mana-gold text-mana-gold-foreground",
    suit: "[--card-suit:var(--suit-gold)] [--card-suit-ink:var(--suit-gold-ink)]",
  },
}

export const PILE_ZONE_CLASS_NAME =
  "flex shrink-0 items-center gap-5 rounded-[1.5rem] border-2 border-dashed border-playmat-stitch p-3 pr-6 short:gap-4 short:rounded-[1.25rem] short:p-2 short:pr-5 outline-none transition-colors duration-200 hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt"

// A hanging price tag: paper with a punched hole on the left, for tags that hang on the mat (prices, sources)
export const TAG_CLASS_NAME =
  "relative flex min-h-11 flex-col justify-center rounded-r-md rounded-l-[1.25rem] bg-card-paper py-2 pr-3 pl-7 text-left text-card-ink before:absolute before:top-1/2 before:left-2.5 before:size-2.5 before:-translate-y-1/2 before:rounded-full before:bg-felt before:shadow-[inset_0_1px_1px_var(--shadow-color)]"

// Every tab of a section opens with the same heading, so the title does not jump in size when the presenter switches
export const PANEL_HEADING_CLASS_NAME = "max-w-[72ch] font-serif text-2xl leading-snug text-balance"
