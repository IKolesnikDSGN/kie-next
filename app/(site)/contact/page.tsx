import { client } from '@/lib/sanity'
import ContactClient from './ContactClient'

async function getContactData(): Promise<{ cvUrl: string | null; qrUrl: string | null }> {
  const data = await client.fetch<{ cvUrl: string; qrUrl: string } | null>(
    `*[_type == "siteSettings" && _id == "siteSettings"][0]{
      "cvUrl": cvFile.asset->url,
      "qrUrl": qrImage.asset->url
    }`,
    {},
    { next: { revalidate: 60 } }
  )
  return {
    cvUrl: data?.cvUrl ?? null,
    qrUrl: data?.qrUrl ?? null,
  }
}

export default async function ContactPage() {
  const { cvUrl, qrUrl } = await getContactData()
  return <ContactClient cvUrl={cvUrl} qrUrl={qrUrl} />
}
