import { ObjectiveCard } from "@/features/objectives/components/ObjectiveCard"
import { SectionPage } from "@/features/shared/components/SectionPage"
import { SectionTabs } from "@/features/shared/components/SectionTabs"
import { CARD_STYLES_BY_COLOR } from "@/features/shared/components/cardStyles"
import { texts } from "@/i18n/texts"

export function ObjectivesPage() {
  const content = texts.objectives

  return (
    <SectionPage sectionKey="objectives">
      <SectionTabs label={content.tabsLabel} tabs={[
        {
          value: "general",
          label: content.generalLabel,
          content: (
            <div className={`m-auto w-full max-w-4xl rounded-xl border-l-4 border-mana-blue bg-card-paper p-5 text-card-ink shadow-card md:p-7 ${CARD_STYLES_BY_COLOR.blue.suit}`}>
              <h2 className="font-display text-2xl leading-tight font-bold text-card-suit-ink">{content.generalLabel}</h2>
              <p className="mt-2 font-sans text-lg leading-snug font-medium">{content.general}</p>
              <p className="mt-4 border-t border-card-suit-ink/20 pt-3 font-sans text-base leading-snug">
                <span className="font-bold text-card-suit-ink">{content.metricLabel}: </span>
                {content.metric}
              </p>
            </div>
          ),
        },
        {
          value: "specific",
          label: content.specificLabel,
          content: (
            <div className="m-auto w-full">
              <h2 className="sr-only">{content.specificLabel}</h2>
              <ol className="grid gap-3 md:grid-cols-3">
                {content.items.map((objective, index) => (
                  <ObjectiveCard key={objective} objective={objective} position={index + 1} />
                ))}
              </ol>
            </div>
          ),
        },
      ]} />
    </SectionPage>
  )
}
