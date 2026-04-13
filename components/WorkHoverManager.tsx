'use client'

import { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import TransitionLink from './TransitionLink'
import Copy from './Copy'
import { signalWorkGallery } from '@/lib/workGallerySignal'

export interface WorkCaseData {
  title: string
  slug: { current: string }
  tags: string[]
  mediaSlideUrls: string[]
  firstSlideImageUrl?: string
}

// Imperatively build tag elements into a container
function setTagDOM(el: HTMLElement, tags: string[]) {
  while (el.firstChild) el.removeChild(el.firstChild)

  if (tags.length === 0) {
    const div = document.createElement('div')
    div.className = 'tag'
    const p = document.createElement('p')
    p.className = 'label'
    p.textContent = 'Hover'
    div.appendChild(p)
    el.appendChild(div)
    return
  }

  tags.forEach((tag, i) => {
    const div = document.createElement('div')
    div.className = i === 0 ? 'tag' : 'tag is-secondary'
    const p = document.createElement('p')
    p.className = 'label'
    p.textContent = tag
    div.appendChild(p)
    el.appendChild(div)
  })
}

interface Props {
  cases: WorkCaseData[]
}

export default function WorkHoverManager({ cases }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const currentSlug = useRef<string | null>(null)
  const casesMap = useRef(new Map(cases.map((c) => [c.slug.current, c])))

  // Init placeholder on mount (no React children in descRef's div)
  useEffect(() => {
    const wrapEl = wrapRef.current
    if (wrapEl) {
      wrapEl.style.pointerEvents = 'none'
      const t = setTimeout(() => { wrapEl.style.pointerEvents = '' }, 1000)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const descEl = descRef.current
    if (!descEl) return
    setTagDOM(descEl, [])
    gsap.fromTo(
      descEl.firstChild,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.8, ease: 'expo.out' }
    )
  }, [])

  const showTags = useCallback((tags: string[]) => {
    const descEl = descRef.current
    if (!descEl) return
    const existing = Array.from(descEl.children)

    const render = () => {
      setTagDOM(descEl, tags)
      gsap.fromTo(
        Array.from(descEl.children),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'expo.out' }
      )
    }

    if (existing.length > 0) {
      gsap.to(existing, { opacity: 0, y: -6, duration: 0.15, onComplete: render })
    } else {
      render()
    }
  }, [])

  const hideTags = useCallback(() => {
    const descEl = descRef.current
    if (!descEl) return
    const existing = Array.from(descEl.children)

    gsap.to(existing, {
      opacity: 0, y: -6, duration: 0.15,
      onComplete: () => {
        setTagDOM(descEl, [])
        gsap.fromTo(
          descEl.firstChild,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
        )
      },
    })
  }, [])

  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const item = (e.target as Element).closest('[data-work-slug]') as HTMLElement | null
    if (!item) return
    const slug = item.dataset.workSlug
    if (!slug || slug === currentSlug.current) return
    currentSlug.current = slug

    const c = casesMap.current.get(slug)
    if (!c) return

    // 1. Tags
    showTags(c.tags)

    // 2. Dim other worknameitem elements
    wrapRef.current?.querySelectorAll<HTMLElement>('[data-work-slug]').forEach((el) => {
      gsap.to(el, { opacity: el.dataset.workSlug === slug ? 1 : 0.3, duration: 0.2 })
    })

    // 3. Gallery signal
    signalWorkGallery({ slideUrls: c.mediaSlideUrls })
  }, [showTags])

  const handleMouseLeave = useCallback(() => {
    if (!currentSlug.current) return
    currentSlug.current = null

    hideTags()

    wrapRef.current?.querySelectorAll<HTMLElement>('[data-work-slug]').forEach((el) => {
      gsap.to(el, { opacity: 1, duration: 0.2 })
    })

    signalWorkGallery(null)
  }, [hideTags])

  return (
    <div className="work-wrap">
      {/* Tight wrapper — hover zone is exactly the items' bounding box */}
      <div
        ref={wrapRef}
        className="work-names-wrap"
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
      >
        {cases.map((c, i) => (
          <TransitionLink
            key={c.slug.current}
            href={`/work/${c.slug.current}`}
            className="worknameitem"
            data-work-slug={c.slug.current}
          >
            <Copy animateOnScroll={false} delay={0.65 + i * 0.05}>
              <h3 className="workname">
                {c.title}{i < cases.length - 1 ? ',' : ''}
              </h3>
            </Copy>
          </TransitionLink>
        ))}
      </div>
      <div className="work-divider" />
      {/* Managed imperatively — no React children */}
      <div className="work-description" ref={descRef} />
    </div>
  )
}
