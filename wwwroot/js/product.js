let currentProductId;  

function getProductUrlFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('productUrl');
}

async function fetchProductByUrl(productURL) {
    try {
        if (!productURL) {
            throw new Error('Invalid product URL');
        }

        const token = Cookies.get('Token');

        const encodedProductURL = encodeURIComponent(productURL);

        const response = await fetch(`https://jammerapi.mahmadamin.com/api/Product/GetProductByURL/url?url=${encodedProductURL}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
            displayProductDetails(data.data); 
            fetchReviews(data.data.id); 
            currentProductId = data.data.id; 
        } else {
            throw new Error('No product data found.');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup(`Error fetching product details: ${error.message}`, false); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productUrl = getProductUrlFromQuery(); 
    if (productUrl) {
        fetchProductByUrl(productUrl);
    } else {
        showPopup('No product URL found in the query string.', false); 
    }
});






let productCoupon = null ;
// Function to display product details in the card
function displayProductDetails(product) {
    console.log(product)
    productCoupon = product.couponId;
    document.querySelector('.main-product-name').textContent = product.name;
    document.querySelector('.main-product-description').textContent = product.description;
    document.querySelector('.main-product-price').textContent = `PKR ${product.price}`; 
    document.querySelector('.main-product-origin-price').innerHTML = `<del>PKR ${(product.price * 1.2).toFixed(2)}</del>`;
    document.getElementById('product-description').textContent = product.description;


    const swiperWrapper = document.querySelector('.list-img');
    swiperWrapper.style.display = "flex";
    swiperWrapper.style.justifyContent = "center";
    swiperWrapper.style.height = "400px";
    swiperWrapper.innerHTML = '';

    const imgElement = document.createElement('img');

    imgElement.src = `https://jammerapi.mahmadamin.com${product.imagePath[0]}`;
    imgElement.alt = product.name;
    swiperWrapper.appendChild(imgElement);
}

// Function to fetch reviews by product ID
async function fetchReviews(productId) {
    try {
        const token = Cookies.get('Token');

        const response = await fetch(`https://jammerapi.mahmadamin.com/api/Review/GetReviews/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data && data.data) {
            displayReviews(data.data);
        }
    } catch (error) {
        showPopup('Error fetching reviews: ', false);

    }
}

// Function to display reviews
function displayReviews(reviews) {
    const reviewContainer = document.querySelector('.reviews-section');
    reviewContainer.innerHTML = '';

    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');

        const reviewerName = document.createElement('h4');
        reviewerName.textContent = review.fullname;

        const reviewDate = document.createElement('span');
        reviewDate.textContent = new Date(review.createdAt).toLocaleDateString();

        const reviewMessage = document.createElement('p');
        reviewMessage.textContent = review.message;

        const reviewerImage = document.createElement('img');
        reviewerImage.style.height = "100px";
        reviewerImage.style.borderRadius = "100px";
        reviewerImage.src = `https://jammerapi.mahmadamin.com${review.image}`;
        reviewerImage.alt = `${review.fullname}'s review`;

        const starRating = document.createElement('div');
        starRating.classList.add('flex', 'items-center');

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('svg');
            star.setAttribute('data-rating', i);
            star.classList.add('star', 'w-6', 'h-6','cursor-pointer');
            star.setAttribute('aria-hidden', 'true');
            star.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            star.setAttribute('fill', 'currentColor');
            star.setAttribute('viewBox', '0 0 22 20');

            const starPath = document.createElement('path');
            starPath.setAttribute('d', 'M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z');

            if (i <= review.points) {
                star.classList.add('text-yellow-500'); 
                star.style.color = "#1f1f1f";

            } else {
                star.classList.add('text-gray-300'); 
                star.style.color = "#c59b08";

            }

            star.appendChild(starPath);
            starRating.appendChild(star);
        }

        reviewItem.appendChild(reviewerImage);
        reviewItem.appendChild(reviewerName);
        reviewItem.appendChild(reviewDate);
        reviewItem.appendChild(reviewMessage);
        reviewItem.appendChild(starRating);

        reviewContainer.appendChild(reviewItem);
    });
}





let quantityCount = 1;
let quantity = document.querySelector('#quantity');
const quantityCountPlus = document.querySelector('.ph-plus');
const quantityCountMinus = document.querySelector('.ph-minus');
quantityCountPlus.addEventListener("click", function () {
    quantityCount = quantityCount + 1;
    quantity.textContent = quantityCount;
});
quantityCountMinus.addEventListener("click", function () {
    if (quantityCount <= 1) {
        return
    }
    quantityCount = quantityCount - 1;
    quantity.textContent = quantityCount;


})
document.querySelector(".main-add-cart-btn").addEventListener("click", function () { addToCart(currentProductId) });

async function addToCart(productId) {
    quantity = quantity.textContent;
    const payload = {
        productId: productId,
        quantity: parseInt(quantity),
        couponId: productCoupon != null ? productCoupon : 0
    };

    const token = Cookies.get('Token');

    try {
        const response = await fetch('https://jammerapi.mahmadamin.com/api/Cart/AddToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('popupMessage').innerText = 'Product added to cart successfully!';
            document.getElementById('popupModal').style.display = "flex";
        } else {
            document.getElementById('popupMessage').innerText = 'Product already added';
            document.getElementById('popupModal').style.display = "flex";
            showPopup('Failed to add to cart:', false);


        }
    } catch (error) {
        showPopup('Error adding to cart:', false);

    };
};

document.getElementById('closePopup').addEventListener('click', function () {
    document.getElementById('popupModal').style.display = "none";
});


let buyNowBtn = document.getElementById("buyNowBtn");
buyNowBtn.addEventListener('click', function (event) {
    event.preventDefault(); 

    addToCart(currentProductId)
    const cartUrl = `/Home/Cart`;

    window.location.href = cartUrl;
  
});


let selectedRating = 0;
let stars = document.querySelectorAll("#starRating .star");

 stars.forEach((star, index) => {
        star.addEventListener("click", function () {
            selectedRating = index + 1;
            updateStarColors(selectedRating);
 });

    function updateStarColors(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-300');
                star.style.color = "#c59b08";
            } else {
                star.classList.remove('text-yellow-300');
                star.style.color = "#1f1f1f";
            }
        });
    }
});


const submitReviewBtn = document.querySelector("#submit-review-btn");
submitReviewBtn.addEventListener("click", function () {
    const  message = document.querySelector("#message");

    let obj = { productId: currentProductId, message: message.value, points: selectedRating };
    message.value = "";
    selectedRating = 0;
    postReview(obj)
})


async function postReview(obj) {

    const token = Cookies.get('Token');

    try {
        let response = await fetch('https://jammerapi.mahmadamin.com/api/Review/AddReview', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(obj)
        });

        let data = await response.json();

        if (response.ok) {
            fetchReviews(currentProductId)
            showPopup('Add Review Succesfully');

            
        } else {
            showPopup('Error Occurd While Proccessing',false);


 
        }
    } catch (error) {
        showPopup('Error occurred:', false);

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
