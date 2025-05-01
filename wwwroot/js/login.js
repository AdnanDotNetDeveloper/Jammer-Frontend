const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const loginContainer = document.getElementById("login-container");

// Add animations on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add animation to form elements
    const formElements = document.querySelectorAll('.form-input, .btn');
    formElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate-fade-in');
        }, 100 + (index * 50));
    });
});

// Login functionality
loginBtn.addEventListener("click", function() {
    // Show loading state
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Logging in...';
    loginBtn.disabled = true;
    
    let obj = { email: username.value, password: password.value };
    username.value = "";
    password.value = "";
    loginUser(obj);
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

        if (response.ok) {
            // If login is successful
            showNotification(data.message, 'success');

            // Store token in cookies
            const token = data.data;
            Cookies.set('Token', token, { expires: 7 });

            // Redirect user to previous URL or home page with a slight delay for animation
            setTimeout(() => {
                const previousUrl = localStorage.getItem("previousUrl");
                if (previousUrl) {
                    localStorage.removeItem("previousUrl");
                    window.location.href = previousUrl;
                } else {
                    window.location.pathname = "/";
                }
            }, 1000);
        } else {
            // Reset form if login fails
            resetForm();
            showNotification(data.message || "Login failed. Please check your credentials.", 'error');
        }
    } catch (error) {
        // Catch any network or other errors
        console.error("Error occurred:", error);
        resetForm();
        showNotification("An error occurred. Please try again later.", 'error');
    }
}

function resetForm() {
    loginBtn.innerHTML = 'Login';
    loginBtn.disabled = false;
}

function showNotification(message, type = 'info') {
    // Create the notification element
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

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

