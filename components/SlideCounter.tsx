'use client'

import { useEffect, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { registerSlideIndexHandler } from '@/lib/slideIndexSignal'

interface SlideCounterProps {
  total: number
}

export default function SlideCounter({ total }: SlideCounterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLSpanElement>(null)

  // Entry animation (mirrors Copy split={false})
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const inner = currentRef.current?.closest('.tag') as HTMLElement | null
    if (!wrapper || !inner) return

    gsap.set(inner, { y: '110%' })

    const play = () => {
      gsap.to(inner, { y: '0%', duration: 1.1, delay: 0.75, ease: 'expo.out' })
    }

    if (document.fonts.status === 'loaded') {
      play()
    } else {
      document.fonts.ready.then(play)
    }
  }, [])

  // Subscribe to slide index changes
  useEffect(() => {
    return registerSlideIndexHandler((index: number) => {
      const el = currentRef.current
      if (!el) return

      gsap.to(el, {
        opacity: 0,
        y: '-40%',
        duration: 0.2,
        ease: 'power1.in',
        onComplete: () => {
          el.textContent = String(index + 1)
          gsap.fromTo(
            el,
            { opacity: 0, y: '40%' },
            { opacity: 1, y: '0%', duration: 0.3, ease: 'power1.out' }
          )
        },
      })
    })
  }, [])

  return (
    <div ref={wrapperRef} style={{ overflow: 'hidden' }}>
      <div className="tag">
        <p className="label">
          <span ref={currentRef} style={{ display: 'inline-block' }}>1</span>
          {' / '}
          <span className="label-progress">{total}</span>
        </p>
      </div>
    </div>
  )
}
