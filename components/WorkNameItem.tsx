'use client'

import TransitionLink from './TransitionLink'

interface WorkNameItemProps {
  href: string
  children: React.ReactNode
}

export default function WorkNameItem({ href, children }: WorkNameItemProps) {
  return (
    <TransitionLink href={href} className="worknameitem">
      {children}
    </TransitionLink>
  )
}
