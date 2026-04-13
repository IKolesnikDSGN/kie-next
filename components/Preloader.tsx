'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { client } from '@/lib/sanity'
import { setCaseData } from '@/lib/caseCache'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetRef {
  asset?: { url?: string }
}

interface SlideRaw {
  _type: string
  _key: string
  image?: AssetRef
  media?: AssetRef
  background?: AssetRef
  content?: AssetRef
  items?: { _key: string; image?: AssetRef }[]
}

interface CaseRaw {
  slug: string
  slides?: SlideRaw[]
}

// ─── Query ────────────────────────────────────────────────────────────────────

const ALL_CASES_QUERY = `
  *[_type == "case"]{
    "slug": slug.current,
    slides[]{
      _type,
      _key,
      heading,
      body,
      image{ asset->{ url } },
      items[]{
        _key,
        image{ asset->{ url } },
        label,
        description,
        display
      },
      media{ asset->{ url } },
      background{ asset->{ url } },
      content{ asset->{ url } }
    }
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractImageUrls(cases: CaseRaw[]): string[] {
  const urls: string[] = []
  for (const c of cases) {
    for (const slide of c.slides ?? []) {
      if (slide.image?.asset?.url) urls.push(slide.image.asset.url)
      if (slide.media?.asset?.url) urls.push(slide.media.asset.url)
      if (slide.background?.asset?.url) urls.push(slide.background.asset.url)
      if (slide.content?.asset?.url) urls.push(slide.content.asset.url)
      for (const item of slide.items ?? []) {
        if (item.image?.asset?.url) urls.push(item.image.asset.url)
      }
    }
  }
  return [...new Set(urls)]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const line = lineRef.current
    if (!overlay || !line) return

    gsap.set(line, { height: '0%' })

    const animateTo = (percent: number, duration = 0.5) =>
      new Promise<void>((resolve) =>
        gsap.to(line, {
          height: `${percent}%`,
          duration,
          ease: 'power2.out',
          onComplete: resolve,
        })
      )

    const run = async () => {
      // Kick off immediate visible progress
      animateTo(8, 0.3)

      // Fetch all cases + slide data from Sanity
      let cases: CaseRaw[] = []
      try {
        const data = await client.fetch<CaseRaw[]>(ALL_CASES_QUERY)
        cases = data ?? []
        for (const c of cases) {
          setCaseData(c.slug, c.slides ?? [])
        }
      } catch {
        // Network or Sanity error — preloader still completes
      }

      await animateTo(35, 0.4)

      // Preload all images into browser cache
      const urls = extractImageUrls(cases)
      if (urls.length > 0) {
        let loaded = 0
        await Promise.all(
          urls.map(
            (url) =>
              new Promise<void>((resolve) => {
                const img = new window.Image()
                img.onload = img.onerror = () => {
                  loaded++
                  const pct = 35 + (loaded / urls.length) * 53
                  gsap.to(line, { height: `${pct}%`, duration: 0.25, ease: 'power1.out' })
                  resolve()
                }
                img.src = url
              })
          )
        )
      }

      await animateTo(90, 0.3)

      // Wait for fonts
      await document.fonts.ready

      await animateTo(100, 0.35)

      // Brief pause at 100%, then fade out the overlay
      await new Promise<void>((resolve) => setTimeout(resolve, 150))

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          overlay.style.display = 'none'
        },
      })
    }

    run()
  }, [])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={lineRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 4,
          backgroundColor: '#fff',
        }}
      />
    </div>
  )
}
