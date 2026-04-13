'use client'

import { createContext, useContext } from 'react'

interface TransitionContextValue {
  startTransition: (href: string) => void
  startPolygonTransition: (href: string) => void
  handleClose: () => void
}

export const TransitionContext = createContext<TransitionContextValue>({
  startTransition: () => {},
  startPolygonTransition: () => {},
  handleClose: () => {},
})

export function usePageTransition() {
  return useContext(TransitionContext)
}
