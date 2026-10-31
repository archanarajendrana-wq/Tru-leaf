// Adds the 11 conventional processed fruit & vegetable products from "processed Fruit and Vegetable category.pdf"
// (Pickled & Preserved Vegetables, Juices & Purees, Frozen Fruits & Vegetables) and creates those three subcategories
// if they don't exist yet (without catalogue flags, so the catalogue's built-in list is unaffected until the full
// catalogue seed runs). Uses your logged-in Sanity CLI session.
//
// Run: npx sanity exec update-processed-products.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const { readFileSync } = require('node:fs')
const path = require('node:path')

const client = getCliClient({ apiVersion: '2024-01-01' })
const imagesDir = path.resolve(__dirname, '../assets/images/category-normalized')

const CERTS = ['Halal', 'Kosher', 'FSSC 22000']
const GHERKIN_PACK = '240/260 liters in HMHDPE Food Grade Drums and 17.5 liters white colour pails/buckets'
const TOMATO_STORAGE = 'Product should be stored at ambient temperature and not below 4 deg C. Avoid exposure to higher temperature and sunlight.'
const FROZEN_SHELF = '24 Months without interruptions on the cold chain'

const categories = {
  'pickled-preserved-vegetables': {
    name: 'Pickled & Preserved Vegetables',
    shortDescription: 'Pickled and preserved vegetables, ready for retail and food service.',
    image: 'category-pickled-vegetables.png',
  },
  'juices-purees': {
    name: 'Juices & Purees',
    shortDescription: 'Fruit juices and purees for beverage and food makers.',
    image: 'category-juices-purees.png',
  },
  'frozen-fruits-vegetables': {
    name: 'Frozen Fruits & Vegetables',
    shortDescription: 'Frozen fruits and vegetables with the cold chain intact.',
    image: 'category-frozen-produce.png',
  },
}

const P = (...paras) => paras.join('\n\n')

const products = [
  {
    category: 'pickled-preserved-vegetables',
    name: 'Gherkins in Vinegar',
    botanicalName: 'Cucumis sativus (L.)',
    description: P(
      'Gherkins intended for preservation in natural alcoholic vinegar are picked while still young and small, generally ranging from 12 to 25 millimetres in length. At this stage of maturity, the vegetables possess a naturally firm structure and crisp bite, making them particularly suitable for premium and gourmet applications.',
      'The prepared product is immersed in a precisely formulated solution containing water, natural alcoholic vinegar, sodium chloride (salt), calcium chloride, and potassium metabisulphite. The combination is designed to develop a characteristic acidic flavour while supporting stability, texture retention, and food safety throughout storage. The finished gherkins exhibit an appealing green appearance, varying from pale green to deeper green shades, along with a fresh and crunchy mouthfeel.',
      'Under appropriate storage conditions, the product can remain suitable for consumption for up to 24 months from the date of manufacture. Combining established pickling practices with controlled processing parameters and stringent quality requirements enables these gherkins to satisfy international standards while retaining their characteristic colour, flavour, and crisp texture.',
    ),
    packaging: GHERKIN_PACK,
    gradeDetails: 'Size / caliber (diameter or length of gherkins): 20/30; 1/4 cm, 2/5 cm, 3/6 cm, 4/7 cm, 6/9 cm (length basis); 21/27 mm, 28/40 mm (diameter basis).',
    shelfLife: '12 Months',
    storage: 'Ambient Temperature',
  },
  {
    category: 'pickled-preserved-vegetables',
    name: 'Gherkins in Acetic Acid',
    botanicalName: 'Cucumis sativus (L.)',
    description: P(
      'Pickled Gherkins in Acetic Acid are sourced from the fertile agricultural regions of South India, where young cucumbers are carefully gathered to retain their crispness, freshness, and characteristic taste. Following stringent selection, the produce undergoes grading, cleaning, and soaking before being immersed in a formulated preservation solution containing water, acetic acid, sodium chloride (salt), calcium chloride, and potassium metabisulphite.',
      'This controlled preparation develops a pleasant, distinctive tang while preserving the naturally firm and crunchy bite of the vegetables. Selected at an ideal stage of maturity, the gherkins offer a fresh texture and appealing flavour suited to a variety of culinary applications. Their natural green appearance, ranging from pale green to deep green shades, is effectively retained during processing and storage.',
    ),
    packaging: GHERKIN_PACK,
    gradeDetails: 'Size / caliber (diameter or length of gherkins): 300+ (20/30); 150/300 (10/30); 120/300 (1/4 cm); 80/120 (2/5 cm); 60/80 (3/6 cm); 80/150 (4/7 cm); 60/160 (5/8 cm); 30/60 (6/9 cm), all on a length basis.',
    shelfLife: '12 Months',
    storage: 'Ambient Temperature',
  },
  {
    category: 'pickled-preserved-vegetables',
    name: 'Gherkins in Brine',
    botanicalName: 'Cucumis sativus (L.)',
    description: P(
      'Fermented gherkins are selected at an early stage of maturity, with individual fruits measuring approximately 12–25 millimetres in length. Once sorted for uniformity, they undergo thorough cleaning and soaking before being transferred into food-grade High-Density Polyethylene (HDPE) barrels.',
      'For preservation, the produce is immersed in a naturally prepared brine comprising water, sodium chloride, and calcium chloride. The controlled fermentation develops a distinctive flavour profile while helping the vegetables retain their characteristic firmness and crisp bite. During maturation, they gradually develop an attractive colour ranging from light green to olive green, resulting in a natural and appealing appearance.',
      'To maintain consistent quality, the brine concentration is regulated at 15% sodium chloride, with an allowable deviation of ±1%. Through natural lactic fermentation, the acidity is maintained above 0.6% (expressed as lactic acid), while the pH remains below 3.5. These controlled conditions support proper fermentation, preservation, and product stability.',
    ),
    packaging: '240/260 liters in HMHDPE Food Grade Drums',
    gradeDetails: 'Size / caliber (diameter or length of gherkins): 300+ (5/10); 150/300 (10/30); 100/160 (3/6 cm); 60/100 (6/9 cm); 40/60 (9/12 cm), all on a length basis; 30/40 (21/27 mm); 20/30 (27/32 mm); 10/20 (32/40 mm), all on a diameter basis.',
    shelfLife: '24 Months',
    storage: 'Ambient Temperature',
  },
  {
    category: 'juices-purees',
    name: 'Pineapple Pulp',
    botanicalName: 'Ananas comosus',
    description: P(
      'Our aseptic pineapple pulp is produced from fresh, GI-tagged pineapples sourced from Kerala, selected for their natural flavour, aroma, colour, and maturity. The prepared pineapple pieces are then crushed using a fruit mill to obtain a smooth, uniform puree. This puree undergoes aseptic processing, a controlled preservation method designed to maintain its quality while ensuring microbiological safety.',
      "Following treatment, the finished pineapple puree is filled into aseptic packaging and packed in MS drums for hygienic handling, transportation, and storage. This carefully managed process helps preserve the fruit's characteristic taste, colour, aroma, and consistency, making the pulp suitable for a wide range of food and beverage applications.",
    ),
    packaging: '20 kg aseptic bag-in-box, 200 kg aseptic bag-in-drum, canned 3.03 kg (108 oz), 820 g (30 oz), 560 g (20 oz), 425 g (15 oz) and 227 g (8 oz)',
    shelfLife: '24 Months',
    storage: 'Ambient Temperature',
  },
  {
    category: 'juices-purees',
    name: 'Tomato Paste',
    botanicalName: 'Solanum lycopersicum',
    description: P(
      'Aseptic tomato paste is produced from carefully selected, ripe red tomatoes processed under controlled hygienic conditions. The raw material undergoes thorough washing followed by final inspection to remove unsuitable or defective fruits. The selected tomatoes are then crushed and subjected to Hot Break treatment at 85–90°C before pulping and finishing.',
      'The resulting tomato pulp is concentrated to achieve the desired consistency and then passed through a series of foreign-matter control systems, including magnetic traps, strainers, and metal detectors.',
    ),
    packaging: 'Product net weight: 228 kg, or as per customer requirement',
    gradeDetails: 'Aseptic tomato paste (28°–30° Brix)',
    shelfLife: '18 Months',
    storage: TOMATO_STORAGE,
  },
  {
    category: 'juices-purees',
    name: 'Tomato Puree',
    botanicalName: 'Solanum lycopersicum',
    description: P(
      'Tomato Puree is made by concentrating pure tomato juice after the seeds and skin have been removed out of sound, fully ripe tomato. The juice is passed through a 0.7 mm sieve and concentrated by evaporation of water from the juice.',
      'The product is derived from firm, sound, red ripe tomatoes. The tomato juice is passed through a 0.5 mm sieve to remove seeds, skin and external matter. It possesses the characteristic flavour and taste.',
    ),
    packaging: 'Product net weight: 220 kg, or as per customer requirement',
    gradeDetails: 'Aseptic tomato puree (20°–22° Brix)',
    shelfLife: '18 Months',
    storage: TOMATO_STORAGE,
  },
  {
    category: 'juices-purees',
    name: 'Pink Guava Puree',
    botanicalName: 'Psidium guajava',
    description: P(
      'Fruit puree is produced from fresh, sound, fully ripe fruits, using a suitable processing method carried out in accordance with GMP. During preparation, unwanted components such as the skin, seeds, and other hard or inedible materials are carefully removed.',
      "The resulting product is a non-fermented, non-alcoholic, non-concentrated, and non-diluted fruit preparation obtained directly from pulpy fruits. Careful handling and controlled processing help retain the fruit's natural characteristics while ensuring a consistent and wholesome ingredient suitable for further food and beverage applications.",
    ),
    packaging: 'Product net weight: 220 kg; canned 3.10 kg',
    gradeDetails: 'Aseptic pink guava puree, 14/16° Brix',
    shelfLife: '24 Months',
    storage: TOMATO_STORAGE,
  },
  {
    category: 'frozen-fruits-vegetables',
    name: 'Frozen Pineapple Pulp',
    botanicalName: 'Ananas comosus',
    description: P(
      'Our frozen pineapple pulp is produced from fully ripened pineapples cultivated in Kerala, a renowned pineapple-growing region in southern India. Carefully selected farm-fresh fruits are sorted, washed, and prepared under hygienic conditions before undergoing controlled pulping using modern processing equipment.',
      "The finished pulp retains the pineapple's distinctive golden colour, natural aroma, and characteristic flavour, offering a consistent fruit base for a variety of food and beverage applications. Frozen promptly after processing, it helps preserve the fruit's natural qualities throughout storage and distribution.",
      'Widely suitable for commercial and culinary applications, frozen pineapple pulp can be used in the preparation of fruit beverages, juices, puddings, cakes, yoghurt, desserts, and other pineapple-based products.',
    ),
    packaging: 'Packed in 15 kg pails, or 10 bags of 1000 g in a simplex cardboard box (net weight 10 kg)',
    gradeDetails: '100% natural pineapple pulp',
    shelfLife: '18 Months without interruptions on the cold chain',
    storage: '-18°C',
  },
  {
    category: 'frozen-fruits-vegetables',
    name: 'Frozen Pineapple Dice',
    botanicalName: 'Ananas comosus',
    description: P(
      'Our 10 × 10 mm frozen pineapple flowing dices are produced exclusively from frozen semi-ripe pineapple slices, which are vertically cut to achieve the specified dimensions. Due to the naturally elongated shape and geometry of pineapple slices, minor variations in the final shape and size of individual pieces are naturally expected.',
      'Approximately 55–60% of the dices will have two sides conforming to the specified 10 × 10 mm dimension, while the remaining 40–45% may have irregular shapes resulting from the natural structure, curvature, and geometry of the fruit.',
      'This format retains the natural character of pineapple while providing a practical cut suitable for food processing, bakery, dessert, beverage, and other culinary applications.',
    ),
    packaging: 'IQF pineapple dice is stored in food grade PE bags and packed in a 5-ply corrugated box. Outer box: net weight 5.00 kg, gross weight 5.51 kg, size (L x W x H) 345 x 270 x 155 mm. Unit: net weight 1.00 kg, gross weight 1.02 kg, size (L x W x H) 340 x 150 x 30 mm.',
    gradeDetails: 'Grade A, Grade B, Grade C',
    shelfLife: FROZEN_SHELF,
    storage: '-18°C',
  },
  {
    category: 'frozen-fruits-vegetables',
    name: 'Frozen Pineapple Slice',
    botanicalName: 'Ananas comosus',
    description: P(
      'Frozen whole slices of pineapple consist of whole, practically unbroken slices of pineapple that have been cut, at a right angle to the longitudinal axis, into approximately equal units.',
      'Frozen pineapple slice is produced from properly ripened pineapple fruit selected for suitable quality and maturity. The fruit is carefully prepared by removing the peel, core, and unwanted portions, followed by thorough washing to ensure cleanliness before freezing.',
      'The product is rapidly frozen and subsequently maintained under controlled low-temperature conditions to preserve its natural flavour, colour, texture, and freshness throughout storage and distribution.',
      "The controlled freezing process helps retain the fruit's characteristic qualities while providing a convenient ingredient for a wide range of food and beverage applications.",
    ),
    gradeDetails: 'Grade A, Grade B, Grade C',
    shelfLife: FROZEN_SHELF,
    storage: '-18°C',
  },
  {
    category: 'frozen-fruits-vegetables',
    name: 'Frozen Pineapple Chunks',
    botanicalName: 'Ananas comosus',
    description: P(
      'Frozen chunks of pineapple are pieces of pineapple which do not conform to any of the foregoing styles, which need not be symmetrical nor uniform in size, and which do not exceed 1-1/2 inches in any dimension.',
      'Natural product, pasty, not diluted, not concentrated, not fermented, without preservatives obtained from the disintegration and sieving of the edible fraction of healthy and clean ripe pineapple. Each fruit is assessed for firmness, colour, shape, and overall condition.',
      'The freshly prepared dices are subsequently subjected to blast freezing, which rapidly lowers their temperature and helps preserve their natural characteristics. After freezing, the product is transferred to cold storage and maintained at −18°C under controlled conditions until further processing, dispatch, or delivery.',
      'This carefully managed process ensures that the frozen pineapple dices retain their natural flavour, colour, texture, and freshness while providing consistent size and quality for food-industry applications.',
    ),
    packaging: 'IQF pineapple dice is stored in food grade PE bags and packed in a 5-ply corrugated box.',
    gradeDetails: 'Grade A, Grade B, Grade C',
    shelfLife: FROZEN_SHELF,
    storage: '-18°C',
  },
]

const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

;(async () => {
  // categories (created only if missing, with their cutout image)
  const catIds = {}
  for (const [slug, c] of Object.entries(categories)) {
    const _id = `category-${slug}`
    catIds[slug] = _id
    const exists = await client.fetch('*[_id==$id][0]{_id}', { id: _id })
    if (exists) {
      console.log('category exists', slug)
      continue
    }
    const asset = await client.assets.upload('image', readFileSync(path.join(imagesDir, c.image)), { filename: c.image })
    await client.create({
      _id,
      _type: 'category',
      name: c.name,
      slug: { _type: 'slug', current: slug },
      shortDescription: c.shortDescription,
      image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      featured: false,
    })
    console.log('category created', slug)
  }

  // products
  const tx = client.transaction()
  const counters = {}
  for (const p of products) {
    counters[p.category] = (counters[p.category] || 0) + 1
    const _id = `product-conventional-${p.category}-${slugify(p.name)}`
    const doc = {
      _id,
      _type: 'product',
      name: p.name,
      slug: { _type: 'slug', current: `conventional-${p.category}-${slugify(p.name)}` },
      grade: 'conventional',
      category: categories[p.category].name,
      parentCategory: { _type: 'reference', _ref: catIds[p.category] },
      description: p.description,
      botanicalName: p.botanicalName,
      sourcedFrom: 'India',
      gradeDetails: p.gradeDetails,
      shelfLife: p.shelfLife,
      storage: p.storage,
      certifications: CERTS,
      featured: false,
      order: counters[p.category],
    }
    if (p.packaging) doc.packaging = p.packaging
    if (!p.gradeDetails) delete doc.gradeDetails
    tx.createOrReplace(doc)
    console.log('product', _id)
  }
  await tx.commit()
  console.log(`Done: ${products.length} products written.`)
})().catch((e) => { console.error(e.message); process.exit(1) })
