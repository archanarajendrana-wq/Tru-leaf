// Uploads the generated private-label category cutouts (assets/images/category-normalized) and sets them on
// the matching Sanity categories. Uses your logged-in Sanity CLI session.
// Run: npx sanity exec attach-private-label-images.cjs --with-user-token [-- <slug> ...]
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const client = getCliClient({ apiVersion: '2024-01-01' })
const dir = path.resolve(__dirname, '../assets/images/category-normalized')
const all = ['pickles-cornichons', 'ready-to-drink-beverages', 'ready-to-cook-products', 'ready-to-eat-products', 'flavoured-energy-drink', 'healthy-snacks']
// optionally pass slugs after "--" to update just those, e.g. -- ready-to-drink-beverages
const allowed = [...all, 'coconut-products']
const picked = process.argv.slice(2).filter((a) => allowed.includes(a))
const slugs = picked.length ? picked : all

;(async () => {
  for (const slug of slugs) {
    const file = `category-${slug}.png`
    const asset = await client.assets.upload('image', readFileSync(path.join(dir, file)), { filename: file })
    await client.patch(`category-${slug}`).set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit()
    console.log('image set', slug)
  }
  console.log('Done.')
})().catch((e) => { console.error(e.message); process.exit(1) })
