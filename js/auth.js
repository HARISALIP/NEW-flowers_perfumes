// auth.js — PHP session-based authentication for Hostinger version
// Replaces the old hardcoded client-side credential check

let currentUser = null;

// ── Load user from localStorage on startup ──
const storedUser = localStorage.getItem('fp_user');
if (storedUser) {
    try { currentUser = JSON.parse(storedUser); } catch(e) {}
}

// ── Login: POST to PHP session endpoint ──
const login = async (email, password) => {
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const res = await fetch('/api/login.php', { method: 'POST', body: formData });
        const json = await res.json();

        if (json.success) {
            currentUser = json.user;
            localStorage.setItem('fp_user', JSON.stringify(currentUser));
            localStorage.setItem('isLoggedIn', 'true');
            updateAuthUI();
            return true;
        } else {
            return false;
        }
    } catch(e) {
        console.error("Login error:", e);
        return false;
    }
};

// ── Logout: call PHP to destroy session ──
const logout = async () => {
    try {
        await fetch('/api/logout.php', { method: 'POST' });
    } catch(e) {}
    currentUser = null;
    localStorage.removeItem('fp_user');
    localStorage.removeItem('isLoggedIn');
    updateAuthUI();
    window.location.href = '/index.html';
};

// ── Session check against PHP ──
const checkSession = async () => {
    try {
        const res = await fetch('/api/session-check.php');
        const json = await res.json();
        if (json.loggedIn && json.user) {
            currentUser = json.user;
            localStorage.setItem('fp_user', JSON.stringify(currentUser));
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            currentUser = null;
            localStorage.removeItem('fp_user');
            localStorage.removeItem('isLoggedIn');
        }
        updateAuthUI();
    } catch(e) {}
};

const getUser          = ()  => currentUser;
const isAuthenticated  = ()  => !!currentUser && localStorage.getItem('isLoggedIn') === 'true';
const isAdmin          = ()  => currentUser !== null && currentUser.role === 'admin';

// ── Update UI elements based on auth state ──
const updateAuthUI = () => {
    const authLinks  = document.querySelectorAll('.auth-link');
    const adminLinks = document.querySelectorAll('.admin-nav-item');

    authLinks.forEach(link => {
        if (isAuthenticated()) {
            link.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
            link.href = "#";
            link.onclick = (e) => {
                e.preventDefault();
                if (confirm('Do you want to logout?')) logout();
            };
        } else {
            link.innerHTML = `<i class="fa-solid fa-user"></i> Login`;
            link.href = "login.php";
            link.onclick = null;
        }
    });

    adminLinks.forEach(item => {
        item.style.display = isAdmin() ? 'block' : 'none';
    });
};

document.addEventListener('DOMContentLoaded', () => {
    checkSession();       // verify with server on every page load
    updateAuthUI();
});

// ── Global scope ──
window.login           = login;
window.logout          = logout;
window.getUser         = getUser;
window.isAuthenticated = isAuthenticated;
window.isAdmin         = isAdmin;
window.updateAuthUI    = updateAuthUI;
window.checkSession    = checkSession;
