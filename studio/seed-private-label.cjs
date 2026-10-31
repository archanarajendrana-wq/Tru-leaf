// Creates the Private Label categories (published) if they don't exist yet.
// Run: npx sanity exec seed-private-label.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const client = getCliClient({ apiVersion: '2024-01-01' })

const cats = [
  ['coconut-products', 'Coconut Products', 'Sustainably sourced from premium farms.', 'coconut-halves.png'],
  ['pickles-cornichons', 'Pickles / Cornichons', 'Crisp, brined and ready to pack under your label.'],
  ['ready-to-drink-beverages', 'Ready to Drink Beverages', 'Bottled and canned drinks, formulated to your spec.'],
  ['ready-to-cook-products', 'Ready to Cook Products', 'Prepped bases, spice blends and kits for the home kitchen.'],
  ['ready-to-eat-products', 'Ready to Eat Products', 'Shelf-stable meals and sides, packed and sealed for retail.'],
  ['flavoured-energy-drink', 'Flavoured Energy Drink', 'Functional, flavoured drinks developed with our R&D team.'],
  ['healthy-snacks', 'Healthy Snacks', 'Better-for-you snacks made from traceable ingredients.'],
]

;(async () => {
  for (const [i, [slug, name, shortDescription, img]] of cats.entries()) {
    const _id = `category-${slug}`
    const existing = await client.fetch('*[_type=="category" && (name==$name || _id==$id)][0]{_id}', { name, id: _id })
    if (existing) {
      await client.patch(existing._id).set({ privateLabel: true, privateLabelOrder: i + 1 }).commit()
      console.log('updated', name)
      continue
    }
    const doc = {
      _id, _type: 'category', name, shortDescription,
      slug: { _type: 'slug', current: slug },
      featured: false, privateLabel: true, privateLabelOrder: i + 1,
    }
    if (img) {
      const asset = await client.assets.upload('image', readFileSync(path.join(__dirname, '../assets/images', img)), { filename: img })
      doc.image = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
    }
    await client.createOrReplace(doc)
    console.log('created', name)
  }
})().catch((e) => { console.error(e.message); process.exit(1) })
