import { ObjectiveCard } from "@/features/objectives/components/ObjectiveCard"
import { SectionPage } from "@/features/shared/components/SectionPage"
import { CARD_STYLES_BY_COLOR } from "@/features/shared/components/cardStyles"
import { texts } from "@/i18n/texts"

export function ObjectivesPage() {
  const content = texts.objectives

  return (
    <SectionPage sectionKey="objectives">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-3 short:gap-2">
        <div className={`rounded-xl border-l-4 border-mana-blue bg-card-paper px-4 py-3 text-card-ink shadow-card md:grid md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:items-center md:gap-4 short:px-3 short:py-2 ${CARD_STYLES_BY_COLOR.blue.suit}`}>
          <div>
            <h2 className="shrink-0 font-display text-xl leading-tight font-bold text-card-suit-ink">{content.generalLabel}</h2>
            <p className="font-sans text-base leading-snug font-medium">{content.general}</p>
          </div>
          <p className="mt-1.5 border-t border-card-suit-ink/20 pt-1.5 font-sans text-sm leading-snug md:mt-0 md:border-t-0 md:border-l md:py-1 md:pl-4 short:py-0">
            <span className="font-bold text-card-suit-ink">{content.metricLabel}: </span>
            {content.metric}
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-display text-xl leading-none font-bold text-foreground short:mb-1">{content.specificLabel}</h2>
          <ol className="grid gap-3 md:grid-cols-3 short:gap-2">
            {content.items.map((objective, index) => (
              <ObjectiveCard key={objective.title} objective={objective} position={index + 1} />
            ))}
          </ol>
        </div>
      </div>
    </SectionPage>
  )
}
