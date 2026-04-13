'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerWorkGalleryHandler, type WorkGalleryPayload } from '@/lib/workGallerySignal'

const SLOT_COUNT = 2
// Bottom exclusion zone in px — 17rem @ 16px/rem
const BOTTOM_MARGIN_REM = 17
const REM_TO_PX = () => parseFloat(getComputedStyle(document.documentElement).fontSize)

function randomPositions(vpW: number, vpH: number) {
  const bottomMarginPx = BOTTOM_MARGIN_REM * REM_TO_PX()
  const maxBottom = vpH - bottomMarginPx

  // Split viewport into two halves horizontally (left / right)
  // Each slot gets its own half so they never overlap.
  return [0, 1].map((half) => {
    const widthPx = ((20 + Math.random() * 20) / 100) * vpW
    const heightPx = widthPx * (9 / 16)

    const zoneW = vpW / 2
    // Keep the image within its half
    const left = half * zoneW + Math.random() * Math.max(0, zoneW - widthPx)
    const maxTop = Math.max(0, maxBottom - heightPx)
    const top = Math.random() * maxTop

    return { widthPx, heightPx, left, top }
  })
}

export default function WorkGallery() {
  const bgRef = useRef<HTMLDivElement>(null)
  const slotsRef = useRef<(HTMLDivElement | null)[]>([null, null])
  const isVisible = useRef(false)

  useEffect(() => {
    const bg = bgRef.current
    const slots = slotsRef.current

    registerWorkGalleryHandler((payload: WorkGalleryPayload) => {
      if (bg) gsap.killTweensOf(bg)
      slots.forEach((s) => { if (s) gsap.killTweensOf(s) })

      // ── Hide ────────────────────────────────────────────────────────
      if (!payload) {
        isVisible.current = false
        if (bg) gsap.to(bg, { opacity: 0, duration: 0.3 })
        slots.forEach((s) => { if (s) gsap.to(s, { opacity: 0, duration: 0.3 }) })
        return
      }

      // ── Show ─────────────────────────────────────────────────────────
      const { slideUrls } = payload
      const vpW = window.innerWidth
      const vpH = window.innerHeight
      const positions = randomPositions(vpW, vpH)

      const animateIn = () => {
        if (bg) gsap.to(bg, { opacity: 1, duration: 0.4 })

        slideUrls.slice(0, SLOT_COUNT).forEach((url, i) => {
          const slot = slots[i]
          if (!slot) return

          const img = slot.querySelector('img') as HTMLImageElement
          if (img) img.src = `${url}?w=900&auto=format&q=80`

          const { widthPx, heightPx, left, top } = positions[i]

          gsap.set(slot, {
            width: widthPx,
            height: heightPx,
            left,
            top,
            clipPath: 'inset(100% 100% 100% 100%)',
            opacity: 1,
          })

          gsap.to(slot, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            delay: i * 0.1,
            ease: 'expo.out',
          })
        })

        // Hide any slots without a url (if fewer than SLOT_COUNT provided)
        for (let i = slideUrls.length; i < SLOT_COUNT; i++) {
          const slot = slots[i]
          if (slot) gsap.set(slot, { opacity: 0 })
        }

        isVisible.current = true
      }

      if (isVisible.current) {
        const visible = slots.filter(Boolean) as HTMLDivElement[]
        gsap.to(visible, { opacity: 0, duration: 0.3, onComplete: animateIn })
      } else {
        animateIn()
      }
    })
  }, [])

  return (
    <>
      {/* Background overlay */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--_theme---background-2)',
          backdropFilter: 'blur(4px)',
          opacity: 0,
        }}
      />

      {/* 2 image slots */}
      {([0, 1] as const).map((i) => (
        <div
          key={i}
          ref={(el) => { slotsRef.current[i] = el }}
          style={{ position: 'absolute', opacity: 0, overflow: 'hidden' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ))}
    </>
  )
}
