const settingsForm = document.getElementById("settingsForm");

const adminNameInput = document.getElementById("adminName");
const usernameInput = document.getElementById("username");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const message = document.getElementById("settingsMessage");

const savedAdminName =
    localStorage.getItem("adminName") || "Admin";

const savedUsername =
    localStorage.getItem("adminUsername") || "admin";

adminNameInput.value = savedAdminName;
usernameInput.value = savedUsername;

settingsForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const adminName =
        adminNameInput.value.trim();

    const username =
        usernameInput.value.trim();

    const newPassword =
        newPasswordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    if (!adminName) {
        message.textContent =
            "Please enter admin name.";
        return;
    }

    if (!username) {
        message.textContent =
            "Please enter username.";
        return;
    }

    if (newPassword || confirmPassword) {

        if (newPassword.length < 4) {
            message.textContent =
                "Password must be at least 4 characters.";
            return;
        }

        if (newPassword !== confirmPassword) {
            message.textContent =
                "Passwords do not match.";
            return;
        }

        localStorage.setItem(
            "adminPassword",
            newPassword
        );
    }

    localStorage.setItem(
        "adminName",
        adminName
    );

    localStorage.setItem(
        "adminUsername",
        username
    );

    message.textContent =
        "Settings saved successfully.";

    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
});