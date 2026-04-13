'use client'

import { usePathname } from 'next/navigation'
import { useTransitionRouter } from 'next-view-transitions'
import { useEffect, useRef, useState } from 'react'
import { client } from '@/lib/sanity'
import { signalBackgroundTransition } from '@/lib/backgroundTransitionSignal'
import { registerSlideIndexHandler } from '@/lib/slideIndexSignal'
import { registerSlideTotalHandler } from '@/lib/slideTotalSignal'
import Copy from '@/components/Copy'
import PosterLogo from '@/components/PosterLogo'

interface CaseSummary {
  title: string
  slug: { current: string }
}

function triggerPolygonTransition() {
  document.documentElement.animate(
    [
      { filter: 'brightness(1)', transform: 'translateY(0%)' },
      { filter: 'brightness(0)', transform: 'translateY(30%)' },
    ],
    { duration: 950, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards', pseudoElement: '::view-transition-old(root)' },
  )
  document.documentElement.animate(
    [
      { opacity: 1, clipPath: 'polygon(100% 0%, 100% 0, 0 0, 0 0%)', transform: 'translateY(0%)' },
      { opacity: 1, clipPath: 'polygon(100% 100%, 100% 0, 0 0, 0 100%)', transform: 'translateY(0%)' },
    ],
    { duration: 950, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
  )
}

function MobSlideCounter() {
  const [current, setCurrent] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const unsubIndex = registerSlideIndexHandler((index) => setCurrent(index + 1))
    const unsubTotal = registerSlideTotalHandler((t) => {
      setTotal(t)
      setCurrent(1)
    })
    return () => { unsubIndex(); unsubTotal() }
  }, [])

  if (!total) return null

  return (
    <p className="label mob-slide-counter">{current} / {total}</p>
  )
}

export default function MobLayout() {
  const pathname = usePathname()
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  const router = useTransitionRouter()
  const [cases, setCases] = useState<CaseSummary[]>([])

  useEffect(() => {
    client
      .fetch<CaseSummary[]>(`*[_type == "case"] | order(_createdAt asc){ title, slug }`)
      .then(setCases)
  }, [])

  const navigate = (href: string) => {
    const prev = pathnameRef.current
    router.push(href, {
      onTransitionReady: () => {
        signalBackgroundTransition(prev, href)
        triggerPolygonTransition()
      },
    })
  }

  if (pathname === '/') {
    return (
      <div className="mob-layout">
        <div className="mob-top">
          <div className="mob-top-item">
            <div className="mob-logo">
              <PosterLogo />
            </div>
            <Copy split={false} animateOnScroll={false} delay={0}>
              <p className="label">Igor Kolesnik</p>
            </Copy>
          </div>
          <div className="mob-top-item">
            <Copy animateOnScroll={false} delay={0.15}>
              <h1 className="mob-index-heading">Branding, digital design & development</h1>
            </Copy>
            <Copy animateOnScroll={false} delay={0.3}>
              <p className="mob-index-subtext">For small – medium businesses, startups, and fellow professionals striving for growth and new opportunities</p>
            </Copy>
          </div>
          <div className="mob-top-item">
            <Copy split={false} animateOnScroll={false} delay={0.45}>
              <p className="label">work</p>
            </Copy>
            <div className="mob-work-wrap">
              {cases.map((c, i) => (
                <div
                  key={c.slug.current}
                  className="mob-work-item"
                  onClick={() => navigate(`/work/${c.slug.current}`)}
                >
                  <Copy split={false} animateOnScroll={false} delay={0.5 + i * 0.085}>
                    <h3>{c.title},</h3>
                  </Copy>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mob-btm">
          <div className="mob-link-wrap">
            <Copy split={false} animateOnScroll={false} delay={0.55}>
              <h3 className="mob-link">IgorDsgn</h3>
            </Copy>
          </div>
          <div className="mob-link-wrap">
            <Copy split={false} animateOnScroll={false} delay={0.65}>
              <h3 className="mob-link">kolesnikig25@gmail.com</h3>
            </Copy>
          </div>
        </div>
      </div>
    )
  }

  if (pathname.startsWith('/work/')) {
    return (
      <div className="mob-case-overlay">
        <div className="mob-case-top">
          <button className="mob-case-btn mob-case-back label" onClick={() => navigate('/')}>
            ← back
          </button>
          <button className="mob-case-btn mob-case-contact label" onClick={() => navigate('/contact')}>
            contact
          </button>
        </div>
        <div className="mob-case-btm">
          <MobSlideCounter />
          <p className="mob-swipe-hint label">swipe</p>
        </div>
      </div>
    )
  }

  return null
}
