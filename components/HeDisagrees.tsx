'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

const LERP = 0.1
const IMG_H_REM = 7
const ASPECT = 2 / 3
const GAP_PX = 20

export default function HeDisagrees({ src }: { src: string }) {
  const [mounted, setMounted] = useState(false)
  const imgDivRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const pos = useRef({ x: 0, y: 0 })
  const raf = useRef<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Event delegation on document — survives GSAP SplitText DOM recreation
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.('.he-disagrees-text')
      const from = (e.relatedTarget as Element | null)?.closest?.('.he-disagrees-text')
      if (target && !from) imgDivRef.current?.classList.add('is-visible')
    }
    const onOut = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.('.he-disagrees-text')
      const to = (e.relatedTarget as Element | null)?.closest?.('.he-disagrees-text')
      if (target && !to) imgDivRef.current?.classList.remove('is-visible')
    }

    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [onMouseMove])

  useEffect(() => {
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const imgH = IMG_H_REM * remPx
    const imgW = imgH * ASPECT

    const tick = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * LERP
      pos.current.y += (mouse.current.y - pos.current.y) * LERP

      if (wrapRef.current) {
        const tx = pos.current.x - imgW / 2
        const ty = pos.current.y - imgH - GAP_PX
        wrapRef.current.style.transform = `translate(${tx}px, ${ty}px)`
      }

      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [])

  return (
    <>
      <span className="he-disagrees-text">
        He disagrees.
      </span>
      {mounted && createPortal(
        <div ref={wrapRef} className="he-disagrees-wrap" aria-hidden="true">
          <div ref={imgDivRef} className="he-disagrees-img">
            <Image
              src={src}
              alt=""
              fill
              sizes="calc(7rem * 2 / 3)"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
