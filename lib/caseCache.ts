// Module-level cache for case slide data.
// Populated by Preloader on app init — SlideShowcase reads from here before fetching.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, any[]>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCaseData(slug: string, slides: any[]) {
  cache.set(slug, slides)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCaseData(slug: string): any[] | undefined {
  return cache.get(slug)
}
