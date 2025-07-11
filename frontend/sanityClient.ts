import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'hrz2l3l9',         // 👈 your actual project ID
  dataset: 'production',
  apiVersion: '2024-07-11',     // can be today's date
  useCdn: true
})
