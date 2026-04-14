'use client'

import { useEffect, useState } from 'react'

export default function MoscowTime() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const formatted = now.toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Moscow',
        hour: '2-digit',
        minute: '2-digit',
      })
      setTime(formatted)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <h4 className="a-list-item is-secondary margin-btm">GMT +3, Georgia — {time}</h4>
}
