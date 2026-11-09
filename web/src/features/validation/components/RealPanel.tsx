import { cn } from "@/lib/utils"
import { PANEL_HEADING_CLASS_NAME, TAG_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { fillTemplate, formatMoney } from "@/features/shared/format"
import type { RealReference, ValidationData } from "@/features/validation/types/validationData"
import { texts } from "@/i18n/texts"

// The plot starts after a column for the row names
const CHART = { width: 730, height: 300, left: 250, right: 30, top: 20, bottom: 42, rowHeight: 82 }
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
  const yOf = (index: number) => CHART.top + 55 + index * CHART.rowHeight
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

      <div className="grid flex-1 content-center items-center gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        {/* On paper like the other charts, so thin marks keep their contrast; each row's name sits in its own column */}
        <figure className="flex flex-col gap-3 rounded-lg bg-card-paper p-4 text-card-ink shadow-card">
          <figcaption className="font-display text-xl font-bold">{labels.chartTitle}</figcaption>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-sans text-base">
            <span className="flex items-center gap-2"><span className="size-3.5 rotate-45 bg-mana-gold ring-2 ring-card-ink" aria-hidden />{labels.referenceLegend}</span>
            <span className="flex items-center gap-2"><span className="h-5 w-2 rounded-sm bg-card-ink" aria-hidden />{labels.meanLegend}</span>
            <span className="flex items-center gap-2"><span className="h-3 w-6 rounded-full bg-card-ink/25 ring-1 ring-card-ink/60" aria-hidden />{labels.ciLegend}</span>
          </div>
          <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="h-auto w-full" role="img" aria-label={labels.chartTitle}>
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={xOf(tick)} x2={xOf(tick)} y1={CHART.top} y2={CHART.height - CHART.bottom} strokeDasharray="3 5" className="stroke-card-ink/25" />
                <text x={xOf(tick)} y={CHART.height - CHART.bottom + 24} textAnchor="middle" className="nums fill-card-ink font-sans text-[18px]">
                  {formatMoney(tick).replace(".00", "")}
                </text>
              </g>
            ))}
            <line
              x1={xOf(reference.priceUsd)}
              x2={xOf(reference.priceUsd)}
              y1={CHART.top}
              y2={CHART.height - CHART.bottom}
              strokeWidth={2.5}
              strokeDasharray="8 6"
              className="stroke-mana-gold"
            />
            {rows.map((row, index) => {
              const y = yOf(index)
              const isReference = row.key === "referencia_real"
              return (
                <g key={row.key}>
                  <text x={0} y={y + 6} className="fill-card-ink font-sans text-[20px] font-bold">
                    {texts.validation.names[row.key]}
                  </text>
                  {row.ci95 && (
                    <rect
                      x={xOf(row.ci95[0])}
                      y={y - 10}
                      width={xOf(row.ci95[1]) - xOf(row.ci95[0])}
                      height={20}
                      rx={10}
                      strokeWidth={1.5}
                      className="fill-card-ink/20 stroke-card-ink/60"
                    />
                  )}
                  {isReference ? (
                    <rect x={xOf(row.cost) - 10} y={y - 10} width={20} height={20} transform={`rotate(45 ${xOf(row.cost)} ${y})`} strokeWidth={2.5} className="fill-mana-gold stroke-card-ink" />
                  ) : (
                    <rect x={xOf(row.cost) - 5} y={y - 18} width={10} height={36} rx={3} className="fill-card-ink" />
                  )}
                  <text x={xOf(row.cost)} y={y - 26} textAnchor="middle" className="nums fill-card-ink font-sans text-[20px] font-bold">
                    {formatMoney(row.cost)}
                  </text>
                </g>
              )
            })}
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

        <div className="flex flex-col gap-4">
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
        </div>
      </div>
    </div>
  )
}
