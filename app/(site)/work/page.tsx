import { client } from '@/lib/sanity'
import WorkHoverManager, { type WorkCaseData } from '@/components/WorkHoverManager'

async function getCases(): Promise<WorkCaseData[]> {
  const raw = await client.fetch<Array<{
    title: string
    slug: { current: string }
    tags: string[]
    firstSlideImageUrl?: string
    mediaSlideUrls: (string | null)[]
  }>>(
    `*[_type == "case"] | order(_createdAt asc) {
      title,
      slug,
      tags,
      "firstSlideImageUrl": slides[_type == "mediaSlide" && defined(media.asset)][0].media.asset->url,
      "mediaSlideUrls": slides[_type == "mediaSlide" && defined(media.asset)][0..2].media.asset->url
    }`
  )

  return raw.map((c) => ({
    title: c.title,
    slug: c.slug,
    tags: c.tags ?? [],
    firstSlideImageUrl: c.firstSlideImageUrl,
    mediaSlideUrls: (c.mediaSlideUrls ?? []).filter((u): u is string => !!u),
  }))
}

export default async function WorkPage() {
  const cases = await getCases()

  return (
    <>
      {cases.map((c) =>
        c.firstSlideImageUrl ? (
          <link
            key={c.slug.current}
            rel="preload"
            as="image"
            href={`${c.firstSlideImageUrl}?w=1920&auto=format`}
          />
        ) : null
      )}
      <WorkHoverManager cases={cases} />
    </>
  )
}
