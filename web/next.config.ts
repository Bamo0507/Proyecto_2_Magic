import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cards.scryfall.io", pathname: "/**" },
      { protocol: "https", hostname: "backs.scryfall.io", pathname: "/**" },
      { protocol: "https", hostname: "tcgplayer-cdn.tcgplayer.com", pathname: "/product/**" },
    ],
  },
}

export default nextConfig
