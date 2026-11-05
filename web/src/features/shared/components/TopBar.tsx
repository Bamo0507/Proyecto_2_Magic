import Link from "next/link"

import { texts } from "@/i18n/texts"

export function TopBar() {
  return (
    <header className="mat-padding shrink-0 pt-[calc(var(--mat-inset)+0.75rem)] short:pt-[calc(var(--mat-inset)+0.25rem)]">
      <nav aria-label={texts.nav.label} className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-md font-sans text-lg font-bold tracking-[0.12em] text-foreground/70 outline-none transition-colors [font-variant-caps:all-small-caps] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt"
        >
          {texts.nav.brand}
        </Link>
        <span className="nums font-sans text-lg font-medium tracking-[0.12em] text-foreground/70 [font-variant-caps:all-small-caps]">
          {texts.nav.course}
        </span>
      </nav>
    </header>
  )
}
