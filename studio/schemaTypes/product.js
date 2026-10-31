import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product name',
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
      name: 'grade',
      title: 'Ingredient type',
      description: 'Organic Ingredients or Conventional Ingredients on the Product Catalogue',
      type: 'string',
      options: {
        list: [
          { title: 'Organic', value: 'organic' },
          { title: 'Conventional', value: 'conventional' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentCategory',
      title: 'Subcategory',
      description: 'The subcategory this product is listed under, e.g. Coconut Products, Spices',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'additionalCategories',
      title: 'Also list under',
      description: 'Optional: show this product in other subcategories too (e.g. an oil under both Coconut Products and Edible Oils)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'category',
      title: 'Card label',
      description: 'Short label on trending cards and in search. Usually the subcategory name.',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Product image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      description: 'Shown on product list/category cards (one line)',
      type: 'string',
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      description: 'Shown on the product detail overlay',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'botanicalName',
      title: 'Botanical name',
      type: 'string',
    }),
    defineField({
      name: 'sourcedFrom',
      title: 'Sourced from',
      type: 'string',
    }),
    defineField({
      name: 'packaging',
      title: 'Available packaging',
      description: 'e.g. 20 kg aseptic bag-in-box, 200 mL Tetra Pak',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'gradeDetails',
      title: 'Fat & grade options',
      description: 'e.g. Organic Coconut Milk 18% Fat; conventional options; stabilizers',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'sizeChart',
      title: 'Size & grade chart',
      description: 'Optional table shown in the product details, one row per size / caliber',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'sizeRow',
          fields: [
            defineField({ name: 'size', title: 'Size / caliber', type: 'string' }),
            defineField({ name: 'basis', title: 'Specification / basis', type: 'string' }),
          ],
          preview: { select: { title: 'size', subtitle: 'basis' } },
        },
      ],
    }),
    defineField({
      name: 'shelfLife',
      title: 'Shelf life',
      description: 'e.g. 18 Months',
      type: 'string',
    }),
    defineField({
      name: 'storage',
      title: 'Storage',
      description: 'e.g. Ambient Temperature',
      type: 'string',
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'BRCGS Food Safety', value: 'BRCGS' },
          { title: 'USDA Organic', value: 'USDA Organic' },
          { title: 'Kosher (OU)', value: 'Kosher' },
          { title: 'Non-GMO Project Verified', value: 'Non-GMO Project Verified' },
          { title: 'Halal', value: 'Halal' },
          { title: 'FSSC 22000', value: 'FSSC 22000' },
        ],
        layout: 'grid',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured (show in Trending Products)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers show first',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
})
