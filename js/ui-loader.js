// ui-loader.js - Dynamically fetches and injects shared header and footer
async function loadComponent(elementId, filePath, callback) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        const html = await response.text();
        placeholder.innerHTML = html;
        if (callback) callback();
    } catch (error) {
        console.error("Error loading component:", error);
    }
}

function initHeaderLogic() {
    const menuBtn = document.getElementById("menu-btn");
    const mobileNav = document.getElementById("mobile-nav");
    const closeBtn = document.getElementById("close-btn");

    if (menuBtn && mobileNav) {
        menuBtn.onclick = () => mobileNav.classList.add("active");
    }
    if (closeBtn && mobileNav) {
        closeBtn.onclick = () => mobileNav.classList.remove("active");
    }

    // Sync active state based on current page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (window.updateCartBadge) window.updateCartBadge();
    if (window.initLanguageToggle) window.initLanguageToggle();
    if (window.updateAuthUI) window.updateAuthUI();

    // Scroll Logic for Header Top Bar
    const header = document.getElementById("header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 30) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }
}

function initFooterLogic() {
    const scrollTopBtn = document.getElementById("scroll-to-top");
    if (scrollTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add("visible");
            } else {
                scrollTopBtn.classList.remove("visible");
            }
        });
        scrollTopBtn.onclick = (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', '/header.html', initHeaderLogic);
    loadComponent('footer-placeholder', '/footer.html', initFooterLogic);
});
