import { defineType, defineField } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showreelVideo',
      title: 'Showreel Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description: 'Background video for the showreel section (homepage, about, etc.)',
    }),
  ],
})
