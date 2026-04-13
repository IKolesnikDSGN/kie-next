type Handler = (index: number) => void

const _handlers: Set<Handler> = new Set()
let _lastIndex = 0

export function registerSlideIndexHandler(fn: Handler): () => void {
  _handlers.add(fn)
  fn(_lastIndex)
  return () => { _handlers.delete(fn) }
}

export function signalSlideIndex(index: number): void {
  _lastIndex = index
  _handlers.forEach((fn) => fn(index))
}

export function resetSlideIndexSignal(): void {
  _lastIndex = 0
}
