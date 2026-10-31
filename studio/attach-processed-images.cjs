// Uploads the generated photos for the processed fruit & vegetable products (assets/images/products) and sets each on
// both its conventional and organic Sanity product. Uses your logged-in Sanity CLI session.
// Run: npx sanity exec attach-processed-images.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const client = getCliClient({ apiVersion: '2024-01-01' })
const dir = path.resolve(__dirname, '../assets/images/products')

// file -> product id suffix (after "product-<grade>-")
const items = {
  'gherkins-in-vinegar': 'pickled-preserved-vegetables-gherkins-in-vinegar',
  'gherkins-in-acetic-acid': 'pickled-preserved-vegetables-gherkins-in-acetic-acid',
  'gherkins-in-brine': 'pickled-preserved-vegetables-gherkins-in-brine',
  'pineapple-pulp': 'juices-purees-pineapple-pulp',
  'tomato-paste': 'juices-purees-tomato-paste',
  'tomato-puree': 'juices-purees-tomato-puree',
  'pink-guava-puree': 'juices-purees-pink-guava-puree',
  'frozen-pineapple-pulp': 'frozen-fruits-vegetables-frozen-pineapple-pulp',
  'frozen-pineapple-dice': 'frozen-fruits-vegetables-frozen-pineapple-dice',
  'frozen-pineapple-slice': 'frozen-fruits-vegetables-frozen-pineapple-slice',
  'frozen-pineapple-chunks': 'frozen-fruits-vegetables-frozen-pineapple-chunks',
}

;(async () => {
  for (const [file, suffix] of Object.entries(items)) {
    const asset = await client.assets.upload('image', readFileSync(path.join(dir, `${file}.jpg`)), { filename: `${file}.jpg` })
    const image = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
    const tx = client.transaction()
    for (const grade of ['conventional', 'organic']) tx.patch(`product-${grade}-${suffix}`, (p) => p.set({ image }))
    await tx.commit()
    console.log('image set', file, '(conventional + organic)')
  }
  console.log('Done.')
})().catch((e) => { console.error(e.message); process.exit(1) })
