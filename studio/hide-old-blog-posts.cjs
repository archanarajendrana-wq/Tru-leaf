// Hides every blog post except the five from the client's PDFs by setting hidden: true on them.
// Nothing is deleted: untick "Hide from the website" on a post in the Studio to bring it back.
// Uses your logged-in Sanity CLI session. Run: npx sanity exec hide-old-blog-posts.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const posts = require('./blog-posts-content.cjs')
const client = getCliClient({ apiVersion: '2024-01-01' })

;(async () => {
  const keep = posts.map((p) => p.id)
  const others = await client.fetch('*[_type=="post" && !(_id in $keep)]{_id, title}', { keep })
  const tx = client.transaction()
  others.forEach((p) => tx.patch(p._id, (x) => x.set({ hidden: true })))
  // make sure the five shared posts are visible
  keep.forEach((id) => tx.patch(id, (x) => x.set({ hidden: false })))
  await tx.commit()
  others.forEach((p) => console.log('hidden:', p.title))
  console.log(`Done: ${others.length} posts hidden, ${keep.length} shown.`)
})().catch((e) => { console.error(e.message); process.exit(1) })
