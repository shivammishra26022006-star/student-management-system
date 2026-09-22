const loginForm =
    document.getElementById("userLoginForm");

const registerForm =
    document.getElementById("userRegisterForm");

const loginMessage =
    document.getElementById("userLoginMessage");

const registerMessage =
    document.getElementById("userRegisterMessage");


/* =========================
   USER LOGIN
========================= */

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username =
        document.getElementById("loginUsername")
            .value
            .trim();

    const password =
        document.getElementById("loginPassword")
            .value;

    loginMessage.textContent = "Logging in...";

    try {
        const response = await fetch("/api/users/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Login failed"
            );
        }

        localStorage.setItem(
            "userLoggedIn",
            "true"
        );

        localStorage.setItem(
            "userId",
            data.user.id
        );

        localStorage.setItem(
            "userName",
            data.user.name
        );

        loginMessage.textContent =
            "Login successful.";

        /*
         * Abhi user dashboard nahi banaya hai.
         * Isliye filhaal login successful message hi dikhega.
         */

    } catch (error) {
        console.error(error);

        loginMessage.textContent =
            error.message;
    }
});


/* =========================
   USER REGISTRATION
========================= */

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName")
                .value
                .trim();

        const email =
            document.getElementById("registerEmail")
                .value
                .trim();

        const phone =
            document.getElementById("registerPhone")
                .value
                .trim();

        const username =
            document.getElementById("registerUsername")
                .value
                .trim();

        const password =
            document.getElementById("registerPassword")
                .value;

        registerMessage.textContent =
            "Creating account...";

        try {

            const response =
                await fetch(
                    "/api/users/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            phone,
                            username,
                            password
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Registration failed"
                );
            }

            registerMessage.textContent =
                "Account created successfully.";

            registerForm.reset();

        } catch (error) {

            console.error(error);

            registerMessage.textContent =
                error.message;
        }
    }
);