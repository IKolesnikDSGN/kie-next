'use client'

import { usePathname } from 'next/navigation'
import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import SlideShowcase from './SlideShowcase'
import WorkGallery from './WorkGallery'
import MobLayout from './MobLayout'
import { registerSlidesReadyHandler } from '@/lib/slidesReadySignal'
import { registerBackgroundTransitionHandler } from '@/lib/backgroundTransitionSignal'

function activeSection(pathname: string): 'showreel' | 'case' {
  return pathname.startsWith('/work/') ? 'case' : 'showreel'
}

export default function PageBackground({ showreelVideoUrl }: { showreelVideoUrl: string | null }) {
  const pathname = usePathname()
  const showreelRef = useRef<HTMLDivElement>(null)
  const caseSliderRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const currentSection = useRef<'showreel' | 'case'>(activeSection(pathname))
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  // Two-condition gate for caseSlider fade-in:
  // both bgTransitionReady AND slidesReady must fire before animating
  const bgTransitionReadyRef = useRef(false)
  const slidesReadyForFadeRef = useRef(false)

  const overlayVisible = pathname === '/' || pathname === '/about'

  // Initial state (no animation) + fade-in on pathname change
  useLayoutEffect(() => {
    const showreel = showreelRef.current
    const caseSlider = caseSliderRef.current
    if (!showreel || !caseSlider) return

    if (isFirstRender.current) {
      isFirstRender.current = false
      const active = activeSection(pathname)
      gsap.set(showreel, { display: active === 'showreel' ? 'block' : 'none', opacity: 1 })
      gsap.set(caseSlider, { display: active === 'case' ? 'block' : 'none', opacity: 1 })
      currentSection.current = active
      return
    }

    const next = activeSection(pathname)
    const prev = currentSection.current

    if (next !== prev) {
      // Section changed: prepare incoming element (opacity:0) — cross-fade handled by backgroundTransitionHandler
      const nextEl = next === 'showreel' ? showreel : caseSlider
      gsap.killTweensOf(nextEl)
      gsap.set(nextEl, { display: 'block', opacity: 0 })
      currentSection.current = next
      // Reset gate for the upcoming caseSlider fade-in
      bgTransitionReadyRef.current = false
      slidesReadyForFadeRef.current = false
    } else if (next === 'case') {
      // Case → case: hold opacity:0, reset gate
      gsap.killTweensOf(caseSlider)
      gsap.set(caseSlider, { opacity: 0 })
      bgTransitionReadyRef.current = false
      slidesReadyForFadeRef.current = false
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fade in background section when PageContent's onTransitionReady fires
  useLayoutEffect(() => {
    const showreel = showreelRef.current
    const caseSlider = caseSliderRef.current
    if (!showreel || !caseSlider) return

    function tryStartCaseFadeIn() {
      if (!caseSlider) return
      if (!bgTransitionReadyRef.current || !slidesReadyForFadeRef.current) return
      bgTransitionReadyRef.current = false
      slidesReadyForFadeRef.current = false
      gsap.to(caseSlider, { opacity: 1, duration: 0.9, ease: 'power1.out' })
    }

    registerBackgroundTransitionHandler((prevPathname, nextPathname) => {
      const prevSection = activeSection(prevPathname)
      const nextSection = activeSection(nextPathname)

      if (nextSection !== prevSection) {
        // Section changed — cross-fade showreel ↔ case
        const prevEl = prevSection === 'showreel' ? showreel : caseSlider
        const nextEl = nextSection === 'showreel' ? showreel : caseSlider
        gsap.killTweensOf([prevEl, nextEl])
        gsap.set(nextEl, { display: 'block', opacity: 0 })
        gsap.to(prevEl, { opacity: 0, duration: 0.5, onComplete: () => { gsap.set(prevEl, { display: 'none' }) } })

        if (nextSection === 'case') {
          // caseSlider fade-in is gated — slidesReady must also confirm
          bgTransitionReadyRef.current = true
          tryStartCaseFadeIn()
        } else {
          // showreel needs no gate
          gsap.to(nextEl, { opacity: 1, duration: 1.1 })
        }
      } else if (nextSection === 'case') {
        // case → case: caseSlider already at opacity:0, gated fade-in
        bgTransitionReadyRef.current = true
        tryStartCaseFadeIn()
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fade in case-slider when SlideShowcase has new data ready
  useLayoutEffect(() => {
    const caseSlider = caseSliderRef.current
    if (!caseSlider) return

    function tryStartCaseFadeIn() {
      if (!caseSlider) return
      if (!bgTransitionReadyRef.current || !slidesReadyForFadeRef.current) return
      bgTransitionReadyRef.current = false
      slidesReadyForFadeRef.current = false
      gsap.to(caseSlider, { opacity: 1, duration: 0.9, ease: 'power1.out' })
    }

    registerSlidesReadyHandler(() => {
      if (!pathnameRef.current.startsWith('/work/')) return
      slidesReadyForFadeRef.current = true
      tryStartCaseFadeIn()
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page-background">
      <div className="showreel-wrap" ref={showreelRef}>
        {showreelVideoUrl && (
          <video
            className="showreel-video"
            src={showreelVideoUrl}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <div className="showreel-overlay" data-visible={overlayVisible ? 'true' : undefined} />
      </div>
      <div className="workgallery-wrap" data-active={pathname === '/work' ? 'true' : undefined}>
        <WorkGallery />
      </div>
      <div className="case-slider" ref={caseSliderRef}>
        <SlideShowcase />
      </div>
      <MobLayout />
    </div>
  )
}
