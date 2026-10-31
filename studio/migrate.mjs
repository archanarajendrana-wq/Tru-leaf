// One-time migration: pushes existing hardcoded site content into Sanity.
// Run with: SANITY_WRITE_TOKEN=sk... node migrate.mjs
// Delete the write token in sanity.io/manage once this has run successfully.

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const siteRoot = path.resolve(__dirname, '..')
const imagesDir = path.join(siteRoot, 'assets/images')

const token = process.env.SANITY_WRITE_TOKEN
if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN env var. Run: SANITY_WRITE_TOKEN=sk... node migrate.mjs')
  process.exit(1)
}

const client = createClient({
  projectId: 'qir915mw',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const imageAssetCache = new Map()

async function uploadImage(relativePath) {
  if (imageAssetCache.has(relativePath)) return imageAssetCache.get(relativePath)
  const filename = path.basename(relativePath)
  const filePath = path.join(imagesDir, filename)
  const buffer = readFileSync(filePath)
  console.log(`Uploading image: ${filename}`)
  const asset = await client.assets.upload('image', buffer, { filename })
  const ref = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  imageAssetCache.set(relativePath, ref)
  return ref
}

const products = [
  {
    name: 'Coconut Milk',
    category: 'Coconut',
    grade: 'organic',
    image: 'assets/images/product-card.png',
    botanicalName: 'Cocos nucifera',
    sourcedFrom: 'Ooty & Munnar (India)',
    shortDescription: 'Sustainably sourced from premium farms',
    description:
      "Organic coconut milk is extracted from fresh, grated coconut flesh and gently pressed to retain its natural richness. It's a nutritious, dairy-free staple widely used in curries, desserts and beverages. We source our premium coconut milk from several origins across South and Southeast Asia, supplying it fresh, UHT-packed or as concentrate.",
    order: 1,
    featured: true,
  },
  {
    name: 'Coconut Cream',
    category: 'Coconut',
    grade: 'organic',
    image: 'assets/images/product-card.png',
    botanicalName: 'Cocos nucifera',
    sourcedFrom: 'Ooty & Munnar (India)',
    shortDescription: 'Sustainably sourced from premium farms',
    description:
      'Organic coconut cream is a tropical staple rich in natural fats. This sweet treat is both nutritious and delicious. Our organic coconut cream is an important ingredient in curries, desserts and smoothies. We source our premium quality organic coconut cream from several origins in South Asia and Southeast Asia, supplying it as puree, paste or frozen slices (IQF).',
    order: 2,
    featured: true,
  },
  {
    name: 'Desiccated Coconut',
    category: 'Coconut',
    grade: 'organic',
    image: 'assets/images/product-card-2.png',
    botanicalName: 'Cocos nucifera',
    sourcedFrom: 'Ooty & Munnar (India)',
    shortDescription: 'Sustainably sourced from premium farms',
    description:
      "Desiccated coconut is made by drying and finely shredding fresh coconut meat, preserving its natural flavour and oils. It's a versatile ingredient for baking, confectionery and savoury dishes. We supply it in fine, medium and coarse grades, cleaned, graded and tested for purity before every shipment.",
    order: 3,
    featured: true,
  },
  {
    name: 'Extra Virgin Coconut Oil',
    category: 'Coconut',
    grade: 'organic',
    image: 'assets/images/product-card.png',
    botanicalName: 'Cocos nucifera',
    sourcedFrom: 'Ooty & Munnar (India)',
    shortDescription: 'Sustainably sourced from premium farms',
    description:
      'Extra virgin coconut oil is cold-pressed from fresh coconut meat without heat or chemicals, preserving its natural aroma and nutrients. Prized for cooking, skincare and haircare, we supply it in bulk, retail-ready and private-label packaging, tested for purity before every shipment.',
    order: 4,
    featured: true,
  },
  {
    name: 'Coconut Flour',
    category: 'Coconut',
    grade: 'organic',
    image: 'assets/images/product-card.png',
    botanicalName: 'Cocos nucifera',
    sourcedFrom: 'Ooty & Munnar (India)',
    shortDescription: 'Sustainably sourced from premium farms',
    description:
      "Coconut flour is milled from dried, defatted coconut meat, giving it a naturally sweet taste and a fine, soft texture. It's a popular gluten-free alternative for baking. We supply it cleaned, sifted and tested for purity before every shipment.",
    order: 5,
  },
  {
    name: 'Virgin Coconut Oil',
    category: 'Coconut',
    grade: 'organic',
    image: 'assets/images/product-card.png',
    botanicalName: 'Cocos nucifera',
    sourcedFrom: 'Ooty & Munnar (India)',
    shortDescription: 'Sustainably sourced from premium farms',
    description:
      'Virgin coconut oil is extracted from fresh coconut milk without refining, bleaching or deodorising, preserving its natural aroma and nutrients. We supply it in bulk, retail-ready and private-label packaging, tested for purity before every shipment.',
    order: 6,
  },
]

const posts = [
  {
    slug: 'traceability-trust',
    title: 'Why Traceability Changes How Buyers Trust a Shipment',
    excerpt: "Documentation alone doesn't build confidence. Here's how a verifiable chain of custody, from farm to freight, earns repeat orders.",
    category: 'Supply Chain',
    author: 'Renious Charles',
    date: '2026-03-04',
    readTime: '5 min read',
    image: 'assets/images/product-card.png',
    secondaryImage: 'assets/images/overlay-organic-farm.png',
    body: [
      'Most buyers have been burned at least once by paperwork that looked complete but didn\'t hold up. A certificate without a traceable chain of custody is just a document — it tells you what someone claims happened, not what actually happened between the farm and the port.',
      'That\'s the gap we built Truleaf to close. Every lot we export carries a record back to the specific farm cluster it came from: harvest date, processing facility, lab results, and every hand it passed through before it reached a container.',
      "Traceability isn't a feature we add on request — it's the operating condition for anything leaving our facilities. If a batch can't be traced, it doesn't ship, regardless of how good the product looks.",
      "For buyers, that changes the conversation. Instead of auditing us after something goes wrong, you can verify a shipment before it ever leaves origin — and that's what turns a one-off order into a long-term relationship.",
    ],
  },
  {
    slug: 'certification-audit',
    title: 'Inside an Organic Certification Audit',
    excerpt: 'What inspectors actually check on a farm visit, and why most documentation gaps show up long before the audit begins.',
    category: 'Certification',
    author: 'John Wesley',
    date: '2026-02-18',
    readTime: '6 min read',
    image: 'assets/images/trending-frame57.png',
    secondaryImage: 'assets/images/about-origin-figure.jpg',
    body: [
      'An organic certification audit rarely fails on the day of the inspection. By the time an inspector is walking the fields, most of the outcome has already been decided — in the record-keeping, the input logs, and the chain of custody built up over the preceding season.',
      'Inspectors look for consistency: do the purchase records match the yield, does the input log match what\'s actually in the soil, and can every step between harvest and storage be accounted for without gaps.',
      'We run internal mock audits with our farm partners well before the certifying body arrives, specifically to catch the small inconsistencies that trip up first-time exporters — a missing date, a batch number that doesn\'t reconcile, a storage log that wasn\'t updated.',
      'The result is an audit that confirms what we already know to be true, rather than one that surfaces surprises. That reliability is what lets our certifications hold up under buyer-side scrutiny, not just pass on paper.',
    ],
  },
  {
    slug: 'coconut-formats',
    title: 'Coconut Milk, Cream, or Desiccated — Choosing the Right Format',
    excerpt: "A buyer's guide to matching coconut product formats to shelf life, shipping cost, and end-use requirements.",
    category: 'Products',
    author: 'Renious Charles',
    date: '2026-02-05',
    readTime: '5 min read',
    image: 'assets/images/overlay-organic-farm.png',
    secondaryImage: 'assets/images/product-card.png',
    body: [
      'Coconut milk, cream, and desiccated coconut all start from the same fruit, but the format you choose shapes everything downstream — shelf life, freight cost, storage conditions, and how the ingredient behaves in your production line.',
      'Fresh coconut milk has the shortest shelf life and the highest freight cost per unit of usable product, but it carries the cleanest flavor profile for beverages and fresh-format desserts. UHT-packed and concentrate formats trade some of that freshness for dramatically better logistics economics.',
      'Desiccated coconut, by contrast, is built for shelf stability. Moisture content and grade (fine, medium, coarse) determine both its baking performance and how long it holds up in warehouse conditions without going rancid.',
      "We work with buyers early in the sourcing conversation to match format to use case — there's rarely a single \"best\" option, only the one that fits your supply chain and your product.",
    ],
  },
  {
    slug: 'direct-farm-sourcing',
    title: 'What Changes When You Source Direct From Farms',
    excerpt: 'Cutting out intermediaries reshapes pricing, documentation, and accountability — not always in the ways buyers expect.',
    category: 'Supply Chain',
    author: 'John Wesley',
    date: '2026-01-22',
    readTime: '5 min read',
    image: 'assets/images/hero-split.png',
    secondaryImage: 'assets/images/about-origin-figure.jpg',
    body: [
      'Direct farm sourcing sounds straightforward — remove the middleman, improve the margin. In practice, what actually changes is accountability. When a broker sits between you and the farm, a quality issue can get lost in translation. When you source direct, there\'s one line of responsibility, start to finish.',
      'That also means more upfront work. Direct relationships require investing in farm-level quality systems, training, and documentation standards that a broker would otherwise abstract away from you.',
      "We've spent years building that infrastructure with certified cooperatives and family farms across India's key growing regions, so our buyers get the pricing and transparency benefits of direct sourcing without having to build the farm relationships themselves.",
      'The result is cleaner documentation, more consistent quality shipment to shipment, and a direct line back to the source whenever a question comes up.',
    ],
  },
  {
    slug: 'global-compliance',
    title: 'Meeting Import Compliance Across Three Continents',
    excerpt: 'How we structure documentation to satisfy EU, North American, and Asia-Pacific import requirements at the same time.',
    category: 'Compliance',
    author: 'John Wesley',
    date: '2026-01-09',
    readTime: '7 min read',
    image: 'assets/images/about-origin-figure.jpg',
    secondaryImage: 'assets/images/hero-split.png',
    body: [
      'Export documentation that satisfies one market rarely satisfies all of them. EU import requirements emphasize traceability and residue testing; North American buyers often require additional FDA-aligned documentation; Asia-Pacific markets bring their own certification and labeling standards.',
      'Rather than building separate documentation pipelines per market, we structure our core compliance file — lab results, chain of custody, certifications — to be a superset that satisfies the strictest requirement across all three regions from the outset.',
      'That means a shipment bound for Rotterdam carries documentation that would also clear customs in Los Angeles or Singapore, with only minor market-specific paperwork added at the end rather than rebuilt from scratch.',
      'We also track regulatory changes proactively across all three regions, so our documentation standards shift ahead of a rule change rather than scrambling to catch up after one.',
    ],
  },
  {
    slug: 'inconsistent-supply-chain-cost',
    title: 'The Real Cost of an Inconsistent Supply Chain',
    excerpt: "Shipment-to-shipment variability is expensive in ways that don't show up on an invoice. Here's what to watch for.",
    category: 'Supply Chain',
    author: 'Renious Charles',
    date: '2025-12-15',
    readTime: '5 min read',
    image: 'assets/images/product-card-2.png',
    secondaryImage: 'assets/images/overlay-organic-farm.png',
    body: [
      "A supplier who delivers a great shipment once and an inconsistent one the next time isn't actually cheaper, even if the per-unit price is lower. The hidden costs — reformulation, delayed production runs, failed QC batches — rarely show up on the original invoice.",
      'Consistency comes from process, not luck: the same farm clusters, the same quality gates, the same testing protocol on every batch, regardless of order size or season.',
      "We measure our own performance on shipment-to-shipment variance, not just average quality, because a buyer planning a production schedule needs to know what they're getting is predictable, not just that it's good on a good day.",
      'That discipline is also why we talk buyers out of orders we can\'t reliably fill at the quality level they need — a short-term "no" protects the long-term consistency the relationship depends on.',
    ],
  },
  {
    slug: 'desiccated-coconut-grading',
    title: 'Desiccated Coconut: Grading, Moisture, and Shelf Life',
    excerpt: 'A closer look at the grading standards that determine whether a batch is fit for export, and how we test for them.',
    category: 'Products',
    author: 'John Wesley',
    date: '2025-12-02',
    readTime: '6 min read',
    image: 'assets/images/product-card.png',
    secondaryImage: 'assets/images/trending-frame57.png',
    body: [
      'Desiccated coconut grading comes down to three interlocking factors: particle size (fine, medium, or coarse), moisture content, and fat content — and getting any one of them wrong affects both performance in your product and shelf life in the warehouse.',
      'Moisture is the one that causes the most trouble. Too high, and a batch is vulnerable to mold and rancidity in transit; too low, and the texture suffers in baking applications. We test every batch against a tight moisture band before it ships, not just at the point of processing.',
      "Fat content matters just as much for flavor stability — higher-fat desiccated coconut has a shorter shelf life if storage conditions aren't controlled, which is why we pair grading data with specific storage and handling guidance for each shipment.",
      "None of this is visible from the outside of a bag. It's why we hand over full lab documentation with every shipment, so buyers aren't taking grading claims on faith.",
    ],
  },
  {
    slug: 'private-label-packaging',
    title: 'Private Label Packaging: What to Plan For',
    excerpt: "From minimum order quantities to artwork lead times, the details that make or break a private label run.",
    category: 'Packaging',
    author: 'Renious Charles',
    date: '2025-11-20',
    readTime: '4 min read',
    image: 'assets/images/trending-frame57.png',
    secondaryImage: 'assets/images/product-card-2.png',
    body: [
      "Private label runs fail for predictable reasons: artwork that isn't print-ready, minimum order quantities that don't match the buyer's actual demand forecast, and lead times that get discovered too late in the process to adjust.",
      "We start private label conversations with the constraints, not the design — packaging format, MOQ, target shelf date — so that by the time artwork is being finalized, there are no surprises left to find.",
      'Lead time is the one buyers most often underestimate. Between packaging procurement, label approval, and production scheduling, a private label run typically needs more runway than a standard bulk order, and we build that into the timeline from the first conversation.',
      "Done right, private label packaging is one of the highest-margin moves a buyer can make. Done without planning, it's the fastest way to miss a retail launch window.",
    ],
  },
  {
    slug: 'repeat-orders',
    title: 'Why We Measure Success in Repeat Orders',
    excerpt: "A one-off deal doesn't test a supply chain. Here's what we've learned from clients who've sourced with us for years.",
    category: 'Supply Chain',
    author: 'John Wesley',
    date: '2025-11-06',
    readTime: '5 min read',
    image: 'assets/images/overlay-organic-farm.png',
    secondaryImage: 'assets/images/product-card.png',
    body: [
      "Any supplier can deliver a good first shipment — there's no supply chain pressure yet, no accumulated history to strain under. The real test is the fifth order, placed after the relationship has absorbed a delayed harvest, a shipping delay, or a specification change.",
      "We track repeat order rate internally as a core health metric, above volume or revenue growth, because it's the clearest signal that what we're delivering holds up under real operating conditions over time.",
      "Clients who've sourced with us for years tell us the same thing: it isn't that nothing ever goes wrong, it's that when something does, they get a straight answer and a fix, not a defensive explanation.",
      "That's the standard every new relationship gets held to from the first order — because we're building for the fifth one, not just the first.",
    ],
  },
]

function toPortableText(paragraphs) {
  return paragraphs.map((text) => ({
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text }],
  }))
}

async function run() {
  console.log(`Migrating ${products.length} products...`)
  for (const p of products) {
    const image = await uploadImage(p.image)
    const doc = {
      _type: 'product',
      name: p.name,
      slug: { _type: 'slug', current: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') },
      category: p.category,
      grade: p.grade,
      image,
      shortDescription: p.shortDescription,
      description: p.description,
      botanicalName: p.botanicalName,
      sourcedFrom: p.sourcedFrom,
      featured: !!p.featured,
      order: p.order,
    }
    const id = `product-${doc.slug.current}`
    await client.createOrReplace({ _id: id, ...doc })
    console.log(`  ✓ ${p.name}`)
  }

  console.log(`\nMigrating ${posts.length} blog posts...`)
  for (const post of posts) {
    const image = await uploadImage(post.image)
    const secondaryImage = await uploadImage(post.secondaryImage)
    const doc = {
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      excerpt: post.excerpt,
      category: post.category,
      author: post.author,
      date: post.date,
      readTime: post.readTime,
      image,
      secondaryImage,
      body: toPortableText(post.body),
    }
    const id = `post-${post.slug}`
    await client.createOrReplace({ _id: id, ...doc })
    console.log(`  ✓ ${post.title}`)
  }

  console.log('\nDone. Open your Studio to see everything.')
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
