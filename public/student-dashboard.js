/* =========================================================
   STUDENT DASHBOARD
========================================================= */

let currentUser = null;

let currentStudent = null;


/* =========================================================
   HELPER
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
            value ?? "-";

    }

}


function formatMoney(
    value
) {

    return (
        "₹" +
        (
            Number(value) || 0
        ).toLocaleString("en-IN")
    );

}


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


function showMessage(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    element.innerHTML = `
        <tr>
            <td colspan="6">
                ${escapeHTML(message)}
            </td>
        </tr>
    `;

}


/* =========================================================
   LOAD CURRENT USER
========================================================= */

async function loadCurrentUser() {

    const userId =
        localStorage.getItem(
            "userId"
        );


    const loggedIn =
        localStorage.getItem(
            "userLoggedIn"
        );


    if (
        !userId ||
        loggedIn !== "true"
    ) {

        window.location.href =
            "user-login.html";

        return false;

    }


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
                "Unable to load student account"
            );

        }


        currentUser =
            user;


        return true;


    } catch (error) {

        console.error(
            "User loading error:",
            error
        );


        localStorage.removeItem(
            "userLoggedIn"
        );

        localStorage.removeItem(
            "userId"
        );

        localStorage.removeItem(
            "userName"
        );


        window.location.href =
            "user-login.html";


        return false;

    }

}


/* =========================================================
   LOAD LINKED STUDENT
========================================================= */

async function loadLinkedStudent() {

    try {

        const response =
            await fetch(
                `/api/users/${currentUser.id}/student`
            );


        const student =
            await response.json();


        if (!response.ok) {

            throw new Error(
                student.error ||
                "Linked student record not found"
            );

        }


        currentStudent =
            student;


        return true;


    } catch (error) {

        console.error(
            "Linked student error:",
            error
        );


        return false;

    }

}


/* =========================================================
   LOAD PROFILE
========================================================= */

function loadProfile() {

    const student =
        currentUser;


    if (!student) {

        return;

    }


    setText(
        "studentNameHeader",
        student.name
    );


    setText(
        "welcomeStudent",
        `Welcome, ${student.name}`
    );


    setText(
        "studentIdDisplay",
        student.student_id || "-"
    );


    setText(
        "courseDisplay",
        student.course || "-"
    );


    setText(
        "semesterDisplay",
        student.semester || "-"
    );


    setText(
        "collegeDisplay",
        student.college || "-"
    );


    setText(
        "profileName",
        student.name
    );


    setText(
        "profileDob",
        student.date_of_birth || "-"
    );


    setText(
        "profileGender",
        student.gender || "-"
    );


    setText(
        "profileEmail",
        student.email || "-"
    );


    setText(
        "profilePhone",
        student.phone || "-"
    );


    setText(
        "profileAddress",
        student.address || "-"
    );


    setText(
        "profileCity",
        student.city || "-"
    );


    setText(
        "profileState",
        student.state || "-"
    );


    setText(
        "profilePincode",
        student.pincode || "-"
    );


    setText(
        "profileStudentId",
        student.student_id || "-"
    );


    setText(
        "profileRollNumber",
        student.roll_number || "-"
    );


    setText(
        "profileCourse",
        student.course || "-"
    );


    setText(
        "profileDepartment",
        student.department || "-"
    );


    setText(
        "profileSemester",
        student.semester || "-"
    );


    setText(
        "profileAcademicYear",
        student.academic_year || "-"
    );


    setText(
        "profileCollege",
        student.college || "-"
    );


    setText(
        "profileGuardianName",
        student.guardian_name || "-"
    );


    setText(
        "profileGuardianRelation",
        student.guardian_relation || "-"
    );


    setText(
        "profileGuardianPhone",
        student.guardian_phone || "-"
    );


    setText(
        "profileEmergencyContact",
        student.emergency_contact || "-"
    );


    setText(
        "profileUsername",
        student.username || "-"
    );


    setText(
        "profileStatus",
        student.status || "Active"
    );

}


/* =========================================================
   LOAD ATTENDANCE
========================================================= */

async function loadAttendance() {

    const studentId =
        currentStudent
            ? Number(currentStudent.id)
            : null;


    if (!studentId) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/attendance"
            );


        const records =
            await response.json();


        if (!response.ok) {

            throw new Error(
                records.error ||
                "Unable to load attendance"
            );

        }


        const myRecords =
            records.filter(
                record =>
                    Number(
                        record.student_id
                    ) === studentId
            );


        let present = 0;

        let absent = 0;


        myRecords.forEach(
            record => {

                if (
                    record.status === "Present"
                ) {

                    present++;

                }


                if (
                    record.status === "Absent"
                ) {

                    absent++;

                }

            }
        );


        const total =
            myRecords.length;


        const percentage =
            total > 0
                ? (
                    (
                        present /
                        total
                    ) * 100
                ).toFixed(1)
                : "0.0";


        setText(
            "presentDays",
            present
        );


        setText(
            "absentDays",
            absent
        );


        setText(
            "totalAttendanceDays",
            total
        );


        setText(
            "attendancePercentage",
            percentage + "%"
        );


        setText(
            "attendancePercentageDetail",
            percentage + "%"
        );


        const table =
            document.getElementById(
                "studentAttendanceTable"
            );


        if (!table) {

            return;

        }


        table.innerHTML = "";


        if (
            myRecords.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="2">
                        No attendance records available.
                    </td>
                </tr>
            `;


            return;

        }


        myRecords.forEach(
            record => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            record.date || "-"
                        )}
                    </td>

                    <td>
                        <span
                            class="${
                                record.status === "Present"
                                    ? "status active"
                                    : "status"
                            }"
                        >
                            ${escapeHTML(
                                record.status || "-"
                            )}
                        </span>
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Attendance error:",
            error
        );


        showMessage(
            "studentAttendanceTable",
            "Unable to load attendance."
        );

    }

}


/* =========================================================
   LOAD MARKS
========================================================= */

async function loadMarks() {

    const studentId =
        currentStudent
            ? Number(currentStudent.id)
            : null;


    if (!studentId) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/marks"
            );


        const records =
            await response.json();


        if (!response.ok) {

            throw new Error(
                records.error ||
                "Unable to load marks"
            );

        }


        const myMarks =
            records.filter(
                record =>
                    Number(
                        record.student_id
                    ) === studentId
            );


        setText(
            "totalMarks",
            myMarks.length
        );


        const marksTable =
            document.getElementById(
                "studentMarksTable"
            );


        const resultTable =
            document.getElementById(
                "studentResultTable"
            );


        if (marksTable) {

            marksTable.innerHTML = "";

        }


        if (resultTable) {

            resultTable.innerHTML = "";

        }


        if (
            myMarks.length === 0
        ) {

            if (marksTable) {

                marksTable.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No marks records available.
                        </td>
                    </tr>
                `;

            }


            if (resultTable) {

                resultTable.innerHTML = `
                    <tr>
                        <td colspan="3">
                            No result records available.
                        </td>
                    </tr>
                `;

            }


            setText(
                "resultTotalSubjects",
                0
            );


            setText(
                "resultTotalMarks",
                0
            );


            setText(
                "resultAverage",
                0
            );


            return;

        }


        let totalMarksValue = 0;


        myMarks.forEach(
            record => {

                totalMarksValue +=
                    Number(
                        record.marks
                    ) || 0;


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            record.exam_name || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.subject || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.marks ?? "-"
                        )}
                    </td>

                `;


                if (marksTable) {

                    marksTable.appendChild(
                        row.cloneNode(true)
                    );

                }


                if (resultTable) {

                    resultTable.appendChild(
                        row
                    );

                }

            }
        );


        const average =
            totalMarksValue /
            myMarks.length;


        setText(
            "resultTotalSubjects",
            myMarks.length
        );


        setText(
            "resultTotalMarks",
            totalMarksValue
        );


        setText(
            "resultAverage",
            average.toFixed(1)
        );


    } catch (error) {

        console.error(
            "Marks error:",
            error
        );


        showMessage(
            "studentMarksTable",
            "Unable to load marks."
        );


        showMessage(
            "studentResultTable",
            "Unable to load result."
        );

    }

}


/* =========================================================
   LOAD FEES
========================================================= */

async function loadFees() {

    const studentId =
        currentStudent
            ? Number(currentStudent.id)
            : null;


    if (!studentId) {

        return;

    }


    try {

        const summaryResponse =
            await fetch(
                "/api/fees/summary"
            );


        const summaries =
            await summaryResponse.json();


        if (!summaryResponse.ok) {

            throw new Error(
                summaries.error ||
                "Unable to load fee summary"
            );

        }


        const mySummary =
            summaries.find(
                record =>
                    Number(
                        record.id
                    ) === studentId
            );


        if (mySummary) {

            setText(
                "totalFee",
                formatMoney(
                    mySummary.total_fee
                )
            );


            setText(
                "paidFee",
                formatMoney(
                    mySummary.paid_fee
                )
            );


            setText(
                "pendingFeeDetail",
                formatMoney(
                    mySummary.pending_fee
                )
            );


            setText(
                "pendingFees",
                formatMoney(
                    mySummary.pending_fee
                )
            );

        }


        const feeResponse =
            await fetch(
                "/api/fees"
            );


        const fees =
            await feeResponse.json();


        if (!feeResponse.ok) {

            throw new Error(
                fees.error ||
                "Unable to load fee records"
            );

        }


        const myFees =
            fees.filter(
                record =>
                    Number(
                        record.student_id
                    ) === studentId
            );


        const table =
            document.getElementById(
                "studentFeesTable"
            );


        if (!table) {

            return;

        }


        table.innerHTML = "";


        if (
            myFees.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No fee payment records available.
                    </td>
                </tr>
            `;


            return;

        }


        myFees.forEach(
            fee => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            fee.fee_type || "-"
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            fee.amount
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            fee.payment_date || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            fee.payment_method || "-"
                        )}
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Fees error:",
            error
        );


        showMessage(
            "studentFeesTable",
            "Unable to load fee information."
        );

    }

}


/* =========================================================
   LOAD TIMETABLE
========================================================= */

async function loadTimetable() {

    const table =
        document.getElementById(
            "studentTimetableTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML = `
        <tr>
            <td colspan="4">
                Loading timetable...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "/api/timetable"
            );


        const records =
            await response.json();


        if (!response.ok) {

            throw new Error(
                records.error ||
                "Unable to load timetable"
            );

        }


        const studentCourse =
            String(
                currentUser.course || ""
            )
                .trim()
                .toLowerCase();


        const studentSemester =
            String(
                currentUser.semester || ""
            )
                .trim()
                .toLowerCase();


        const myTimetable =
            records.filter(
                record => {

                    const recordCourse =
                        String(
                            record.course || ""
                        )
                            .trim()
                            .toLowerCase();


                    const recordSemester =
                        String(
                            record.semester || ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        recordCourse ===
                            studentCourse &&

                        recordSemester ===
                            studentSemester
                    );

                }
            );


        table.innerHTML = "";


        if (
            myTimetable.length === 0
        ) {

            table.innerHTML = `
                <tr>

                    <td colspan="4">
                        No timetable published for your course and semester.
                    </td>

                </tr>
            `;


            return;

        }


        myTimetable.forEach(
            record => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            record.day || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.time || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.subject || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.room || "-"
                        )}
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Timetable error:",
            error
        );


        table.innerHTML = `
            <tr>

                <td colspan="4">
                    Unable to load timetable.
                </td>

            </tr>
        `;

    }

}


/* =========================================================
   LOAD NOTICES
========================================================= */

async function loadNotices() {

    const noticeList =
        document.getElementById(
            "studentNoticesList"
        );


    if (!noticeList) {

        return;

    }


    noticeList.innerHTML = `

        <div class="card">

            <div>

                <h3>
                    Loading announcements...
                </h3>

                <p>
                    Please wait while notices are loaded.
                </p>

            </div>

        </div>

    `;


    try {

        const response =
            await fetch(
                "/api/notices"
            );


        const rawResponse =
            await response.text();


        let notices = [];


        try {

            notices =
                JSON.parse(
                    rawResponse
                );

        } catch (jsonError) {

            console.error(
                "Notice JSON error:",
                jsonError
            );

            throw new Error(
                "Unable to read notices from server."
            );

        }


        if (!response.ok) {

            throw new Error(
                notices.error ||
                "Unable to load notices"
            );

        }


        const studentCourse =
            String(
                currentUser?.course || ""
            )
                .trim()
                .toLowerCase();


        const visibleNotices =
            notices.filter(
                notice => {

                    const audience =
                        String(
                            notice.audience || ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        audience === "all students" ||
                        audience === studentCourse
                    );

                }
            );


        setText(
            "noticeCount",
            visibleNotices.length
        );


        if (
            visibleNotices.length === 0
        ) {

            noticeList.innerHTML = `

                <div class="card">

                    <div>

                        <h3>
                            No announcements
                        </h3>

                        <p>
                            New college announcements will appear here.
                        </p>

                    </div>

                </div>

            `;

            return;

        }


        noticeList.innerHTML = "";


        visibleNotices.forEach(
            notice => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "card";


                card.innerHTML = `

                    <div>

                        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;">

                            <div>

                                <h3 style="margin-bottom:6px;">
                                    ${escapeHTML(
                                        notice.title ||
                                        "Announcement"
                                    )}
                                </h3>

                                <p style="margin:0;color:#666;">

                                    ${escapeHTML(
                                        notice.message ||
                                        ""
                                    )}

                                </p>

                            </div>

                            <span class="status active">

                                ${escapeHTML(
                                    notice.category ||
                                    "General"
                                )}

                            </span>

                        </div>

                        <div style="margin-top:12px;color:#777;font-size:14px;">

                            Date:
                            ${escapeHTML(
                                notice.notice_date ||
                                "-"
                            )}

                            &nbsp; | &nbsp;

                            Audience:
                            ${escapeHTML(
                                notice.audience ||
                                "All Students"
                            )}

                        </div>

                    </div>

                `;


                noticeList.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Notices error:",
            error
        );


        setText(
            "noticeCount",
            0
        );


        noticeList.innerHTML = `

            <div class="card">

                <div>

                    <h3>
                        Unable to load announcements
                    </h3>

                    <p>
                        Please refresh the page and try again.
                    </p>

                </div>

            </div>

        `;

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutLink =
        document.getElementById(
            "studentLogoutLink"
        );


    if (!logoutLink) {

        return;

    }


    logoutLink.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "userLoggedIn"
            );

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "userName"
            );

        }
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
   START DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const userLoaded =
            await loadCurrentUser();


        if (!userLoaded) {

            return;

        }


        loadProfile();


        const studentLoaded =
            await loadLinkedStudent();


        if (studentLoaded) {

            await loadAttendance();

            await loadMarks();

            await loadFees();

            await loadTimetable();

        }


        await loadNotices();

        setupLogout();

    }
);