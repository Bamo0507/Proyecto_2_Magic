import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface CardButtonProps {
  label: string
  onSelect?: () => void
  children: ReactNode
  className?: string
}

// A card on the stage opens its detail when clicked; while an animation plays there is no handler and it stays inert
export function CardButton({ label, onSelect, children, className }: CardButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!onSelect}
      aria-label={label}
      className={cn(
        "block w-full cursor-zoom-in rounded-[0.6rem] outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt enabled:hover:-translate-y-0.5 disabled:cursor-default motion-reduce:transition-none",
        className
      )}
    >
      {children}
    </button>
  )
}
