'use client'

import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'

export default function PosterLogo() {
  const kRef = useRef<SVGGElement>(null)
  const iRef = useRef<SVGGElement>(null)
  const eRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const letters = [kRef.current, iRef.current, eRef.current]
    gsap.set(letters, { y: 600 })
    gsap.to(letters, {
      y: 0,
      duration: 1.3,
      stagger: { each: 0.085, from: 'center' },
      delay: 0.5,
      ease: 'expo.out',
    })
  }, [])

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 1408 543" className="logo">
      <defs>
        <clipPath id="clip-k">
          <rect x="-10" y="0" width="585" height="543" />
        </clipPath>
        <clipPath id="clip-i">
          <rect x="600" y="0" width="210" height="543" />
        </clipPath>
        <clipPath id="clip-e">
          <rect x="835" y="0" width="585" height="543" />
        </clipPath>
      </defs>
      <g ref={kRef} clipPath="url(#clip-k)">
        <path d="M0 0H192.361V119.46C192.361 144.8 191.327 180.741 189.259 227.284L374.639 0H568.552L357.575 238.92L570.28 543H368.434L189.259 302.529C191.327 349.071 192.361 385.013 192.361 410.353V543H0V0Z" fill="currentColor" />
      </g>
      <g ref={iRef} clipPath="url(#clip-i)">
        <path d="M608.639 0H801V543H608.639V0Z" fill="currentColor" />
      </g>
      <g ref={eRef} clipPath="url(#clip-e)">
        <path d="M841 0H1408V121.011L1031.81 121.011V204.013L1349.83 204.013V318.819H1031.81V421.989H1408V543H841V0Z" fill="currentColor" />
      </g>
    </svg>
  )
}
