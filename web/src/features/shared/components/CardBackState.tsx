"use client"

import { RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardBack } from "@/features/shared/components/CardBack"
import { texts } from "@/i18n/texts"

interface CardBackStateProps {
  status: "loading" | "error"
  onRetry?: () => void
}

export function CardBackState({ status, onRetry }: CardBackStateProps) {
  if (status === "loading") {
    return (
      <div role="status" className="flex items-center gap-4">
        <CardBack className="w-14 motion-safe:animate-pulse" />
        <span className="font-sans text-base text-muted-foreground">{texts.states.loading}</span>
      </div>
    )
  }

  return (
    <div role="alert" className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <CardBack className="w-14" />
      <div className="flex flex-col items-start gap-2">
        <p className="font-display text-lg font-bold">{texts.states.errorTitle}</p>
        <p className="font-sans text-sm text-muted-foreground">{texts.states.errorText}</p>
        {onRetry && (
          <Button variant="outline" size="lg" onClick={onRetry}>
            <RotateCw data-icon="inline-start" />
            {texts.states.retry}
          </Button>
        )}
      </div>
    </div>
  )
}
