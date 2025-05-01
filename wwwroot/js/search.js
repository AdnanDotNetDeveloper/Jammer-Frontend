window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    console.log(query)

    if (query) {
        fetch(`https://jammerapi.mahmadamin.com/api/Product/SearchProductsByName?query=${query}`)
            .then(response => response.json())
            .then(products => {
                console.log(products.data)
                displaySearchResults(products.data);
            });
    }
});

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Function to fetch search results
async function searchProducts(query) {
    try {
        const response = await fetch(`https://jammerapi.mahmadamin.com/api/Product/SearchProductsByName?query=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log(data.data)
        displaySearchResults(data.data);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

searchButton.addEventListener('click', (event) => {
    const query = searchInput.value.trim();
    if (query) {
        searchProducts(query);
    }
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchProducts(query);
        }
    }
});

document.addEventListener('click', (event) => {
    if (!searchPopup.contains(event.target) && !searchButton.contains(event.target) && !searchInput.contains(event.target)) {
        searchPopup.classList.add('hidden');
    }
});

// Function to display search results
function displaySearchResults(products) {
    const productsContainer = document.querySelector('#list-product-result'); 
    productsContainer.innerHTML = '';

    products.forEach(product => {
        const productLink = document.createElement('a');
        productLink.href = `/Home/Product?productUrl=${product.productURL}`;
        productLink.className = 'block';

        const productCard = document.createElement('div');
        productCard.className = 'product-item style-marketplace p-4 border border-line rounded-2xl flex flex-col justify-between';

        const bgImgDiv = document.createElement('div');
        bgImgDiv.className = 'bg-img relative w-full aspect-1/1 flex justify-center';

        const productImg = document.createElement('img');
        productImg.className = "w-full h-full object-cover";
        productImg.src = `https://jammerapi.mahmadamin.com${product.imagePath[0]}`;
        productImg.alt = product.name;
        productImg.style.height = "200px";
        bgImgDiv.appendChild(productImg);

        const listActionDiv = document.createElement('div');
        listActionDiv.className = 'list-action flex flex-col gap-1 absolute top-0 right-0';

        const actionButtons = [
            { class: 'add-wishlist-btn', iconClass: 'ph-heart', action: (e) => { e.preventDefault(); e.stopPropagation(); addToWishlist(product.id, 1, 0); } },
            { class: 'compare-btn', iconClass: 'ph-repeat' },
            { class: 'quick-view-btn', iconClass: 'ph-eye' }
        ];

        actionButtons.forEach(action => {
            const span = document.createElement('span');
            span.className = `${action.class} w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-small duration-300`;
            const icon = document.createElement('i');
            icon.className = `ph ${action.iconClass}`;
            span.appendChild(icon);

            if (action.action) {
                span.addEventListener('click', action.action);
            }

            listActionDiv.appendChild(span);
        });

        bgImgDiv.appendChild(listActionDiv);
        productLink.appendChild(bgImgDiv);

        const productInfoDiv = document.createElement('div');
        productInfoDiv.className = 'product-infor mt-4 flex flex-col justify-between flex-grow';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'text-title';
        titleSpan.textContent = product.name;

        const starDiv = document.createElement('div');
        starDiv.className = 'flex gap-0.5 mt-1';
        for (let i = 0; i < 5; i++) {
            const starIcon = document.createElement('i');
            starIcon.className = 'ph-fill ph-star text-sm text-yellow';
            starDiv.appendChild(starIcon);
        }

        const priceSpan = document.createElement('span');
        priceSpan.className = 'text-title inline-block mt-1';
        priceSpan.textContent = `PKR ${product.price.toFixed(2)}`;

        productInfoDiv.appendChild(titleSpan);
        productInfoDiv.appendChild(starDiv);
        productInfoDiv.appendChild(priceSpan);

        productLink.appendChild(productInfoDiv);

        const addToCartButton = document.createElement('button');
        addToCartButton.textContent = 'Add to Cart';
        addToCartButton.className = 'button-main mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition';

        addToCartButton.addEventListener('click', async (event) => {
            await addToCart(product.id, 1, 0);
            window.location.href = '/Home/Cart'; 
        });


        productCard.appendChild(productLink);
        productCard.appendChild(addToCartButton); 
        productsContainer.appendChild(productCard);
    });
}

// Function to call addToWishlist API
async function addToWishlist(productId, quantity = 1, couponId = 0) {
    try {
        const token = Cookies.get('Token');
        let obj = {
            productId: productId,
            quantity: quantity,
            couponId: couponId
        }

        const response = await fetch('https://jammerapi.mahmadamin.com/api/WishList/AddWishList', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Product added to wishlist:', result);
        } else {
            const errorText = await response.text();
            console.error('Error adding product to wishlist:', errorText);
        }
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
    }
}

// Function to call addToCart API
async function addToCart(productId, quantity = 1, couponId = 0) {
    try {
        const token = Cookies.get('Token');
        let obj = {
            productId: productId,
            quantity: quantity,
            couponId: couponId
        }

        const response = await fetch('https://jammerapi.mahmadamin.com/api/Cart/AddToCart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Product added to cart:', result);
        } else {
            const errorText = await response.text();
            console.error('Error adding product to cart:', errorText);
        }
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
    }
}
