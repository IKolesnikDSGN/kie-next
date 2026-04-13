export type WorkGalleryPayload = { slideUrls: string[] } | null

type Handler = (payload: WorkGalleryPayload) => void

let _handler: Handler | null = null

export function signalWorkGallery(payload: WorkGalleryPayload) {
  _handler?.(payload)
}

export function registerWorkGalleryHandler(fn: Handler) {
  _handler = fn
}
