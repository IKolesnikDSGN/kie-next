'use client'

import { usePathname } from 'next/navigation'
import { useContext } from 'react'
import TransitionLink from './TransitionLink'
import { TransitionContext } from './TransitionContext'

export default function Nav() {
  const pathname = usePathname()
  const { startPolygonTransition } = useContext(TransitionContext)

  const isActive = (href: string) =>
    href === '/work'
      ? pathname === '/work' || pathname.startsWith('/work/')
      : pathname === href

  const handleContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (pathname !== '/contact') {
      startPolygonTransition('/contact')
    }
  }

  return (
    <nav className="nav">
      <TransitionLink href="/" className="nav-logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1408 543" className="logo">
          <path d="M0 0H192.361V119.46C192.361 144.8 191.327 180.741 189.259 227.284L374.639 0H568.552L357.575 238.92L570.28 543H368.434L189.259 302.529C191.327 349.071 192.361 385.013 192.361 410.353V543H0V0Z" fill="currentColor" data-nav-reveal="path" className="path"></path>
          <path d="M608.639 0H801V543H608.639V0Z" fill="currentColor" data-nav-reveal="path" className="path"></path>
          <path d="M841 0H1408V121.011L1031.81 121.011V204.013L1349.83 204.013V318.819H1031.81V421.989H1408V543H841V0Z" fill="currentColor" data-nav-reveal="path" className="path"></path>
        </svg>
      </TransitionLink>
      <div className="nav-links">
        <TransitionLink href="/work" className={isActive('/work') ? 'nav-link active' : 'nav-link'}>
          work
        </TransitionLink>
        <TransitionLink href="/about" className={isActive('/about') ? 'nav-link active' : 'nav-link'}>
          about
        </TransitionLink>
      </div>
      <a
        href="/contact"
        onClick={handleContact}
        className={`nav-btn${isActive('/contact') ? ' nav-link active' : ' nav-link'}`}
      >
        contact
      </a>
    </nav>
  )
}
