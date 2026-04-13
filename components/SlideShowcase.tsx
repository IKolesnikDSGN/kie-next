'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { client } from '@/lib/sanity'
import { getCaseData } from '@/lib/caseCache'
import { signalSlidesReady } from '@/lib/slidesReadySignal'
import { signalSlideIndex, resetSlideIndexSignal } from '@/lib/slideIndexSignal'
import { signalSlideTotal, resetSlideTotalSignal } from '@/lib/slideTotalSignal'
import Copy from '@/components/Copy'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SanityImageAsset {
  url: string
}

interface SanityImage {
  asset: SanityImageAsset
}

interface InfoSlide {
  _type: 'infoSlide'
  _key: string
  heading: string
  body?: string
  image?: SanityImage
}

interface MediaSlide {
  _type: 'mediaSlide'
  _key: string
  media?: SanityImage
}

interface BgOverlaySlide {
  _type: 'bgOverlaySlide'
  _key: string
  background?: SanityImage
  content?: SanityImage
}

interface BgScrollSlide {
  _type: 'bgScrollSlide'
  _key: string
  background?: SanityImage
  content?: SanityImage
}

type Slide = InfoSlide | MediaSlide | BgOverlaySlide | BgScrollSlide

// ─── Query ────────────────────────────────────────────────────────────────────

const SLIDES_QUERY = `
  *[_type == "case" && slug.current == $slug][0]{
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

// ─── FadeImage ────────────────────────────────────────────────────────────────
//
// Обёртка над Image: показывает shimmer-скелетон до загрузки, затем плавно
// проявляет изображение. Для fill-изображений возвращает Fragment (скелетон +
// картинка как siblings в уже позиционированном родителе). Для sized-изображений
// оборачивает в relative-контейнер.

function FadeImage({
  fill,
  style,
  className,
  onLoad: onLoadProp,
  wrapperStyle,
  ...props
}: React.ComponentProps<typeof Image> & { wrapperStyle?: React.CSSProperties }) {
  const [loaded, setLoaded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true)
    ;(onLoadProp as ((e: React.SyntheticEvent<HTMLImageElement>) => void) | undefined)?.(e)

    // Для sized-изображений: плавная анимация высоты от placeholder до реальной
    if (!fill && wrapperRef.current) {
      const wrapper = wrapperRef.current
      const img = e.currentTarget as HTMLImageElement
      if (!img.naturalWidth || !img.naturalHeight) return
      const targetHeight = (img.naturalHeight / img.naturalWidth) * wrapper.offsetWidth
      const currentHeight = wrapper.offsetHeight
      if (Math.abs(targetHeight - currentHeight) > 2) {
        gsap.fromTo(
          wrapper,
          { height: currentHeight },
          { height: targetHeight, duration: 0.5, ease: 'expo.out', onComplete: () => { gsap.set(wrapper, { height: 'auto' }) } }
        )
      }
    }
  }

  const imgStyle: React.CSSProperties = {
    ...style,
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.5s ease',
  }

  const skeleton = (
    <div className={`img-skeleton${loaded ? ' img-skeleton--done' : ''}`} />
  )

  if (fill) {
    return (
      <>
        {skeleton}
        <Image fill style={imgStyle} className={className} onLoad={handleLoad} {...props} />
      </>
    )
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'block', overflow: 'hidden', ...wrapperStyle }}>
      {skeleton}
      <Image style={imgStyle} className={className} onLoad={handleLoad} {...props} />
    </div>
  )
}

// ─── BgOverlaySlide renderer ──────────────────────────────────────────────────
//
// bg-картинка (absolute cover) + оверлей по центру (70vw / min 500px, height auto)

function BgOverlaySlideContent({ slide }: { slide: BgOverlaySlide }) {
  if (!slide.background?.asset?.url || !slide.content?.asset?.url) return null
  return (
    <>
      <FadeImage
        src={slide.background.asset.url}
        alt=""
        fill
        style={{ objectFit: 'cover' }}
      />
      <div className="slide-overlay-center">
        <div className="slide-overlay-inner">
          <FadeImage
            src={slide.content.asset.url}
            alt=""
            width={1920}
            height={1080}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            wrapperStyle={{ borderRadius: 'var(--radius--main)' }}
          />
        </div>
      </div>
    </>
  )
}

// ─── BgScrollSlide renderer ───────────────────────────────────────────────────
//
// bg-картинка (absolute cover) + скроллируемый оверлей (70vw / min 500px, full height).
// Прокрутка управляется window-level wheel хандлером в SlideShowcase
// (колёсо срабатывает на pageContent поверх, а не на элементах pageBackground).

function BgScrollSlideContent({ slide }: { slide: BgScrollSlide }) {
  const thumbRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Обновляем ползунок скроллбара через RAF
  useEffect(() => {
    const thumb = thumbRef.current
    const overlay = overlayRef.current
    if (!thumb || !overlay) return

    const rootFS = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const trackPx = 6 * rootFS

    let rafId: number
    const update = () => {
      const maxScroll = overlay.scrollHeight - overlay.clientHeight
      if (maxScroll > 0) {
        const progress = overlay.scrollTop / maxScroll
        thumb.style.top = `${progress * (trackPx - thumb.offsetHeight)}px`
      }
      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (!slide.background?.asset?.url || !slide.content?.asset?.url) return null
  return (
    <>
      <FadeImage
        src={slide.background.asset.url}
        alt=""
        fill
        style={{ objectFit: 'cover' }}
      />
      <div ref={overlayRef} className="slide-scroll-overlay">
        <div className="slide-scroll-content">
          <FadeImage
            src={slide.content.asset.url}
            alt=""
            width={1920}
            height={1080}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            wrapperStyle={{ borderRadius: 'var(--radius--main)' }}
          />
        </div>
      </div>
      <div className="slide-scroll-track">
        <div ref={thumbRef} className="slide-scroll-thumb" />
      </div>
    </>
  )
}

// ─── InfoSlide renderer ───────────────────────────────────────────────────────
//
// Когда isActive=false (слайд ещё не активен) — текст скрыт.
// Когда isActive становится true — монтируем Copy, который сразу играет анимацию.

function InfoSlideContent({ slide, isActive }: { slide: InfoSlide; isActive: boolean }) {
  return (
    <div className="case-info">
      <div className="case-info-column">
        {isActive ? (
          <Copy animateOnScroll={false}>
            <h3 className="case-info-heading">{slide.heading}</h3>
          </Copy>
        ) : (
          <h3 className="case-info-heading" style={{ visibility: 'hidden' }}>{slide.heading}</h3>
        )}
        {slide.body && (
          isActive ? (
            <Copy animateOnScroll={false} delay={0.2}>
              <p className="case-info-p">{slide.body}</p>
            </Copy>
          ) : (
            <p className="case-info-p" style={{ visibility: 'hidden' }}>{slide.body}</p>
          )
        )}
      </div>
      {slide.image?.asset?.url && (
        <div className="case-media-column" style={{ position: 'relative' }}>
          <FadeImage
            src={slide.image.asset.url}
            alt=""
            fill
            className="image"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Slide content renderers ──────────────────────────────────────────────────

function renderSlideContent(slide: Slide, isActive: boolean) {
  switch (slide._type) {
    case 'infoSlide':
      return <InfoSlideContent slide={slide} isActive={isActive} />

    case 'mediaSlide':
      if (!slide.media?.asset?.url) return null
      return (
        <>
          <FadeImage
            src={slide.media.asset.url}
            alt=""
            fill
            className="case-media"
            style={{ objectFit: 'cover' }}
          />
          <div className="mob-media-overlay">
            <div className="mob-media-image">
              <FadeImage
                src={slide.media.asset.url}
                alt=""
                width={1920}
                height={1080}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                wrapperStyle={{ borderRadius: 'var(--radius--main)' }}
              />
            </div>
          </div>
        </>
      )

    case 'bgOverlaySlide':
      return <BgOverlaySlideContent slide={slide} />

    case 'bgScrollSlide':
      return <BgScrollSlideContent slide={slide} />

    default:
      return null
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SlideShowcase() {
  const pathname = usePathname()
  const slug = pathname.startsWith('/work/') ? pathname.slice(6) : null

  const [slides, setSlides] = useState<Slide[]>([])
  const [revealedSlides, setRevealedSlides] = useState<Set<number>>(() => new Set([0]))
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const innerRefs = useRef<(HTMLDivElement | null)[]>([])
  const cursorRef = useRef<HTMLDivElement>(null)
  const isAnimating = useRef(false)
  const activeIndexRef = useRef(0)
  const slidesRef = useRef(slides)
  slidesRef.current = slides

  // Lerp-состояние для скролла bgScrollSlide
  const scrollTargetY = useRef(0)
  const scrollCurrentY = useRef(0)
  const scrollIsRunning = useRef(false)
  const scrollRafId = useRef<number | null>(null)

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!slug) {
      setSlides([])
      setRevealedSlides(new Set([0]))
      resetSlideIndexSignal()
      resetSlideTotalSignal()
      return
    }
    resetSlideIndexSignal()
    resetSlideTotalSignal()
    const cached = getCaseData(slug)
    if (cached) {
      const slides = cached as Slide[]
      setSlides(slides)
      activeIndexRef.current = 0
      setActiveSlideIndex(0)
      setRevealedSlides(new Set([0]))
      signalSlideTotal(slides.length)
      signalSlidesReady()
      return
    }

    client
      .fetch<{ slides: Slide[] } | null>(SLIDES_QUERY, { slug })
      .then((data) => {
        const slides = data?.slides ?? []
        setSlides(slides)
        activeIndexRef.current = 0
        setActiveSlideIndex(0)
        setRevealedSlides(new Set([0]))
        signalSlideTotal(slides.length)
        signalSlidesReady()
      })
  }, [slug])

  // ─── Initial z-index setup when slides load ──────────────────────────────────

  useLayoutEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.set(el, {
        zIndex: i === 0 ? 1 : 0,
        clipPath: 'inset(0 0% 0 0%)',
      })
    })
    innerRefs.current.forEach((el) => {
      if (el) gsap.set(el, { x: '0%' })
    })
  }, [slides])

  // ─── Core transition ─────────────────────────────────────────────────────────

  const goTo = useCallback((nextIndex: number, direction: 'next' | 'prev') => {
    const total = slidesRef.current.length
    if (isAnimating.current || total <= 1) return
    if (nextIndex === activeIndexRef.current) return

    const currentEl = slideRefs.current[activeIndexRef.current]
    const nextEl = slideRefs.current[nextIndex]
    const nextInner = innerRefs.current[nextIndex]

    if (!nextEl) return

    isAnimating.current = true

    setRevealedSlides(prev => {
      if (prev.has(nextIndex)) return prev
      return new Set([...prev, nextIndex])
    })

    const clipStart =
      direction === 'next' ? 'inset(0 0% 0 100%)' : 'inset(0 100% 0 0%)'
    const xStart = direction === 'next' ? '20%' : '-20%'

    if (currentEl) gsap.set(currentEl, { zIndex: 1 })
    gsap.set(nextEl, { zIndex: 2, clipPath: clipStart })
    if (nextInner) gsap.set(nextInner, { x: xStart, filter: 'brightness(0)' })

    gsap.to(nextEl, {
      clipPath: 'inset(0 0% 0 0%)',
      duration: 1.2,
      ease: 'expo.inOut',
      onComplete: () => {
        slideRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { zIndex: i === nextIndex ? 1 : 0 })
        })
        activeIndexRef.current = nextIndex
        isAnimating.current = false
        signalSlideIndex(nextIndex)
        setActiveSlideIndex(nextIndex)
        // Сбрасываем позицию скролла при смене слайда
        scrollTargetY.current = 0
        scrollCurrentY.current = 0
        const overlay = slideRefs.current[nextIndex]?.querySelector('.slide-scroll-overlay') as HTMLElement | null
        if (overlay) overlay.scrollTop = 0
      },
    })

    if (nextInner) {
      gsap.to(nextInner, { x: '0%', filter: 'brightness(1)', duration: 1.2, ease: 'expo.inOut' })
    }
  }, [])

  const next = useCallback(() => {
    const total = slidesRef.current.length
    if (!total) return
    goTo((activeIndexRef.current + 1) % total, 'next')
  }, [goTo])

  const prev = useCallback(() => {
    const total = slidesRef.current.length
    if (!total) return
    goTo((activeIndexRef.current - 1 + total) % total, 'prev')
  }, [goTo])

  // ─── Wheel — скролл для bgScrollSlide ────────────────────────────────────────
  //
  // Колёсо срабатывает на элементах pageContent (который поверх pageBackground),
  // поэтому перехватываем на window и форвардим в оверлей с lerp-анимацией.

  useEffect(() => {
    const getActiveOverlay = () =>
      (slideRefs.current[activeIndexRef.current]?.querySelector('.slide-scroll-overlay') ?? null) as HTMLElement | null

    const tick = () => {
      const overlay = getActiveOverlay()
      if (!overlay) { scrollIsRunning.current = false; return }

      const dist = scrollTargetY.current - scrollCurrentY.current
      if (Math.abs(dist) < 0.5) {
        scrollCurrentY.current = scrollTargetY.current
        overlay.scrollTop = scrollCurrentY.current
        scrollIsRunning.current = false
        return
      }
      scrollCurrentY.current += dist * 0.1
      overlay.scrollTop = scrollCurrentY.current
      scrollRafId.current = requestAnimationFrame(tick)
    }

    const handleWheel = (e: WheelEvent) => {
      if (!pathname.startsWith('/work/')) return
      const main = document.querySelector('.main-container')
      if (main && main.contains(e.target as Node)) return

      const activeSlide = slidesRef.current[activeIndexRef.current]
      if (activeSlide?._type !== 'bgScrollSlide') return

      const overlay = getActiveOverlay()
      if (!overlay) return

      e.preventDefault()
      const maxScroll = overlay.scrollHeight - overlay.clientHeight
      scrollTargetY.current = Math.max(0, Math.min(scrollTargetY.current + e.deltaY, maxScroll))

      if (!scrollIsRunning.current) {
        scrollIsRunning.current = true
        tick()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      if (scrollRafId.current !== null) cancelAnimationFrame(scrollRafId.current)
    }
  }, [pathname])

  // ─── Touch swipe ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let startX = 0
    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!pathname.startsWith('/work/')) return
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) next()
      else prev()
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [next, prev, pathname])

  // ─── Click + Cursor (window-level) ───────────────────────────────────────────

  useEffect(() => {
    const isInMainContainer = (e: MouseEvent) => {
      const main = document.querySelector('.main-container')
      return main ? main.contains(e.target as Node) : false
    }

    const handleClick = (e: MouseEvent) => {
      if (!pathname.startsWith('/work/')) return
      if (slidesRef.current.length <= 1) return
      if (isInMainContainer(e)) return
      const isRight = e.clientX > window.innerWidth / 2
      if (isRight) next()
      else prev()
    }

    let cursorVisible = false
    const setCursorVisible = (visible: boolean) => {
      if (visible === cursorVisible) return
      cursorVisible = visible
      document.body.style.cursor = visible ? 'none' : ''
      gsap.to(cursorRef.current, {
        opacity: visible ? 1 : 0,
        duration: 0.15,
        ease: visible ? 'power1.out' : 'power1.in',
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const cursor = cursorRef.current
      if (!cursor) return
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
      const inMain = isInMainContainer(e)
      setCursorVisible(!inMain)
      if (!inMain) {
        cursor.textContent = e.clientX > window.innerWidth / 2 ? 'next' : 'previous'
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('mousemove', handleMouseMove)

    const cursor = cursorRef.current
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.style.cursor = ''
      if (cursor) gsap.to(cursor, { opacity: 0, duration: 0.15, ease: 'power1.in' })
    }
  }, [next, prev, pathname])

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (!slides.length) return null

  return (
    <div className="slide-interactor">
      {slides.map((slide, i) => (
        <div
          key={slide._key}
          ref={(el) => { slideRefs.current[i] = el }}
          className="case-item"
        >
          <div
            ref={(el) => { innerRefs.current[i] = el }}
            className="case-item-inner"
          >
            {revealedSlides.has(i) && renderSlideContent(slide, i === activeSlideIndex)}
          </div>
        </div>
      ))}

      <div ref={cursorRef} className="slide-cursor">
        next
      </div>
    </div>
  )
}
