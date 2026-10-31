// Product detail overlay (the bottom sheet). Shared by the Coconut products page,
// the search results page and the search type-ahead.
//
// Anything with data-open-overlay and data-product-* attributes opens it when
// clicked; so do the Coconut page's existing .trend-card tiles and the
// product rows (anywhere on the card, including the "view products" link). Pages without the overlay markup
// get it injected on first use.
const ProductOverlay = (() => {
  const TEMPLATE = `
<div class="overlay" id="productOverlay" aria-hidden="true">
  <div class="overlay__backdrop" data-overlay-close></div>
  <div class="overlay__panel" role="dialog" aria-modal="true" aria-labelledby="overlayTitle">
    <div class="overlay__top">
      <p class="overlay__breadcrumb" id="overlayBreadcrumb"></p>
      <button class="overlay__close" id="overlayClose" type="button" aria-label="Close">
        <img src="assets/icons/overlay-arrow.svg" alt="" />
      </button>
    </div>
    <div class="overlay__content">
      <div class="overlay__image">
        <img id="overlayImage" src="" alt="" />
      </div>
      <div class="overlay__details">
        <h2 class="overlay__title" id="overlayTitle"></h2>
        <p class="overlay__desc" id="overlayDesc"></p>
        <div class="overlay__facts" id="overlayFacts"></div>
        <div class="overlay__certs" id="overlayCertsWrap" hidden>
          <p class="overlay__block-label">Certifications</p>
          <ul class="overlay__chips" id="overlayCerts"></ul>
        </div>
        <div class="overlay__acc-list">
          <details class="overlay__acc" id="overlayPackagingWrap" hidden>
            <summary>Available packaging</summary>
            <div class="overlay__acc-body" id="overlayPackaging"></div>
          </details>
          <details class="overlay__acc" id="overlayGradesWrap" hidden>
            <summary>Grade options</summary>
            <div class="overlay__acc-body" id="overlayGrades"></div>
          </details>
          <details class="overlay__acc" id="overlayChart" hidden>
            <summary>Size &amp; grade chart</summary>
            <div class="overlay__acc-body">
              <table class="overlay__chart-table">
                <thead><tr><th>Size / caliber</th><th>Specification / basis</th></tr></thead>
                <tbody id="overlayChartBody"></tbody>
              </table>
            </div>
          </details>
        </div>
        <div class="overlay__actions">
          <a href="contact.html" class="btn btn--primary overlay__cta">Enquire</a>
        </div>
      </div>
    </div>
  </div>
</div>`;

  const esc = (v) => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Products / Organic Ingredients / Coconut Products, each step linked (rows from the products page carry
  // the grade and category slug). Tiles without them (trending cards, search) get Products / <category>.
  const SEP = '<span class="overlay__sep" aria-hidden="true">/</span>';

  function breadcrumb(data) {
    const category = esc(data.productCategory);
    if (data.productGrade && data.productCategorySlug) {
      const label = data.productGrade === 'conventional' ? 'Conventional Ingredients' : 'Organic Ingredients';
      const listing = `products-coconut.html?category=${encodeURIComponent(data.productCategorySlug)}&grade=${data.productGrade}`;
      return `<a href="catalogue.html">Products</a>${SEP}<a href="catalogue.html#${data.productGrade}">${label}</a>${SEP}<a href="${listing}" data-same-page class="is-current">${category}</a>`;
    }
    return `<a href="catalogue.html">Products</a>${category ? SEP + '<span class="is-current">' + category + '</span>' : ''}`;
  }

  let overlay = null;
  let lastFocusedEl = null;
  const $ = (id) => document.getElementById(id);

  function ensure() {
    if (overlay) return overlay;
    overlay = $('productOverlay');
    if (!overlay) {
      document.body.insertAdjacentHTML('beforeend', TEMPLATE);
      overlay = $('productOverlay');
    }
    overlay.querySelectorAll('[data-overlay-close]').forEach((el) => el.addEventListener('click', close));
    $('overlayClose').addEventListener('click', close);
    return overlay;
  }

  // data: the dataset-style keys productName, productCategory, productImage, productDesc, productBotanical, productSourced,
  // plus the optional productPackaging, productGrades, productShelf, productStorage, productCerts and productChart (JSON rows)
  function open(data) {
    ensure();
    $('overlayImage').src = data.productImage || '';
    $('overlayImage').alt = data.productName || '';
    $('overlayTitle').textContent = data.productName || '';
    $('overlayDesc').textContent = data.productDesc || '';
    $('overlayBreadcrumb').innerHTML = breadcrumb(data);

    // key facts as tiles; long values (e.g. storage notes) span the full width
    const facts = [
      ['Origin', data.productSourced],
      ['Botanical name', data.productBotanical, true],
      ['Shelf life', data.productShelf],
      ['Storage', data.productStorage],
    ].filter(([, v]) => v);
    $('overlayFacts').innerHTML = facts
      .map(([label, v, italic]) =>
        `<div class="overlay__fact${String(v).length > 42 ? ' overlay__fact--wide' : ''}"><span class="overlay__fact-label">${label}</span><span class="overlay__fact-value${italic ? ' is-italic' : ''}">${esc(v)}</span></div>`)
      .join('');
    $('overlayFacts').hidden = !facts.length;

    // certifications as badges
    const certs = String(data.productCerts || '').split(',').map((c) => c.trim()).filter(Boolean);
    $('overlayCerts').innerHTML = certs.map((c) => `<li>${esc(c)}</li>`).join('');
    $('overlayCertsWrap').hidden = !certs.length;

    // longer text goes into expandable rows, one sentence per line
    const lines = (text) => String(text || '').split(/(?<=\.)\s+(?=[A-Z])/).map((t) => `<p>${esc(t)}</p>`).join('');
    [['overlayPackagingWrap', 'overlayPackaging', data.productPackaging], ['overlayGradesWrap', 'overlayGrades', data.productGrades]].forEach(([wrap, body, text]) => {
      $(body).innerHTML = lines(text);
      $(wrap).hidden = !text;
      $(wrap).open = false;
    });

    // optional size & grade chart (rows arrive as JSON in data-product-chart)
    let rows = [];
    try { rows = JSON.parse(data.productChart || '[]'); } catch (e) { rows = []; }
    $('overlayChartBody').innerHTML = rows
      .map((r) => `<tr><td>${esc(r.size)}</td><td>${esc(r.basis) || '&ndash;'}</td></tr>`)
      .join('');
    $('overlayChart').hidden = !rows.length;
    $('overlayChart').open = false;

    lastFocusedEl = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('overlayClose').focus();
  }

  function close() {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedEl && document.contains(lastFocusedEl)) lastFocusedEl.focus();
  }

  // delegated, so it also covers cards rendered after the page loaded
  document.addEventListener('click', (e) => {
    // the breadcrumb's last step points at the page the overlay is open on: just close the overlay
    const crumb = e.target.closest('.overlay__breadcrumb a[data-same-page]');
    if (crumb) {
      const target = new URL(crumb.getAttribute('href'), location.href);
      if (target.pathname === location.pathname && target.search === location.search) {
        e.preventDefault();
        close();
      }
      return;
    }
    // the whole product row is the click target (the "View Details" button included)
    const row = e.target.closest('.product-row[data-product-name]');
    if (row) {
      e.preventDefault();
      open(row.dataset);
      return;
    }
    const link = e.target.closest('.view-products');
    if (link) {
      e.preventDefault();
      return;
    }
    const trigger = e.target.closest('[data-open-overlay], .trend-card[data-product-name]');
    if (trigger) {
      e.preventDefault();
      open(trigger.dataset);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close };
})();
