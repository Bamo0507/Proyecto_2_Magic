import { cn } from "@/lib/utils"
import { PANEL_HEADING_CLASS_NAME, TAG_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatMoney } from "@/features/shared/format"
import type { RealReference, ValidationData } from "@/features/validation/types/validationData"
import { texts } from "@/i18n/texts"

const CHART = { width: 640, height: 300, left: 24, right: 24, top: 20, bottom: 44, rowHeight: 76 }
const EURO_FORMAT = new Intl.NumberFormat("es-GT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

interface RealPanelProps {
  validation: ValidationData
  reference: RealReference
}

export function RealPanel({ validation, reference }: RealPanelProps) {
  const labels = texts.validation.real
  const rows = validation.realComparison
  const base = rows.find((row) => row.key === "modelo_base")
  if (!base?.ci95) return null

  const values = rows.flatMap((row) => [row.cost, ...(row.ci95 ?? [])])
  const lowest = Math.floor(Math.min(...values) / 100) * 100
  const highest = Math.ceil(Math.max(...values) / 100) * 100
  const xOf = (amount: number) => CHART.left + ((amount - lowest) / (highest - lowest)) * (CHART.width - CHART.left - CHART.right)
  const yOf = (index: number) => CHART.top + 40 + index * CHART.rowHeight
  const ticks = Array.from({ length: (highest - lowest) / 100 + 1 }, (_, index) => lowest + index * 100)
  const inside = reference.priceUsd >= base.ci95[0] && reference.priceUsd <= base.ci95[1]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className={PANEL_HEADING_CLASS_NAME}>
        {fillTemplate(labels.headingTemplate, {
          reference: formatMoney(reference.priceUsd),
          base: formatMoney(base.cost),
        })}
      </h2>

      <div className="grid flex-1 items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <figure className="flex flex-col gap-2">
          <figcaption className="font-sans text-base font-bold text-foreground/80">{labels.chartTitle}</figcaption>
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-sans text-sm text-foreground/85">
            <span className="flex items-center gap-1.5"><span className="size-3 rotate-45 bg-mana-gold" aria-hidden />{labels.referenceLegend}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-primary" aria-hidden />{labels.meanLegend}</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-foreground" aria-hidden />{labels.ciLegend}</span>
          </div>
          <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="h-auto w-full" role="img" aria-label={labels.chartTitle}>
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={xOf(tick)} x2={xOf(tick)} y1={CHART.top} y2={CHART.height - CHART.bottom} strokeDasharray="3 5" className="stroke-foreground/20" />
                <text x={xOf(tick)} y={CHART.height - CHART.bottom + 22} textAnchor="middle" className="nums fill-foreground/80 font-sans text-[15px]">
                  {tick}
                </text>
              </g>
            ))}
            <line
              x1={xOf(reference.priceUsd)}
              x2={xOf(reference.priceUsd)}
              y1={CHART.top}
              y2={CHART.height - CHART.bottom}
              strokeWidth={2}
              strokeDasharray="7 6"
              className="stroke-mana-gold"
            />
            {rows.map((row, index) => {
              const y = yOf(index)
              const isReference = row.key === "referencia_real"
              return (
                <g key={row.key}>
                  <text x={CHART.left} y={y - 22} className="fill-foreground font-sans text-[16px] font-bold">
                    {texts.validation.names[row.key]}
                  </text>
                  {row.ci95 && (
                    <>
                      <rect
                        x={xOf(row.ci95[0])}
                        y={y - 7}
                        width={xOf(row.ci95[1]) - xOf(row.ci95[0])}
                        height={14}
                        rx={7}
                        className="fill-foreground/15"
                      />
                      <line x1={xOf(row.ci95[0])} x2={xOf(row.ci95[1])} y1={y} y2={y} strokeWidth={2} className="stroke-foreground" />
                    </>
                  )}
                  {isReference ? (
                    <rect x={xOf(row.cost) - 8} y={y - 8} width={16} height={16} transform={`rotate(45 ${xOf(row.cost)} ${y})`} strokeWidth={2} className="fill-mana-gold stroke-felt" />
                  ) : (
                    <rect x={xOf(row.cost) - 4} y={y - 14} width={8} height={28} rx={3} strokeWidth={2} className="fill-primary stroke-felt" />
                  )}
                  <text
                    x={xOf(row.cost)}
                    y={y + 32}
                    textAnchor="middle"
                    className="nums fill-foreground font-sans text-[16px] font-bold"
                  >
                    {formatMoney(row.cost)}
                  </text>
                </g>
              )
            })}
            <text x={(CHART.left + CHART.width - CHART.right) / 2} y={CHART.height - 4} textAnchor="middle" className="fill-foreground/80 font-sans text-[15px]">
              {labels.axis}
            </text>
          </svg>
          <div className="sr-only">
            <table>
              <caption>{labels.chartTitle}</caption>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{texts.validation.names[row.key]}</th>
                    <td>{formatMoney(row.cost)}</td>
                    <td>{row.ci95 ? `${formatMoney(row.ci95[0])}–${formatMoney(row.ci95[1])}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>

        <div className="flex flex-col gap-4 lg:pt-7">
          <p className="font-serif text-xl leading-snug text-pretty">
            {fillTemplate(inside ? labels.insideTemplate : labels.outsideTemplate, {
              low: formatMoney(base.ci95[0]),
              high: formatMoney(base.ci95[1]),
            })}
          </p>

          <a
            href={reference.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              TAG_CLASS_NAME,
              "nums font-sans text-base leading-snug shadow-card transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
            )}
          >
            {fillTemplate(labels.sourceTemplate, {
              source: reference.source,
              original: EURO_FORMAT.format(reference.priceOriginal),
              rate: reference.exchangeRate,
              usd: formatMoney(reference.priceUsd),
              date: reference.date,
            })}
            <span className="sr-only">{labels.openLink}</span>
          </a>

          <section aria-labelledby="limits-title" className="border-y border-foreground/25 py-3">
            <h3 id="limits-title" className="font-sans text-sm font-bold tracking-[0.12em] text-foreground/70 [font-variant-caps:all-small-caps]">
              {labels.limitsTitle}
            </h3>
            <ul className="mt-1 flex flex-col gap-0.5 font-sans text-base text-foreground/85">
              {labels.limits.map((limit) => (
                <li key={limit}>· {limit}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
