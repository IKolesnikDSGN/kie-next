'use client'

import { usePageTransition } from './TransitionContext'

interface Props {
  prevHref?: string
  nextHref?: string
}

export default function CaseNavLinks({ prevHref, nextHref }: Props) {
  const { startTransition } = usePageTransition()

  return (
    <>
      {prevHref && (
        <div className="prev-case">
          <button className="link" onClick={() => startTransition(prevHref)}>
            previous case
          </button>
        </div>
      )}
      {nextHref && (
        <div className="next-case">
          <button className="link" onClick={() => startTransition(nextHref)}>
            next case
          </button>
        </div>
      )}
    </>
  )
}
