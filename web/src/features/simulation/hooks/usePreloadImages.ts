"use client"

import { useEffect } from "react"

const requestedUrls = new Set<string>()

// Asks the browser for the images of the next scene while the current one is on screen, so they come from the cache
// when the scene starts. Requests are never cancelled, because the scene that needs them is the one about to open.
// Nothing waits on them: a card whose image is not there yet keeps showing its printed fallback
export function usePreloadImages(urls: string[]) {
  const key = urls.join("|")

  useEffect(() => {
    if (!key) return
    for (const url of key.split("|")) {
      if (requestedUrls.has(url)) continue
      requestedUrls.add(url)
      const image = new Image()
      image.decoding = "async"
      image.src = url
    }
  }, [key])
}
