import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Category name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      description: 'Shown on the category card (one or two lines)',
      type: 'string',
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: 'image',
      title: 'Category image',
      description: 'Transparent PNG cut-out only (no background, no square photo)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featured',
      title: 'Featured (show in Featured Categories on the home page)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'privateLabel',
      title: 'Show on Private Label page ("Categories You Can Private-Label")',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'privateLabelOrder',
      title: 'Private Label display order',
      description: 'Lower numbers show first',
      type: 'number',
      hidden: ({ document }) => !document?.privateLabel,
    }),
    defineField({
      name: 'showOrganic',
      title: 'Show on Product Catalogue: Organic Ingredients',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'organicOrder',
      title: 'Organic Ingredients display order',
      description: 'Lower numbers show first',
      type: 'number',
      hidden: ({ document }) => !document?.showOrganic,
    }),
    defineField({
      name: 'showConventional',
      title: 'Show on Product Catalogue: Conventional Ingredients',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'conventionalOrder',
      title: 'Conventional Ingredients display order',
      description: 'Lower numbers show first',
      type: 'number',
      hidden: ({ document }) => !document?.showConventional,
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers show first',
      type: 'number',
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'shortDescription',
      media: 'image',
    },
  },
})
