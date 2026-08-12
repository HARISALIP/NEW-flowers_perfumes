// data.js — Product data layer for Hostinger PHP + MySQL version
// All API calls now route to PHP endpoints

const API_PRODUCTS   = '/api/products.php';
const API_PRODUCT    = '/api/product.php';
const API_CATEGORIES = '/api/categories.php';
const API_ADD        = '/api/add-product.php';
const API_UPDATE     = '/api/update-product.php';
const API_DELETE     = '/api/delete-product.php';

let products = [];

// ── LocalStorage fallback helpers ──
const saveToLocalStorage = (data) => {
    try { localStorage.setItem('flower_perfumes_products', JSON.stringify(data)); } catch(e) {}
};

// ── Load all products from PHP/MySQL ──
export const loadProducts = async () => {
    try {
        const response = await fetch(API_PRODUCTS);
        if (!response.ok) throw new Error('Network error');
        products = await response.json();
        saveToLocalStorage(products);
        console.log(`Products loaded from API: ${products.length}`);
    } catch (error) {
        console.warn("API failed, using localStorage fallback:", error);
        const stored = localStorage.getItem('flower_perfumes_products');
        products = stored ? JSON.parse(stored) : [];
    }

    // Trigger UI updates once data is ready
    const triggerUpdates = () => {
        if (window.renderHomepageSections) window.renderHomepageSections();
        if (window.renderAdminProducts)    window.renderAdminProducts();
        if (window.renderShopProducts)     window.renderShopProducts();
        if (window.renderCart)             window.renderCart();
        if (window.renderProductDetails)   window.renderProductDetails();
        if (window.renderProducts)         window.renderProducts();
    };

    triggerUpdates();
    setTimeout(triggerUpdates, 500);
    setTimeout(triggerUpdates, 2000);
};

// Start loading immediately
loadProducts();

// ── Sync getters ──
export const getProducts          = ()    => products;
export const getProductById       = (id)  => products.find(p => p.id === parseInt(id));
export const getFeaturedProducts  = ()    => products.filter(p => p.featured);
export const getProductsByCategory = (cat) => products.filter(p => p.category === cat);

export const getCategories = () => {
    const cats = new Set();
    products.forEach(p => cats.add(p.category || 'Perfume'));
    return Array.from(cats);
};

// ── Mutations — individual PHP endpoints ──
export const addProduct = async (product) => {
    try {
        const formData = new FormData();
        Object.entries(product).forEach(([k, v]) => {
            formData.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
        });
        const res = await fetch(API_ADD, { method: 'POST', body: formData });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Add failed');
        // Reload from server so IDs are fresh
        await loadProducts();
        return json;
    } catch(e) {
        console.error("addProduct failed:", e);
        throw e;
    }
};

export const updateProduct = async (id, updatedProduct) => {
    try {
        const formData = new FormData();
        formData.append('id', id);
        Object.entries(updatedProduct).forEach(([k, v]) => {
            formData.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
        });
        const res = await fetch(API_UPDATE, { method: 'POST', body: formData });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Update failed');
        await loadProducts();
        return true;
    } catch(e) {
        console.error("updateProduct failed:", e);
        throw e;
    }
};

export const deleteProduct = async (id) => {
    try {
        const formData = new FormData();
        formData.append('id', id);
        const res = await fetch(API_DELETE, { method: 'POST', body: formData });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Delete failed');
        await loadProducts();
        return true;
    } catch(e) {
        console.error("deleteProduct failed:", e);
        throw e;
    }
};

// ── Global scope exposure (for non-module scripts) ──
window.getProducts           = getProducts;
window.getProductById        = getProductById;
window.getFeaturedProducts   = getFeaturedProducts;
window.getProductsByCategory = getProductsByCategory;
window.getCategories         = getCategories;
window.addProduct            = addProduct;
window.updateProduct         = updateProduct;
window.deleteProduct         = deleteProduct;
window.loadProducts          = loadProducts;
