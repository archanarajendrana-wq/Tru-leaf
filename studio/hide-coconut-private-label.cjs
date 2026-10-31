// Takes Coconut Products off the Supply Chain page's "Categories You Can Private-Label" list by unticking its
// "Show on Private Label page" flag. The category itself is untouched everywhere else (catalogue, products pages).
// Uses your logged-in Sanity CLI session. Run: npx sanity exec hide-coconut-private-label.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const client = getCliClient({ apiVersion: '2024-01-01' })
;(async () => {
  await client.patch('category-coconut-products').set({ privateLabel: false }).commit()
  console.log('Coconut Products removed from the private-label list')
})().catch((e) => { console.error(e.message); process.exit(1) })
