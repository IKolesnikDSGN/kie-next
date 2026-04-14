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
    defineField({
      name: 'cvFile',
      title: 'CV File',
      type: 'file',
      options: {
        accept: '.pdf,.doc,.docx',
      },
      description: 'Файл CV для скачивания на странице контактов',
    }),
    defineField({
      name: 'qrImage',
      title: 'QR Code Image',
      type: 'image',
      description: 'QR-код на странице контактов',
    }),
    defineField({
      name: 'posterBgImage',
      title: 'Poster Background Image',
      type: 'image',
      description: 'Фоновое изображение постера (за логотипом)',
    }),
    defineField({
      name: 'posterFgImage',
      title: 'Poster Foreground Image',
      type: 'image',
      description: 'Изображение переднего плана постера (поверх логотипа)',
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      description: 'Список навыков в гриде на странице About',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Название',
              type: 'string',
            }),
            defineField({
              name: 'icon',
              title: 'Иконка',
              type: 'image',
            }),
          ],
          preview: {
            select: {
              title: 'name',
              media: 'icon',
            },
          },
        },
      ],
    }),
  ],
})
