// Shared Sanity read client. No build step, no token — this only ever
// reads published content, which is public by default on Sanity's CDN.
const SANITY_PROJECT_ID = 'qir915mw';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

async function sanityFetch(query, params) {
  const url = new URL(`https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`);
  url.searchParams.set('query', query);
  if (params) {
    for (const key of Object.keys(params)) {
      url.searchParams.set(`$${key}`, JSON.stringify(params[key]));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Sanity request failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}

// Resolve a Sanity image asset reference (e.g. "image-abc123-2000x1500-png")
// into a CDN URL, without an extra network round trip.
function urlForImageRef(ref) {
  if (!ref) return '';
  const parts = ref.replace('image-', '').split('-');
  const format = parts.pop();
  const dimensions = parts.pop();
  const id = parts.join('-');
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const BLOCK_TAGS = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', blockquote: 'blockquote' };

function renderSpans(children, markDefs) {
  return (children || [])
    .map((span) => {
      let text = escapeHtml(span.text || '');
      (span.marks || []).forEach((mark) => {
        if (mark === 'strong') text = `<strong>${text}</strong>`;
        else if (mark === 'em') text = `<em>${text}</em>`;
        else if (mark === 'code') text = `<code>${text}</code>`;
        else if (mark === 'underline') text = `<u>${text}</u>`;
        else {
          const linkDef = (markDefs || []).find((def) => def._key === mark && def._type === 'link');
          if (linkDef) {
            const href = escapeHtml(linkDef.href || '#');
            text = `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
          }
        }
      });
      return text;
    })
    .join('');
}

// Portable Text -> HTML. Handles paragraphs, headings, blockquotes, bold/
// italic/underline/code, links, bullet/numbered lists, and inline images
// (dropped in anywhere in the body, any number of them).
function portableTextToHtml(blocks) {
  if (!Array.isArray(blocks)) return '';

  let html = '';
  let listType = null; // 'bullet' | 'number' | null

  const closeList = () => {
    if (listType) {
      html += listType === 'bullet' ? '</ul>' : '</ol>';
      listType = null;
    }
  };

  for (const block of blocks) {
    if (block._type === 'image') {
      closeList();
      const url = urlForImageRef(block.asset && block.asset._ref);
      if (url) {
        html += `<div class="blog-post__image"><img src="${url}" alt="${escapeHtml(block.alt || '')}" /></div>`;
      }
      continue;
    }

    if (block._type !== 'block') continue;

    if (block.listItem) {
      const wantType = block.listItem === 'number' ? 'number' : 'bullet';
      if (listType !== wantType) {
        closeList();
        html += wantType === 'bullet' ? '<ul>' : '<ol>';
        listType = wantType;
      }
      html += `<li>${renderSpans(block.children, block.markDefs)}</li>`;
      continue;
    }

    closeList();
    const tag = BLOCK_TAGS[block.style] || 'p';
    html += `<${tag}>${renderSpans(block.children, block.markDefs)}</${tag}>`;
  }

  closeList();
  return html;
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Wraps each search term found in already-escaped text with <mark>.
function highlightTerms(text, terms) {
  const safe = escapeHtml(text || '');
  if (!terms || !terms.length) return safe;
  const pattern = terms.map((t) => escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return safe.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}

// Product listing page that every category card opens (site-wide rule).
const PRODUCT_LISTING_URL = 'products-coconut.html';

// Shared category-card row (styles: assets/category-card.css). Used by the
// home page's Featured Categories, the Supply Chain page's category list and
// the search results page (which passes `terms` to highlight matches and
// `attrs` for extra attributes such as the product overlay's data-* hooks).
// Cards always link to the product listing page; `arrow: false` only hides
// the arrow, the card stays clickable. `link: false` renders a plain, non-interactive list row (used by the
// Supply Chain page's private-label list).
function renderCategoryCard({ name, description, imageUrl, href, terms, attrs, arrow = true, link = true }) {
  const tag = link ? 'a' : 'div';
  const hrefAttr = link ? ` href="${href || PRODUCT_LISTING_URL}"` : '';
  return `
    <${tag}${hrefAttr} class="category-card${link ? '' : ' category-card--static'}"${attrs ? ' ' + attrs : ''}>
      <div class="category-card__image">${imageUrl ? `<img src="${imageUrl}" alt="" />` : ''}</div>
      <div class="category-card__info">
        <h3>${highlightTerms(name, terms)}</h3>
        <p>${highlightTerms(description, terms)}</p>
      </div>
      ${arrow && link ? '<span class="category-card__arrow" aria-hidden="true"><img src="assets/icons/arrow-diagonal.svg" alt="" /></span>' : ''}
    </${tag}>
  `;
}

// Shared trend-card tile (styles: assets/trend-card.css). Used by the home
// page's Trending Products.
function renderTrendCard({ name, category, imageUrl, href }) {
  return `
    <a href="${href || 'catalogue.html'}" class="trend-card">
      <div class="trend-card__image"><img src="${imageUrl || ''}" alt="${escapeHtml(name || '')}" /></div>
      <div class="trend-card__body">
        <div class="trend-card__text">
          <span class="trend-card__eyebrow">${escapeHtml(category || '')}</span>
          <h3>${escapeHtml(name || '')}</h3>
        </div>
        <img src="assets/icons/arrow-diagonal.svg" alt="" class="trend-card__icon" />
      </div>
    </a>
  `;
}
