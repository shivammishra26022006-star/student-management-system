/* =========================================================
   STUDENT LOGIN
========================================================= */

const loginForm =
    document.getElementById(
        "userLoginForm"
    );

const loginMessage =
    document.getElementById(
        "userLoginMessage"
    );


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "loginUsername"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            loginMessage.textContent =
                "Logging in...";


            try {

                const response =
                    await fetch(
                        "/api/users/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
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
                        "Login failed"
                    );

                }


                /* =========================
                   SAVE LOGIN SESSION
                ========================= */

                localStorage.setItem(
                    "userLoggedIn",
                    "true"
                );


                localStorage.setItem(
                    "userId",
                    String(
                        data.user.id
                    )
                );


                localStorage.setItem(
                    "userName",
                    data.user.name
                );


                /* =========================
                   SUCCESS
                ========================= */

                loginMessage.textContent =
                    "Login successful. Opening dashboard...";


                setTimeout(
                    function () {

                        window.location.href =
                            "student-dashboard.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Student login error:",
                    error
                );


                loginMessage.textContent =
                    error.message;

            }

        }
    );

}