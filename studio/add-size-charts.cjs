// Adds the size & grade charts for the three gherkin products ("processed Fruit and Vegetable category.pdf")
// to both their conventional and organic Sanity entries. Uses your logged-in Sanity CLI session.
// Run: npx sanity exec add-size-charts.cjs --with-user-token
const { getCliClient } = require('sanity/cli')
const client = getCliClient({ apiVersion: '2024-01-01' })

const L = 'length basis'
const D = 'diameter basis'
const charts = {
  'gherkins-in-vinegar': [
    ['20/30', ''], ['1/4 cm', L], ['2/5 cm', L], ['3/6 cm', L], ['4/7 cm', L], ['6/9 cm', L], ['21/27 mm', D], ['28/40 mm', D],
  ],
  'gherkins-in-acetic-acid': [
    ['300+', '20/30'], ['150/300', '10/30'], ['120/300', `1/4 cm ${L}`], ['80/120', `2/5 cm ${L}`], ['60/80', `3/6 cm ${L}`],
    ['80/150', `4/7 cm ${L}`], ['60/160', `5/8 cm ${L}`], ['30/60', `6/9 cm ${L}`],
  ],
  'gherkins-in-brine': [
    ['300+', '5/10'], ['150/300', '10/30'], ['100/160', `3/6 cm ${L}`], ['60/100', `6/9 cm ${L}`], ['40/60', `9/12 cm ${L}`],
    ['30/40', `21/27 mm ${D}`], ['20/30', `27/32 mm ${D}`], ['10/20', `32/40 mm ${D}`],
  ],
}

;(async () => {
  const tx = client.transaction()
  for (const [slug, rows] of Object.entries(charts)) {
    const sizeChart = rows.map(([size, basis], i) => ({ _type: 'sizeRow', _key: `r${i}`, size, basis }))
    for (const grade of ['conventional', 'organic']) {
      tx.patch(`product-${grade}-pickled-preserved-vegetables-${slug}`, (p) =>
        p.set({ sizeChart, gradeDetails: 'Size / caliber (diameter or length of gherkins): see the size & grade chart below.' }),
      )
    }
    console.log('chart', slug, rows.length, 'rows')
  }
  await tx.commit()
  console.log('Done.')
})().catch((e) => { console.error(e.message); process.exit(1) })
