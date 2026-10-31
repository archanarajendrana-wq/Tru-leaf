// Uploads the generated cover images (assets/images/blog) and sets each as the cover of its blog post in Sanity.
// Uses your logged-in Sanity CLI session. Run: npx sanity exec attach-blog-covers.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const posts = require('./blog-posts-content.cjs')

const client = getCliClient({ apiVersion: '2024-01-01' })
const dir = path.resolve(__dirname, '../assets/images/blog')

;(async () => {
  for (const p of posts) {
    const file = `${p.slug}.jpg`
    const asset = await client.assets.upload('image', readFileSync(path.join(dir, file)), { filename: file })
    await client.patch(p.id).set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit()
    console.log('cover set', p.id)
  }
  console.log('Done.')
})().catch((e) => { console.error(e.message); process.exit(1) })
