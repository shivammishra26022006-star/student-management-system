document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");

    const savedUsername =
        localStorage.getItem("adminUsername");

    const savedPassword =
        localStorage.getItem("adminPassword");

    if (
        savedUsername &&
        savedPassword &&
        username === savedUsername &&
        password === savedPassword
    ) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "index.html";
        return;
    }

    if (
        username === "admin" &&
        password === "admin123"
    ) {
        localStorage.setItem("adminUsername", "admin");
        localStorage.setItem("adminPassword", "admin123");
        localStorage.setItem("isLoggedIn", "true");

        window.location.href = "index.html";
        return;
    }

    if (
        username === "admin" &&
        password === "admin456"
    ) {
        localStorage.setItem("adminUsername", "admin");
        localStorage.setItem("adminPassword", "admin456");
        localStorage.setItem("isLoggedIn", "true");

        window.location.href = "index.html";
        return;
    }

    if (
        username === "rahul" &&
        password === "rahul123"
    ) {
        localStorage.setItem("adminUsername", "rahul");
        localStorage.setItem("adminPassword", "rahul123");
        localStorage.setItem("adminName", "rahul");
        localStorage.setItem("isLoggedIn", "true");

        window.location.href = "index.html";
        return;
    }

    message.textContent =
        "Invalid username or password.";
});