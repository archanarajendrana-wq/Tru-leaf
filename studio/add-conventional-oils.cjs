// Adds CONVENTIONAL versions of the three coconut oils (Virgin, Extra Virgin, Coconut Oil), cloned from the organic
// entries, listed under Coconut Products and Edible Oils. The USDA Organic certification is dropped from the clones.
// Copied specs/descriptions need a conventional review. Uses your logged-in Sanity CLI session.
// Run: npx sanity exec add-conventional-oils.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const client = getCliClient({ apiVersion: '2024-01-01' })

const sources = [
  'product-virgin-coconut-oil',
  'product-extra-virgin-coconut-oil',
  'product-organic-coconut-products-coconut-oil',
]

;(async () => {
  const docs = await client.fetch('*[_id in $ids]', { ids: sources })
  const tx = client.transaction()
  for (const src of docs) {
    const { _id, _rev, _createdAt, _updatedAt, ...rest } = src
    const base = _id.replace(/^product-(organic-coconut-products-)?/, '')
    const doc = {
      ...rest,
      _id: `product-conventional-coconut-products-${base}`,
      grade: 'conventional',
      featured: false,
      slug: { _type: 'slug', current: `conventional-coconut-products-${base}` },
      certifications: (src.certifications || []).filter((c) => c !== 'USDA Organic'),
    }
    tx.createOrReplace(doc)
    console.log('conventional', doc._id, '| certs:', doc.certifications.join(', '))
  }
  await tx.commit()
  console.log(`Done: ${docs.length} conventional oils written.`)
})().catch((e) => { console.error(e.message); process.exit(1) })
