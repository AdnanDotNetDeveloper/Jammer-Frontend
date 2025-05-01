// Function to fetch cart data using async
async function fetchCartData() {
    try {
        const token = Cookies.get('Token');
        const response = await fetch('https://jammerapi.mahmadamin.com/api/Cart/GetUserCart', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok) {
            displayCartProducts(result.data);
            calculateSummary(result.data);
        } else {
            showPopup('Error fetching cart data:', false);

        }
    } catch (error) {
        showPopup('Error:', false);

    }
}

let cartProducts = [];
let addedProducts = [];

function displayCartProducts(products) {
    const productList = document.querySelector('.list-product-main');
    productList.innerHTML = ''; 

    cartProducts = products;

    products.forEach(product => {
        const productRow = document.createElement('div');
        productRow.classList.add('flex', 'items-center', 'gap-4', 'p-2');

        const productColumn = document.createElement('div');
        productColumn.classList.add('w-1/2', 'flex', 'items-center');

        const img = document.createElement('img');
        img.src = `https://jammerapi.mahmadamin.com${product.productImages[0]}`;
        img.alt = product.productName;
        img.style.height = "100px";
        img.classList.add('w-16', 'h-16', 'mr-3', 'object-cover', 'rounded');

        const name = document.createElement('div');
        name.textContent = product.productName;

        productColumn.appendChild(img);
        productColumn.appendChild(name);

        const productPrice = document.createElement('div');
        productPrice.classList.add('w-1/6', 'text-center');
        productPrice.textContent = `PKR ${product.price}`;

        const productQuantity = document.createElement('div');
        productQuantity.classList.add('w-1/12', 'text-center', 'flex', 'items-center', 'justify-center');

        const decrementButton = document.createElement('button');
        decrementButton.classList.add('body1', 'cursor-pointer', 'ph-minus', 'ph-bold');

        const quantitySpan = document.createElement('span');
        quantitySpan.textContent = product.quantity;
        quantitySpan.classList.add('px-2');

        const incrementButton = document.createElement('button');
        incrementButton.classList.add('body1', 'cursor-pointer', 'ph-plus', 'ph-bold');

        incrementButton.addEventListener('click', () => {
            product.quantity++;
            quantitySpan.textContent = product.quantity;
            totalPrice.textContent = `PKR ${(product.price * product.quantity).toFixed(2)}`;
            updateProductQuantity(product.id, product.quantity); 
            calculateSummary(cartProducts)
            updateCartQuintity()
        });

        decrementButton.addEventListener('click', () => {
            if (product.quantity > 1) {
                product.quantity--;
                quantitySpan.textContent = product.quantity;
                totalPrice.textContent = `PKR ${(product.price * product.quantity).toFixed(2)}`;
                updateProductQuantity(product.id, product.quantity); 
                calculateSummary(cartProducts)
                updateCartQuintity()
            }
        });

        productQuantity.appendChild(decrementButton);
        productQuantity.appendChild(quantitySpan);
        productQuantity.appendChild(incrementButton);

        const totalPrice = document.createElement('div');
        totalPrice.classList.add('w-1/6', 'text-center');
        totalPrice.textContent = `PKR ${(product.price * product.quantity).toFixed(2)}`;

        const addButtonContainer = document.createElement('div');
        addButtonContainer.classList.add('w-1/6', 'text-center');
        const addButton = document.createElement('button');
        addButton.classList.add('button-main', 'mt-2', 'p-2', 'w-full', 'text-center');
        addButton.style.backgroundColor = "#28a745";
        addButton.textContent = 'Add';

        addButton.addEventListener('click', () => {
            if (addButton.textContent === 'Add') {
                addButton.textContent = 'Added';
                addButton.style.backgroundColor = "#007bff";
                addedProducts.push(product); 
            } else {
                addButton.textContent = 'Add';
                addButton.style.backgroundColor = "#28a745";
                const index = addedProducts.findIndex(p => p.id === product.id);
                if (index > -1) {
                    addedProducts.splice(index, 1);
                }
            }
        });

        addButtonContainer.appendChild(addButton);

        const removeButtonContainer = document.createElement('div');
        removeButtonContainer.classList.add('w-1/6', 'text-center');
        const removeButton = document.createElement('button');
        removeButton.classList.add('delete-btn', 'button-main', 'mt-2', 'p-2', 'w-full', 'text-center');
        removeButton.style.backgroundColor = "#cd0000";
        removeButton.textContent = 'Remove';

        removeButton.addEventListener('click', async () => {
            try {
                await removeProductFromCart(product.id);
                productRow.remove();
                fetchCartData(); 
            } catch (error) {
                showPopup('Error removing product from cart:', false);

            }
        });

        removeButtonContainer.appendChild(removeButton);

        productRow.appendChild(productColumn);
        productRow.appendChild(productPrice);
        productRow.appendChild(productQuantity);
        productRow.appendChild(totalPrice);
        productRow.appendChild(addButtonContainer); 
        productRow.appendChild(removeButtonContainer);

        productList.appendChild(productRow);
    });
    const buyNowButton = document.getElementById('go-to-checkout');

    buyNowButton.addEventListener('click', () => {
        if (addedProducts.length > 0) {
            navigateToCheckout(addedProducts);
        } else {
            showPopup('Please add products to checkout!', false);

        }
    });

    productList.appendChild(buyNowButton); 


}
function updateCartQuintity() {
    const cartItems = cartProducts.map(product => ({
        cartId: product.id,
        quantity: product.quantity
    }));
    let cartItem = { items: cartItems }

    updateCartOnLeave(cartItem);  
};

// Function to update product quantity globally (outside displayCartProducts)
function updateProductQuantity(productId, newQuantity) {
    const product = cartProducts.find(p => p.id === productId);
    if (product) {
        product.quantity = newQuantity;
        showPopup(`Updated quantity for product ID ${productId}: ${newQuantity}`);

    }

}

// API for updating cart quantities when user leaves the page
async function updateCartOnLeave(cartItems) {

    const token = Cookies.get('Token');

    try {
        const response = await fetch(`https://jammerapi.mahmadamin.com/api/Cart/UpdateCartItems`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cartItems)
        });

        if (!response.ok) {
            showPopup('Failed to update cart on leave',false);

        }
    } catch (error) {
        showPopup('Error updating cart on leave:', false);

    }
}

// Sample function for removing a product from the cart
async function removeProductFromCart(productId) {

    const token = Cookies.get('Token');

    try {
        const response = await fetch(`/api/removeCartItem/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            showPopup('Failed to remove product from cart');

        }
    } catch (error) {
        showPopup('Error removing product from cart:', false);

    }
}


// API call to remove product from cart by product ID
async function removeProductFromCart(productId) {
    const token = Cookies.get('Token');
    const response = await fetch(`https://jammerapi.mahmadamin.com/api/Cart/DeleteCartItem/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        showPopup('Failed to remove product from cart', false);

    }
}

// Function to navigate to checkout page with full product data
function navigateToCheckout(cartItems) {
    const checkoutData = cartItems.map(item => ({
        productId: item.productId,
        couponId: item.couponId || null,  
        quantity: item.quantity,
        productImage: item.productImages[0],
        productName: item.productName,
        price: item.price 
    }));

    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    window.location.href = '/Home/Checkout';
}

// Function to calculate and display the order summary in the right section
async function calculateSummary(cartItems) {
    let subtotal = 0;
    let discount = 0;

    for (const item of cartItems) {
        subtotal += (item.quantity * parseFloat(item.price));

        if (item.couponId) {
            const token = Cookies.get('Token');

            try {
                const response = await fetch(`https://jammerapi.mahmadamin.com/api/Coupon/GetCouponById/${item.couponId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const couponData = await response.json();
             

                if (couponData && couponData.data) {
                    const coupon = couponData.data;

                    if (coupon.discountType === "FLAT") {
                        discount += (item.quantity * parseFloat(coupon.discount)); 

                    } else if (coupon.discountType === "PERCENTAGE") {
                        discount +=( item.quantity * (subtotal * (parseFloat(coupon.discount) / 100))); 
                    }
                }
            } catch (error) {
                showPopup(`Error fetching coupon for item ${ item.couponId }:`, false);

            }
        }
    }

    const subtotalElement = document.querySelector('.total-product');
    const discountElement = document.querySelector('.discount');
    const shippingElement = document.querySelector('.ship');
    const totalCartElement = document.querySelector('.total-cart');

    subtotalElement.textContent = `PKR ${subtotal.toFixed(2)}`;

    discountElement.textContent = `PKR ${discount.toFixed(2)}`;

    const shippingCost = 0; 
    shippingElement.textContent = `PKR ${shippingCost.toFixed(2)}`;

    const total = subtotal - discount + shippingCost;
    totalCartElement.textContent = `PKR ${total.toFixed(2)}`;
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

fetchCartData();
