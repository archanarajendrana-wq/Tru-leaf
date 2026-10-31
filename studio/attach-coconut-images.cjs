// Uploads the generated organic coconut product images (assets/images/products) and sets them on the
// matching Sanity products. Uses your logged-in Sanity CLI session.
// Run: npx sanity exec attach-coconut-images.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const client = getCliClient({ apiVersion: '2024-01-01' })
const dir = path.resolve(__dirname, '../assets/images/products')

const images = {
  'product-coconut-cream': 'coconut-cream.jpg',
  'product-virgin-coconut-oil': 'virgin-coconut-oil.jpg',
  'product-extra-virgin-coconut-oil': 'extra-virgin-coconut-oil.jpg',
  'product-coconut-flour': 'coconut-flour.jpg',
  'product-organic-coconut-products-coconut-water': 'coconut-water.jpg',
  'product-organic-coconut-products-grated-coconut-frozen': 'grated-coconut-frozen.jpg',
  'product-organic-coconut-products-coconut-oil': 'coconut-oil.jpg',
  'product-organic-coconut-products-coconut-butter': 'coconut-butter.jpg',
  'product-organic-coconut-products-coconut-fresh': 'coconut-fresh.jpg',
}

;(async () => {
  for (const [id, file] of Object.entries(images)) {
    const asset = await client.assets.upload('image', readFileSync(path.join(dir, file)), { filename: file })
    await client.patch(id).set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit()
    console.log('image set', id)
  }
  console.log('Done.')
})().catch((e) => { console.error(e.message); process.exit(1) })
