// Site search: shared data loading + ranking, and the type-ahead dropdown that
// attaches to every .catalogue-search form. Requires assets/sanity.js first.
const SiteSearch = (() => {
  let dataPromise;

  // products + posts are fetched once per page load and reused
  function load() {
    if (!dataPromise) {
      dataPromise = Promise.all([
        sanityFetch(
          `*[_type=="category"] | order(order asc){name, shortDescription, "image": image.asset->url, "thumb": image.asset->url + "?w=96&h=96&fit=crop&auto=format"}`
        ),
        sanityFetch(
          `*[_type=="product"] | order(order asc){name, category, grade, shortDescription, description, botanicalName, sourcedFrom, "image": image.asset->url, "overlayImage": image.asset->url + "?w=1200&auto=format", "thumb": image.asset->url + "?w=96&h=96&fit=crop&auto=format"}`
        ),
        sanityFetch(
          `*[_type=="post" && hidden != true] | order(date desc){title, excerpt, category, author, "slug": slug.current, "image": image.asset->url, "thumb": image.asset->url + "?w=96&h=96&fit=crop&auto=format"}`
        ),
      ]).then(([categories, products, posts]) => ({ categories, products, posts }));
      dataPromise.catch(() => { dataPromise = null; });
    }
    return dataPromise;
  }

  const termsOf = (q) => (q || '').toLowerCase().split(/\s+/).filter(Boolean);

  // every term has to appear somewhere in the item's text; name hits rank first
  function rank(terms, nameText, otherText) {
    const name = (nameText || '').toLowerCase();
    const rest = `${name} ${(otherText || '').toLowerCase()}`;
    if (!terms.length || !terms.every((t) => rest.includes(t))) return -1;
    return terms.reduce((score, t) => score + (name.includes(t) ? 3 : 1), 0);
  }

  function search(items, nameOf, textOf, terms) {
    return items
      .map((item) => ({ item, score: rank(terms, nameOf(item), textOf(item)) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);
  }

  const categoryText = (c) => c.shortDescription || '';
  const productText = (p) => [p.category, p.grade, p.shortDescription, p.description, p.botanicalName, p.sourcedFrom].join(' ');
  const postText = (p) => [p.excerpt, p.category, p.author].join(' ');

  function find(data, terms) {
    return {
      categories: search(data.categories, (c) => c.name, categoryText, terms),
      products: search(data.products, (p) => p.name, productText, terms),
      posts: search(data.posts, (p) => p.title, postText, terms),
    };
  }

  // categories lead to the product listing page; products open the bottom overlay
  const categoryHref = () => 'products-coconut.html';
  const productHref = () => 'products-coconut.html';
  const productAttrs = (p) =>
    [
      'data-open-overlay',
      `data-product-name="${escapeHtml(p.name || '').replace(/"/g, '&quot;')}"`,
      `data-product-category="${escapeHtml(p.category || '').replace(/"/g, '&quot;')}"`,
      `data-product-image="${escapeHtml(p.overlayImage || p.image || '').replace(/"/g, '&quot;')}"`,
      `data-product-desc="${escapeHtml(p.description || p.shortDescription || '').replace(/"/g, '&quot;')}"`,
      `data-product-botanical="${escapeHtml(p.botanicalName || '').replace(/"/g, '&quot;')}"`,
      `data-product-sourced="${escapeHtml(p.sourcedFrom || '').replace(/"/g, '&quot;')}"`,
    ].join(' ');
  const postHref = (p) => `blog-post.html?post=${p.slug}`;
  const resultsHref = (q) => `search.html?q=${encodeURIComponent(q)}`;

  // ---- type-ahead dropdown ----
  const MAX_CATEGORIES = 3;
  const MAX_PRODUCTS = 4;
  const MAX_POSTS = 3;
  const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SEARCH_ICON = '<svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6"/><line x1="13.6" y1="13.6" x2="18" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  function attach(form) {
    const input = form.querySelector('input[type="search"]');
    if (!input) return;

    const listId = `search-suggest-${Math.random().toString(36).slice(2, 8)}`;
    const box = document.createElement('div');
    box.className = 'search-suggest';
    box.id = listId;
    box.setAttribute('role', 'listbox');
    box.setAttribute('aria-label', 'Search suggestions');
    box.hidden = true;
    form.appendChild(box);

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', listId);
    input.setAttribute('autocomplete', 'off');

    let options = [];
    let active = -1;
    let seq = 0;
    let timer;

    const close = () => {
      box.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    };

    const setActive = (i) => {
      options.forEach((o, n) => {
        o.classList.toggle('is-active', n === i);
        o.setAttribute('aria-selected', String(n === i));
      });
      active = i;
      if (i >= 0) {
        input.setAttribute('aria-activedescendant', options[i].id);
        options[i].scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    };

    const item = ({ href, thumb, title, meta, terms, n, attrs }) => `
      <a class="search-suggest__item" role="option" aria-selected="false" id="${listId}-o${n}" href="${href}"${attrs ? ' ' + attrs : ''}>
        <span class="search-suggest__thumb">${thumb ? `<img src="${thumb}" alt="" loading="lazy" />` : ''}</span>
        <span class="search-suggest__text">
          <span class="search-suggest__name">${highlightTerms(title, terms)}</span>
          <span class="search-suggest__meta">${escapeHtml(meta || '')}</span>
        </span>
      </a>`;

    async function render() {
      const q = input.value.trim();
      const mine = ++seq;
      if (!q) { close(); return; }

      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');

      let data;
      try {
        data = await load();
      } catch (err) {
        close();
        return;
      }
      if (mine !== seq) return; // a newer keystroke superseded this render

      const terms = termsOf(q);
      const { categories, products, posts } = find(data, terms);
      const shownCategories = categories.slice(0, MAX_CATEGORIES);
      const shownProducts = products.slice(0, MAX_PRODUCTS);
      const shownPosts = posts.slice(0, MAX_POSTS);
      let n = 0;
      let html = '';

      if (!shownCategories.length && !shownProducts.length && !shownPosts.length) {
        const popular = data.products.slice(0, 4);
        html = `
          <div class="search-suggest__empty">
            <span class="search-suggest__empty-icon">${SEARCH_ICON}</span>
            <p class="search-suggest__empty-title">No matches for “${escapeHtml(q)}”</p>
            <p class="search-suggest__empty-body">Check the spelling or try a broader word. Popular searches:</p>
            <div class="search-suggest__chips">
              ${popular.map((p) => `<a class="search-suggest__chip" role="option" aria-selected="false" id="${listId}-o${n++}" href="${resultsHref(p.name)}">${escapeHtml(p.name)}</a>`).join('')}
            </div>
          </div>`;
      } else {
        if (shownCategories.length) {
          html += '<p class="search-suggest__group" role="presentation">Categories</p>';
          html += shownCategories
            .map((c) => item({ href: categoryHref(c), thumb: c.thumb, title: c.name, meta: 'Category', terms, n: n++ }))
            .join('');
        }
        if (shownProducts.length) {
          html += '<p class="search-suggest__group" role="presentation">Products</p>';
          html += shownProducts
            .map((p) => item({ href: productHref(p), thumb: p.thumb, title: p.name, meta: p.category || 'Product', terms, n: n++, attrs: productAttrs(p) }))
            .join('');
        }
        if (shownPosts.length) {
          html += '<p class="search-suggest__group" role="presentation">Articles</p>';
          html += shownPosts
            .map((p) => item({ href: postHref(p), thumb: p.thumb, title: p.title, meta: p.category || 'Article', terms, n: n++ }))
            .join('');
        }
        const total = categories.length + products.length + posts.length;
        html += `
          <a class="search-suggest__all" role="option" aria-selected="false" id="${listId}-o${n++}" href="${resultsHref(q)}">
            <span>See all ${total} result${total === 1 ? '' : 's'} for “${escapeHtml(q)}”</span>${ARROW}
          </a>`;
      }

      box.innerHTML = html;
      options = [...box.querySelectorAll('[role="option"]')];
      active = -1;
      input.removeAttribute('aria-activedescendant');
    }

    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(render, 90);
    });
    input.addEventListener('focus', () => { if (input.value.trim()) render(); });
    input.addEventListener('blur', () => setTimeout(close, 120));

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (box.hidden || !options.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(active + 1 >= options.length ? 0 : active + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(active <= 0 ? options.length - 1 : active - 1);
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        options[active].click(); // product rows open the overlay, everything else navigates
      }
    });

    // keep focus in the input while interacting with the list
    box.addEventListener('mousedown', (e) => e.preventDefault());
    box.addEventListener('mousemove', (e) => {
      const i = options.indexOf(e.target.closest('[role="option"]'));
      if (i >= 0 && i !== active) setActive(i);
    });
  }

  document.querySelectorAll('.catalogue-search').forEach(attach);

  return { load, termsOf, find, categoryHref, productHref, productAttrs, postHref, resultsHref, attach };
})();
