// Creates (or replaces) the five blog posts from the client's PDFs in Sanity, using your logged-in CLI session.
// Content lives in blog-posts-content.cjs. Cover images reuse images already in Sanity (placeholders: replace in the Studio).
//
// Dry run: npx sanity exec seed-blog-posts.cjs --with-user-token
// Apply:   npx sanity exec seed-blog-posts.cjs --with-user-token -- --apply
const { getCliClient } = require('sanity/cli')
const posts = require('./blog-posts-content.cjs')

const apply = process.argv.includes('--apply')
const client = getCliClient({ apiVersion: '2024-01-01' })

let keyN = 0
const key = () => `k${(keyN++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

// inline: **bold** and [text](url)
function spans(text) {
  const children = []
  const markDefs = []
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  let last = 0
  let m
  while ((m = re.exec(text))) {
    if (m.index > last) children.push({ _type: 'span', _key: key(), text: text.slice(last, m.index), marks: [] })
    if (m[1]) {
      children.push({ _type: 'span', _key: key(), text: m[1], marks: ['strong'] })
    } else {
      const k = key()
      markDefs.push({ _key: k, _type: 'link', href: m[3] })
      children.push({ _type: 'span', _key: key(), text: m[2], marks: [k] })
    }
    last = re.lastIndex
  }
  if (last < text.length) children.push({ _type: 'span', _key: key(), text: text.slice(last), marks: [] })
  return { children, markDefs }
}

function toBlocks(src) {
  return src
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      let style = 'normal'
      let listItem
      let text = line
      if (line.startsWith('## ')) { style = 'h3'; text = line.slice(3) }
      else if (line.startsWith('# ')) { style = 'h2'; text = line.slice(2) }
      else if (line.startsWith('- ')) { listItem = 'bullet'; text = line.slice(2) }
      else if (/^\d+\.\s/.test(line) && !/^\d+\.\s[A-Z][^.]*$/.test('')) {
        // "1. Intended application..." numbered list item (sub-heading lines start with "## " so no clash)
        listItem = 'number'; text = line.replace(/^\d+\.\s/, '')
      }
      const { children, markDefs } = spans(text)
      const block = { _type: 'block', _key: key(), style, markDefs, children }
      if (listItem) { block.listItem = listItem; block.level = 1 }
      return block
    })
}

const plain = (blocks) => blocks.map((b) => b.children.map((c) => c.text).join('')).join(' ')

function excerptOf(blocks) {
  const first = plain([blocks[0]])
  if (first.length <= 240) return first
  return first.slice(0, 236).replace(/\s+\S*$/, '') + '...'
}

;(async () => {
  // placeholder covers: reuse existing blog cover images (distinct ones, newest first)
  const covers = await client.fetch('*[_type=="post" && defined(image) && !(_id in $ids)] | order(date desc){"ref": image.asset._ref}', { ids: posts.map((p) => p.id) })
  const refs = [...new Set(covers.map((c) => c.ref))]

  const tx = client.transaction()
  posts.forEach((p, i) => {
    const body = toBlocks(p.body)
    const words = plain(body).split(/\s+/).length
    const doc = {
      _id: p.id,
      _type: 'post',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      excerpt: excerptOf(body),
      category: p.category,
      date: p.date,
      readTime: `${Math.max(1, Math.round(words / 200))} min read`,
      body,
    }
    if (refs.length) doc.image = { _type: 'image', asset: { _type: 'reference', _ref: refs[i % refs.length] } }
    tx.createOrReplace(doc)
    console.log(`${apply ? 'WRITE' : 'DRY  '} ${p.id}  |  ${doc.readTime}  |  ${body.length} blocks  |  ${p.date}  |  ${p.category}`)
  })
  if (apply) {
    const res = await tx.commit()
    console.log(`Done: ${res.results.length} posts written.`)
  } else {
    console.log('Dry run only. Re-run with "-- --apply" to write.')
  }
})().catch((e) => { console.error(e.message); process.exit(1) })
