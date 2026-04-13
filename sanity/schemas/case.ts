import { defineType, defineField, defineArrayMember } from 'sanity'

// ─── Slide 4: full-screen image ──────────────────────────────────────────────
const mediaSlide = defineArrayMember({
  type: 'object',
  name: 'mediaSlide',
  title: 'Media Slide',
  fields: [
    defineField({
      name: 'media',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { media: 'media' },
    prepare({ media }) {
      return { title: 'Media Slide', media }
    },
  },
})

// ─── Slide 1: two-column heading + text + image ───────────────────────────────
const infoSlide = defineArrayMember({
  type: 'object',
  name: 'infoSlide',
  title: 'Info Slide',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body text',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'image',
      title: 'Image (right column)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare({ title, media }) {
      return { title: `Info: ${title ?? '—'}`, media }
    },
  },
})

// ─── Slide: bg + centered content image (height auto) ───────────────────────
const bgOverlaySlide = defineArrayMember({
  type: 'object',
  name: 'bgOverlaySlide',
  title: 'BG + Overlay Slide',
  fields: [
    defineField({
      name: 'background',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content Image (centered, 70% width)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { media: 'background' },
    prepare({ media }) {
      return { title: 'BG + Overlay Slide', media }
    },
  },
})

// ─── Slide: bg + scrollable content image ────────────────────────────────────
const bgScrollSlide = defineArrayMember({
  type: 'object',
  name: 'bgScrollSlide',
  title: 'BG + Scroll Slide',
  fields: [
    defineField({
      name: 'background',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content Image (scrollable, 70% width)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { media: 'background' },
    prepare({ media }) {
      return { title: 'BG + Scroll Slide', media }
    },
  },
})

// ─── Case document ────────────────────────────────────────────────────────────
export const caseSchema = defineType({
  name: 'case',
  title: 'Case',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [infoSlide, mediaSlide, bgOverlaySlide, bgScrollSlide],
    }),
  ],
})
