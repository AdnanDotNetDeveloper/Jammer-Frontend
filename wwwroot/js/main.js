/**
 * Jammer E-commerce - Main functionality
 * Modern theme with enhanced user experience
 */

// Theme configuration
const theme = {
    primary: '#3B82F6',      // Blue
    secondary: '#10B981',    // Green
    accent: '#F472B6',       // Pink
    neutral: '#111827',      // Dark gray
    danger: '#EF4444',       // Red
    warning: '#F59E0B',      // Amber
    info: '#3B82F6',         // Blue
    success: '#10B981',      // Green
    background: '#F9FAFB',   // Light gray
    light: '#FFFFFF',        // White
    dark: '#111827'          // Dark gray
};

// DOM Elements
const userIconContainer = document.querySelector("#account-icons");
const userIcon = document.querySelector("#main-user-icon");
const menuToggle = document.querySelector(".menu-mobile-icon");
const menuMobile = document.querySelector("#menu-mobile");
const closeMenuBtn = document.querySelector(".close-menu-mobile-btn");
const scrollToTopBtn = document.querySelector(".scroll-to-top-btn");
const departmentBtn = document.querySelector(".menu-department-btn");
const subMenuDepartment = document.querySelector(".sub-menu-department");

// Authentication state management
function updateAuthUI() {
    const token = Cookies.get('Token');
    
    if (!token) {
        if (userIconContainer) userIconContainer.style.display = "none";
        if (userIcon) userIcon.style.display = "flex";
    } else {
        if (userIconContainer) userIconContainer.style.display = "flex";
        if (userIcon) userIcon.style.display = "none";
    }
}

// Initialize UI components
function initializeUI() {
    // Auth UI
    updateAuthUI();
    
    // Mobile menu functionality
    if (menuToggle && menuMobile) {
        menuToggle.addEventListener("click", () => {
            menuMobile.classList.add("open");
            document.body.style.overflow = "hidden";
        });
    }
    
    if (closeMenuBtn && menuMobile) {
        closeMenuBtn.addEventListener("click", () => {
            menuMobile.classList.remove("open");
            document.body.style.overflow = "";
        });
    }
    
    // Department menu toggle
    if (departmentBtn && subMenuDepartment) {
        departmentBtn.addEventListener("click", () => {
            subMenuDepartment.classList.toggle("active");
        });
        
        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (!departmentBtn.contains(e.target) && !subMenuDepartment.contains(e.target)) {
                subMenuDepartment.classList.remove("active");
            }
        });
    }
    
    // Scroll to top functionality
    if (scrollToTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add("active");
                scrollToTopBtn.style.opacity = "1";
                scrollToTopBtn.style.visibility = "visible";
            } else {
                scrollToTopBtn.classList.remove("active");
                scrollToTopBtn.style.opacity = "0";
                scrollToTopBtn.style.visibility = "hidden";
            }
        });
        
        scrollToTopBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
    
    // Add hover effects to all product cards
    addProductCardEffects();
    
    // Setup login/signup buttons
    setupAuthButtons();
}

// Product card hover effects
function addProductCardEffects() {
    const style = document.createElement('style');
    style.textContent = `
        .product-item {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .product-item .list-action {
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
            z-index: 10;
        }
        .product-item:hover .list-action {
            opacity: 1;
            transform: translateY(0);
        }
        .hover-zoom {
            overflow: hidden;
            border-radius: 8px;
        }
        .hover-zoom img {
            transition: transform 0.5s ease;
        }
        .hover-zoom:hover img {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
}

// Setup auth buttons
function setupAuthButtons() {
    const loginBtn = document.getElementById("login");
    const signupBtn = document.getElementById("signup");
    const logoutBtn = document.getElementById("logout");
    
    if (loginBtn) {
        loginBtn.addEventListener("click", function() {
            localStorage.setItem("previousUrl", window.location.href);
            window.location.pathname = "/Home/login";
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener("click", function() {
            localStorage.setItem("previousUrl", window.location.href);
            window.location.pathname = "/Home/signup";
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            Cookies.remove('Token');
            localStorage.removeItem('user');
            updateAuthUI();
            window.location.pathname = "/";
        });
    }
}

// Initialize theme colors
function applyThemeColors() {
    const root = document.documentElement;
    
    // Set CSS variables for the theme
    Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });
    
    // Update specific elements
    const primaryButtons = document.querySelectorAll('.button-main');
    primaryButtons.forEach(btn => {
        btn.style.backgroundColor = theme.primary;
    });
}

// Document ready event
document.addEventListener("DOMContentLoaded", function() {
    initializeUI();
    applyThemeColors();
    
    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false,
            mirror: true,
            anchorPlacement: 'top-bottom'
        });
    }
});

// Export theme for other modules
window.jammerTheme = theme;