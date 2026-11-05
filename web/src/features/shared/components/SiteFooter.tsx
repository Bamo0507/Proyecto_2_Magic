import { FanContentNotice } from "@/features/shared/components/FanContentNotice"
import { texts } from "@/i18n/texts"

export function SiteFooter() {
  return (
    <footer className="mat-padding shrink-0 pt-6 pb-[calc(var(--mat-inset)+1rem)] md:pt-3 short:pb-[calc(var(--mat-inset)+0.5rem)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 font-sans text-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="text-lg leading-snug font-medium tracking-[0.12em] [font-variant-caps:all-small-caps]">{texts.footer.team}</p>
        <FanContentNotice />
      </div>
    </footer>
  )
}
