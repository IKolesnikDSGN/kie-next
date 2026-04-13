import { client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Copy from '@/components/Copy'
import SlideCounter from '@/components/SlideCounter'
import CaseNavLinks from '@/components/CaseNavLinks'

interface CaseSummary {
  title: string
  slug: { current: string }
}

interface CaseFull extends CaseSummary {
  tags?: string[]
  slides?: { _type: string; _key: string }[]
}

async function getCase(slug: string): Promise<CaseFull | null> {
  return client.fetch(
    `*[_type == "case" && slug.current == $slug][0]{
      title,
      slug,
      tags,
      slides[]{ _type, _key }
    }`,
    { slug }
  )
}

async function getAllCases(): Promise<CaseSummary[]> {
  return client.fetch(
    `*[_type == "case"] | order(_createdAt asc){ title, slug }`
  )
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [caseData, allCases] = await Promise.all([getCase(slug), getAllCases()])

  if (!caseData) notFound()

  const currentIndex = allCases.findIndex((c) => c.slug.current === slug)
  const prevCase = currentIndex > 0 ? allCases[currentIndex - 1] : null
  const nextCase =
    allCases.length > 1
      ? currentIndex < allCases.length - 1
        ? allCases[currentIndex + 1]
        : allCases[0]
      : null
  const slideCount = caseData.slides?.length ?? 0

  return (
    <div className="case-wrap">
      <div className="case-name-indicator">
        <Copy animateOnScroll={false} delay={0.65}>
          <h1 className="case-name">{caseData.title}</h1>
        </Copy>
        {slideCount > 0 && <SlideCounter total={slideCount} />}
      </div>
      <div className="case-divider"></div>
      <CaseNavLinks
        prevHref={prevCase ? `/work/${prevCase.slug.current}` : undefined}
        nextHref={nextCase ? `/work/${nextCase.slug.current}` : undefined}
      />
    </div>
  )
}
