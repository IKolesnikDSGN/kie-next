'use client'

import { useContext } from 'react'
import { usePathname } from 'next/navigation'
import { TransitionContext } from './TransitionContext'

interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  children: React.ReactNode
}

export default function TransitionLink({ href, className, children, ...rest }: TransitionLinkProps) {
  const { startTransition, startPolygonTransition } = useContext(TransitionContext)
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (pathname === '/contact') {
      startPolygonTransition(href)
    } else {
      startTransition(href)
    }
  }

  return (
    <a href={href} className={className} {...rest} onClick={handleClick}>
      {children}
    </a>
  )
}
