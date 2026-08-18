// shop.js — Shop page logic (v2)
// NOTE: uses shopProducts (not allProducts) to avoid conflict with script.js global

var shopProducts = [];
var shopFiltered = [];
var shopRendered = 0;
var shopObserver = null;
var SHOP_BATCH = 16;

/* ── Init ── */
window.addEventListener('load', function () {
    if (window.getProducts && window.getProducts().length > 0) {
        initShop();
    } else {
        setTimeout(initShop, 600);
    }
});

function getBrandName(product) {
    if (!product || !product.title_en) return 'Flower Perfumes';
    return product.title_en.split(' - ')[0].trim();
}

/* ── Brand pills ── */
function populateBrandRow(products) {
    var container = document.getElementById('brand-row');
    if (!container) return;
    var brands = [];
    products.forEach(function(p) {
        var b = getBrandName(p);
        if (!brands.includes(b)) brands.push(b);
    });
    brands = brands.slice(0, 12);
    container.innerHTML = brands.map(function(b) {
        return '<button class="brand-pill" data-brand="' + b + '">' + b + '</button>';
    }).join('');
    container.querySelectorAll('.brand-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var si = document.getElementById('shop-search');
            if (si) { si.value = btn.dataset.brand; filterProducts(); }
        });
    });
}

/* ── Results bar ── */
function updateResultsMeta(products) {
    var rt = document.getElementById('results-text');
    var rc = document.getElementById('results-chip');
    var cs = document.getElementById('filter-category');
    var fs = document.getElementById('filter-type');
    if (rt) rt.textContent = products.length + ' perfumes found.';
    if (rc) rc.textContent = (cs && cs.value !== 'all' ? cs.value : 'All') + ' • ' + (fs ? fs.options[fs.selectedIndex].text : 'Featured');
}

/* ── Init shop ── */
function initShop() {
    shopProducts = window.getProducts ? window.getProducts() : [];
    if (!shopProducts.length) { setTimeout(initShop, 500); return; }

    var catSel = document.getElementById('filter-category');
    if (catSel && window.getCategories) {
        var cats = window.getCategories();
        catSel.innerHTML = '<option value="all">All Categories</option>' +
            cats.map(function(c){ return '<option value="' + c + '">' + c + '</option>'; }).join('');
    }

    populateBrandRow(shopProducts);

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var f = params.get('filter');
    var si = document.getElementById('shop-search');
    var fs = document.getElementById('filter-type');

    if (q && si) si.value = q;
    if (f && fs) fs.value = f;

    filterProducts();
}

/* ── Card builder — premium dark card ── */
function createShopCard(product) {
    var brand    = getBrandName(product);
    var namePart = product.title_en.includes(' - ') ? product.title_en.split(' - ')[1].trim() : product.title_en;
    var imgSrc   = product.image || ('images/perfume' + (((product.id - 1) % 8) + 1) + '.jpg');
    var badge    = product.badge_en || '';
    var type     = product.type_en  || 'Extrait De Parfum';

    var card = document.createElement('div');
    card.className = 'premium-card';

    var link = document.createElement('a');
    link.href = 'product-detail.html?id=' + product.id;
    link.className = 'premium-card-link';

    /* Image area */
    var imgWrap = document.createElement('div');
    imgWrap.className = 'premium-card-img-wrap';

    var img = document.createElement('img');
    img.src = imgSrc;
    img.alt = namePart;
    img.loading = 'lazy';
    img.onerror = function(){ this.src = 'images/perfume1.jpg'; };
    imgWrap.appendChild(img);

    if (badge) {
        var badgeEl = document.createElement('span');
        badgeEl.className = 'premium-card-badge';
        badgeEl.textContent = badge;
        imgWrap.appendChild(badgeEl);
    }
    link.appendChild(imgWrap);

    /* Info body */
    var body = document.createElement('div');
    body.className = 'premium-card-body';

    var brandEl = document.createElement('p');
    brandEl.className = 'premium-card-brand';
    brandEl.textContent = brand;

    var nameEl = document.createElement('h3');
    nameEl.className = 'premium-card-name';
    nameEl.textContent = namePart;

    var typeEl = document.createElement('p');
    typeEl.className = 'premium-card-type';
    typeEl.textContent = type;

    var footer = document.createElement('div');
    footer.className = 'premium-card-footer';

    var price = document.createElement('span');
    price.className = 'premium-card-price';
    price.textContent = 'QR ' + product.price;

    var actions = document.createElement('div');
    actions.className = 'premium-card-actions';

    var cartBtn = document.createElement('button');
    cartBtn.className = 'pca-cart';
    cartBtn.textContent = 'ADD TO CART';
    cartBtn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        if (window.addToCart) window.addToCart(product.id);
        if (window.showToast) window.showToast('Added to cart!');
    });

    var viewBtn = document.createElement('a');
    viewBtn.className = 'pca-view';
    viewBtn.textContent = 'VIEW';
    viewBtn.href = 'product-detail.html?id=' + product.id;
    viewBtn.addEventListener('click', function(e){ e.stopPropagation(); });

    actions.appendChild(cartBtn);
    actions.appendChild(viewBtn);
    footer.appendChild(price);
    footer.appendChild(actions);

    body.appendChild(brandEl);
    body.appendChild(nameEl);
    body.appendChild(typeEl);
    body.appendChild(footer);

    link.appendChild(body);
    card.appendChild(link);

    return card;
}

/* ── Load-more / infinite scroll ── */
function disconnectShopObserver() {
    if (shopObserver) { shopObserver.disconnect(); shopObserver = null; }
}

function ensureLoadMore(container, hasMore) {
    var loader = document.getElementById('shop-load-more');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'shop-load-more';
        loader.className = 'shop-load-more';
        container.insertAdjacentElement('afterend', loader);
    }
    if (!shopFiltered.length) { loader.innerHTML = ''; loader.style.display = 'none'; return null; }
    if (!hasMore) {
        loader.innerHTML = '<span class="shop-load-done">All ' + shopFiltered.length + ' perfumes loaded</span>';
        loader.style.display = 'flex'; return null;
    }
    loader.innerHTML = '<div class="shop-load-spinner"></div><span>Loading more perfumes...</span>';
    loader.style.display = 'flex';
    return loader;
}

function appendBatch() {
    var container = document.getElementById('shop-container');
    if (!container) return;
    var batch = shopFiltered.slice(shopRendered, shopRendered + SHOP_BATCH);
    batch.forEach(function(p) { container.appendChild(createShopCard(p)); });
    shopRendered += batch.length;
    var loader = ensureLoadMore(container, shopRendered < shopFiltered.length);
    disconnectShopObserver();
    if (loader) {
        shopObserver = new IntersectionObserver(function(entries) {
            if (entries[0] && entries[0].isIntersecting) appendBatch();
        }, { rootMargin: '240px 0px' });
        shopObserver.observe(loader);
    }
}

function renderProducts(list) {
    var container = document.getElementById('shop-container');
    if (!container) return;
    
    // If called without arguments (e.g., from script.js global fetch), re-apply filters & sort
    if (!list) {
        filterProducts();
        return;
    }
    
    var products = list;
    disconnectShopObserver();
    if (!products || !products.length) {
        container.innerHTML = '<p style="text-align:center;width:100%;color:#b8ab8a;padding:60px 0;">No perfumes found.</p>';
        shopFiltered = []; shopRendered = 0;
        ensureLoadMore(container, false);
        updateResultsMeta([]);
        return;
    }
    shopFiltered = products;
    shopRendered = 0;
    container.innerHTML = '';
    appendBatch();
    updateResultsMeta(products);
}

/* ── Filter ── */
function filterProducts() {
    var si  = document.getElementById('shop-search');
    var fs  = document.getElementById('filter-type');
    var cs  = document.getElementById('filter-category');
    var q   = si  ? si.value.toLowerCase()  : '';
    var typ = fs  ? fs.value  : 'all';
    var cat = cs  ? cs.value  : 'all';

    var out = shopProducts.filter(function(p) {
        var b = getBrandName(p).toLowerCase();
        var ok = (p.title_en && p.title_en.toLowerCase().includes(q)) ||
                 (p.title_ar && p.title_ar.includes(q)) ||
                 (p.type_en  && p.type_en.toLowerCase().includes(q)) ||
                 b.includes(q);
        return ok && (cat === 'all' || p.category === cat);
    });

    if (typ === 'new' || typ === 'all' || typ === 'featured') out.sort(function(a,b){ return b.id - a.id; });
    if (typ === 'low')  out.sort(function(a,b){ return parseFloat(a.price) - parseFloat(b.price); });
    if (typ === 'high') out.sort(function(a,b){ return parseFloat(b.price) - parseFloat(a.price); });
    if (typ === 'best') out = out.filter(function(p){ return p.badge_en && p.badge_en.includes('BEST') || p.featured; });

    renderProducts(out);
}

/* ── Wire up filters ── */
document.addEventListener('DOMContentLoaded', function() {
    var si = document.getElementById('shop-search');
    var fs = document.getElementById('filter-type');
    var cs = document.getElementById('filter-category');
    if (si) si.addEventListener('input', filterProducts);
    if (fs) fs.addEventListener('change', filterProducts);
    if (cs) cs.addEventListener('change', filterProducts);
});

/* ── Exports ── */
window.filterProducts      = filterProducts;
window.renderProducts      = renderProducts;
window.initShop            = initShop;
window.renderShopProducts  = initShop;
