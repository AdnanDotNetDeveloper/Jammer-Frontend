/**
 * Jammer E-commerce Frontend
 * Modern JS implementation with improved architecture
 */

// Core application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS animation library if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false,
            mirror: true
        });
    }
    
    // Initialize all sections
    fetchProducts();           // Main products and deals
    fetchTopRatedProducts();   // Top rated products section
    fetchRecommendedProducts(); // Recommended products
    fetchBanner();             // Banner images
    fetchCategories();         // Categories
    initSearchFunctionality(); // Search functionality
    
    // Initialize scroll to top button functionality
    const scrollToTopBtn = document.querySelector('.scroll-to-top-btn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('active', 'flex');
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.remove('active');
                scrollToTopBtn.classList.add('hidden');
            }
        });
        
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add global hover style for all product items
    const style = document.createElement('style');
    style.textContent = `
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
        .scroll-to-top-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background-color: #263587;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            z-index: 100;
        }
        .scroll-to-top-btn.active {
            opacity: 1;
        }
        .scroll-to-top-btn:hover {
            transform: translateY(-5px);
        }
    `;
    document.head.appendChild(style);
});

// Main initialization function
const initializeApp = () => {
    // Check user authentication status
    checkAuthStatus();
    
    // Initialize search functionality
    initSearchFunctionality();
    
    // Initialize product loading
    loadAllProducts();
    
    // Enable animation on scroll if AOS is available
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }

    // Check if elements exist before adding event listeners
    const wishlistButton = document.getElementById('to-wishlist');
    if (wishlistButton) {
        wishlistButton.addEventListener('click', () => {
            window.location.href = '/Home/Wishlist';
        });
    }
    
    const cartButton = document.getElementById('to-cart');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            window.location.href = '/Home/Cart';
        });
    }
    
    // Initialize components with error handling
    try {
        // Handle API errors gracefully
        fetchProducts().catch(error => {
            console.error('Error loading products:', error);
            // Show a user-friendly message
            UIHelper.showPopup('Some product data could not be loaded. Please try again later.', false);
        });
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};

/**
 * Authentication and User Management
 */
const checkAuthStatus = () => {
    const userIconContainer = document.querySelector("#account-icons");
    const userIcon = document.querySelector("#user-icon");
    
    if (!userIconContainer || !userIcon) return;
    
    const token = Cookies.get('Token');
    
    if (!token) {
        userIconContainer.style.display = "none";
        userIcon.style.display = "flex";
    } else {
        userIconContainer.style.display = "flex"; 
        userIcon.style.display = "none";
    }
};

/**
 * API Service Module - Handles all API calls
 */
const ApiService = {
    baseUrl: 'https://jammerapi.mahmadamin.com/api',
    
    // Get auth header with token if available
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth) {
            const token = Cookies.get('Token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },
    
    // Generic API request method
    async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
        try {
            const url = `${this.baseUrl}/${endpoint}`;
            const options = {
                method,
                headers: this.getHeaders(requiresAuth)
            };
            
            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },
    
    // Specific API methods
    async searchProducts(query) {
        return this.request(`Product/SearchProductsByName?query=${encodeURIComponent(query)}`, 'GET', null, false);
    },
    
    async getRandomProducts() {
        return this.request('Coupon/GetRandomCouponProducts');
    },
    
    async getTopRatedProducts() {
        return this.request('Product/GetProductsWithPaging?pageNumber=1&pageSize=10');
    },
    
    async getCategories() {
        return this.request('Category/GetAllCategories', 'GET', null, false);
    },
    
    async getProductsByCategory(categoryId) {
        return this.request(`Product/FilterProductsByCategory/${categoryId}`);
    },
    
    async getBanners() {
        return this.request('Banner/GetAllBanners');
    },
    
    async getProductById(productId) {
        return this.request(`Product/GetProductById?productId=${productId}`);
    },
    
    async addToWishlist(productId, quantity = 1, couponId = 0) {
        return this.request('WishList/AddWishList', 'POST', { productId, quantity, couponId });
    },
    
    async addToCart(productId, quantity = 1, couponId = 0) {
        return this.request('Cart/AddToCart', 'POST', { productId, quantity, couponId });
    }
};

/**
 * UI Helper Module - Handles notifications and UI elements
 */
const UIHelper = {
    // Show popup notification
    showPopup(message, success = true) {
        const popup = document.getElementById('popup-message');
        if (!popup) return;
        
        popup.style.top = "15%";
        popup.style.right = "1%";
        popup.style.zIndex = "500";
        
        popup.textContent = message;
        popup.classList.remove('hidden', 'bg-red', 'bg-green');
        popup.classList.add(success ? 'bg-green' : 'bg-red');
        
        // Add fade-in animation
        popup.classList.add('fade-in');
        
        setTimeout(() => {
            popup.classList.add('hidden');
            popup.classList.remove('fade-in');
        }, 3000);
    },
    
    // Create loading spinner
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner flex justify-center items-center py-10';
        spinner.innerHTML = '<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#263587]"></div>';
        return spinner;
    }
};

/**
 * Search Functionality
 */
const initSearchFunctionality = () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchPopup = document.getElementById('search-popup');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const searchButtonMobile = document.getElementById('search-button-mobile');
    const searchPopupMobile = document.getElementById('search-popup-mobile');
    
    if (!searchInput || !searchButton || !searchPopup) return;
    
    // Desktop search
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });
    
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
    
    // Mobile search if elements exist
    if (searchButtonMobile && searchInputMobile && searchPopupMobile) {
        searchButtonMobile.addEventListener('click', () => {
            const query = searchInputMobile.value.trim();
            if (query) {
                performSearch(query, true);
            }
        });
        
        searchInputMobile.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const query = searchInputMobile.value.trim();
                if (query) {
                    performSearch(query, true);
                }
            }
        });
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', (event) => {
        if (searchPopup && !searchPopup.contains(event.target) && !searchButton.contains(event.target) && !searchInput.contains(event.target)) {
            searchPopup.classList.add('hidden');
        }
        
        if (searchPopupMobile && !searchPopupMobile.contains(event.target) && !searchButtonMobile?.contains(event.target) && !searchInputMobile?.contains(event.target)) {
            searchPopupMobile.classList.add('hidden');
        }
    });
    
    // Search function
    async function performSearch(query, isMobile = false) {
        try {
            const response = await ApiService.searchProducts(query);
            const targetPopup = isMobile ? searchPopupMobile : searchPopup;
            
            if (response && response.data) {
                displaySearchResults(response.data, targetPopup, isMobile);
            } else {
                UIHelper.showPopup('No search results found', false);
            }
        } catch (error) {
            UIHelper.showPopup('Error searching products', false);
        }
    }
    
    // Display search results
    function displaySearchResults(products, popupElement, isMobile = false) {
        if (!popupElement) return;
        
        popupElement.innerHTML = '';
        popupElement.classList.remove('hidden');
        
        const limitedProducts = products.slice(0, 5);
        
        popupElement.classList.add(
            'absolute',
            'top-14',
            'bg-white',
            'border',
            'border-gray-300',
            'z-50',
            'p-4',
            'shadow-lg',
            'rounded-lg',
            isMobile ? 'right-6' : 'left-8'
        );
        
        if (limitedProducts.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'text-center py-4 text-gray-500';
            noResults.textContent = 'No results found';
            popupElement.appendChild(noResults);
            return;
        }
        
        limitedProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('flex', 'items-center', 'justify-between', 'mb-4', 'gap-2', 'hover:bg-gray-50', 'p-2', 'rounded');
            
            const img = document.createElement('img');
            img.src = `https://jammerapi.mahmadamin.com${product.imagePath[0]}`;
            img.alt = product.name;
            img.classList.add('w-12', 'h-12', 'object-cover', 'mr-4', 'rounded');
            
            const productName = document.createElement('p');
            productName.textContent = product.name;
            productName.classList.add('flex-1', 'truncate');
            
            const viewMoreBtn = document.createElement('button');
            viewMoreBtn.textContent = 'View';
            viewMoreBtn.classList.add('text-blue', 'ml-4', 'px-3', 'py-1', 'rounded', 'bg-[#263587]', 'text-white', 'hover:bg-opacity-90', 'transition');
            viewMoreBtn.addEventListener('click', () => {
                window.location.href = `/Home/Product?productUrl=${product.productURL}`;
            });
            
            productDiv.appendChild(img);
            productDiv.appendChild(productName);
            productDiv.appendChild(viewMoreBtn);
            productDiv.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    window.location.href = `/Home/Product?productUrl=${product.productURL}`;
                }
            });
            
            popupElement.appendChild(productDiv);
        });
        
        const viewAllBtn = document.createElement('button');
        viewAllBtn.textContent = 'View All Results';
        viewAllBtn.classList.add('button-main', 'mt-4', 'w-full', 'text-center', 'bg-gray-100', 'hover:bg-gray-200', 'transition');
        viewAllBtn.addEventListener('click', () => {
            const searchQuery = popupElement === searchPopupMobile ? searchInputMobile.value.trim() : searchInput.value.trim();
            window.location.href = `/Home/Search?query=${encodeURIComponent(searchQuery)}`;
        });
        
        popupElement.appendChild(viewAllBtn);
    }
};

/**
 * Product Loading and Display Functions
 */
const loadAllProducts = async () => {
    try {
        // Load everything in parallel for better performance
        await Promise.all([
            fetchProducts(),
            fetchBanner(),
            fetchCategories()
        ]);
        
        if (typeof AOS !== 'undefined') {
            // Refresh AOS after dynamic content is loaded
            setTimeout(() => AOS.refresh(), 500);
        }
    } catch (error) {
        console.error("Error loading initial data:", error);
        UIHelper.showPopup('Error loading page content', false);
    }
};

/**
 * Main Product Functions
 */
async function fetchProducts() {
    // Initial loading indicator
    document.querySelector('#recommended-product-con')?.innerHTML = '<div class="flex justify-center py-10"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#263587]"></div></div>';
    document.querySelector('#list')?.innerHTML = '<div class="flex justify-center py-10"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#263587]"></div></div>';
    
    try {
        // Fetch categories
        await fetchCategories();
        
        // Fetch banners
        await fetchBanner();
        
        // Fetch top rated and recommended products in parallel
        const [topRatedData, recommendedData] = await Promise.allSettled([
            ApiService.getTopRatedProducts(),
            ApiService.getTopRatedProducts() // Using same API for both sections for now
        ]);
        
        // Process top rated products if available
        if (topRatedData.status === 'fulfilled' && topRatedData.value?.data) {
            fetchTopRatedProducts(topRatedData.value.data);
        } else {
            fetchTopRatedProducts([]);
        }
        
        // Process recommended products if available
        if (recommendedData.status === 'fulfilled' && recommendedData.value?.data) {
            fetchRecommendedProducts(recommendedData.value.data);
        } else {
            fetchRecommendedProducts([]);
        }
        
        // Initialize any remaining UI components
        initializeSwiper();
        
    } catch (error) {
        console.error('Error fetching products:', error);
        UIHelper.showPopup('Error loading product data', false);
    }
}

// Create product card element - reusable function for different sections
function createProductCard(product, index = 0, variant = 'standard') {
    const productLink = document.createElement('a');
    productLink.href = `/Home/Product?productUrl=${product.productURL}`;
    productLink.className = 'block'; 
    
    // Add AOS animation with cascade effect
    if (typeof AOS !== 'undefined') {
        productLink.setAttribute('data-aos', 'fade-up');
        productLink.setAttribute('data-aos-delay', (100 + (index * 50) % 400).toString());
        productLink.setAttribute('data-aos-duration', '800');
        productLink.setAttribute('data-aos-easing', 'ease-in-out');
    }

    const productCard = document.createElement('div');
    productCard.className = `product-item ${variant === 'list' ? 'style-marketplace-list flex items-center gap-4' : 'style-marketplace'} p-4 border border-line rounded-2xl flex ${variant === 'list' ? 'flex-row' : 'flex-col'} justify-between relative hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1`;

    // Create the image container
    const bgImgDiv = document.createElement('div');
    bgImgDiv.className = `bg-img relative ${variant === 'list' ? 'lg:w-[150px] w-[120px] flex-shrink-0' : 'w-full'} aspect-1/1 flex justify-center overflow-hidden rounded-lg`;

    const productImg = document.createElement('img');
    productImg.className = "object-cover rounded transition-transform duration-500 hover:scale-110";
    productImg.src = `https://jammerapi.mahmadamin.com${product.imagePaths ? product.imagePaths[0] : product.imagePath[0]}`;
    productImg.alt = product.productName || product.name;
    productImg.style.height = variant === 'list' ? "150px" : "200px";
    
    bgImgDiv.appendChild(productImg);

    // Add action buttons
    const listActionDiv = createActionButtons(product);
    bgImgDiv.appendChild(listActionDiv);

    // Add hover effect for the action buttons
    productCard.addEventListener('mouseover', () => {
        listActionDiv.style.opacity = '1';
        listActionDiv.style.transform = 'translateY(0)';
    });

    productCard.addEventListener('mouseout', () => {
        listActionDiv.style.opacity = '0';
        listActionDiv.style.transform = 'translateY(10px)';
    });

    // Create product info
    const productInfoDiv = document.createElement('div');
    productInfoDiv.className = `product-infor mt-4 flex flex-col justify-between ${variant === 'list' ? 'flex-grow' : 'flex-grow'}`;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'text-title font-medium line-clamp-2 hover:text-[#263587] transition-colors';
    titleSpan.textContent = product.productName || product.name;

    const starDiv = document.createElement('div');
    starDiv.className = 'flex gap-0.5 mt-1';
    
    // Show actual rating if available, otherwise use 5 stars
    const rating = product.rating || 5;
    for (let i = 0; i < 5; i++) {
        const starIcon = document.createElement('i');
        if (i < rating) {
            starIcon.className = 'ph-fill ph-star text-sm text-yellow';
        } else {
            starIcon.className = 'ph ph-star text-sm text-yellow';
        }
        starDiv.appendChild(starIcon);
    }

    const priceSpan = document.createElement('span');
    priceSpan.className = 'text-title inline-block mt-1 font-semibold text-[#263587]';
    priceSpan.textContent = `PKR ${(product.price || 0).toFixed(2)}`;

    const discountPriceElement = document.createElement('del');
    discountPriceElement.classList.add('caption2', 'text-secondary', 'ml-2');
    
    if (product.discountedPrice && product.discountedPrice > product.price) {
        discountPriceElement.textContent = `PKR ${product.discountedPrice}`;
    }

    productInfoDiv.appendChild(titleSpan);
    productInfoDiv.appendChild(starDiv);
    
    const priceWrapper = document.createElement('div');
    priceWrapper.className = 'flex items-center mt-2';
    priceWrapper.appendChild(priceSpan);
    
    if (product.discountedPrice && product.discountedPrice > product.price) {
        priceWrapper.appendChild(discountPriceElement);
    }
    
    productInfoDiv.appendChild(priceWrapper);

    // Add sale badge if it's on sale
    if (product.discountedPrice && product.price < product.discountedPrice) {
        const saleBadge = document.createElement('div');
        saleBadge.className = 'absolute top-2 left-2 bg-red text-white text-xs font-bold px-2 py-1 rounded-full z-10';
        saleBadge.textContent = 'SALE';
        productCard.appendChild(saleBadge);
    }

    // Assemble the product card
    productCard.appendChild(bgImgDiv);
    productCard.appendChild(productInfoDiv);
    productLink.appendChild(productCard);

    return productLink;
}

// Create action buttons (wishlist, view, cart)
function createActionButtons(product) {
    const listActionDiv = document.createElement('div');
    listActionDiv.className = 'list-action flex flex-col gap-1 absolute top-0 right-0 z-10';

    const actionButtons = [
        { 
            class: 'add-wishlist-btn', 
            iconClass: 'ph-heart', 
            action: (e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                addToWishlist(product.productId || product.id, 1, product.couponId || 0); 
            } 
        },
        { 
            class: 'quick-view-btn', 
            iconClass: 'ph-eye' 
        },
        { 
            class: 'add-cart-btn', 
            iconClass: 'ph-shopping-bag-open', 
            action: (e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                addToCart(product.productId || product.id, 1, product.couponId || 0); 
            } 
        }
    ];

    actionButtons.forEach(action => {
        const span = document.createElement('span');
        span.className = `${action.class} w-8 h-8 bg-white flex items-center justify-center rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-100`;
        
        const icon = document.createElement('i');
        icon.className = `ph ${action.iconClass}`;
        span.appendChild(icon);

        if (action.action) {
            span.addEventListener('click', action.action);
        }

        listActionDiv.appendChild(span);
    });

    // Add opacity and transform for hover effect
    listActionDiv.style.opacity = '0';
    listActionDiv.style.transform = 'translateY(10px)';
    listActionDiv.style.transition = 'opacity 0.3s, transform 0.3s';

    return listActionDiv;
}

// Add to Wishlist Function
async function addToWishlist(productId, quantity = 1, couponId = 0) {
    try {
        const response = await ApiService.addToWishlist(productId, quantity, couponId);
        if (response && response.isSuccess) {
            UIHelper.showPopup('Product added to wishlist successfully', true);
        } else {
            UIHelper.showPopup(response?.message || 'Failed to add product to wishlist', false);
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        UIHelper.showPopup('Error adding to wishlist', false);
    }
}

// Add to Cart Function
async function addToCart(productId, quantity = 1, couponId = 0) {
    try {
        await ApiService.addToCart(productId, quantity, couponId);
        UIHelper.showPopup('Product added to cart');
    } catch (error) {
        if (error.message && error.message.includes('already')) {
            UIHelper.showPopup('Product already in cart', false);
        } else {
            UIHelper.showPopup('Error adding product to cart', false);
        }
    }
}

/**
 * Banner Functions
 */
async function fetchBanner() {
    try {
        const response = await ApiService.getBanners();
        const banners = response.data;
        
        if (banners && banners.length > 0) {
            const swiperWrapper = document.querySelector('.swiper-wrapper');
            if (!swiperWrapper) return;
            
            swiperWrapper.innerHTML = ''; 
            
            // Create slides for each banner
            banners.forEach((banner, index) => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                
                // Apply AOS animations if available
                if (typeof AOS !== 'undefined') {
                    slide.setAttribute('data-aos', 'fade-up');
                    slide.setAttribute('data-aos-delay', (100 * (index % 4)).toString());
                }
                
                const bannerLink = document.createElement('a');
                bannerLink.className = 'block';
                
                // Set appropriate link based on banner type
                if (banner.link === 1 && banner.linkId) {
                    // Product link
                    getProductUrlForBanner(banner.linkId, bannerLink);
                } else if (banner.link === 2) {
                    // Category link
                    bannerLink.href = `/Home/Category?categoryId=${banner.linkId || ''}`;
                } else {
                    // Default homepage
                    bannerLink.href = '/';
                }
                
                const bannerImg = document.createElement('img');
                bannerImg.src = `https://jammerapi.mahmadamin.com${banner.image}`;
                bannerImg.alt = 'Banner';
                bannerImg.classList.add('w-full', 'h-auto', 'object-cover');
                
                bannerLink.appendChild(bannerImg);
                slide.appendChild(bannerLink);
                swiperWrapper.appendChild(slide);
            });
            
            // Initialize Swiper
            initializeSwiper();
        } else {
            UIHelper.showPopup('No banners found', false);
        }
    } catch (error) {
        console.error("Error fetching banners:", error);
        UIHelper.showPopup('Error loading banners', false);
    }
}

// Helper function to get product URL for banner links
async function getProductUrlForBanner(productId, bannerLink) {
    try {
        if (!productId) return bannerLink || '/';
        
        const response = await ApiService.getProductById(productId);
        if (response && response.data) {
            return `/Home/Product?url=${encodeURIComponent(response.data.url)}`;
        }
        return bannerLink || '/';
    } catch (error) {
        console.error('Error fetching product for banner:', error);
        return bannerLink || '/';
    }
}

// Initialize Swiper slider
function initializeSwiper() {
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library not loaded');
        return;
    }
    
    // Initialize home banner slider
    new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        speed: 1000,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}

/**
 * Category Functions
 */
async function fetchCategories() {
    try {
        const response = await ApiService.getCategories();
        const categories = response.data;
        
        if (!categories || categories.length === 0) {
            UIHelper.showPopup('No categories found', false);
            return;
        }
        
        // Display categories in different sections
        displayCategoriesInDepartmentMenu(categories);
        displayFeaturedCategories(categories);
        displayCategoryCollections(categories);
        initializeCategoryButtons(categories);
        displayPromotionalBanners(categories);
        
        // Initialize category browsing
        if (document.getElementById('list-product')) {
            fetchProductsByParentId(categories[0]?.id || 57);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        UIHelper.showPopup('Error loading categories', false);
    }
}

// Display categories in department dropdown menu
function displayCategoriesInDepartmentMenu(categories) {
    const categoryContainer = document.querySelector('.sub-menu-department');
    if (!categoryContainer) return;
    
    categoryContainer.innerHTML = '';
    
    // Limit to top 8 categories for the menu
    const limitedCategories = categories.slice(0, 8);
    
    limitedCategories.forEach((category, index) => {
        const categoryLink = document.createElement('a');
        categoryLink.href = `/Home/Category?categoryId=${category.id}`;
        categoryLink.className = 'item py-3 whitespace-nowrap border-b border-line w-full flex items-center justify-between hover:bg-gray-50 transition-colors px-2';
        
        // Apply AOS animations if available
        if (typeof AOS !== 'undefined') {
            categoryLink.setAttribute('data-aos', 'fade-right');
            categoryLink.setAttribute('data-aos-delay', (50 * index).toString());
        }
        
        const categorySpan = document.createElement('span');
        categorySpan.className = 'flex items-center gap-2';
        
        const categoryIcon = document.createElement('i');
        // Use different icons based on category index for variety
        const iconClasses = [
            'ph-desktop-tower', 'ph-device-tablet-camera', 'ph-printer', 
            'ph-device-mobile-speaker', 'ph-keyboard', 'ph-game-controller',
            'ph-person-arms-spread', 'ph-watch', 'ph-headphones'
        ];
        categoryIcon.className = `ph-bold ${iconClasses[index % iconClasses.length]} text-lg`;
        
        const categoryName = document.createElement('span');
        categoryName.textContent = category.name;
        
        categorySpan.appendChild(categoryIcon);
        categorySpan.appendChild(categoryName);
        
        categoryLink.appendChild(categorySpan);
        
        const caretIcon = document.createElement('i');
        caretIcon.className = 'ph-bold ph-caret-right';
        categoryLink.appendChild(caretIcon);
        
        categoryContainer.appendChild(categoryLink);
    });
}

// Display categories in featured section
function displayFeaturedCategories(categories) {
    // Display first 3 categories in the banner section
    for (let i = 0; i < 3 && i < categories.length; i++) {
        const category = categories[i];
        const img = document.getElementById(`category-img-${i + 1}`);
        const title = document.getElementById(`category-name-${i + 1}`);
        const shopBtn = document.getElementById(`shop-btn-${i + 1}`);
        
        if (img && title && shopBtn) {
            img.className = 'object-cover transition-transform hover:scale-105';
            img.style.height = "200px";
            img.src = `https://jammerapi.mahmadamin.com${category.imagePath}`;
            title.textContent = category.name;
            shopBtn.textContent = `Shop ${category.name}`;
        }
    }
}

// Display category collections
function displayCategoryCollections(categories) {
    // Group categories by parent-child relationships
    const parentCategories = {};
    const childCategories = {};
    
    categories.forEach(category => {
        if (category.parentId === null) {
            parentCategories[category.id] = {
                ...category,
                children: []
            };
        } else {
            if (!childCategories[category.parentId]) {
                childCategories[category.parentId] = [];
            }
            childCategories[category.parentId].push(category);
        }
    });
    
    // Associate children with parent categories
    Object.keys(childCategories).forEach(parentId => {
        if (parentCategories[parentId]) {
            parentCategories[parentId].children = childCategories[parentId];
        }
    });
    
    // Get card elements
    const cardElements = [
        document.getElementById('category-card-1'),
        document.getElementById('category-card-2'),
        document.getElementById('category-card-3'),
        document.getElementById('category-card-4'),
    ];
    
    let cardIndex = 0;
    
    // Fill category cards with data
    Object.values(parentCategories).forEach(parentCategory => {
        if (cardIndex < cardElements.length) {
            const card = cardElements[cardIndex];
            if (!card) return;
            cardIndex++;
            
            card.innerHTML = '';
            
            // Image section
            const imageLink = document.createElement('a');
            imageLink.href = `/Home/Category?categoryId=${parentCategory.id}`;
            imageLink.className = 'w-[100px] h-[100px] flex-shrink-0';
            
            const image = document.createElement('img');
            image.src = `https://jammerapi.mahmadamin.com${parentCategory.imagePath}`;
            image.alt = parentCategory.name;
            image.className = 'object-cover transition-transform hover:scale-105';
            image.style.height = '100px';
            
            imageLink.appendChild(image);
            
            // Text content section
            const textContentDiv = document.createElement('div');
            textContentDiv.className = 'text-content w-full';
            
            const headingDiv = document.createElement('div');
            headingDiv.className = 'heading6 pb-4';
            headingDiv.textContent = parentCategory.name;
            
            const ul = document.createElement('ul');
            
            // Add child categories
            const childrenToShow = parentCategory.children.slice(0, 4); // Show max 4 children
            childrenToShow.forEach(child => {
                const li = document.createElement('li');
                li.className = 'mt-1';
                
                const childLink = document.createElement('a');
                childLink.href = `/Home/Category?categoryId=${child.id}`;
                childLink.className = 'has-line-before caption1 text-secondary hover:text-black transition-colors';
                childLink.textContent = child.name;
                
                li.appendChild(childLink);
                ul.appendChild(li);
            });
            
            // "View all" link
            const allProductsLink = document.createElement('a');
            allProductsLink.href = `/Home/Category?categoryId=${parentCategory.id}`;
            allProductsLink.className = 'flex items-center gap-1.5 mt-4 group';
            
            const allProductsSpan = document.createElement('span');
            allProductsSpan.className = 'text-button group-hover:text-[#263587] transition-colors';
            allProductsSpan.textContent = `All ${parentCategory.name}`;
            
            const allProductsIcon = document.createElement('i');
            allProductsIcon.className = 'ph-bold ph-caret-double-right text-sm group-hover:translate-x-1 transition-transform';
            
            allProductsLink.appendChild(allProductsSpan);
            allProductsLink.appendChild(allProductsIcon);
            
            // Assemble the card
            textContentDiv.appendChild(headingDiv);
            textContentDiv.appendChild(ul);
            textContentDiv.appendChild(allProductsLink);
            
            card.appendChild(imageLink);
            card.appendChild(textContentDiv);
        }
    });
    
    // Hide unused cards
    while (cardIndex < cardElements.length) {
        if (cardElements[cardIndex]) {
            cardElements[cardIndex].style.display = 'none';
        }
        cardIndex++;
    }
}

// Initialize category buttons for filtering products
function initializeCategoryButtons(categories) {
    const menuTab = document.querySelector('.menu');
    if (!menuTab) return;
    
    menuTab.innerHTML = '';
    
    categories.forEach((category, index) => {
        const button = document.createElement('div');
        button.classList.add(
            'tab-item', 
            'relative', 
            'text-secondary', 
            'text-button-uppercase', 
            'py-2', 
            'px-5', 
            'cursor-pointer', 
            'duration-300', 
            'hover:text-black',
            'rounded-lg'
        );
        
        // Make first button active
        if (index === 0) {
            button.classList.add('bg-white', 'text-black', 'shadow-sm');
        }
        
        button.textContent = category.name;
        button.dataset.categoryId = category.id;
        
        // Add click handler
        button.addEventListener('click', (e) => {
            // Update active state
            const buttons = menuTab.querySelectorAll('.tab-item');
            buttons.forEach(btn => {
                btn.classList.remove('bg-white', 'text-black', 'shadow-sm');
                btn.classList.add('text-secondary');
            });
            
            button.classList.add('bg-white', 'text-black', 'shadow-sm');
            button.classList.remove('text-secondary');
            
            // Fetch products for this category
            fetchProductsByParentId(category.id);
        });
        
        menuTab.appendChild(button);
    });
}

// Display promotional banners with category data
function displayPromotionalBanners(categories) {
    // Use first 2 categories for promotional banners
    for (let i = 0; i < 2 && i < categories.length; i++) {
        const category = categories[i];
        const titleElement = document.getElementById(`category-title-${i + 1}`);
        const imageElement = document.querySelector(`#category-banner-${i + 1} .banner-img img`);
        const discountElement = document.getElementById(`category-discount-${i + 1}`);
        
        if (titleElement && imageElement && discountElement) {
            titleElement.innerHTML = `${category.name} <br/> Special Deal`;
            imageElement.src = `https://jammerapi.mahmadamin.com${category.imagePath}`;
            imageElement.alt = category.name;
            
            // Show random discount for visual appeal
            const discountAmount = Math.floor(Math.random() * 40) + 10; // Random between 10-50%
            discountElement.textContent = `Save ${discountAmount}%`;
        }
    }
}

// Fetch and display products by category ID
async function fetchProductsByParentId(parentId) {
    try {
        const productContainer = document.getElementById('list-product');
        
        if (!productContainer) {
            console.error("Product container not found");
            return;
        }
        
        // Show loading indicator
        productContainer.innerHTML = '<div class="col-span-full flex justify-center py-10"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#263587]"></div></div>';
        
        // Fetch products by category
        try {
            const response = await ApiService.getProductsByCategory(parentId);
            
            // Clear container
            productContainer.innerHTML = '';
            
            if (response && response.data && response.data.length > 0) {
                // Create a grid for products
                const gridContainer = document.createElement('div');
                gridContainer.className = 'grid xl:grid-cols-3 md:grid-cols-2 gap-6 w-full';
                productContainer.appendChild(gridContainer);
                
                // Display each product
                response.data.forEach((product, index) => {
                    const productCard = createProductCard(product, index);
                    
                    // Add scroll trigger animation
                    if (typeof AOS !== 'undefined') {
                        productCard.setAttribute('data-aos', 'fade-up');
                        productCard.setAttribute('data-aos-delay', (50 * (index % 3)).toString());
                        productCard.setAttribute('data-aos-duration', '600');
                    }
                    
                    gridContainer.appendChild(productCard);
                });
                
                // Add "View All" button
                const viewAllContainer = document.createElement('div');
                viewAllContainer.className = 'col-span-full flex justify-center mt-8';
                
                const viewAllButton = document.createElement('a');
                viewAllButton.href = `/Home/Category?id=${parentId}`;
                viewAllButton.className = 'button-main bg-[#263587] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 group';
                viewAllButton.textContent = 'View All in this Category';
                
                const arrowIcon = document.createElement('i');
                arrowIcon.className = 'ph-bold ph-arrow-right text-sm transition-transform group-hover:translate-x-1';
                viewAllButton.appendChild(arrowIcon);
                
                viewAllContainer.appendChild(viewAllButton);
                productContainer.appendChild(viewAllContainer);
            } else {
                productContainer.innerHTML = '<div class="text-center py-8 text-gray-500">No products found in this category</div>';
            }
            
            // Refresh AOS animations
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        } catch (error) {
            console.error("Error fetching products by category:", error);
            productContainer.innerHTML = '<div class="text-center py-8 text-red-500">Error loading products</div>';
        }
    } catch (error) {
        console.error("Error in fetchProductsByParentId:", error);
        UIHelper.showPopup('Error loading category products', false);
    }
}

/**
 * Top Rated Products, Recommended Products, and Deals Functions
 */

// Top Rated Products
async function fetchTopRatedProducts(existingProducts = []) {
    try {
        const productContainer = document.querySelector('#list');
        
        if (!productContainer) {
            console.error("Top Rated Products container not found");
            return;
        }
        
        // Show loading indicator
        productContainer.innerHTML = '<div class="col-span-full flex justify-center py-10"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#263587]"></div></div>';
        
        // Use existing products if provided, otherwise fetch from API
        let products = existingProducts;
        
        if (!products || products.length === 0) {
            try {
                const response = await ApiService.getTopRatedProducts();
                if (response && response.data) {
                    products = response.data;
                }
            } catch (error) {
                console.error("Error fetching top rated products:", error);
                productContainer.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">Error loading products</div>';
                return;
            }
        }
        
        // Clear container
        productContainer.innerHTML = '';
        
        if (!products || products.length === 0) {
            productContainer.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No products found</div>';
            return;
        }
        
        // Create a responsive grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-4 sm:gap-5 md:gap-6';
        productContainer.appendChild(gridContainer);
        
        // Limit to 6 products for top rated section
        const limitedProducts = products.slice(0, 6);
        
        // Display each product in a list format
        limitedProducts.forEach((product, index) => {
            const productItem = document.createElement('div');
            productItem.className = 'col-span-1 transition-all duration-300 hover:transform hover:-translate-y-1';
            
            if (typeof AOS !== 'undefined') {
                productItem.setAttribute('data-aos', 'fade-up');
                productItem.setAttribute('data-aos-delay', (100 * (index % 3)).toString());
                productItem.setAttribute('data-aos-anchor-placement', 'top-bottom');
            }
            
            // Use the reusable product card function with 'list' variant
            const productCard = createProductCard(product, index, 'list');
            productItem.appendChild(productCard);
            gridContainer.appendChild(productItem);
        });
        
        // Add "View More" button at the bottom
        const viewMoreContainer = document.createElement('div');
        viewMoreContainer.className = 'col-span-full flex justify-center mt-8';
        
        const viewMoreButton = document.createElement('a');
        viewMoreButton.href = '/Home/Shop';
        viewMoreButton.className = 'button-main bg-[#263587] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2';
        viewMoreButton.textContent = 'View More Products';
        
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'ph-bold ph-arrow-right text-sm transition-transform group-hover:translate-x-1';
        viewMoreButton.appendChild(arrowIcon);
        
        viewMoreContainer.appendChild(viewMoreButton);
        productContainer.appendChild(viewMoreContainer);
        
        // Refresh AOS animations
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }
    } catch (error) {
        console.error("Error in fetchTopRatedProducts:", error);
        UIHelper.showPopup('Error loading top-rated products', false);
    }
}

// Recommended Products
async function fetchRecommendedProducts(existingProducts = []) {
    try {
        const productContainer = document.querySelector('#recommended-product-con');
        
        if (!productContainer) {
            console.error("Recommended products container not found");
            return;
        }
        
        // Show loading indicator
        productContainer.innerHTML = '<div class="col-span-full flex justify-center py-10"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#263587]"></div></div>';
        
        // Use existing products if provided, otherwise fetch from API
        let products = existingProducts;
        
        if (!products || products.length === 0) {
            try {
                const response = await ApiService.getTopRatedProducts();
                if (response && response.data) {
                    products = response.data;
                }
            } catch (error) {
                console.error("Error fetching recommended products:", error);
                productContainer.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">Error loading products</div>';
                return;
            }
        }
        
        // Clear container
        productContainer.innerHTML = '';
        
        if (!products || products.length === 0) {
            productContainer.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No products found</div>';
            return;
        }
        
        // Shuffle the array to get different products each time
        const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
        
        // Limit to 10 products for recommendations (2 rows of 5 on large screens)
        const limitedProducts = shuffledProducts.slice(0, 10);
        
        // Create a responsive grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 sm:gap-5 md:gap-6';
        productContainer.appendChild(gridContainer);
        
        // Display each product in a card format
        limitedProducts.forEach((product, index) => {
            const productItem = document.createElement('div');
            productItem.className = 'col-span-1 transition-all duration-300 hover:transform hover:-translate-y-1';
            
            if (typeof AOS !== 'undefined') {
                productItem.setAttribute('data-aos', 'fade-up');
                productItem.setAttribute('data-aos-delay', (100 * (index % 5)).toString());
                productItem.setAttribute('data-aos-duration', '800');
                productItem.setAttribute('data-aos-anchor-placement', 'top-bottom');
            }
            
            // Use the reusable product card function with 'standard' variant
            const productCard = createProductCard(product, index, 'standard');
            productItem.appendChild(productCard);
            gridContainer.appendChild(productItem);
        });
        
        // Add "View More" button at the bottom
        const viewMoreContainer = document.createElement('div');
        viewMoreContainer.className = 'col-span-full flex justify-center mt-8';
        
        const viewMoreButton = document.createElement('a');
        viewMoreButton.href = '/Home/Shop';
        viewMoreButton.className = 'button-main bg-[#263587] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2';
        viewMoreButton.textContent = 'View More Products';
        
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'ph-bold ph-arrow-right text-sm transition-transform group-hover:translate-x-1';
        viewMoreButton.appendChild(arrowIcon);
        
        viewMoreContainer.appendChild(viewMoreButton);
        productContainer.appendChild(viewMoreContainer);
        
        // Refresh AOS animations
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }
    } catch (error) {
        console.error("Error in fetchRecommendedProducts:", error);
        UIHelper.showPopup('Error loading recommended products', false);
    }
}

// Deals of the Week
function loadDealsOfTheWeek(products) {
    try {
        // Get products container
        const productsContainer = document.querySelector('#products-container');
        if (!productsContainer) {
            console.error("Products container not found for deals of the week");
            return;
        }
        
        // Create a dedicated container for deals
        const dealsGrid = document.createElement('div');
        dealsGrid.className = 'deals-of-week-container grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6';
        
        // Clear and append the deals grid
        productsContainer.innerHTML = '';
        productsContainer.appendChild(dealsGrid);
        
        // If no products provided, try to fetch top rated products
        if (!products || products.length === 0) {
            dealsGrid.innerHTML = '<div class="col-span-full flex justify-center py-10"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#263587]"></div></div>';
            
            // Fetch top rated products
            ApiService.getTopRatedProducts().then(response => {
                if (response && response.data && response.data.length > 0) {
                    // Clear loading indicator
                    dealsGrid.innerHTML = '';
                    
                    // Display the products
                    displayDealProducts(response.data.slice(0, 5), dealsGrid);
                } else {
                    dealsGrid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No deals available</div>';
                }
            }).catch(error => {
                console.error("Error fetching top rated products for deals:", error);
                dealsGrid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">Error loading deals</div>';
            });
            
            return;
        }
        
        // Limit to 5 products for deals
        const dealProducts = products.slice(0, 5);
        
        // Display the products
        displayDealProducts(dealProducts, dealsGrid);
        
        // Create a countdown timer update function
        initializeCountdownTimer();
    } catch (error) {
        console.error("Error in loadDealsOfTheWeek:", error);
        UIHelper.showPopup('Error loading deals', false);
    }
}

// Helper function to display deal products
function displayDealProducts(products, container) {
    // Display each deal product
    products.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.className = 'col-span-1';
        
        // Add AOS animation
        if (typeof AOS !== 'undefined') {
            productItem.setAttribute('data-aos', 'fade-up');
            productItem.setAttribute('data-aos-delay', (100 * (index % 5)).toString());
            productItem.setAttribute('data-aos-duration', '800');
        }
        
        // Use the same product card function with 'standard' variant for consistency
        const productCard = createProductCard(product, index, 'standard');
        
        // Add a sale badge
        const dealCard = productCard.querySelector('.product-item');
        if (dealCard) {
            // Add the deal badge if not already present
            const existingBadge = dealCard.querySelector('.sale-badge');
            if (!existingBadge) {
                const saleBadge = document.createElement('div');
                saleBadge.className = 'sale-badge absolute top-2 left-2 bg-red text-white text-xs font-bold px-2 py-1 rounded-full z-10';
                saleBadge.textContent = 'DEAL';
                dealCard.appendChild(saleBadge);
            }
            
            // Add a countdown indicator for deals
            const countdownIndicator = document.createElement('div');
            countdownIndicator.className = 'countdown-indicator absolute bottom-2 right-2 bg-red bg-opacity-80 text-white text-xs px-2 py-1 rounded-full z-10 flex items-center';
            
            const clockIcon = document.createElement('i');
            clockIcon.className = 'ph-bold ph-clock mr-1 text-xs';
            countdownIndicator.appendChild(clockIcon);
            
            const countdownText = document.createElement('span');
            countdownText.className = 'text-xs';
            countdownText.textContent = 'Limited time';
            countdownIndicator.appendChild(countdownText);
            
            dealCard.appendChild(countdownIndicator);
        }
        
        productItem.appendChild(productCard);
        container.appendChild(productItem);
    });
    
    // Add "View More Deals" button at the bottom
    const viewMoreContainer = document.createElement('div');
    viewMoreContainer.className = 'col-span-full flex justify-center mt-8';
    
    const viewMoreButton = document.createElement('a');
    viewMoreButton.href = '/Home/Deals';
    viewMoreButton.className = 'button-main bg-red text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2';
    viewMoreButton.textContent = 'View All Deals';
    
    const arrowIcon = document.createElement('i');
    arrowIcon.className = 'ph-bold ph-arrow-right text-sm transition-transform group-hover:translate-x-1';
    viewMoreButton.appendChild(arrowIcon);
    
    viewMoreContainer.appendChild(viewMoreButton);
    container.appendChild(viewMoreContainer);
    
    // Refresh AOS animations if available
    if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 100);
    }
}

// Initialize countdown timer for deals
function initializeCountdownTimer() {
    // Set a future date for countdown (7 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    // Update countdown timer elements
    function updateCountdown() {
        const now = new Date();
        const difference = futureDate - now;
        
        if (difference <= 0) {
            document.querySelector('.countdown-day').textContent = '00';
            document.querySelector('.countdown-hour').textContent = '00';
            document.querySelector('.countdown-minute').textContent = '00';
            document.querySelector('.countdown-second').textContent = '00';
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Update DOM elements
        document.querySelector('.countdown-day').textContent = days.toString().padStart(2, '0');
        document.querySelector('.countdown-hour').textContent = hours.toString().padStart(2, '0');
        document.querySelector('.countdown-minute').textContent = minutes.toString().padStart(2, '0');
        document.querySelector('.countdown-second').textContent = seconds.toString().padStart(2, '0');
    }
    
    // Initial update
    updateCountdown();
    
    // Update every second
    setInterval(updateCountdown, 1000);
}

// Remove event listener duplicates for cleaner initialization
document.removeEventListener('DOMContentLoaded', fetchProducts);
document.removeEventListener('DOMContentLoaded', fetchBanner);
document.removeEventListener('DOMContentLoaded', fetchCategories);
document.removeEventListener('DOMContentLoaded', function() { fetchProductsByParentId(57); });

// Clean up existing function calls
fetchProducts = fetchProducts || function() { console.log('fetchProducts is already defined'); };

// Ensure we only initialize once
const isInitialized = false;
if (!isInitialized && document.readyState === 'complete') {
    initializeApp();
}

// Add a document-ready handler at the very end of the file
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Add global error handler for API calls
    window.addEventListener('error', function(event) {
        console.error('Global error handler:', event.error);
        // Only show user-friendly messages for specific errors
        if (event.error && event.error.message && 
            (event.error.message.includes('Cannot read properties of null') || 
             event.error.message.includes('404') ||
             event.error.message.includes('401'))) {
            UIHelper.showPopup('An error occurred. Some features may not work properly.', false);
        }
    });
    
    // Add null checks for elements that might be accessed in other scripts
    const elementsToCheck = [
        'to-wishlist', 'to-cart', 'wishlist-icon', 'cart-icon', 
        'account-dropdown', 'search-button', 'mobile-menu-button',
        'list', 'recommended-product-con', 'products-container'
    ];
    
    elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found in the document.`);
        }
    });
    
    // Initialize any additional features
    initializeCountdownTimer();
});
