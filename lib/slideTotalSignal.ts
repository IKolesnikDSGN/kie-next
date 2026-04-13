type Handler = (total: number) => void

const _handlers: Set<Handler> = new Set()
let _lastTotal = 0

export function registerSlideTotalHandler(fn: Handler): () => void {
  _handlers.add(fn)
  if (_lastTotal > 0) fn(_lastTotal)
  return () => { _handlers.delete(fn) }
}

export function signalSlideTotal(total: number): void {
  _lastTotal = total
  _handlers.forEach((fn) => fn(total))
}

export function resetSlideTotalSignal(): void {
  _lastTotal = 0
}
