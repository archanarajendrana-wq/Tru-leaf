// Creates the Edible Oils subcategory (without catalogue flags, so the catalogue's built-in list is unaffected until the
// full catalogue seed runs) and lists the coconut oil products under it as well as Coconut Products.
// Uses your logged-in Sanity CLI session. Run: npx sanity exec add-edible-oils.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const client = getCliClient({ apiVersion: '2024-01-01' })
const file = path.resolve(__dirname, '../assets/images/category-normalized/category-edible-oils.png')

const oilProducts = [
  'product-virgin-coconut-oil',
  'product-extra-virgin-coconut-oil',
  'product-organic-coconut-products-coconut-oil',
]

;(async () => {
  const exists = await client.fetch('*[_id=="category-edible-oils"][0]{_id}')
  if (!exists) {
    const asset = await client.assets.upload('image', readFileSync(file), { filename: 'category-edible-oils.png' })
    await client.create({
      _id: 'category-edible-oils',
      _type: 'category',
      name: 'Edible Oils',
      slug: { _type: 'slug', current: 'edible-oils' },
      shortDescription: 'Cold-pressed and refined oils in bulk and retail packs.',
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      featured: false,
    })
    console.log('created category edible-oils')
  } else {
    console.log('category edible-oils already exists')
  }

  const tx = client.transaction()
  oilProducts.forEach((id) =>
    tx.patch(id, (p) => p.set({ additionalCategories: [{ _type: 'reference', _key: 'edible-oils', _ref: 'category-edible-oils' }] })),
  )
  await tx.commit()
  console.log(`listed ${oilProducts.length} products under Edible Oils`)
})().catch((e) => { console.error(e.message); process.exit(1) })
