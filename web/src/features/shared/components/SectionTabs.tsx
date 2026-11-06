"use client"

import type { ReactNode } from "react"
import { Tabs } from "@base-ui/react/tabs"

export interface SectionTab {
  value: string
  label: string
  content: ReactNode
}

interface SectionTabsProps {
  label: string
  tabs: SectionTab[]
}

// Tabs inside a section field, so each part of a long section fits the field and the presenter moves through them in
// order. The active tab is a paper label laid on the felt; the others are stitched slots. The arrow keys move between
// tabs while a tab has focus, without changing section
export function SectionTabs({ label, tabs }: SectionTabsProps) {
  return (
    <Tabs.Root defaultValue={tabs[0]?.value} className="flex min-h-0 flex-1 flex-col gap-6">
      <Tabs.List aria-label={label} className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className="min-h-11 cursor-pointer rounded-lg border-2 border-dashed border-playmat-stitch px-4 font-sans text-base font-bold text-foreground/80 outline-none transition-[color,background-color,border-color,translate,box-shadow] duration-200 ease-out not-data-active:hover:text-foreground not-data-active:hover:border-foreground/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt motion-reduce:transition-none data-active:-translate-y-0.5 data-active:border-transparent data-active:bg-card-paper data-active:text-card-ink data-active:shadow-card"
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        // If a tab ever needs more room than the field (a narrow window), it scrolls inside the field instead of spilling
        // over the navigation below; the small padding keeps lifted cards and focus rings from being clipped
        <Tabs.Panel
          key={tab.value}
          value={tab.value}
          className="-mx-2 -mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 pt-2 pb-2 outline-none motion-safe:animate-rise-in"
        >
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
