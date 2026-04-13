import PageBackground from '@/components/PageBackground'
import PageContent from '@/components/PageContent'
import Preloader from '@/components/Preloader'
import { client } from '@/lib/sanity'

async function getShowreelVideoUrl(): Promise<string | null> {
  const data = await client.fetch<{ url: string } | null>(
    `*[_type == "siteSettings" && _id == "siteSettings"][0]{ "url": showreelVideo.asset->url }`,
    {},
    { next: { revalidate: 60 } }
  )
  return data?.url ?? null
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const showreelVideoUrl = await getShowreelVideoUrl()

  return (
    <div className="page-wrap">
      <Preloader />
      <PageBackground showreelVideoUrl={showreelVideoUrl} />
      <PageContent>{children}</PageContent>
    </div>
  )
}
