'use client'

import { useEffect, useRef, ReactNode, forwardRef } from 'react'

interface SmoothScrollProps {
  className?: string
  children: ReactNode
  ease?: number
}

const SmoothScroll = forwardRef<HTMLDivElement, SmoothScrollProps>(
  function SmoothScroll({ className, children, ease = 0.1 }, forwardedRef) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const targetY = useRef(0)
    const currentY = useRef(0)
    const rafId = useRef<number | null>(null)
    const isRunning = useRef(false)

    useEffect(() => {
      const el = containerRef.current
      if (!el) return

      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        targetY.current = Math.max(
          0,
          Math.min(targetY.current + e.deltaY, el.scrollHeight - el.clientHeight)
        )
        if (!isRunning.current) tick()
      }

      const tick = () => {
        const dist = targetY.current - currentY.current
        if (Math.abs(dist) < 0.2) {
          currentY.current = targetY.current
          el.scrollTop = currentY.current
          isRunning.current = false
          return
        }
        currentY.current += dist * ease
        el.scrollTop = currentY.current
        isRunning.current = true
        rafId.current = requestAnimationFrame(tick)
      }

      el.addEventListener('wheel', onWheel, { passive: false })

      return () => {
        el.removeEventListener('wheel', onWheel)
        if (rafId.current !== null) cancelAnimationFrame(rafId.current)
      }
    }, [ease])

    return (
      <div
        ref={(el) => {
          containerRef.current = el
          if (typeof forwardedRef === 'function') forwardedRef(el)
          else if (forwardedRef) Object.assign(forwardedRef, { current: el })
        }}
        className={className}
      >
        {children}
      </div>
    )
  }
)

export default SmoothScroll
