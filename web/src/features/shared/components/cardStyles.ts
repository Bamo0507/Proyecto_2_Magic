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
