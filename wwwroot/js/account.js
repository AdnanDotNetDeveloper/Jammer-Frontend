const token = Cookies.get('Token'); 
async function fetchUserData() {
    try {
        const response = await fetch('https://jammerapi.mahmadamin.com/api/Users/GetUserById', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok) {
            displayUserInfo(result)
        } else {
            console.error('Error fetching user data:', result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayUserInfo(user) {
    const avatarElement = document.querySelector('.avatar img');
    const nameElement = document.querySelector('.name');
    const emailElement = document.querySelector('.mail');

    avatarElement.src = `https://jammerapi.mahmadamin.com${user.image}`; 

    nameElement.textContent = user.fullName;

    emailElement.textContent = user.email;
}


fetchUserData();


const logoutBtn = document.querySelector("#logout-button");
logoutBtn.addEventListener("click", function () {
    Cookies.remove("Token");
    window.location.pathname = "/";
});

const orderBtn = document.querySelector("#order-button");
orderBtn.addEventListener("click", function () {
    window.location.pathname = "/Home/Order";
});

const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.querySelector('.button-main').addEventListener('click', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('firstName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const imageInput = document.getElementById('image').files[0];

    if (newPassword !== confirmPassword) {
        alert('New Password and Confirm Password do not match!');
        return;
    }

    const formData = new FormData();
    formData.append('FullName', fullName);
    formData.append('PhoneNumber', phoneNumber);
    if (password) {
        formData.append('Password', password);
    }
    if (newPassword) {
        formData.append('NewPassword', newPassword);
    }
    if (imageInput) {
        formData.append('Image', imageInput);
    }

    fetch('https://jammerapi.mahmadamin.com/api/Users/UpdateUser', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showPopupMessage('Account updated successfully!', true);
            } else {
                showPopupMessage('Failed to update account: ' + data.message, false);
            }
        })
        .catch(error => {
            showPopupMessage('An error occurred while updating your account.', false);
        });
});

function showPopupMessage(message, isSuccess) {
    const popupMessageContent = document.getElementById('popupMessageContent');
    const popupMessage = document.getElementById('popupMessage');

    popupMessageContent.textContent = message;

    if (isSuccess) {
        popupMessageContent.classList.remove('bg-red-500');
        popupMessageContent.classList.add('bg-green-500');
    } else {
        popupMessageContent.classList.remove('bg-green-500');
        popupMessageContent.classList.add('bg-red-500');
    }

    popupMessage.classList.remove('hidden');
    setTimeout(() => {
        popupMessage.classList.add('hidden');
    }, 3000);
}