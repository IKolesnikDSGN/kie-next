'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useLayoutEffect, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { useTransitionRouter } from 'next-view-transitions'
import Nav from './Nav'
import { TransitionContext } from './TransitionContext'
import { signalBackgroundTransition } from '@/lib/backgroundTransitionSignal'

gsap.registerPlugin(Flip)

function getLayoutClass(pathname: string): string {
  if (pathname === '/') return 'layout-index'
  if (pathname === '/work') return 'layout-work'
  if (pathname.startsWith('/work/')) return 'layout-case'
  if (pathname === '/about') return 'layout-about'
  return 'layout-index'
}

// Suppress default cross-fade for FLIP transitions — old snapshot hidden, new content visible
function suppressViewTransition() {
  document.documentElement.animate(
    [{ opacity: 0 }],
    { duration: 1.2, fill: 'forwards', pseudoElement: '::view-transition-old(root)' },
  )
  document.documentElement.animate(
    [{ opacity: 1 }],
    { duration: 1.2, fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
  )
}

// Animates via View Transition API pseudoelements — only called for /contact navigation
function triggerPolygonTransition() {
  document.documentElement.animate(
    [
      { filter: 'brightness(1)', transform: 'translateY(0%)' },
      { filter: 'brightness(0)', transform: 'translateY(30%)' },
    ],
    { duration: 1200, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards', pseudoElement: '::view-transition-old(root)' },
  )
  document.documentElement.animate(
    [
      { opacity: 1, clipPath: 'polygon(100% 0%, 100% 0, 0 0, 0 0%)', transform: 'translateY(0%)' },
      { opacity: 1, clipPath: 'polygon(100% 100%, 100% 0, 0 0, 0 100%)', transform: 'translateY(0%)' },
    ],
    { duration: 1200, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
  )
}

export default function PageContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()                    // fallback only (when refs unavailable)
  const transitionRouter = useTransitionRouter() // all client navigations (FLIP + polygon)
  const layoutClass = getLayoutClass(pathname)

  const mainContainerRef = useRef<HTMLDivElement>(null)
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const isFirstRender = useRef(true)
  const previousPathnameRef = useRef<string>('')
  const isPopStateRef = useRef(false)
  // Always-current pathname ref to avoid stale closures in useCallback
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  // Detect browser back/forward: save current pathname and fade out content
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true
      previousPathnameRef.current = pathnameRef.current
      const contentEl = contentContainerRef.current
      if (contentEl) {
        gsap.killTweensOf(contentEl)
        gsap.to(contentEl, { opacity: 0, duration: 0.25, ease: 'power1.in' })
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Polygon clip-path via View Transition API — used for /contact navigation (both to and from)
  const startContactTransition = useCallback(
    (href: string) => {
      previousPathnameRef.current = pathnameRef.current
      document.documentElement.dataset.pageTransition = '1'
      transitionRouter.push(href, {
        onTransitionReady: () => {
          signalBackgroundTransition(previousPathnameRef.current, href)
          triggerPolygonTransition()
          setTimeout(() => { delete document.documentElement.dataset.pageTransition }, 1400)
        },
      })
    },
    [transitionRouter],
  )

  // FLIP transition — used for all non-contact page changes
  // Uses transitionRouter so onTransitionReady fires after new DOM is ready
  const startTransition = useCallback(
    (href: string) => {
      const el = mainContainerRef.current
      const contentEl = contentContainerRef.current
      if (!el || !contentEl) {
        router.push(href)
        return
      }

      const isCaseToCase = pathnameRef.current.startsWith('/work/') && href.startsWith('/work/')

      const doTransition = () => {
        previousPathnameRef.current = pathnameRef.current
        document.documentElement.dataset.pageTransition = '1'

        gsap.killTweensOf(el)
        const flipState = Flip.getState(el)

        transitionRouter.push(href, {
          onTransitionReady: () => {
            suppressViewTransition()
            signalBackgroundTransition(previousPathnameRef.current, href)

            gsap.set(el, { clearProps: 'all' })
            Flip.from(flipState, {
              duration: 1.2,
              ease: 'expo.inOut',
              onComplete: () => { delete document.documentElement.dataset.pageTransition },
            })

            gsap.fromTo(contentEl, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.6, ease: 'power1.out' })
          },
        })
      }

      if (isCaseToCase) {
        const caseSlider = document.querySelector('.case-slider') as HTMLElement | null
        gsap.to(contentEl, { opacity: 0, duration: 0.2 })
        if (caseSlider) gsap.to(caseSlider, { opacity: 0, duration: 0.2 })
        setTimeout(doTransition, 200)
      } else {
        doTransition()
      }
    },
    [router, transitionRouter],
  )

  // Close handler — FLIP for most pages, polygon for /contact
  const handleClose = useCallback(() => {
    const target = previousPathnameRef.current || '/'
    if (pathnameRef.current === '/contact') {
      startContactTransition(target)
    } else {
      startTransition(target)
    }
  }, [startContactTransition, startTransition])

  // After pathname changes, handle nav/close-btn animations for /about transitions
  useLayoutEffect(() => {
    const navEl = mainContainerRef.current?.querySelector<HTMLElement>('.nav')
    const closeBtn = closeBtnRef.current

    if (isFirstRender.current) {
      isFirstRender.current = false
      // Direct navigation to /about — set initial state without animation
      if (pathname === '/about') {
        if (navEl) gsap.set(navEl, { opacity: 0, display: 'none' })
        if (closeBtn) gsap.set(closeBtn, { opacity: 1, pointerEvents: 'auto' })
      }
      return
    }

    const prevPath = previousPathnameRef.current

    if (pathname === '/about') {
      // Entering /about: fade nav out, then remove from flow; fade close btn in
      if (navEl) gsap.to(navEl, {
        opacity: 0, duration: 0.3, ease: 'power1.in',
        onComplete: () => { gsap.set(navEl, { display: 'none' }) },
      })
      if (closeBtn) {
        gsap.set(closeBtn, { pointerEvents: 'auto' })
        gsap.fromTo(closeBtn, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.7, ease: 'power1.out' })
      }
    } else if (prevPath === '/about') {
      // Leaving /about: restore nav to flow, fade it in; fade close btn out
      if (navEl) {
        gsap.set(navEl, { display: 'flex' })
        gsap.fromTo(navEl, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.6, ease: 'power1.out' })
      }
      if (closeBtn) {
        gsap.set(closeBtn, { pointerEvents: 'none' })
        gsap.to(closeBtn, { opacity: 0, duration: 0.2, ease: 'power1.in' })
      }
    } else if (prevPath === '/contact') {
      // Leaving /contact: stagger nav items in after polygon transition (~1200ms)
      if (navEl) {
        const navItems = navEl.querySelectorAll<HTMLElement>('.nav-logo, .nav-links .nav-link, .nav-btn')
        gsap.set(navItems, { opacity: 0, y: 10 })
        gsap.to(navItems, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'expo.out',
          stagger: 0.09,
          delay: 0.85,
        })
      }
    }

    // Back/forward navigation: signal background and crossfade content in
    if (isPopStateRef.current) {
      isPopStateRef.current = false
      signalBackgroundTransition(prevPath, pathname)
      const contentEl = contentContainerRef.current
      if (contentEl) {
        gsap.killTweensOf(contentEl)
        gsap.fromTo(contentEl, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.15, ease: 'power1.out' })
      }
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TransitionContext.Provider value={{ startTransition, startPolygonTransition: startContactTransition, handleClose }}>
      {pathname === '/contact' ? (
        <div className="page-content layout-contact">
          <Nav />
          {children}
        </div>
      ) : (
        <div className={`page-content ${layoutClass}`}>
          <div className="main-container" ref={mainContainerRef}>
            <Nav />
            <div className="content-container" ref={contentContainerRef}>
              {children}
            </div>
          </div>
          <button
            ref={closeBtnRef}
            className="about-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </TransitionContext.Provider>
  )
}
