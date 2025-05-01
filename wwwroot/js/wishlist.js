// Fetch and display cart data
async function fetchUserCart() {
    const token = Cookies.get('Token'); // Retrieve token
    const response = await fetch('https://jammerapi.mahmadamin.com/api/WishList/GetUserWishList', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data.data)
    displayCartItems(data.data);
}

// Display cart items
function displayCartItems(cartData) {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = ''; // Clear existing content

    cartData.forEach(item => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-item', 'p-4', 'border', 'border-line', 'rounded-2xl');

        // Product image
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('bg-img', 'relative', 'w-full', 'flex', 'justify-center', 'aspect-1/1');
        const img = document.createElement('img');
        img.src = `https://jammerapi.mahmadamin.com${item.productImages[0]}`; // Assuming the API returns product image URLs
        img.alt = item.productName;
        img.style.height = "150px";
        imgDiv.appendChild(img);
        productCard.appendChild(imgDiv);

        // Product info
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('product-infor', 'flex', 'flex-col', 'mt-4');
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('text-title');
        nameSpan.textContent = item.productName;
        infoDiv.appendChild(nameSpan);

        const starDiv = document.createElement('div');
        starDiv.className = 'flex flex-row gap-0.5 mt-1';
        for (let i = 0; i < 5; i++) {
            const starIcon = document.createElement('i');
            starIcon.className = 'ph-fill ph-star text-sm text-yellow';
            starDiv.appendChild(starIcon);
        }
        infoDiv.appendChild(starDiv);

        const priceSpan = document.createElement('p');
        priceSpan.classList.add('text-title', 'inline-block', 'mt-1');
        priceSpan.textContent = `PKR ${item.price}`; // Updated to PKR
        infoDiv.appendChild(priceSpan);

        const productLink = document.createElement('a');
        productLink.href = `/Home/Product?productUrl=${item.productURL}`;  // Use the product's URL
        productLink.className = 'block';  // Add class to ensure link is clickable
        // Buy Now button
        const buyNowBtn = document.createElement('button');
        buyNowBtn.classList.add('button-main', 'mt-2', 'p-2', 'w-full', 'text-center');
        buyNowBtn.textContent = 'Buy It Now';
        buyNowBtn.onclick = () => deleteCartItem(item.id, productCard); // Pass the product ID
        productLink.appendChild(buyNowBtn);
        infoDiv.appendChild(productLink);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn', 'button-main', 'mt-2', 'p-2', 'w-full', 'text-center');
        deleteBtn.style.backgroundColor = "#cd0000";
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteCartItem(item.id, productCard); // Pass the product ID
        infoDiv.appendChild(deleteBtn);

        productCard.appendChild(infoDiv);
        cartContainer.append(productCard);
    });
}

// Delete cart item
async function deleteCartItem(productId, productCard) {
    const token = Cookies.get('Token'); // Retrieve token
    const response = await fetch(`https://jammerapi.mahmadamin.com/api/WishList/DeleteWishListItem/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        productCard.remove(); // Remove card from the page on successful delete
    } else {
        console.error('Failed to delete the item');
    }
}

// Call function on page load
fetchUserCart();
