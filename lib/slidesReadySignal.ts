type Handler = () => void

let _handler: Handler | null = null

export function registerSlidesReadyHandler(fn: Handler): void {
  _handler = fn
}

export function signalSlidesReady(): void {
  _handler?.()
}
