/* =========================================================
   SETTINGS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const settingsForm =
            document.getElementById(
                "settingsForm"
            );

        const adminNameInput =
            document.getElementById(
                "adminName"
            );

        const usernameInput =
            document.getElementById(
                "username"
            );

        const newPasswordInput =
            document.getElementById(
                "newPassword"
            );

        const confirmPasswordInput =
            document.getElementById(
                "confirmPassword"
            );

        const message =
            document.getElementById(
                "settingsMessage"
            );


        /* =================================================
           CHECK ELEMENTS
        ================================================= */

        if (
            !settingsForm ||
            !adminNameInput ||
            !usernameInput ||
            !newPasswordInput ||
            !confirmPasswordInput ||
            !message
        ) {

            console.error(
                "Settings form elements not found."
            );

            return;

        }


        /* =================================================
           LOAD SAVED SETTINGS
        ================================================= */

        const savedAdminName =
            localStorage.getItem(
                "adminName"
            ) || "Admin";


        const savedUsername =
            localStorage.getItem(
                "adminUsername"
            ) || "admin";


        adminNameInput.value =
            savedAdminName;


        usernameInput.value =
            savedUsername;


        /* =================================================
           SAVE SETTINGS
        ================================================= */

        settingsForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const adminName =
                    adminNameInput.value.trim();


                const username =
                    usernameInput.value.trim();


                const newPassword =
                    newPasswordInput.value;


                const confirmPassword =
                    confirmPasswordInput.value;


                /* =========================================
                   CLEAR OLD MESSAGE
                ========================================= */

                message.textContent = "";

                message.style.color =
                    "";


                /* =========================================
                   ADMIN NAME VALIDATION
                ========================================= */

                if (!adminName) {

                    message.textContent =
                        "Please enter admin name.";

                    return;

                }


                /* =========================================
                   USERNAME VALIDATION
                ========================================= */

                if (!username) {

                    message.textContent =
                        "Please enter username.";

                    return;

                }


                if (
                    username.length < 3
                ) {

                    message.textContent =
                        "Username must be at least 3 characters.";

                    return;

                }


                /* =========================================
                   PASSWORD VALIDATION
                ========================================= */

                if (
                    newPassword ||
                    confirmPassword
                ) {

                    if (
                        newPassword.length < 6
                    ) {

                        message.textContent =
                            "Password must be at least 6 characters.";

                        return;

                    }


                    if (
                        newPassword !==
                        confirmPassword
                    ) {

                        message.textContent =
                            "Passwords do not match.";

                        return;

                    }


                    localStorage.setItem(
                        "adminPassword",
                        newPassword
                    );

                }


                /* =========================================
                   SAVE ADMIN NAME
                ========================================= */

                localStorage.setItem(
                    "adminName",
                    adminName
                );


                /* =========================================
                   SAVE USERNAME
                ========================================= */

                localStorage.setItem(
                    "adminUsername",
                    username
                );


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                message.textContent =
                    "Settings saved successfully.";

                message.style.color =
                    "green";


                /* =========================================
                   CLEAR PASSWORD FIELDS
                ========================================= */

                newPasswordInput.value =
                    "";

                confirmPasswordInput.value =
                    "";

            }
        );

    }
);