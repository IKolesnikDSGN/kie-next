import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found-wrap">
      <p>404</p>
      <Link href="/">← back</Link>
    </div>
  )
}
