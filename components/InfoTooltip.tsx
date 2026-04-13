'use client'

import { useState, useRef } from 'react'
import Copy from '@/components/Copy'

interface InfoTooltipProps {
  text: string
  children: React.ReactNode
}

export default function InfoTooltip({ text, children }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(true)
  }

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100)
  }

  return (
    <div className="info-tooltip-wrap">
      <div
        className="info-icon"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <Copy split={false}>
          <svg width=".875rem" height=".875rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor"/>
            <path d="M8 7V12" stroke="currentColor" strokeLinecap="round"/>
            <circle cx="8" cy="5" r="0.75" fill="currentColor"/>
          </svg>
        </Copy>
        <div
          className={`info-popup${visible ? ' is-visible' : ''}`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <p className="label">{text}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
