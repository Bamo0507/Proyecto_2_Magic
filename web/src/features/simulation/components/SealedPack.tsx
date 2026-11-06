"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { texts } from "@/i18n/texts"

const CRIMP_CLASS_NAME =
  "absolute inset-x-0 h-[6%] bg-[repeating-linear-gradient(90deg,var(--card-paper)_0_2px,transparent_2px_7px)] opacity-15"
const PACK_IMAGE_SIZE = { width: 525, height: 1000 }
// The product photo sits on white; these insets drop the white margin around the wrapper (measured on the image) and
// split it at the tear line, so the strip and the body are two crops of the same picture
const STRIP_CLIP_CLASS_NAME = "[clip-path:inset(0.6%_2.1%_88%_2.1%)]"
const BODY_CLIP_CLASS_NAME = "[clip-path:inset(12%_2.1%_0.6%_2.1%)]"

interface SealedPackProps {
  imageUrl?: string | null
  className?: string
}

// Our own wrapper, drawn in the card-back typography. It is what shows while the official photo loads, and what stays
// if the photo never arrives
function DrawnPack({ hidden }: { hidden: boolean }) {
  const labels = texts.simulation.sealedPack

  return (
    <div className={cn("absolute inset-x-[6%] inset-y-0 text-card-paper", hidden && "invisible")} aria-hidden>
      <div
        data-pack-body
        className="absolute inset-x-0 top-[13%] bottom-0 overflow-hidden rounded-b-[6cqi] bg-card-ink shadow-card-lifted"
      >
        <span className="absolute inset-0 bg-linear-to-br from-card-paper/14 via-transparent to-card-paper/6" />
        <span className={cn(CRIMP_CLASS_NAME, "bottom-0")} />
        <span className="absolute inset-[7cqi] top-[9cqi] rounded-[3cqi] shadow-[inset_0_0_0_max(1px,0.8cqi)_var(--card-paper)] opacity-40" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-[3cqi]">
          <span className="font-sans text-[7cqi] font-bold tracking-[0.18em] [font-variant-caps:all-small-caps]">
            {labels.label}
          </span>
          <span className="font-display text-[30cqi] leading-none font-extrabold tracking-[-0.03em]">MH3</span>
          <span className="h-[max(1px,0.8cqi)] w-[40cqi] bg-card-paper/70" />
          <span className="font-sans text-[7cqi] font-bold tracking-[0.18em] [font-variant-caps:all-small-caps]">
            {labels.cards}
          </span>
        </span>
      </div>
      <div
        data-pack-strip
        className="absolute inset-x-0 top-0 h-[14%] origin-bottom-left overflow-hidden rounded-t-[6cqi] border-b-2 border-dashed border-card-paper/40 bg-card-ink shadow-card"
      >
        <span className={cn(CRIMP_CLASS_NAME, "top-0")} />
        <span className="absolute inset-0 bg-linear-to-br from-card-paper/14 via-transparent to-transparent" />
      </div>
    </div>
  )
}

export function SealedPack({ imageUrl, className }: SealedPackProps) {
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const labels = texts.simulation.sealedPack
  const usePhoto = Boolean(imageUrl) && !photoFailed
  const showPhoto = usePhoto && photoLoaded

  return (
    <div
      role="img"
      aria-label={showPhoto ? labels.officialAlt : labels.hint}
      className={cn("@container relative aspect-[525/1000] drop-shadow-2xl", className)}
    >
      <DrawnPack hidden={showPhoto} />
      {usePhoto && imageUrl && (
        <div className={cn("absolute inset-0", !showPhoto && "invisible")} aria-hidden>
          <div data-pack-body className={cn("absolute inset-0", BODY_CLIP_CLASS_NAME)}>
            <Image
              src={imageUrl}
              alt=""
              width={PACK_IMAGE_SIZE.width}
              height={PACK_IMAGE_SIZE.height}
              unoptimized
              loading="eager"
              draggable={false}
              onLoad={() => setPhotoLoaded(true)}
              onError={() => setPhotoFailed(true)}
              className="size-full"
            />
          </div>
          <div data-pack-strip className={cn("absolute inset-0 origin-[2%_12%]", STRIP_CLIP_CLASS_NAME)}>
            <Image
              src={imageUrl}
              alt=""
              width={PACK_IMAGE_SIZE.width}
              height={PACK_IMAGE_SIZE.height}
              unoptimized
              loading="eager"
              draggable={false}
              className="size-full"
            />
          </div>
          <span className="absolute inset-x-[2.1%] top-[12%] border-t-2 border-dashed border-card-ink/35" />
        </div>
      )}
    </div>
  )
}
