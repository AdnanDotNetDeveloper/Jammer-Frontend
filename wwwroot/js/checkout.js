//User Login JS 

const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const loginCon = document.getElementById("login-con");
const loginMessage = document.getElementById("login-message");
async function loginUser(obj) {
    let data = await fetch("https://jammerapi.mahmadamin.com/api/Users/Login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(obj)
    });

    data = await data.json();

    if (data.message === "Login Successfully") {
        console.log(data.message);
        token = data.data;
        Cookies.set('Token', token, { expires: 7 });
        loginCon.style.display = "none";
        loginMessage.innerText = data.message;
        setTimeout(function () {
            loginMessage.style.display = "none";

        }, 2000)

    } else {
        console.log(data.message);
    }
}

loginBtn.addEventListener("click", function () {
    let token = Cookies.get("Token");
    if (token) {
        loginCon.style.display = "none";
        loginMessage.innerText = "Your are already login";
        setTimeout(function () {
            loginMessage.style.display = "none";

        }, 2000)
        return
    }
    let obj = { email: username.value, password: password.value };
    username.value = "";
    password.value = "";
    loginUser(obj)
    console.log("btn clicked")

})


document.getElementById("login").addEventListener("click", function () {
    localStorage.setItem("previousUrl", window.location.href);
    window.location.pathname = "/Home/login";

})

document.getElementById("signup").addEventListener("click", function () {
    localStorage.setItem("previousUrl", window.location.href);
    window.location.pathname = "/Home/signup";

})

let currentProductId; 

function getProductUrlFromQuery() {
    const params = new URLSearchParams(window.location.search);
    console.log(params.get('productUrl'));
    return params.get('productUrl');
}





const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData')) || [];

const productQuantities = {};
async function renderCheckoutProducts() {
    const productContainer = document.querySelector('.list-product-main');
    productContainer.innerHTML = '';

    let totalPrice = 0;
    let totalDiscount = 0;

    for (const product of checkoutData) {
        productQuantities[product.productId] = product.quantity || 1;

        let discountAmount = 0;
        let discountType = null;

        if (product.couponId) {
            const token = Cookies.get('Token');

            try {
                const response = await fetch(`https://jammerapi.mahmadamin.com/api/Coupon/GetCouponById/${product.couponId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const couponData = await response.json();

                if (couponData.data) {
                    discountType = couponData.data.discountType;
                    discountAmount = couponData.data.discount;
                }
            } catch (error) {
                console.error('Failed to fetch coupon data:', error);
            }
        }

        let priceAfterDiscount = product.price;
        if (discountType === 'FLAT') {
            priceAfterDiscount = Math.max(product.price - discountAmount, 0);
        } else if (discountType === 'PERCENTAGE') {
            priceAfterDiscount = product.price - (product.price * (discountAmount / 100));
        }

        totalPrice += priceAfterDiscount * productQuantities[product.productId];
        totalDiscount += (product.price - priceAfterDiscount) * productQuantities[product.productId];

        const productCard = document.createElement('div');
        productCard.classList.add('item', 'flex', 'justify-between', 'gap-4', 'p-4', 'items-center');

        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('bg_img');
        const imgElement = document.createElement('img');
        imgElement.style.height = "100px";
        imgElement.src = `https://jammerapi.mahmadamin.com${product.productImage}` || './assets/images/product/1000x1000.png';
        imgWrapper.appendChild(imgElement);

        const nameElement = document.createElement('div');
        nameElement.classList.add('name', 'text-center');
        nameElement.textContent = product.productName || 'Unknown Product';
        imgWrapper.appendChild(nameElement);
        productCard.appendChild(imgWrapper);

        const quantityWrapper = document.createElement('div');
        quantityWrapper.style.height = "50px";
        quantityWrapper.style.width = "100px";
        quantityWrapper.className = 'quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[140px] w-[120px] flex-shrink-0';

        const minusButton = document.createElement('button');
        minusButton.classList.add('body1', 'cursor-pointer', 'ph-minus', 'ph-bold');
        minusButton.onclick = () => updateQuantity(product.productId, -1);

        const quantityElement = document.createElement('span');
        quantityElement.className = "quantity body1 font-semibold";
        quantityElement.textContent = productQuantities[product.productId];

        const plusButton = document.createElement('button');
        plusButton.classList.add('body1', 'cursor-pointer', 'ph-plus', 'ph-bold');
        plusButton.onclick = () => updateQuantity(product.productId, 1);

        quantityWrapper.appendChild(minusButton);
        quantityWrapper.appendChild(quantityElement);
        quantityWrapper.appendChild(plusButton);
        productCard.appendChild(quantityWrapper);

        const priceElement = document.createElement('div');
        priceElement.classList.add('price', 'text-center');
        priceElement.textContent = `PKR ${product.price}`;

        const discountElement = document.createElement('div');
        discountElement.classList.add('discount', 'text-center');
        if (discountType === 'FLAT') {
            discountElement.textContent = `Discount: -PKR ${discountAmount}`;
        } else if (discountType === 'PERCENTAGE') {
            discountElement.textContent = `Discount: -${discountAmount}%`;
        }

        const finalPriceElement = document.createElement('div');
        finalPriceElement.classList.add('final-price', 'text-center');
        finalPriceElement.textContent = `Final Price: PKR ${priceAfterDiscount}`;

        productCard.appendChild(priceElement);
        productCard.appendChild(discountElement);
        productCard.appendChild(finalPriceElement);

        productContainer.appendChild(productCard);
    }

    document.querySelector("#total-price").textContent = `${totalPrice.toFixed(2)}`;
    document.querySelector("#total-discount").textContent = `${totalDiscount.toFixed(2)}`;
}



const AddressBtn = document.getElementById('AddressBtn');
const saveAddressBtn = document.getElementById('saveAddressBtn');
const addressModal = document.getElementById('addressModal');
const addressList = document.getElementById('addressList');
const closeModalBtn = document.getElementById('closeModal');
addressModal.style.zIndex = "1000";

saveAddressBtn.addEventListener("click",async function () {
    let city =  document.getElementById('city').value
    let street =  document.getElementById('street').value
    let postalCode = document.getElementById('postalCode').value
    let region = document.getElementById('region').value

    const addressData = {
        city: city,
        street: street,
        postalCode: postalCode,
        region: region,
    };
    try {
        const token = Cookies.get('Token');

        let response = await fetch('https://jammerapi.mahmadamin.com/api/Address/AddAddress', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addressData)
        });

        if (response) {
            showPopup('Address Saved successfully!', 'success');
        } else {
            let errorData = await response.json();
            showPopup('Error: ' + errorData.message, 'error');
        }
    } catch (error) {
        showPopup('An error occurred while Adding Address.', 'error');
    }

})

AddressBtn.addEventListener('click', async () => {
    const token = Cookies.get('Token');
    try {
        const response = await fetch('https://jammerapi.mahmadamin.com/api/Address/GetAddresss', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const addressData = await response.json();
        renderAddressList(addressData.data);
        addressModal.classList.remove('hidden');
    } catch (error) {
        showPopup('Error fetching addresses:' + error, false) 

    }
});

function renderAddressList(addresses) {
    addressList.innerHTML = '';
    addresses.forEach(address => {
        const addressItem = document.createElement('div');
        addressItem.classList.add('border', 'bg-linear', 'p-3', 'rounded-lg', 'flex', 'justify-between', 'items-center');
        addressItem.innerHTML = `
                <div>
                    <p><strong>City:</strong> ${address.city}</p>
                    <p><strong>Street:</strong> ${address.street}</p>
                    <p><strong>Postal Code:</strong> ${address.postalCode}</p>
                    <p><strong>Region:</strong> ${address.region}</p>
                </div>
                <div>
                    <button class="text-blue-500 button-main text-xs selectAddress" data-id="${address.id}">Select</button>
                    <button class="text-red-500 button-main text-xs deleteAddress" data-id="${address.id}">Delete</button>
                </div>
            `;
        addressList.appendChild(addressItem);
    });

    document.querySelectorAll('.selectAddress').forEach(button => {
        button.addEventListener('click', event => {
            const selectedId = event.target.dataset.id;
            const selectedAddress = addresses.find(addr => addr.id == selectedId);
            fillAddressInputs(selectedAddress);
            addressModal.classList.add('hidden');
        });
    });

    document.querySelectorAll('.deleteAddress').forEach(button => {
        button.addEventListener('click', async event => {
            const addressId = event.target.dataset.id;
            await deleteAddress(addressId);
            event.target.closest('div').remove(); 
        });
    });
}

function fillAddressInputs(address) {
    document.getElementById('city').value = address.city;
    document.getElementById('street').value = address.street;
    document.getElementById('postalCode').value = address.postalCode;
    document.getElementById('region').value = address.region;
}

async function deleteAddress(id) {
    const token = Cookies.get('Token');
    try {
        await fetch(`https://jammerapi.mahmadamin.com/api/Address/DeleteAddress/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        showPopup('Error deleting address:'+ error, false) 

    }
}

closeModalBtn.addEventListener('click', () => {
    addressModal.classList.add('hidden');
});






function updateQuantity(productId, change) {
    if (productQuantities[productId] + change >= 1) {
        productQuantities[productId] += change;

        const product = checkoutData.find(p => p.productId === productId);
        if (product) {
            product.quantity = productQuantities[productId];
        }

        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

        renderCheckoutProducts();
    }
}

renderCheckoutProducts();






// Add event listener for form submission
document.getElementById('orderForm').addEventListener('click', async () => {

    let city = document.getElementById('city').value;
    let street = document.getElementById('street').value;
    let postalCode = document.getElementById('postalCode').value;
    let region = document.getElementById('region').value;

    const orderData = {
        city: city,
        street: street,
        postalCode: postalCode,
        region: region,
        items: []  
    };

    checkoutData.forEach(product => {
        orderData.items.push({
            productId: product.productId, 
            quantity: productQuantities[product.productId], 
            couponId: product.couponId
        });
    });

    city = "";
    street = "";
    postalCode = "";
    region = "";

    console.log(orderData);

    try {
        const token = Cookies.get('Token');

        let response = await fetch('https://jammerapi.mahmadamin.com/api/Order/CreateOrder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            let data = await response.json();
            console.log(data);
            showPopup('Order placed successfully!', 'success');
            setTimeout(() => {
                window.location.pathname = "/"
            }, 3000);
        } else {
            let errorData = await response.json();
            showPopup('Error: ' + errorData.message, 'error');
        }
    } catch (error) {
        showPopup('An error occurred while submitting your order.', 'error');
    }
});

// Function to show the popup
function showPopup(message, type) {
    const popupContainer = document.getElementById('popupContainer');
    const popupText = document.getElementById('popupText');

    popupText.textContent = message;

    if (type === 'success') {
        popupText.classList.remove('text-red-500');
        popupText.classList.add('text-green-500');
    } else {
        popupText.classList.remove('text-green-500');
        popupText.classList.add('text-red-500');
    }

    popupContainer.classList.remove('hidden');

    setTimeout(() => {
        popupContainer.classList.add('hidden');
    }, 3000);
}
