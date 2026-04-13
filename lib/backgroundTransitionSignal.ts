type Handler = (prevPathname: string, nextPathname: string) => void

let _handler: Handler | null = null

export function registerBackgroundTransitionHandler(fn: Handler): void {
  _handler = fn
}

export function signalBackgroundTransition(prevPathname: string, nextPathname: string): void {
  _handler?.(prevPathname, nextPathname)
}
