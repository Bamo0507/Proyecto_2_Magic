import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// The one way a chosen object is marked across the site: it is lifted and a stitched outline surrounds it, as if it
// were placed on a zone of the mat. The paper is never made transparent; only the ink of the other choices fades
export const SELECTED_OBJECT_CLASS_NAME = "-translate-y-1.5 shadow-card-lifted outline-2 outline-offset-4 outline-dashed outline-foreground/60"
export const UNSELECTED_OBJECT_CLASS_NAME = "shadow-card text-card-ink/60 hover:-translate-y-0.5 hover:text-card-ink"

interface PaperOptionProps {
  selected: boolean
  onSelect: () => void
  children: ReactNode
  className?: string
}

// A choice drawn as a slip of paper on the table, so a toggle reads as picking up an object instead of a switch
export function PaperOption({ selected, onSelect, children, className }: PaperOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "min-h-11 cursor-pointer rounded-md bg-card-paper px-3 py-2 text-left text-card-ink transition-[translate,box-shadow,color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt focus-visible:outline-none motion-reduce:transition-none",
        selected ? SELECTED_OBJECT_CLASS_NAME : UNSELECTED_OBJECT_CLASS_NAME,
        className
      )}
    >
      {children}
    </button>
  )
}
