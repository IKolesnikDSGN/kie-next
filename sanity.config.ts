'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { caseSchema } from './sanity/schemas/case'
import { siteSettingsSchema } from './sanity/schemas/siteSettings'

export default defineConfig({
  basePath: '/studio',
  projectId: '9ndx0o91',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== 'siteSettings'
            ),
          ]),
    }),
  ],
  schema: {
    types: [caseSchema, siteSettingsSchema],
  },
})
