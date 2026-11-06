import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CardBack } from "@/features/shared/components/CardBack"
import { CardDeck } from "@/features/shared/components/CardDeck"
import { DiscardPile } from "@/features/shared/components/DiscardPile"
import { PlaymatBackground } from "@/features/shared/components/PlaymatBackground"
import { PlaymatStitch } from "@/features/shared/components/PlaymatStitch"
import { SectionCard } from "@/features/shared/components/SectionCard"
import { SectionHandNav } from "@/features/shared/components/SectionHandNav"
import { SectionNavigationEffects } from "@/features/shared/components/SectionNavigationEffects"
import { SiteFooter } from "@/features/shared/components/SiteFooter"
import { TopBar } from "@/features/shared/components/TopBar"
import { formatSectionPosition, getSection } from "@/features/shared/sections"
import { texts, type SectionKey } from "@/i18n/texts"

const PILE_TEXT_HIDDEN_ON_PHONES = "max-sm:pr-3 max-sm:[&>span:last-child]:sr-only"

interface SectionPageProps {
  sectionKey: SectionKey
  children?: ReactNode
  // Sections whose field holds a full stage give up the one-screen layout so the field can grow past the viewport
  tallField?: boolean
}

function UnderConstruction() {
  return (
    <div className="m-auto flex max-w-md flex-col items-center gap-4 py-6 text-center">
      <CardBack className="w-16" />
      <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">{texts.section.underConstructionTitle}</h2>
      <p className="font-sans text-base leading-relaxed text-pretty text-muted-foreground">{texts.section.underConstructionText}</p>
    </div>
  )
}

export function SectionPage({ sectionKey, children, tallField = false }: SectionPageProps) {
  const { section, position, previousSection, nextSection } = getSection(sectionKey)
  const content = texts.sections[sectionKey]

  return (
    <main
      className={cn(
        "relative isolate flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden",
        tallField ? "md:min-h-dvh" : "md:h-dvh md:min-h-[44rem]"
      )}
    >
      <PlaymatBackground />
      <PlaymatStitch />
      <TopBar />
      <SectionNavigationEffects sectionKey={sectionKey} previousHref={previousSection.href} nextHref={nextSection.href} />

      <div className="mat-padding mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 py-5 md:min-h-0 short:gap-3 short:py-3">
        <header className="flex shrink-0 items-center gap-5 md:gap-7">
          <div className="w-20 shrink-0 motion-safe:animate-card-land md:w-24 short:w-[4.5rem]" aria-hidden>
            <SectionCard section={section} position={position} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 motion-safe:animate-rise-in motion-safe:[animation-delay:80ms] short:gap-1">
            <p className="nums font-sans text-sm font-medium text-muted-foreground">
              {formatSectionPosition(position)} · {content.type}
            </p>
            <h1 className="font-display text-[clamp(2rem,min(4.5vw,7vh),3.5rem)] leading-none font-extrabold tracking-[-0.015em]">
              {content.title}
            </h1>
            <p className="max-w-[65ch] font-serif text-lg leading-snug text-pretty text-foreground/80">{content.text}</p>
          </div>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "hidden self-start px-3 md:inline-flex")}
          >
            <ArrowLeft data-icon="inline-start" />
            {texts.section.back}
          </Link>
        </header>

        <section
          aria-label={texts.section.fieldLabel}
          className={cn(
            "flex flex-1 flex-col rounded-[1.75rem] border-2 border-dashed border-playmat-stitch p-4 motion-safe:animate-rise-in motion-safe:[animation-delay:160ms] md:p-6",
            tallField ? "md:h-[clamp(38rem,72dvh,50rem)] md:flex-none" : "md:min-h-0"
          )}
        >
          {children ?? <UnderConstruction />}
        </section>

        <div className="grid shrink-0 grid-cols-2 items-end gap-3 motion-safe:animate-rise-in motion-safe:[animation-delay:240ms] md:grid-cols-[1fr_auto_1fr]">
          <DiscardPile section={previousSection} className={cn("justify-self-start", PILE_TEXT_HIDDEN_ON_PHONES)} />
          <SectionHandNav currentKey={sectionKey} className="col-span-2 row-start-1 md:col-span-1 md:row-start-auto" />
          <CardDeck
            href={nextSection.href}
            title={texts.section.nextCard}
            subtitle={texts.sections[nextSection.key].title}
            className={cn("justify-self-end", PILE_TEXT_HIDDEN_ON_PHONES)}
          />
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}
