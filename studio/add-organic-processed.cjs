// Adds ORGANIC versions of the 11 processed fruit & vegetable products, cloned from the conventional entries.
// Organic Ingredients on the catalogue has cards for Juices & Purees and Fruits & Vegetables (not Pickled or Frozen),
// so: the 4 pulps/purees sit under Juices & Purees; the 3 gherkins and 4 frozen pineapple products also appear under
// Fruits & Vegetables. The fruits-vegetables category is created if missing (no catalogue flags).
// The specs, grades and certifications are COPIED from the conventional products and need an organic review.
// Uses your logged-in Sanity CLI session. Run: npx sanity exec add-organic-processed.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const client = getCliClient({ apiVersion: '2024-01-01' })
const file = path.resolve(__dirname, '../assets/images/category-normalized/category-fruits-vegetables.png')

;(async () => {
  // Fruits & Vegetables subcategory (create if missing)
  const exists = await client.fetch('*[_id=="category-fruits-vegetables"][0]{_id}')
  if (!exists) {
    const asset = await client.assets.upload('image', readFileSync(file), { filename: 'category-fruits-vegetables.png' })
    await client.create({
      _id: 'category-fruits-vegetables',
      _type: 'category',
      name: 'Fruits & Vegetables',
      slug: { _type: 'slug', current: 'fruits-vegetables' },
      shortDescription: 'Fresh produce graded and packed for export.',
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      featured: false,
    })
    console.log('created category fruits-vegetables')
  }

  const sources = await client.fetch(
    '*[_type=="product" && grade=="conventional" && _id match "product-conventional-*" && parentCategory->slug.current in ["pickled-preserved-vegetables","juices-purees","frozen-fruits-vegetables"]] | order(parentCategory->slug.current asc, order asc)',
  )

  const tx = client.transaction()
  for (const src of sources) {
    const { _id, _rev, _createdAt, _updatedAt, ...rest } = src
    const slug = src.parentCategory._ref.replace('category-', '')
    const doc = {
      ...rest,
      _id: _id.replace('product-conventional-', 'product-organic-'),
      grade: 'organic',
      slug: { _type: 'slug', current: src.slug.current.replace('conventional-', 'organic-') },
    }
    // reachable from the Organic "Fruits & Vegetables" card too (pulps/purees already have the Juices & Purees card)
    if (slug !== 'juices-purees') {
      doc.additionalCategories = [{ _type: 'reference', _key: 'fruits-vegetables', _ref: 'category-fruits-vegetables' }]
    }
    tx.createOrReplace(doc)
    console.log('organic', doc._id, slug !== 'juices-purees' ? '(+ Fruits & Vegetables)' : '')
  }
  await tx.commit()
  console.log(`Done: ${sources.length} organic products written.`)
})().catch((e) => { console.error(e.message); process.exit(1) })
