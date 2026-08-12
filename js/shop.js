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

/* ── Card builder — fully DOM-based, zero style.css dependency ── */
function createShopCard(product) {
    var brand    = getBrandName(product);
    var namePart = product.title_en.includes(' - ') ? product.title_en.split(' - ')[1].trim() : product.title_en;
    var imgSrc   = product.image || ('images/perfume' + (((product.id - 1) % 8) + 1) + '.jpg');

    /* Card wrapper = <a> */
    var card = document.createElement('a');
    card.href = 'product-detail.html?id=' + product.id;
    card.style.cssText = 'text-decoration:none;color:inherit;display:flex;flex-direction:column;' +
        'background:linear-gradient(160deg,#0d1a0e,#060d07);' +
        'border:1px solid rgba(212,175,55,0.18);border-radius:16px;overflow:hidden;' +
        'box-shadow:0 6px 28px rgba(0,0,0,0.38);' +
        'transition:transform .25s,box-shadow .25s,border-color .25s;cursor:pointer;';

    /* Image area */
    var imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'position:relative;flex-shrink:0;height:220px;background:#060d07;overflow:hidden;';

    var img = document.createElement('img');
    img.src = imgSrc;
    img.alt = namePart;
    img.loading = 'lazy';
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;padding:10px;box-sizing:border-box;transition:transform .4s ease;';
    img.onerror = function(){ this.src = 'images/perfume1.jpg'; };
    imgWrap.appendChild(img);

    if (product.badge_en) {
        var badge = document.createElement('span');
        badge.textContent = product.badge_en;
        badge.style.cssText = 'position:absolute;top:10px;left:10px;' +
            'background:#d4af37;color:#000;font-size:0.58rem;font-weight:800;' +
            'letter-spacing:1.5px;padding:4px 9px;border-radius:20px;text-transform:uppercase;' +
            'font-family:Montserrat,sans-serif;';
        imgWrap.appendChild(badge);
    }
    card.appendChild(imgWrap);

    /* Info panel — always visible below image */
    var info = document.createElement('div');
    info.style.cssText = 'padding:13px 14px 14px;display:flex;flex-direction:column;gap:4px;' +
        'background:linear-gradient(180deg,#0d1a0e,#060d07);flex:1;';

    var brandEl = document.createElement('p');
    brandEl.textContent = brand;
    brandEl.style.cssText = 'margin:0;color:#d4af37;font-size:0.63rem;font-weight:800;' +
        'letter-spacing:2.5px;text-transform:uppercase;font-family:Montserrat,sans-serif;';

    var nameEl = document.createElement('h3');
    nameEl.textContent = namePart;
    nameEl.style.cssText = "margin:0;color:#fff4dc;font-family:'Playfair Display',serif;" +
        'font-size:0.92rem;font-weight:700;line-height:1.3;';

    var typeEl = document.createElement('p');
    typeEl.textContent = product.type_en || 'Extrait De Parfum';
    typeEl.style.cssText = 'margin:0;color:rgba(255,255,255,0.45);font-size:0.7rem;font-family:Montserrat,sans-serif;';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;';

    var price = document.createElement('span');
    price.textContent = 'QR ' + product.price;
    price.style.cssText = 'color:#fff;font-size:1rem;font-weight:800;font-family:Montserrat,sans-serif;';

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:5px;';

    var cartBtn = document.createElement('button');
    cartBtn.textContent = 'CART';
    cartBtn.style.cssText = 'background:#d4af37;color:#000;border:none;padding:6px 10px;' +
        'font-size:0.58rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;' +
        'border-radius:20px;cursor:pointer;font-family:Montserrat,sans-serif;';
    cartBtn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        if (window.addToCart) window.addToCart(product.id);
        if (window.showToast) window.showToast('Added to cart!');
    });

    btns.appendChild(cartBtn);
    row.appendChild(price);
    row.appendChild(btns);
    info.appendChild(brandEl);
    info.appendChild(nameEl);
    info.appendChild(typeEl);
    info.appendChild(row);
    card.appendChild(info);

    /* Hover */
    card.addEventListener('mouseenter', function() {
        card.style.transform = 'translateY(-6px)';
        card.style.boxShadow = '0 18px 48px rgba(0,0,0,0.55)';
        card.style.borderColor = 'rgba(212,175,55,0.38)';
        img.style.transform = 'scale(1.06)';
    });
    card.addEventListener('mouseleave', function() {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 6px 28px rgba(0,0,0,0.38)';
        card.style.borderColor = 'rgba(212,175,55,0.18)';
        img.style.transform = 'scale(1)';
    });

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
    var products = list || shopProducts;
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

    if (typ === 'new')  out.sort(function(a,b){ return b.id - a.id; });
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
