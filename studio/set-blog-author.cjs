// Sets the author on the five new blog posts. Run: npx sanity exec set-blog-author.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const posts = require('./blog-posts-content.cjs')
const client = getCliClient({ apiVersion: '2024-01-01' })
;(async () => {
  const tx = client.transaction()
  posts.forEach((p) => tx.patch(p.id, (x) => x.set({ author: 'Charles' })))
  const res = await tx.commit()
  console.log(`Done: ${res.results.length} posts updated.`)
})().catch((e) => { console.error(e.message); process.exit(1) })
