"use client"

import { Info } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { texts } from "@/i18n/texts"

export function FanContentNotice() {
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md font-sans text-sm font-medium text-foreground/60 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt data-popup-open:text-foreground"
      >
        <Info className="size-4" aria-hidden />
        {texts.footer.fanContentTrigger}
      </PopoverTrigger>
      <PopoverContent side="top" align="end" sideOffset={8} className="w-[min(22rem,calc(100vw-2rem))] bg-popover p-4 shadow-card-lifted ring-0">
        <p lang="en" className="font-sans text-sm leading-relaxed text-pretty text-popover-foreground">
          {texts.footer.fanContent}
        </p>
      </PopoverContent>
    </Popover>
  )
}
