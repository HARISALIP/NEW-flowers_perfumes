// ==========================================
// FLOWER PERFUMES — Main Script (Hybrid)
// ==========================================

const translations = {
    en: {
        title: "FLOWER Perfumes | Luxury Fragrances - Souq Waqif, Doha",
        home: "Home",
        about: "About",
        collection: "Collection",
        contact: "Contact",
        hero_badge: "✦ SOUQ WAQIF, DOHA ✦",
        hero_line1: "The Art of",
        hero_line2: "Fragrance",
        hero_subheadline: "Discover our exclusive collection of authentic luxury perfumes. Where timeless tradition meets modern elegance to create unforgettable, signature scents that leave a lasting impression.",
        explore: "Explore Collection",
        order_now: "Order on WhatsApp",
        about_label: "— About Us",
        about_title: "Flower Perfumes",
        about_text_1: "Located in the heart of Doha's historic Souq Waqif, Flower Perfumes offers an exquisite collection of premium authentic fragrances from around the world.",
        about_text_2: "Experience the perfect blend of tradition and modern elegance. Each fragrance in our collection is carefully curated to ensure the highest quality and most captivating scents.",
        premium_label: "Premium\nFragrances",
        feat_1: "100% Authentic",
        feat_2: "Premium Quality",
        feat_3: "Global Brands",
        collection_label: "— Our Collection",
        collection_title: "Signature Scents",
        wa_title: "Order Your Favourite Scent",
        wa_subtitle: "Message us directly on WhatsApp for quick orders & inquiries",
        name1: "Ibrahim Khalil",
        name2: "Khaliluddin",
        visit_label: "— Find Us",
        contact_title: "Visit Our Store",
        address: "Shop no 523, Souq Waqif, Doha - Qatar",
        phone: "Phone & WhatsApp",
        hours: "Open Daily: 10 AM - 11 PM",
        quick_links: "Quick Links",
        connect: "Connect",
        get_directions: "Get Directions",
        rights: "© 2026 Flower Perfumes. All rights reserved.",
        thanks_review: "Thank you for your review!",
        submit_review: "Submit"
    },
    ar: {
        title: "عطور الزهور | عطور فاخرة - سوق واقف، الدوحة",
        home: "الرئيسية",
        about: "عن المتجر",
        collection: "المجموعة",
        contact: "اتصل بنا",
        hero_badge: "✦ سوق واقف، الدوحة ✦",
        hero_line1: "فن",
        hero_line2: "العطور",
        hero_subheadline: "اكتشف مجموعتنا الحصرية من العطور الفاخرة الأصلية. حيث يلتقي التراث الخالد بالأناقة الحديثة لخلق روائح لا تُنسى تترك انطباعاً دائماً.",
        explore: "استكشف المجموعة",
        order_now: "اطلب عبر واتساب",
        about_label: "— من نحن",
        about_title: "عطور الزهور",
        about_text_1: "يقع محل عطور الزهور في قلب سوق واقف التاريخي بالدوحة، ويقدم مجموعة رائعة من العطور الأصلية الفاخرة من جميع أنحاء العالم.",
        about_text_2: "اختبر المزيج المثالي بين التقاليد والأناقة الحديثة. كل عطر في مجموعتنا تم اختياره بعناية لضمان أعلى جودة وأكثر الروائح جاذبية.",
        premium_label: "عطور\nفاخرة",
        feat_1: "أصلي 100%",
        feat_2: "جودة عالية",
        feat_3: "ماركات عالمية",
        collection_label: "— مجموعتنا",
        collection_title: "عطور مميزة",
        wa_title: "اطلب عطرك المفضل",
        wa_subtitle: "راسلنا مباشرة على واتساب للطلبات والاستفسارات",
        name1: "إبراهيم خليل",
        name2: "خليل الدين",
        visit_label: "— موقعنا",
        contact_title: "قم بزيارة متجرنا",
        address: "محل رقم 523، سوق واقف، الدوحة - قطر",
        phone: "الهاتف وواتساب",
        hours: "مفتوح يومياً: 10 صباحاً - 11 مساءً",
        quick_links: "روابط سريعة",
        connect: "تواصل معنا",
        get_directions: "احصل على الاتجاهات",
        rights: "© 2026 عطور الزهور. جميع الحقوق محفوظة.",
        thanks_review: "شكراً لتقييمك!",
        submit_review: "إرسال"
    }
};

let currentLang = "en";
let allProducts = [];
let homeSearchTerm = "";
let homeCategoryFilter = "all";

// Fallback Default Products
const defaultProducts = [
    { id: 1, title_en: "TSUNARA", title_ar: "تسونارا", type_en: "Extrait De Parfum", type_ar: "عطر مركز", desc_en: "Marine, Beastly, Clean, Woody. A potent freshie that's violent like a Tsunami.", desc_ar: "بحري، وحشي، نظيف، خشبي. عطر منعش وقوي مثل التسونامي.", price: "399", badge_en: "LONGEST-LASTING", badge_ar: "الأطول ثباتاً", image: "images/perfume1.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 33/Month", emi_ar: "أو 33 ر.ق/شهر" },
    { id: 2, title_en: "MILKY WAY", title_ar: "ميلكي واي", type_en: "Extrait De Parfum", type_ar: "عطر مركز", desc_en: "Lactonic, woody, gourmand. Arguably the longest lasting cardamom perfume.", desc_ar: "حليبي، خشبي، قورماند. ربما يكون أطول عطر هيل ثباتاً.", price: "425", badge_en: "VERY LONG LASTING", badge_ar: "ثبات طويل جداً", image: "images/perfume2.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 35/Month", emi_ar: "أو 35 ر.ق/شهر" },
    { id: 3, title_en: "HAUTE TOBACCO", title_ar: "هوت توباكو", type_en: "Extrait De Parfum", type_ar: "عطر مركز", desc_en: "Spicy, Woody, Sweet. A sexy tobacco fragrance for men.", desc_ar: "توابل، خشب، حلو. عطر توباكو جذاب للرجال.", price: "355", badge_en: "AWARD-WINNER", badge_ar: "حائز على جائزة", image: "images/perfume3.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 30/Month", emi_ar: "أو 30 ر.ق/شهر" },
    { id: 4, title_en: "TOBACCO VANILLA", title_ar: "توباكو فانيلا", type_en: "Extrait De Parfum", type_ar: "عطر مركز", desc_en: "Rich, Warm, Sophisticated. An Opulent interplay of sweet & spicy notes.", desc_ar: "غني، دافئ، متطور. تداخل فاخر بين النغمات الحلوة والتوابل.", price: "355", badge_en: "LIMITED EDITION", badge_ar: "إصدار محدود", image: "images/perfume4.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 30/Month", emi_ar: "أو 30 ر.ق/شهر" },
    { id: 5, title_en: "MIDNIGHT OUD", title_ar: "عود منتصف الليل", type_en: "Extrait De Parfum", type_ar: "عطر مركز", desc_en: "Dark, mysterious, and deeply resinous. A truly royal oud experience.", desc_ar: "داكن، غامض وراتنجي بعمق. تجربة عود ملكية حقاً.", price: "480", badge_en: "NEW ARRIVAL", badge_ar: "وصل حديثاً", image: "images/perfume5.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 30/Month", emi_ar: "أو 30 ر.ق/شهر" },
    { id: 6, title_en: "ROSE ELEGANCE", title_ar: "أناقة الورد", type_en: "Eau De Parfum", type_ar: "ماء عطر", desc_en: "A blooming bouquet of fresh pink roses and soft musk.", desc_ar: "باقة مزهرة من الورود الوردية الطازجة والمسك الناعم.", price: "320", badge_en: "BESTSELLER", badge_ar: "الأكثر مبيعاً", image: "images/perfume6.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 30/Month", emi_ar: "أو 30 ر.ق/شهر" },
    { id: 7, title_en: "VELVET MUSK", title_ar: "مسك مخملي", type_en: "Extrait De Parfum", type_ar: "عطر مركز", desc_en: "Smooth, powdery, and deeply comforting wrapped in silk.", desc_ar: "ناعم، بودري، ومريح بعمق مغلف بالحرير.", price: "290", badge_en: "", badge_ar: "", image: "images/perfume7.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 30/Month", emi_ar: "أو 30 ر.ق/شهر" },
    { id: 8, title_en: "AMBER BLAZE", title_ar: "وهج العنبر", type_en: "Eau De Parfum", type_ar: "ماء عطر", desc_en: "A fiery mix of amber, woods, and exotic spices.", desc_ar: "مزيج ناري من العنبر، الأخشاب والتوابل الغريبة.", price: "375", badge_en: "LIMITED EDITION", badge_ar: "إصدار محدود", image: "images/perfume8.jpg", sizes: ["100ml", "50ml"], emi_en: "or QR 30/Month", emi_ar: "أو 30 ر.ق/شهر" }
];

// --- Initialization ---
function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        preloader.style.pointerEvents = 'none';
        setTimeout(() => preloader.style.display = 'none', 500);
    }
}

window.addEventListener("load", () => {
    hidePreloader();
    fetchProducts();
});

// Safety fallback: if load event is too slow, hide it anyway after 3 seconds
setTimeout(hidePreloader, 3000);

async function fetchProducts() {
    // 1. Instant Seeding (Fail-safe)
    allProducts = [...defaultProducts];
    renderProducts();
    renderBrandDiscovery();
    renderTrending();
    renderLatest();

    // 2. Try to sync with server
    try {
        const response = await fetch('/api/products.php');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
            allProducts = data;
            renderProducts();
            renderBrandDiscovery();
            renderTrending();
            renderLatest();
        }
    } catch (error) {
        console.warn('Sync failed, sticking with local data:', error);
    }
}

function renderLatest() {
    const container = document.getElementById('latest-container');
    if (!container || allProducts.length === 0) return;
    
    // Pick newest 3 items or products with NEW badge
    let latest = allProducts.filter(p => 
        (p.badge_en && p.badge_en.toLowerCase().includes('new')) || 
        (p.title_en && p.title_en.includes('MIDNIGHT'))
    );
    
    // If we don't have enough specific "new" items, pad it with other items to reach exactly 3
    if (latest.length < 4) {
        const others = allProducts.filter(p => !latest.includes(p));
        latest = [...latest, ...others].slice(0, 4);
    } else {
        latest = latest.slice(0, 4);
    }
    if (latest.length === 0) return; // Still nothing, don't wipe hardcoded

    container.innerHTML = ''; // Wipe hardcoded
    const lang = currentLang;
    latest.forEach(product => {
        container.appendChild(createFeaturedCard(product, lang));
    });
}

function renderTrending() {
    const container = document.getElementById('trending-container');
    if (!container || allProducts.length === 0) return;

    // Filter for trending (bestsellers, award winners, etc)
    let trending = allProducts.filter(p => 
        (p.badge_en && p.badge_en.toLowerCase().includes('best')) ||
        (p.badge_en && p.badge_en.toLowerCase().includes('award')) ||
        (p.title_en && p.title_en.includes('ROSE'))
    );
    
    // Ensure we have exactly 3 items
    if (trending.length < 4) {
        const others = allProducts.filter(p => !trending.includes(p));
        trending = [...trending, ...others];
    }
    trending = trending.slice(0, 4);

    if (trending.length === 0) return;

    container.innerHTML = ''; // Wipes the "Loading..." text and prevents duplicates
    const lang = currentLang;
    trending.forEach(product => {
        container.appendChild(createFeaturedCard(product, lang));
    });
}

window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

function createFeaturedCard(product, lang) {
    const title = lang === 'ar' ? product.title_ar : product.title_en;
    const badge = lang === 'ar' ? product.badge_ar : product.badge_en;
    
    const card = document.createElement('div');
    card.className = 'trending-card visible';
    card.style.opacity = '1';
    card.style.visibility = 'visible';
    card.style.transform = 'none';
    card.innerHTML = `
        <a href="product-detail.html?id=${product.id}" style="text-decoration: none; display: block; color: inherit;">
            <div class="trending-img">
                <img src="${product.image}" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400'">
                ${badge ? `<div class="trending-badge">${badge}</div>` : ''}
            </div>
            <div class="trending-info text-center">
                <h3 class="trending-title" style="color:#ffffff !important; font-weight:700;">${title}</h3>
                <p class="trending-price" style="color:#ffffff !important; margin-bottom: 15px;">QR ${product.price}</p>
                <span style="color: var(--gold); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Discover <i class="fa-solid fa-arrow-right" style="margin-left: 5px;"></i></span>
            </div>
        </a>
    `;
    return card;
}

function getBrandName(product) {
    if (!product || !product.title_en) return 'Flower Perfumes';
    return product.title_en.split(' - ')[0].trim();
}

function getHomeProducts(products) {
    let filtered = [...products];

    if (homeCategoryFilter !== 'all') {
        filtered = filtered.filter((product) => product.category === homeCategoryFilter);
    }

    if (homeSearchTerm) {
        const search = homeSearchTerm.toLowerCase();
        filtered = filtered.filter((product) =>
            (product.title_en && product.title_en.toLowerCase().includes(search)) ||
            (product.title_ar && product.title_ar.includes(search)) ||
            (product.type_en && product.type_en.toLowerCase().includes(search)) ||
            (getBrandName(product).toLowerCase().includes(search))
        );
    }

    // Ensure variety by picking first from different brands when showing "All"
    if (homeCategoryFilter === 'all' && !homeSearchTerm) {
        const brands = new Set();
        const diverse = [];
        const others = [];
        for (const p of filtered) {
            const b = getBrandName(p);
            if (!brands.has(b)) {
                brands.add(b);
                diverse.push(p);
            } else {
                others.push(p);
            }
        }
        filtered = [...diverse, ...others];
    }

    return filtered.slice(0, 8);
}

function renderBrandDiscovery() {
    const container = document.getElementById('brand-grid');
    if (!container || allProducts.length === 0) return;

    const grouped = new Map();
    allProducts.forEach((product) => {
        const brand = getBrandName(product);
        if (!grouped.has(brand)) grouped.set(brand, []);
        grouped.get(brand).push(product);
    });

    const topBrands = [...grouped.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 4);

    container.innerHTML = topBrands.map(([brand, items]) => {
        const hero = items[0];
        return `
            <article class="brand-card">
                <img src="${hero.image}" alt="${brand}" loading="lazy" onerror="this.src='images/perfume1.jpg'">
                <div class="brand-card-body">
                    <h3>${brand}</h3>
                    <p>${items.length} perfumes curated for luxury gifting, signature wear, and everyday elegance.</p>
                    <a href="shop.html?q=${encodeURIComponent(brand)}">Browse ${brand}</a>
                </div>
            </article>
        `;
    }).join('');
}

function setupCollectionTools() {
    const searchInput = document.getElementById('home-search');
    const searchLink = document.getElementById('home-search-link');
    const filterButtons = document.querySelectorAll('#quick-filters .filter-pill');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            homeSearchTerm = event.target.value.trim();
            if (searchLink) {
                const searchParam = homeSearchTerm ? `?q=${encodeURIComponent(homeSearchTerm)}` : '';
                searchLink.href = `shop.html${searchParam}`;
            }
            renderProducts();
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((pill) => pill.classList.remove('active'));
            button.classList.add('active');
            homeCategoryFilter = button.dataset.filter || 'all';
            renderProducts();
        });
    });
}

function renderProducts(productsToRender) {
    const container = document.getElementById('product-container') || document.getElementById('shop-container');
    if (!container) return;
    
    // If no products provided, try to fetch from global store
    const products = productsToRender || (window.getProducts ? window.getProducts() : []);
    
    if (!products || products.length === 0) {
        // Don't clear if we're still waiting for data
        if (!productsToRender) return; 
        container.innerHTML = '<p class="text-center" style="width:100%; color:#888;">No perfumes found.</p>';
        return;
    }

    const isHomeCollection = container.id === 'product-container' && !document.getElementById('shop-container');
    const productsForView = isHomeCollection ? getHomeProducts(products) : products;

    container.innerHTML = '';
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';

    productsForView.forEach(product => {
        const title = lang === 'ar' ? product.title_ar : product.title_en;
        const type = lang === 'ar' ? product.type_ar : product.type_en;
        const badge = lang === 'ar' ? product.badge_ar : product.badge_en;
        const brand = getBrandName(product);

        const card = document.createElement('div');
        card.className = 'collection-card reveal active';
        let badgeHtml = badge ? `<div class="card-badge premium">${badge}</div>` : '';

        if (isHomeCollection) {
            card.innerHTML = `
                <div class="card-image" style="height: 100%;">
                    <a href="product-detail.html?id=${product.id}" style="display:block; height:100%;">
                        <img src="${product.image}" alt="${title}" loading="lazy" onerror="this.src='images/perfume1.jpg'" style="height: 100%; object-fit: cover;">
                    </a>
                    ${badgeHtml}
                    <div class="card-info-overlay">
                        <p class="product-brand">${brand}</p>
                        <p class="product-type">${type}</p>
                        <p class="product-price">QR ${product.price}</p>
                        <div class="card-actions">
                            <button class="btn btn-gold" onclick="addToCart(${product.id})">ADD TO CART</button>
                            <a href="product-detail.html?id=${product.id}" class="btn btn-outline">VIEW</a>
                        </div>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <a href="product-detail.html?id=${product.id}" style="text-decoration: none; display: block; color: inherit; height: 100%;">
                    <div class="card-image">
                        <img src="${product.image}" alt="${title}" onerror="this.src='images/perfume1.jpg'">
                        ${badgeHtml}
                    </div>
                    <div class="card-info text-center">
                        <h3 class="product-title" style="color:#ffffff !important;">${title}</h3>
                        <p class="product-type" style="color:#aaa;">${type}</p>
                        <p class="product-price" style="color:#ffffff !important; margin-bottom: 15px;">QR ${product.price}</p>
                        <span style="color: var(--gold); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Discover <i class="fa-solid fa-arrow-right" style="margin-left: 5px;"></i></span>
                    </div>
                </a>
            `;
        }
        container.appendChild(card);
    });
}

// --- Standard UI Logic ---
function initUILogic() {
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const mobileNav = document.getElementById("mobile-nav");
    const langToggle = document.getElementById("lang-toggle");
    const mobileLangToggle = document.getElementById("mobile-lang-toggle");

    if (menuBtn && mobileNav) {
        menuBtn.onclick = () => mobileNav.classList.add("active");
    }
    if (closeBtn && mobileNav) {
        closeBtn.onclick = () => mobileNav.classList.remove("active");
    }

    if (langToggle) {
        langToggle.onclick = () => setLanguage(currentLang === 'en' ? 'ar' : 'en');
    }
    if (mobileLangToggle) {
        mobileLangToggle.onclick = () => setLanguage(currentLang === 'en' ? 'ar' : 'en');
    }
    
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById("nav-cart-count");
    if (!badge) return;
    
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    badge.textContent = count;
    badge.style.opacity = count > 0 ? "1" : "0";
}

// Global exposure
window.updateCartBadge = updateCartBadge;
window.initUILogic = initUILogic;

// Run on load
document.addEventListener("DOMContentLoaded", initUILogic);
document.addEventListener("DOMContentLoaded", setupCollectionTools);
window.addEventListener("load", updateCartBadge);

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.dir = (lang === "ar" ? "rtl" : "ltr");
    document.documentElement.lang = lang;
    const langToggle = document.getElementById('lang-toggle');
    const mobileLangToggle = document.getElementById('mobile-lang-toggle');
    if (langToggle) langToggle.innerHTML = `<span>${lang === 'en' ? 'عربي' : 'English'}</span>`;
    if (mobileLangToggle) mobileLangToggle.textContent = (lang === 'en' ? 'عربي' : 'English');

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    renderProducts();
}

function initLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    const mobileLangToggle = document.getElementById('mobile-lang-toggle');
    
    if (langToggle) {
        langToggle.onclick = () => setLanguage(currentLang === 'en' ? 'ar' : 'en');
    }
    if (mobileLangToggle) {
        mobileLangToggle.onclick = () => setLanguage(currentLang === 'en' ? 'ar' : 'en');
    }
}

// Global export to call after header loads
window.initLanguageToggle = initLanguageToggle;

function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
        });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}


// Particles
(function() {
    const container = document.getElementById("particles");
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.animationDuration = (Math.random() * 5 + 5) + "s";
        container.appendChild(p);
    }
})();

window.renderProducts = renderProducts;

document.addEventListener('DOMContentLoaded', () => { 
    setTimeout(() => { 
        if (window.renderTrending) window.renderTrending(); 
        if (window.renderProducts) window.renderProducts(); 
    }, 500); 
});

window.renderHomepageSections = () => { 
    renderProducts(); 
    renderBrandDiscovery();
    renderTrending(); 
    renderLatest(); 
};
