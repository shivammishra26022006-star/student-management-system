const profile = document.querySelector(".profile");

if (profile) {
    const logoutButton = document.createElement("button");

    logoutButton.textContent = "Logout";
    logoutButton.type = "button";

    logoutButton.addEventListener("click", function() {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "login.html";
    });

    profile.appendChild(logoutButton);
}