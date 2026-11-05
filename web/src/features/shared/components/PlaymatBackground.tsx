export function PlaymatBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="playmat-felt absolute inset-0" />
      <div className="playmat-lamp absolute inset-0" />
      <div className="playmat-quilt absolute inset-0" />
      <div className="grain-texture absolute inset-0 opacity-[0.18] mix-blend-overlay" />
    </div>
  )
}
