export const LAST_SECTION_KEY = "mh3-last-section"

export function readSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {}
}
