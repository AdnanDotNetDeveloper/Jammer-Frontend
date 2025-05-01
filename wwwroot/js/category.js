// Function to get the category ID from the URL
function getCategoryIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('categoryId');
}

// Function to call the 'getProductByCategory' API and display the products
async function loadProductsByCategory() {
    const categoryId = getCategoryIdFromUrl();
    if (!categoryId) {
        showPopup('No categoryId found ', false)

        return;
    }

    try {
        const response = await fetch(`https://jammerapi.mahmadamin.com/api/Product/FilterProductsByCategory/${categoryId}`); 
        if (response.ok) {
            const products = await response.json();
            displayCategoryProducts(products.data);
        } else {
            showPopup('Failed to fetch products:', false)

        }
    } catch (error) {
        showPopup('Error fetching products:', false)

    }
}

// Function to display the products in the category
function displayCategoryProducts(products) {
    const productsContainer = document.querySelector('#list-product-category'); 
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
        productImg.className = "object-cover";
        productImg.src = `https://jammerapi.mahmadamin.com${product.imagePath[0]}`;
        productImg.alt = product.name;
        productImg.style.height = "150px";
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
        productCard.appendChild(bgImgDiv);

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

        productCard.appendChild(productInfoDiv);

        const addToCartButton = document.createElement('button');
        addToCartButton.textContent = 'Add to Cart';
        addToCartButton.className = 'button-main mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition';

        addToCartButton.addEventListener('click', async () => {
            await addToCart(product.id, 1, 0); 
            window.location.href = '/Home/Cart'; 
        });

        productCard.appendChild(addToCartButton); 

        productLink.appendChild(productCard);
        productsContainer.appendChild(productLink);
    });
}

window.onload = loadProductsByCategory;




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
            showPopup('Product added to wishlist:', true)

        } else {
            const errorText = await response.text();
            showPopup('Error adding product to wishlist:', false)

        }
    } catch (error) {
        showPopup('Error adding product to wishlist: ', false)

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
            showPopup('Product added to cart:', true)

        } else {
            const errorText = await response.text();
            showPopup('Error adding product to cart:', false)

        }
    } catch (error) {
        showPopup('Error adding product to wishlist:', false)

    }
}

function showPopup(message, success = true) {
    const popup = document.getElementById('popup-message');
    popup.style.top = "15%";
    popup.style.right = "1%";
    popup.style.zIndex = "500";

    popup.textContent = message;
    popup.classList.remove('hidden', 'bg-red', 'bg-green');
    popup.classList.add(success ? 'bg-green' : 'bg-red');

    setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);
}
