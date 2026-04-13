import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: '9ndx0o91',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
