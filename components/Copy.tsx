'use client'

import { useRef, useLayoutEffect, Children, isValidElement, cloneElement } from 'react'
import type { ReactElement } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

interface CopyProps {
  children: React.ReactNode
  animateOnScroll?: boolean
  delay?: number
  /** false — анимирует весь элемент целиком (без SplitText), например для .tag */
  split?: boolean
}

export default function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
  split = true,
}: CopyProps) {
  const containerRef = useRef<HTMLElement>(null)
  const splitRefs = useRef<InstanceType<typeof SplitText>[]>([])
  const linesRef = useRef<Element[]>([])

  // Для split={false}: ref на сам анимируемый элемент (wrapper — overflow:hidden)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    let cleanupFn: (() => void) | undefined

    const init = () => {
      if (split) {
        // ── SplitText mode ──────────────────────────────────────────
        const container = containerRef.current
        if (!container) return

        splitRefs.current = []
        linesRef.current = []

        const isWrapper = container.hasAttribute('data-copy-wrapper')
        const elements: Element[] = isWrapper
          ? Array.from(container.children)
          : [container]

        for (const el of elements) {
          const s = new SplitText(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'line++',
          })

          const style = getComputedStyle(el)
          const indent = style.textIndent
          if (indent && indent !== '0px' && s.lines.length > 0) {
            ;(s.lines[0] as HTMLElement).style.paddingLeft = indent
            ;(el as HTMLElement).style.textIndent = '0'
          }

          splitRefs.current.push(s)
          linesRef.current.push(...s.lines)
        }

        gsap.set(linesRef.current, { y: '110%' })

        const play = () => {
          const transitionDelay = document.documentElement.dataset.pageTransition ? 0.3 : 0
          gsap.to(linesRef.current, {
            y: '0%',
            duration: 1.3,
            stagger: 0.085,
            delay: delay + transitionDelay,
            ease: 'expo.out',
          })
        }

        if (animateOnScroll) {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                play()
                observer.disconnect()
              }
            },
            { threshold: 0.1 }
          )
          observer.observe(container)
          cleanupFn = () => {
            observer.disconnect()
            splitRefs.current.forEach((s) => s.revert())
          }
        } else {
          play()
          cleanupFn = () => { splitRefs.current.forEach((s) => s.revert()) }
        }
      } else {
        // ── Whole-element mode (split={false}) ──────────────────────
        const inner = innerRef.current
        const wrapper = wrapperRef.current
        if (!inner || !wrapper) return

        gsap.set(inner, { y: '110%' })

        const play = () => {
          const transitionDelay = document.documentElement.dataset.pageTransition ? 0.3 : 0
          gsap.to(inner, {
            y: '0%',
            duration: 1.1,
            delay: delay + transitionDelay,
            ease: 'expo.out',
          })
        }

        if (animateOnScroll) {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                play()
                observer.disconnect()
              }
            },
            { threshold: 0.1 }
          )
          observer.observe(wrapper)
          cleanupFn = () => { observer.disconnect() }
        } else {
          play()
        }
      }
    }

    if (document.fonts.status === 'loaded') {
      init()
    } else {
      document.fonts.ready.then(init)
    }

    return () => { cleanupFn?.() }
  }, [animateOnScroll, delay, split])

  // ── Render ───────────────────────────────────────────────────────
  if (!split) {
    const childArray = Children.toArray(children)
    const child = isValidElement(childArray[0])
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cloneElement(childArray[0] as ReactElement<any>, {
          ref: innerRef,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style: { paddingBottom: '4px', ...(childArray[0] as ReactElement<any>).props.style },
        })
      : childArray[0]

    return (
      <div ref={wrapperRef} style={{ overflow: 'hidden' }}>
        {child}
      </div>
    )
  }

  const childArray = Children.toArray(children)

  if (childArray.length === 1 && isValidElement(childArray[0])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cloneElement(childArray[0] as ReactElement<any>, { ref: containerRef })
  }

  return (
    <div ref={containerRef as React.Ref<HTMLDivElement>} data-copy-wrapper>
      {children}
    </div>
  )
}
