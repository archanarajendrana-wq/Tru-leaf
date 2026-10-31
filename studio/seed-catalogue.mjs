// Seeds the Product Catalogue structure into Sanity:
//   grade (Organic / Conventional Ingredients)  ->  subcategories (Category documents)  ->  products
// Source: "Truleaf products.pdf" (product roster) and "Trending Products Details.pdf" (coconut product details).
//
// Dry run (default): prints what would change, writes nothing.
//   SANITY_WRITE_TOKEN=<token> node seed-catalogue.mjs
// Apply:
//   SANITY_WRITE_TOKEN=<token> node seed-catalogue.mjs --apply
//
// Create the token (Editor role) at sanity.io/manage > API > Tokens and delete it afterwards.
// Deploy the Studio schema first (npx sanity deploy) so the new fields show in the editor.
//
// Existing documents only get catalogue fields (and detail text where the PDF has it) set; their
// images, featured flags and names are left alone. New categories upload their image; new products
// are created unfeatured with no image (add images in the Studio). Safe to re-run.

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const apply = process.argv.includes('--apply')
const token = process.env.SANITY_WRITE_TOKEN
if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN env var.')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.resolve(__dirname, '../assets/images/category-normalized')

const client = createClient({
  projectId: 'qir915mw',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

const ALL_CERTS = ['BRCGS', 'USDA Organic', 'Kosher', 'Non-GMO Project Verified']
const OILS_PACKAGING =
  '20 kg pail, 180 kg / 190 kg steel drum, 920 kg IBC tote, Retail 500 mL Glass Bottle, Retail 1000 mL Glass Bottle, 250 / 500 / 1000 mL PET Bottles'
const MILK_CREAM_ORIGIN = 'India, Sri Lanka, Thailand, Indonesia and Philippines'

// isNew: true -> created if missing (with slug, category, order); otherwise patched only.
const DETAILS_SOURCE = [
  {
    _id: 'product-coconut-milk',
    name: 'Coconut Milk',
    description:
      'Coconut milk is derived from fresh coconut flesh through a process of extraction and dilution from Coconut cream and it has a richer consistency and contains a greater proportion of coconut fat, giving it a more concentrated texture and flavor. It is widely finding applications in plant-based food products, particularly as a base for dairy-free yogurt, frozen desserts, beverages, and smoothies.',
    packaging:
      '20 kg aseptic bag-in-box, 200 kg aseptic bag-in-drum, Retorted Canned 200 mL, 400 mL, 180 mL Tetra Pak and 250 mL Tetra Pak',
    gradeDetails:
      'Organic Coconut Milk 18% Fat, Organic Coconut Milk 17% - 19% Fat, Organic Coconut Milk 12% Fat. Also Conventional Coconut Milk 18% Fat, Conventional Coconut Milk 17% - 19% Fat, Conventional Coconut Milk 12% Fat. With and without stabilizers.',
    sourcedFrom: MILK_CREAM_ORIGIN,
    shelfLife: '18 Months',
    storage: 'Ambient Temperature',
    certifications: ALL_CERTS,
  },
  {
    _id: 'product-coconut-cream',
    name: 'Coconut Cream',
    description:
      'Coconut Cream is a rich, smooth coconut ingredient with a naturally creamy texture and distinctive coconut taste, widely used in plant-based foods, dairy-free desserts, beverages, sauces, curries, and bakery products. Coconut Cream (Cocos nucifera) is sourced from trusted processing partners across India, Sri Lanka, Thailand, Indonesia and Philippines supporting consistent supply for food manufacturers and ingredient buyers.',
    packaging:
      '20 kg aseptic bag-in-box, 200 kg aseptic bag-in-drum, Retorted Canned 200 mL, 400 mL, 180 mL Tetra Pak, 250 mL Tetra Pak',
    gradeDetails:
      'Organic Coconut Cream 24% Fat, Organic Coconut Cream 23% - 25% Fat, Conventional Coconut Cream 24% Fat, Conventional Coconut Cream 23% - 25% Fat. With and without stabilizers.',
    sourcedFrom: MILK_CREAM_ORIGIN,
    shelfLife: '18 Months',
    storage: 'Ambient Temperature',
    certifications: ALL_CERTS,
  },
  {
    _id: 'product-desiccated-coconut',
    name: 'Desiccated Coconut',
    description:
      'Desiccated Coconut is produced from the white flesh of mature coconuts, with the outer brown skin removed before the kernel is processed and dried into different particle sizes. Naturally sweet with a pleasant coconut aroma and chewy texture, Desiccated Coconut is available in different cuts and particle sizes for use in bakery products, confectionery, desserts, cereals, snacks, and food toppings.',
    packaging: '25 kg, 200 g, 500 g, 1 kg',
    gradeDetails:
      'Organic High Fat Desiccated Coconut (Fat 60% above), Organic Medium Fat Desiccated Coconut (Fat 40% above), Organic Low Fat Desiccated Coconut (Fat 30% above). Conventional grade also available.',
    sourcedFrom: 'India, Sri Lanka',
    shelfLife: '12 Months',
    storage: 'Ambient Temperature',
    certifications: ALL_CERTS,
  },
  {
    _id: 'product-virgin-coconut-oil',
    name: 'Virgin Coconut Oil',
    description:
      'Available in organic and conventional options, Virgin Coconut Oil is a versatile ingredient for food manufacturers and culinary applications. Its characteristic coconut aroma and flavor complement a variety of products, including bakery, confectionery, cooking, and plant-based formulations. The oil is obtained from coconut flesh using processing methods selected to maintain its natural characteristics.',
    packaging: OILS_PACKAGING,
    gradeDetails: 'Organic Cold Pressed Virgin Coconut Oil, Extra Virgin Coconut Oil. Conventional grade also available.',
    sourcedFrom: 'India',
    shelfLife: '24 Months',
    storage: 'Ambient Temperature',
    certifications: ALL_CERTS,
  },
  {
    _id: 'product-coconut-flour',
    name: 'Coconut Flour',
    description:
      'Coconut Flour is a finely milled ingredient made from the coconut solids remaining after oil extraction. Naturally gluten-free and rich in dietary fibre, it carries a mild coconut taste and aroma, making it a suitable ingredient for bakery products, confectionery, nutritional foods, and a range of plant-based formulations.',
    packaging: '25 kg, 100 g, 250 g, 500 g. Other sizes on request.',
    gradeDetails: 'Organic Coconut Flour, Conventional Coconut Flour.',
    sourcedFrom: 'India',
    shelfLife: '24 Months',
    storage: 'Ambient Temperature',
    certifications: ALL_CERTS,
  },
  {
    _id: 'product-coconut-water',
    slug: 'coconut-water',
    order: 7,
    isNew: true,
    name: 'Coconut Water',
    description:
      'Naturally obtained from young coconuts, Coconut Water is a refreshing plant-based beverage known for its light taste and naturally occurring minerals. With minimal fat and a naturally modest sugar profile, it is widely used in beverages, hydration products, smoothies, and functional drink formulations.',
    packaging: '20 kg aseptic bag-in-box, 200 kg aseptic bag-in-drum, 180 mL Tetra Pak, 250 mL Tetra Pak. Gable top packs on request.',
    gradeDetails: 'Organic Coconut Water, Conventional Coconut Water.',
    sourcedFrom: 'India',
    shelfLife: '12 Months',
    storage: 'Ambient Temperature',
    certifications: ALL_CERTS,
  },
  {
    _id: 'product-rbd-coconut-oil',
    slug: 'rbd-coconut-oil',
    order: 8,
    isNew: true,
    name: 'RBD Coconut Oil',
    description:
      'RBD Coconut Oil is a versatile, refined coconut-based fat designed for applications where a clean sensory profile and dependable performance are required. Its mild taste, light appearance, and good oxidative stability make it suitable for frying, cooking, bakery, confectionery, and other large-scale food manufacturing processes. The oil is obtained from copra and undergoes refining, bleaching, and deodorization to achieve the desired food-grade characteristics.',
    packaging: OILS_PACKAGING,
    gradeDetails: 'Clear to pale yellow. Conventional grade.',
    sourcedFrom: 'India',
    shelfLife: '18 Months',
    storage: 'Ambient Temperature',
    certifications: ['BRCGS'],
  },
  {
    _id: 'product-mct-coconut-oil',
    slug: 'mct-coconut-oil',
    order: 9,
    isNew: true,
    name: 'MCT Coconut Oil',
    description:
      'MCT Oil is a concentrated source of medium-chain fatty acids, primarily Caprylic (C8) and Capric (C10). It is produced by separating selected fractions from coconut oil to achieve specific MCT concentrations and compositions. Depending on the intended application, it can be supplied in standardized C8:C10 ratios such as 60:40 and 70:30, specialty blends, or higher-purity C8 and C10 fractions. Organic options derived exclusively from coconut oil are also available.',
    packaging: OILS_PACKAGING + '. Organic and conventional both available.',
    gradeDetails: 'Organic and conventional both available.',
    sourcedFrom: 'India',
    shelfLife: '24 Months',
    storage: 'Ambient Temperature',
    certifications: ALL_CERTS,
  },
  {
    _id: 'product-grated-coconut-frozen',
    slug: 'grated-coconut-frozen',
    order: 10,
    isNew: true,
    name: 'Grated Coconut (Frozen)',
    description:
      'Prepared from selected coconut flesh with the outer brown layer removed, this frozen grated coconut provides a ready-to-use ingredient while maintaining the natural taste and texture of coconut. Its fine grated form makes it convenient for a variety of sweet and savoury preparations, including curries, bakery products, desserts, smoothies, fillings, and toppings.',
    packaging: '100 g, 250 g, 500 g. Other sizes on request.',
    gradeDetails:
      'Organic Frozen Grated Coconut (without testa brown skin), Organic Frozen Grated Coconut (with testa brown skin). Conventional grade also available.',
    sourcedFrom: 'India',
    shelfLife: '18 Months',
    storage: 'Frozen, -18°C',
    certifications: ALL_CERTS,
  },
]

// Detail text keyed by product name (applies to both the organic and conventional entry).
const detailsByName = Object.fromEntries(
  DETAILS_SOURCE.map(({ _id, isNew, slug, order, ...fields }) => [fields.name, fields]),
)

// Subcategories, as in the client's "PLP Updated file.pdf". organicOrder / conventionalOrder = position in that
// grade's list (omit = not shown there). image: file in assets/images/category-normalized.
const CATEGORIES = [
  { _id: 'category-coconut-products', existing: true, slug: 'coconut-products', organicOrder: 1, conventionalOrder: 1 },
  {
    _id: 'category-fruits-vegetables', slug: 'fruits-vegetables', name: 'Fruits & Vegetables',
    shortDescription: 'Fresh produce graded and packed for export.',
    image: 'category-fruits-vegetables.png', organicOrder: 2, conventionalOrder: 4,
  },
  {
    _id: 'category-edible-oils', slug: 'edible-oils', name: 'Edible Oils',
    shortDescription: 'Cold-pressed and refined oils in bulk and retail packs.',
    image: 'category-edible-oils.png', organicOrder: 3, conventionalOrder: 5,
  },
  {
    _id: 'category-juices-purees', slug: 'juices-purees', name: 'Juices & Purees',
    shortDescription: 'Fruit juices and purees for beverage and food makers.',
    image: 'category-juices-purees.png', organicOrder: 4, conventionalOrder: 3,
  },
  {
    _id: 'category-pickled-preserved-vegetables', slug: 'pickled-preserved-vegetables', name: 'Pickled & Preserved Vegetables',
    shortDescription: 'Pickled and preserved vegetables, ready for retail and food service.',
    image: 'category-pickled-vegetables.png', conventionalOrder: 2,
  },
  {
    _id: 'category-frozen-fruits-vegetables', slug: 'frozen-fruits-vegetables', name: 'Frozen Fruits & Vegetables',
    shortDescription: 'Frozen fruits and vegetables with the cold chain intact.',
    image: 'category-frozen-produce.png', conventionalOrder: 6,
  },
]

const COCONUT = [
  'Coconut Milk', 'Coconut Cream', 'Desiccated Coconut', 'Virgin Coconut Oil', 'Extra Virgin Coconut Oil',
  'Coconut Water', 'Grated Coconut (Frozen)', 'Coconut Flour', 'Coconut Oil', 'Coconut Butter', 'Coconut Fresh',
]

// Product roster per grade and subcategory, in the PDF's order (from "Truleaf products.pdf").
// NOT yet placed (no matching subcategory in the client's PLP): Millets (Ragi, Pearl Millet), Spices
// (Green Chilli, Nutmeg, Black Pepper), Spray Dried Vegetable / Fruit Powders and Vegetable Paste & Brine.
// Edible Oils lists the coconut oils via "Also list under" (see add-edible-oils.cjs).
const ROSTER = [
  { grade: 'organic', category: 'coconut-products', names: COCONUT },
  {
    grade: 'organic', category: 'fruits-vegetables',
    names: ['Pineapple', 'Moringa', 'Mango', 'Amla', 'Turmeric (Fresh)', 'Onion', 'Guava', 'Jackfruit', 'Rambutan', 'Dragon Fruit', 'Ginger', 'Green Chilli', 'Tamarind'],
  },
  { grade: 'conventional', category: 'coconut-products', names: [...COCONUT, 'Coconut Milk Powder', 'Coconut Water Concentrate'] },
  { grade: 'conventional', category: 'pickled-preserved-vegetables', names: ['Gherkins in Vinegar', 'Gherkins in Acetic Acid', 'Gherkins in Brine'] },
  { grade: 'conventional', category: 'juices-purees', names: ['Pineapple Pulp', 'Tomato Paste', 'Tomato Puree', 'Pink Guava Puree'] },
  // details for these come from update-processed-products.cjs ("processed Fruit and Vegetable category.pdf")
  { grade: 'conventional', category: 'frozen-fruits-vegetables', names: ['Frozen Pineapple Pulp', 'Frozen Pineapple Dice', 'Frozen Pineapple Slice', 'Frozen Pineapple Chunks'] },
  {
    grade: 'conventional', category: 'fruits-vegetables',
    names: ['Turmeric (Fresh)', 'Cucumber', 'Red Onion', 'White Onion', 'Jackfruit', 'Drumstick', 'Guava'],
  },
]

// Products that already exist in Sanity (organic coconut) keep their ids.
const EXISTING_IDS = {
  'Coconut Milk': 'product-coconut-milk',
  'Coconut Cream': 'product-coconut-cream',
  'Desiccated Coconut': 'product-desiccated-coconut',
  'Virgin Coconut Oil': 'product-virgin-coconut-oil',
  'Extra Virgin Coconut Oil': 'product-extra-virgin-coconut-oil',
  'Coconut Flour': 'product-coconut-flour',
}

const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]))

// ---- categories ----
for (const c of CATEGORIES) {
  const flags = {
    showOrganic: c.organicOrder != null,
    showConventional: c.conventionalOrder != null,
    ...(c.organicOrder != null && { organicOrder: c.organicOrder }),
    ...(c.conventionalOrder != null && { conventionalOrder: c.conventionalOrder }),
  }
  console.log(`${apply ? 'WRITE' : 'DRY  '} category ${c.existing ? 'set flags' : 'create   '} ${c._id}${c.image === null ? '  (no image yet)' : ''}`)
  if (!apply) continue
  if (c.existing) {
    await client.patch(c._id).set(flags).commit()
    continue
  }
  const doc = {
    _id: c._id, _type: 'category', name: c.name, slug: { _type: 'slug', current: c.slug },
    shortDescription: c.shortDescription, featured: false, ...flags,
  }
  if (c.image) {
    const asset = await client.assets.upload('image', readFileSync(path.join(imagesDir, c.image)), { filename: c.image })
    doc.image = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  }
  await client.createOrReplace(doc)
}

// ---- products ----
const tx = client.transaction()
let created = 0
let updated = 0
for (const { grade, category, names } of ROSTER) {
  const cat = catById[category]
  names.forEach((name, i) => {
    const existingId = grade === 'organic' && category === 'coconut-products' ? EXISTING_IDS[name] : undefined
    const _id = existingId || `product-${grade}-${category}-${slugify(name)}`
    const { name: _n, ...details } = detailsByName[name] || {}
    const fields = {
      ...details,
      ...(category === 'coconut-products' && { botanicalName: 'Cocos nucifera' }),
      category: cat.name, // label shown on cards and in search
      parentCategory: { _type: 'reference', _ref: cat._id },
      order: i + 1,
    }
    if (!existingId) {
      tx.createIfNotExists({
        _id, _type: 'product', name, grade, featured: false,
        slug: { _type: 'slug', current: `${grade}-${category}-${slugify(name)}` },
      })
      created++
    } else {
      updated++
    }
    tx.patch(_id, (p) => p.set(fields))
  })
}
console.log(`${apply ? 'WRITE' : 'DRY  '} products: ${created} to create (if missing), ${updated} existing to update`)

if (!apply) {
  console.log('\nDry run only. Re-run with --apply to write these changes.')
} else {
  const res = await tx.commit()
  console.log(`\nDone: ${res.results.length} product operations committed.`)
}
