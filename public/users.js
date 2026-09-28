/* =========================================================
   ADMIN USERS PAGE
========================================================= */


/* =========================
   LOAD USERS
========================= */

async function loadUsers() {

    const tableBody =
        document.getElementById(
            "usersTableBody"
        );

    if (!tableBody) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/users"
            );


        const users =
            await response.json();


        if (!response.ok) {

            throw new Error(
                users.error ||
                "Unable to load users"
            );

        }


        tableBody.innerHTML = "";


        if (
            users.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>

                    <td colspan="10">
                        No registered students found.
                    </td>

                </tr>
            `;

            return;
        }


        users.forEach(
            function (user) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(user.id)}
                    </td>


                    <td>
                        ${escapeHTML(
                            user.name || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            user.student_id || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            user.roll_number || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            user.course || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            user.email || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            user.phone || "-"
                        )}
                    </td>


                    <td>

                        <span class="status active">
                            ${escapeHTML(
                                user.status || "Active"
                            )}
                        </span>

                    </td>


                    <td>
                        ${
                            user.last_login
                                ? formatDate(
                                    user.last_login
                                )
                                : "Never"
                        }
                    </td>


                    <td>

                        <button
                            type="button"
                            class="primary-button"
                            onclick="viewUser(${Number(user.id)})"
                        >
                            View
                        </button>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Users loading error:",
            error
        );


        tableBody.innerHTML = `
            <tr>

                <td colspan="10">
                    Unable to load students.
                </td>

            </tr>
        `;

    }

}


/* =========================================================
   VIEW SINGLE USER
========================================================= */

async function viewUser(
    userId
) {

    try {

        const response =
            await fetch(
                `/api/users/${userId}`
            );


        const user =
            await response.json();


        if (!response.ok) {

            throw new Error(
                user.error ||
                "Unable to load student details"
            );

        }


        /* =========================
           SHOW DETAILS SECTION
        ========================= */

        const section =
            document.getElementById(
                "studentDetailsSection"
            );


        if (section) {

            section.style.display =
                "block";

        }


        /* =========================
           PERSONAL INFORMATION
        ========================= */

        setText(
            "detailName",
            user.name
        );


        setText(
            "detailDob",
            user.date_of_birth
        );


        setText(
            "detailGender",
            user.gender
        );


        setText(
            "detailEmail",
            user.email
        );


        setText(
            "detailPhone",
            user.phone
        );


        setText(
            "detailAddress",
            user.address
        );


        setText(
            "detailCity",
            user.city
        );


        setText(
            "detailState",
            user.state
        );


        setText(
            "detailPincode",
            user.pincode
        );


        /* =========================
           ACADEMIC INFORMATION
        ========================= */

        setText(
            "detailStudentId",
            user.student_id
        );


        setText(
            "detailRollNumber",
            user.roll_number
        );


        setText(
            "detailCourse",
            user.course
        );


        setText(
            "detailDepartment",
            user.department
        );


        setText(
            "detailSemester",
            user.semester
        );


        setText(
            "detailAcademicYear",
            user.academic_year
        );


        setText(
            "detailCollege",
            user.college
        );


        /* =========================
           GUARDIAN INFORMATION
        ========================= */

        setText(
            "detailGuardianName",
            user.guardian_name
        );


        setText(
            "detailGuardianRelation",
            user.guardian_relation
        );


        setText(
            "detailGuardianPhone",
            user.guardian_phone
        );


        setText(
            "detailEmergencyContact",
            user.emergency_contact
        );


        /* =========================
           ACCOUNT INFORMATION
        ========================= */

        setText(
            "detailUsername",
            user.username
        );


        setText(
            "detailStatus",
            user.status
        );


        setText(
            "detailCreatedAt",
            formatDate(
                user.created_at
            )
        );


        setText(
            "detailLastLogin",
            user.last_login
                ? formatDate(
                    user.last_login
                )
                : "Never"
        );


        /* =========================
           SCROLL TO DETAILS
        ========================= */

        if (section) {

            section.scrollIntoView({
                behavior: "smooth"
            });

        }


    } catch (error) {

        console.error(
            "Student details error:",
            error
        );

        alert(
            error.message
        );

    }

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value || "-";

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? "-"
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUsers();

    }
);