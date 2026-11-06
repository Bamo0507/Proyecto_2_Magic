"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { CardBack } from "@/features/shared/components/CardBack"

interface MagicCardBackProps {
  imageUrl: string | null
  className?: string
}

// The official back as Scryfall publishes it, over our own typographic back so a card is never blank while the image
// loads or if it fails
export function MagicCardBack({ imageUrl, className }: MagicCardBackProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <span className={cn("card-corners relative block aspect-[488/680] overflow-hidden", className)} aria-hidden>
      <CardBack className="absolute inset-0 aspect-auto size-full" />
      {imageUrl && !failed && (
        <Image
          src={imageUrl}
          alt=""
          width={488}
          height={680}
          unoptimized
          loading="eager"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-300 ease-out motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </span>
  )
}
