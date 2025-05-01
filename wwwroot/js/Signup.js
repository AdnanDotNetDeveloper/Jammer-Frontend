const signupBtn = document.getElementById("signup-btn");
const username = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const PhoneNumber = document.getElementById("number");
const passwordConfirm = document.getElementById("password-confirm");
const image = document.getElementById("image");

// Add animations on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add animation to form elements
    const formElements = document.querySelectorAll('.form-input, .btn, .form-label');
    formElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate-fade-in');
        }, 100 + (index * 50));
    });
});

async function loginUser(obj) {
    try {
        let response = await fetch("https://jammerapi.mahmadamin.com/api/Users/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(obj)
        });
        
        let data = await response.json();

        if (data.message === "Login Successfully") {
            showNotification("Account created successfully! Logging you in...", "success");
            let token = data.data;
            Cookies.set('Token', token, { expires: 7 });
            
            // Redirect with a slight delay for animation
            setTimeout(() => {
                let previousUrl = localStorage.getItem("previousUrl");
                if (previousUrl) {
                    localStorage.removeItem("previousUrl");
                    window.location.href = previousUrl;
                } else {
                    window.location.pathname = "/";
                }
            }, 1000);
        } else {
            showNotification(data.message, "error");
            resetForm();
        }
    } catch (error) {
        console.error("Error during login:", error);
        showNotification("Login failed. Please try again later.", "error");
        resetForm();
    }
}

async function signupUser(formData) {
    try {
        // Show loading state
        signupBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Creating Account...';
        signupBtn.disabled = true;

        let response = await fetch("https://jammerapi.mahmadamin.com/api/Users/Signup", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            let result = await response.json();
            loginUser({ email: email.value, password: password.value });
        } else {
            let errorMessage;
            try {
                let errorData = await response.json();
                errorMessage = errorData.message || "Registration failed.";
            } catch (e) {
                errorMessage = response.statusText || "Registration failed.";
            }
            console.error("Signup failed:", errorMessage);
            showNotification(errorMessage, "error");
            resetForm();
        }
    } catch (error) {
        console.error("Error during signup:", error);
        showNotification("Registration failed due to server error.", "error");
        resetForm();
    }
}

function resetForm() {
    signupBtn.innerHTML = 'Create Account';
    signupBtn.disabled = false;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-medium z-50 animate-fade-in ${
        type === 'success' ? 'bg-success-50 border-l-4 border-success text-success-800' : 
        type === 'error' ? 'bg-danger-50 border-l-4 border-danger text-danger-800' : 
        'bg-primary-50 border-l-4 border-primary text-primary-800'
    }`;
    
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

signupBtn.addEventListener("click", function() {
    // Basic form validation
    if (!username.value || !email.value || !password.value || !PhoneNumber.value) {
        showNotification("Please fill in all required fields.", "error");
        return;
    }
    
    if (password.value !== passwordConfirm.value) {
        showNotification("Passwords do not match.", "error");
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        showNotification("Please enter a valid email address.", "error");
        return;
    }

    let formData = new FormData();
    formData.append("FullName", username.value);
    formData.append("Email", email.value);
    formData.append("Password", password.value);
    formData.append("PhoneNumber", PhoneNumber.value);
    formData.append("RoleId", "2");
    
    if (image.files.length > 0) {
        formData.append("Image", image.files[0]);
    }

    signupUser(formData);
});

// Add event listener to any login links
document.addEventListener('DOMContentLoaded', function() {
    const loginLinks = document.querySelectorAll('a[href="/Home/Login"]');
    loginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Store current URL for potential redirect after login
            localStorage.setItem("previousUrl", window.location.href);
        });
    });
});