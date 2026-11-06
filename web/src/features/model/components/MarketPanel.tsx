"use client"

import { useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { SELECTED_OBJECT_CLASS_NAME, UNSELECTED_OBJECT_CLASS_NAME } from "@/features/shared/components/PaperOption"
import { fillTemplate, formatMoney, formatPrecisePercent } from "@/features/shared/format"
import type { MarketExample, ModelData, ProductInfo } from "@/features/model/types/modelData"
import { PANEL_HEADING_CLASS_NAME, TAG_CLASS_NAME } from "@/features/shared/components/cardStyles"
import { texts } from "@/i18n/texts"


interface MarketPanelProps {
  model: ModelData
}

interface ReceiptProps {
  title: string
  tilt: string
  children: ReactNode
  total: { label: string; amount: string }
  footer: string
}

function Receipt({ title, tilt, children, total, footer }: ReceiptProps) {
  return (
    <div className={cn("drop-shadow-xl", tilt)}>
      <section className="torn-edges flex w-56 flex-col gap-1.5 bg-card-paper px-5 py-6 font-sans text-base text-card-ink">
        <h3 className="text-center text-sm font-bold tracking-[0.14em] uppercase">{title}</h3>
        <span className="my-1 border-t-2 border-dashed border-card-ink/30" aria-hidden />
        {children}
        <p className="mt-1 flex items-baseline justify-between gap-3 border-t-2 border-double border-card-ink/50 pt-2 font-display text-2xl font-extrabold">
          <span className="text-lg">{total.label}</span>
          <span className="nums">{total.amount}</span>
        </p>
        <p className="mt-1 text-center text-sm text-card-ink/70">{footer}</p>
      </section>
    </div>
  )
}

function ReceiptLine({ label, amount }: { label: string; amount: string }) {
  return (
    <p className="flex items-baseline justify-between gap-3">
      <span>{label}</span>
      <span className="nums font-bold">{amount}</span>
    </p>
  )
}

// The sealed prices are reference data, not part of the scene, so they are plain linked text on the felt
function ProductPrice({ label, product }: { label: string; product: ProductInfo }) {
  const labels = texts.model.market
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-11 flex-col justify-center rounded-md underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-baseline gap-2 font-sans text-lg">
        {label}
        <span className="nums font-display text-2xl font-extrabold">{formatMoney(product.price)}</span>
      </span>
      <span className="nums font-sans text-base text-foreground/80">
        {product.packs > 1
          ? `${fillTemplate(labels.packsTemplate, { packs: product.packs })} · ${fillTemplate(labels.perPackTemplate, { price: formatMoney(product.pricePerPack) })}`
          : labels.packsOne}
      </span>
      <span className="sr-only">{labels.productLink}</span>
    </a>
  )
}

export function MarketPanel({ model }: MarketPanelProps) {
  const labels = texts.model.market
  const { market } = model
  const [exampleIndex, setExampleIndex] = useState(0)
  const example: MarketExample = market.examples[exampleIndex]
  // Computed from the cents shown on the receipts, so the chip always equals what you pay minus what you receive
  const lost = (Math.round(example.buyPrice * 100) - Math.round(example.saleNet * 100)) / 100

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-7">
      <h2 className={PANEL_HEADING_CLASS_NAME}>{labels.heading}</h2>

      <div className="grid flex-1 items-start gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2 font-sans text-base font-bold text-foreground/80">{labels.examplesLabel}</legend>
            {market.examples.map((option, index) => {
              const isSelected = index === exampleIndex
              return (
                <button
                  key={option.marketPrice}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setExampleIndex(index)}
                  className={cn(
                    TAG_CLASS_NAME,
                    "cursor-pointer transition-[translate,box-shadow,color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none",
                    isSelected ? SELECTED_OBJECT_CLASS_NAME : UNSELECTED_OBJECT_CLASS_NAME
                  )}
                >
                  <span className="nums font-display text-xl font-extrabold">
                    {fillTemplate(labels.exampleTemplate, { price: formatMoney(option.marketPrice) })}
                  </span>
                </button>
              )
            })}
          </fieldset>

          <div className="flex flex-col gap-2.5">
            <p className="font-sans text-base font-bold text-foreground/80">{labels.productsLabel}</p>
            <ProductPrice label={labels.packLabel} product={model.products.pack} />
            <ProductPrice label={labels.boxLabel} product={model.products.box} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-6" aria-live="polite">
            <Receipt
              title={labels.buyTitle}
              tilt="rotate-0"
              total={{ label: labels.youPay, amount: formatMoney(example.buyPrice) }}
              footer={labels.receiptFooter}
            >
              <ReceiptLine label={labels.marketPrice} amount={formatMoney(example.marketPrice)} />
              <p className="text-base leading-snug text-card-ink/80">
                {fillTemplate(labels.minimumNoteTemplate, { minimum: formatMoney(market.minimumBuyPrice) })}
              </p>
            </Receipt>

            <div className="flex flex-col items-center gap-2 text-center">
              <span className="grid size-28 place-items-center rounded-full border-4 border-dashed border-mana-red-foreground/50 bg-mana-red text-mana-red-foreground shadow-chip">
                <span className="nums font-display text-3xl font-extrabold">{formatMoney(-lost)}</span>
              </span>
              <span className="w-32 font-sans text-base leading-tight font-bold">{labels.lossLabel}</span>
            </div>

            <Receipt
              title={labels.sellTitle}
              tilt="rotate-2"
              total={{ label: example.sells ? labels.youReceive : labels.notSold, amount: formatMoney(example.saleNet) }}
              footer={example.sells ? labels.receiptFooter : labels.notSoldNote}
            >
              <ReceiptLine label={labels.marketPrice} amount={formatMoney(example.marketPrice)} />
              <ReceiptLine
                label={fillTemplate(labels.commissionTemplate, { rate: formatPrecisePercent(market.commissionRate) })}
                amount={formatMoney(-example.commission)}
              />
              <ReceiptLine
                label={fillTemplate(labels.processingTemplate, { rate: formatPrecisePercent(market.processingRate) })}
                amount={formatMoney(-example.processing)}
              />
              <ReceiptLine label={labels.fixedFee} amount={formatMoney(-example.fixedFee)} />
            </Receipt>
          </div>

          <div className="flex flex-col gap-1 font-sans text-base leading-snug text-foreground/80">
            <p className="font-bold text-foreground">{labels.rulesTitle}</p>
            <p>
              {fillTemplate(labels.shippingTemplate, {
                cost: formatMoney(market.shippingCost),
                threshold: formatMoney(market.freeShippingFrom),
              })}{" "}
              {fillTemplate(labels.capTemplate, { cap: formatMoney(market.commissionCap) })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
