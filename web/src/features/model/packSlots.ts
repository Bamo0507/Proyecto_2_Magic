import type { ManaColor } from "@/features/shared/types/section"
import type { CardCategory, Composition, ModelData } from "@/features/model/types/modelData"

export type SlotGroupName = "opening" | "common" | "uncommon" | "rare" | "reprint" | "wildcard" | "foil"

export interface SlotGroup {
  name: SlotGroupName
  count: number
  pools: string[]
  color: ManaColor
}

// The 14 places of an MH3 Play Booster in reading order. The opening place changes with the composition (basic land,
// foil land or one more common), and once in a while a special guest takes the place of a common
export const SLOT_GROUPS: SlotGroup[] = [
  { name: "opening", count: 1, pools: ["land", "foil_land"], color: "green" },
  { name: "common", count: 6, pools: ["common", "special_guest"], color: "colorless" },
  { name: "uncommon", count: 3, pools: ["new_uncommon"], color: "blue" },
  { name: "rare", count: 1, pools: ["new_rare_mythic"], color: "gold" },
  { name: "reprint", count: 1, pools: ["reprint"], color: "black" },
  { name: "wildcard", count: 1, pools: ["wildcard"], color: "red" },
  { name: "foil", count: 1, pools: ["foil_with_showcase"], color: "white" },
]

export const CATEGORY_ORDER: CardCategory[] = ["common", "uncommon", "rare", "mythic", "outOfSet"]

// One mana color per kind of card, used the same way in every tab: a rare is always gold and a card outside the
// base set (variants, basic lands, guests) is always green
export const CATEGORY_CHIP_CLASS: Record<CardCategory, string> = {
  common: "[--chip-color:var(--mana-colorless)]",
  uncommon: "[--chip-color:var(--mana-blue)]",
  rare: "[--chip-color:var(--mana-gold)]",
  mythic: "[--chip-color:var(--mana-red)]",
  outOfSet: "[--chip-color:var(--mana-green)]",
}

export const CATEGORY_SWATCH_CLASS: Record<CardCategory, string> = {
  common: "bg-mana-colorless",
  uncommon: "bg-mana-blue",
  rare: "bg-mana-gold",
  mythic: "bg-mana-red",
  outOfSet: "bg-mana-green",
}

function shareWith(compositions: Composition[], predicate: (composition: Composition) => boolean) {
  return compositions.filter(predicate).reduce((total, composition) => total + composition.probability, 0)
}

export function openingShares(compositions: Composition[]) {
  const land = shareWith(compositions, (composition) => Boolean(composition.cardsBySlot.land))
  const foilLand = shareWith(compositions, (composition) => Boolean(composition.cardsBySlot.foil_land))
  return { land, foilLand, extraCommon: 1 - land - foilLand }
}

export function specialGuestShare(compositions: Composition[]) {
  return shareWith(compositions, (composition) => Boolean(composition.cardsBySlot.special_guest))
}

// The main pool of a group is the one whose facts are shown; the opening place shows the land pool
export function mainPoolOf(model: ModelData, group: SlotGroup) {
  return model.slots.find((slot) => slot.name === group.pools[0])
}
