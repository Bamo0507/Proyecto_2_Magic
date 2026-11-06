import { cn } from "@/lib/utils"
import { PANEL_HEADING_CLASS_NAME, TAG_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate } from "@/features/shared/format"
import type { ModelData } from "@/features/model/types/modelData"
import { texts } from "@/i18n/texts"

interface AssumptionsPanelProps {
  model: ModelData
}

interface SourceItem {
  title: string
  text: string
  url: string
}

export function AssumptionsPanel({ model }: AssumptionsPanelProps) {
  const labels = texts.model.assumptions
  const sources: SourceItem[] = [
    {
      title: labels.sources.scryfall.title,
      text: fillTemplate(labels.sources.scryfall.textTemplate, { date: model.pricesDate }),
      url: model.sources.scryfall,
    },
    { title: labels.sources.composition.title, text: labels.sources.composition.text, url: model.sources.composition },
    { title: labels.sources.wizards.title, text: labels.sources.wizards.text, url: model.sources.wizards },
    {
      title: labels.sources.tcgplayer.title,
      text: fillTemplate(labels.sources.tcgplayer.textTemplate, { date: model.sources.sealedPricesDate }),
      url: model.sources.tcgplayerPack,
    },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      <section aria-labelledby="sources-title" className="relative">
        <h3 id="sources-title" className="sr-only">
          {labels.sourcesTitle}
        </h3>
        <span className="absolute inset-x-0 top-2 border-t-2 border-dashed border-playmat-stitch" aria-hidden />
        <ul className="relative grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
          {sources.map((source) => (
            <li key={source.title} className="flex flex-col items-center">
              <span className="h-4 w-0.5 bg-playmat-stitch" aria-hidden />
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  TAG_CLASS_NAME,
                  "group/source w-full shadow-card transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                )}
              >
                <span className="font-display text-lg leading-tight font-bold underline-offset-4 group-hover/source:underline">
                  {source.title}
                </span>
                <span className="font-sans text-base leading-snug">{source.text}</span>
                <span className="sr-only">{labels.openLink}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="assumptions-title" className="flex flex-col gap-3">
        <h3 id="assumptions-title" className="font-sans text-base font-bold text-foreground/80">
          {labels.assumptionsTitle}
        </h3>
        <ol className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4">
          {labels.items.map((item) => (
            <li
              key={item.title}
              className="card-corners relative flex flex-col gap-2 bg-card-paper p-4 text-card-ink shadow-card ring-1 ring-card-ink/10 ring-inset transition-transform duration-200 ease-out hover:z-10 hover:-translate-y-2 motion-reduce:transition-none"
            >
              <span className="pointer-events-none absolute inset-1.5 rounded-[0.35rem] opacity-25 shadow-[inset_0_0_0_1px_var(--card-ink)]" aria-hidden />
              <span className="font-display text-lg leading-tight font-bold">{item.title}</span>
              <span className="font-sans text-base leading-snug">{item.text}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
