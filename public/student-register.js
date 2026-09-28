/* =========================================================
   STUDENT REGISTRATION
========================================================= */

const registerForm =
    document.getElementById(
        "studentRegisterForm"
    );

const registerMessage =
    document.getElementById(
        "registerMessage"
    );


/* =========================================================
   FORM SUBMIT
========================================================= */

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        /* =========================
           PERSONAL INFORMATION
        ========================= */

        const name =
            document.getElementById(
                "registerName"
            ).value.trim();

        const date_of_birth =
            document.getElementById(
                "registerDob"
            ).value;

        const gender =
            document.getElementById(
                "registerGender"
            ).value;

        const email =
            document.getElementById(
                "registerEmail"
            ).value.trim();

        const phone =
            document.getElementById(
                "registerPhone"
            ).value.trim();

        const address =
            document.getElementById(
                "registerAddress"
            ).value.trim();

        const city =
            document.getElementById(
                "registerCity"
            ).value.trim();

        const state =
            document.getElementById(
                "registerState"
            ).value.trim();

        const pincode =
            document.getElementById(
                "registerPincode"
            ).value.trim();


        /* =========================
           ACADEMIC INFORMATION
        ========================= */

        const student_id =
            document.getElementById(
                "registerStudentId"
            ).value.trim();

        const roll_number =
            document.getElementById(
                "registerRollNumber"
            ).value.trim();

        const course =
            document.getElementById(
                "registerCourse"
            ).value;

        const department =
            document.getElementById(
                "registerDepartment"
            ).value.trim();

        const semester =
            document.getElementById(
                "registerSemester"
            ).value;

        const academic_year =
            document.getElementById(
                "registerAcademicYear"
            ).value;

        const college =
            document.getElementById(
                "registerCollege"
            ).value.trim();


        /* =========================
           GUARDIAN INFORMATION
        ========================= */

        const guardian_name =
            document.getElementById(
                "registerGuardianName"
            ).value.trim();

        const guardian_relation =
            document.getElementById(
                "registerGuardianRelation"
            ).value;

        const guardian_phone =
            document.getElementById(
                "registerGuardianPhone"
            ).value.trim();

        const emergency_contact =
            document.getElementById(
                "registerEmergencyContact"
            ).value.trim();


        /* =========================
           ACCOUNT INFORMATION
        ========================= */

        const username =
            document.getElementById(
                "registerUsername"
            ).value.trim();

        const password =
            document.getElementById(
                "registerPassword"
            ).value;

        const confirmPassword =
            document.getElementById(
                "registerConfirmPassword"
            ).value;


        /* =========================
           VALIDATION
        ========================= */

        if (
            password !==
            confirmPassword
        ) {

            registerMessage.textContent =
                "Passwords do not match.";

            return;
        }


        if (
            password.length < 6
        ) {

            registerMessage.textContent =
                "Password must be at least 6 characters.";

            return;
        }


        if (
            pincode.length !== 6 ||
            !/^\d{6}$/.test(pincode)
        ) {

            registerMessage.textContent =
                "Please enter a valid 6-digit PIN code.";

            return;
        }


        if (
            !/^\d+$/.test(phone)
        ) {

            registerMessage.textContent =
                "Please enter a valid phone number.";

            return;
        }


        if (
            !/^\d+$/.test(guardian_phone)
        ) {

            registerMessage.textContent =
                "Please enter a valid guardian phone number.";

            return;
        }


        if (
            !/^\d+$/.test(emergency_contact)
        ) {

            registerMessage.textContent =
                "Please enter a valid emergency contact.";

            return;
        }


        registerMessage.textContent =
            "Creating student account...";


        /* =========================
           SEND TO BACKEND
        ========================= */

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
                            date_of_birth,
                            gender,

                            email,
                            phone,

                            address,
                            city,
                            state,
                            pincode,

                            student_id,
                            roll_number,

                            course,
                            department,
                            semester,
                            academic_year,
                            college,

                            guardian_name,
                            guardian_relation,
                            guardian_phone,
                            emergency_contact,

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


            /* =========================
               SUCCESS
            ========================= */

            registerMessage.textContent =
                "Student account created successfully. Redirecting to login...";


            registerForm.reset();


            setTimeout(
                function () {

                    window.location.href =
                        "user-login.html";

                },
                1200
            );


        } catch (error) {

            console.error(
                "Student registration error:",
                error
            );


            registerMessage.textContent =
                error.message;

        }

    }
);