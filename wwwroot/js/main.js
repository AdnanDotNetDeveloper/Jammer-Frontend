const userIconContainer = document.querySelector("#account-icons");
const userIcon = document.querySelector("#main-user-icon");

const token = Cookies.get('Token');
if (token === undefined || token === null) {
    userIconContainer.style.display = "none";
} else {
    userIconContainer.style.display = "flex";
    userIcon.style.display = "none";
}


document.getElementById("login").addEventListener("click", function () {
    localStorage.setItem("previousUrl", window.location.href);
    window.location.pathname = "/Home/login";

});

document.getElementById("signup").addEventListener("click", function () {
    localStorage.setItem("previousUrl", window.location.href);
    window.location.pathname = "/Home/signup";

});