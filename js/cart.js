// js/cart.js - Robust cart logic handling both ID and DOM extraction
let cart = JSON.parse(localStorage.getItem('cartItems')) || [];

const updateCartBadge = () => {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
        badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 300);
    }
};


const saveCart = () => {
    localStorage.setItem('cartItems', JSON.stringify(cart));
    updateCartBadge();
    console.log("Cart updated:", cart);
};

// Main Add to Cart Function - used by onclick="addToCart(id)"
window.addToCart = function(productId, quantity = 1) {
    let productData = null;

    // 1. Try to get data from global getProductById (data.js)
    if (productId && window.getProductById) {
        productData = window.getProductById(productId);
    }

    // 2. If no product data but we have an event, try DOM scraping (as requested for redo)
    if (!productData && (window.event || arguments[2])) {
        const e = window.event || arguments[2];
        const btn = e.target.closest('button');
        const card = btn ? btn.closest('.product-card') : null;
        
        if (card) {
            try {
                const title = card.querySelector('.product-title-link, h3')?.textContent.trim();
                const priceText = card.querySelector('.price')?.textContent || "0";
                const price = Number(priceText.replace('QR', '').replace(',', '').trim());
                const img = card.querySelector('img')?.src || '';
                const id = productId || Date.now();
                
                productData = { id, title, price, image: img };
            } catch (err) {
                console.error("DOM scraping failed", err);
            }
        }
    }

    if (!productData && productId) {
        // Final fallback if we only have an ID but no data.js or DOM match
        productData = { id: productId, title: "Product " + productId, price: 0 };
    }

    if (productData) {
        const existing = cart.find(item => item.id == productData.id);
        if (existing) {
            existing.quantity = Number(existing.quantity) + Number(quantity);
        } else {
            cart.push({
                id: productData.id,
                title: productData.title_en || productData.title || "Unknown Product",
                price: Number(productData.price || 0),
                image: productData.image || '',
                quantity: Number(quantity)
            });
        }
        saveCart();
        if (window.showToast) window.showToast(`Added ${productData.title_en || productData.title || 'Product'} to cart!`);
    } else {
        console.error("Could not determine product data to add to cart.");
    }
};

// Global Helpers
window.getCart = () => cart;
window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id != id);
    saveCart();
};
window.clearCart = () => {
    cart = [];
    saveCart();
};
window.updateCartQuantity = (id, qty) => {
    const item = cart.find(item => item.id == id);
    if (item && qty > 0) {
        item.quantity = Number(qty);
        saveCart();
    } else if (qty <= 0) {
        window.removeFromCart(id);
    }
};

// Ensure badge is correct on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
