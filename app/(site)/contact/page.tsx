import { client } from '@/lib/sanity'
import ContactClient from './ContactClient'

async function getCvUrl(): Promise<string | null> {
  const data = await client.fetch<{ url: string } | null>(
    `*[_type == "siteSettings" && _id == "siteSettings"][0]{ "url": cvFile.asset->url }`,
    {},
    { next: { revalidate: 60 } }
  )
  return data?.url ?? null
}

export default async function ContactPage() {
  const cvUrl = await getCvUrl()
  return <ContactClient cvUrl={cvUrl} />
}
