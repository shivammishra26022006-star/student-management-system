/* =========================================================
   REPORTS
========================================================= */

let students = [];

let attendanceSummary = [];

let marksRecords = [];

let feeRecords = [];


/* =========================================================
   START PAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        startPage();

    }
);


/* =========================================================
   START PAGE
========================================================= */

async function startPage() {

    await loadData();

    setupReportButton();

}


/* =========================================================
   LOAD ALL REPORT DATA
========================================================= */

async function loadData() {

    try {

        const responses =
            await Promise.all([

                fetch("/api/students"),

                fetch("/api/attendance/summary"),

                fetch("/api/marks"),

                fetch("/api/fees")

            ]);


        const studentsResponse =
            responses[0];

        const attendanceResponse =
            responses[1];

        const marksResponse =
            responses[2];

        const feesResponse =
            responses[3];


        const studentsData =
            await readJSON(
                studentsResponse
            );


        const attendanceData =
            await readJSON(
                attendanceResponse
            );


        const marksData =
            await readJSON(
                marksResponse
            );


        const feesData =
            await readJSON(
                feesResponse
            );


        if (
            !studentsResponse.ok
        ) {

            throw new Error(
                studentsData.error ||
                "Unable to load students"
            );

        }


        if (
            !attendanceResponse.ok
        ) {

            throw new Error(
                attendanceData.error ||
                "Unable to load attendance"
            );

        }


        if (
            !marksResponse.ok
        ) {

            throw new Error(
                marksData.error ||
                "Unable to load marks"
            );

        }


        if (
            !feesResponse.ok
        ) {

            throw new Error(
                feesData.error ||
                "Unable to load fees"
            );

        }


        students =
            Array.isArray(
                studentsData
            )
                ? studentsData
                : [];


        attendanceSummary =
            Array.isArray(
                attendanceData
            )
                ? attendanceData
                : [];


        marksRecords =
            Array.isArray(
                marksData
            )
                ? marksData
                : [];


        feeRecords =
            Array.isArray(
                feesData
            )
                ? feesData
                : [];


        loadStudentDropdown();


    } catch (error) {

        console.error(
            "Report Data Error:",
            error
        );


        alert(
            "Report data load nahi hua: " +
            error.message
        );

    }

}


/* =========================================================
   READ JSON SAFELY
========================================================= */

async function readJSON(
    response
) {

    const text =
        await response.text();


    try {

        return JSON.parse(
            text
        );

    } catch (error) {

        return {

            error:
                "Server returned an invalid response"

        };

    }

}


/* =========================================================
   LOAD STUDENT DROPDOWN
========================================================= */

function loadStudentDropdown() {

    const dropdown =
        document.getElementById(
            "student"
        );


    if (!dropdown) {

        console.error(
            "Student dropdown not found."
        );

        return;

    }


    dropdown.innerHTML = `

        <option value="">
            Select Student
        </option>

    `;


    if (
        students.length === 0
    ) {

        dropdown.innerHTML += `

            <option value="">
                No students available
            </option>

        `;

        return;

    }


    students.forEach(
        function (student) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                student.id;


            option.textContent =
                (
                    student.name ||
                    "Student"
                ) +
                " - " +
                (
                    student.roll_number ||
                    "No Roll Number"
                );


            dropdown.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   SETUP REPORT BUTTON
========================================================= */

function setupReportButton() {

    const button =
        document.getElementById(
            "generateReport"
        );


    if (!button) {

        console.error(
            "Generate Report button not found."
        );

        return;

    }


    button.addEventListener(
        "click",
        function () {

            generateReport();

        }
    );

}


/* =========================================================
   GENERATE REPORT
========================================================= */

function generateReport() {

    const dropdown =
        document.getElementById(
            "student"
        );


    if (!dropdown) {

        return;

    }


    const studentId =
        dropdown.value;


    if (!studentId) {

        alert(
            "Please select a student."
        );

        return;

    }


    const student =
        students.find(
            function (item) {

                return String(
                    item.id
                ) === String(
                    studentId
                );

            }
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;

    }


    displayStudentInfo(
        student
    );


    displayAttendance(
        student
    );


    displayMarks(
        student
    );


    displayFees(
        student
    );

}


/* =========================================================
   DISPLAY STUDENT INFORMATION
========================================================= */

function displayStudentInfo(
    student
) {

    const info =
        document.getElementById(
            "studentInfo"
        );


    if (!info) {

        return;

    }


    info.innerHTML = `

        <div style="
            display:grid;
            grid-template-columns:
                repeat(
                    auto-fit,
                    minmax(220px, 1fr)
                );
            gap:12px;
        ">

            <p>
                <strong>Name:</strong><br>
                ${escapeHTML(
                    student.name
                )}
            </p>

            <p>
                <strong>Roll Number:</strong><br>
                ${escapeHTML(
                    student.roll_number
                )}
            </p>

            <p>
                <strong>Course:</strong><br>
                ${escapeHTML(
                    student.course || "-"
                )}
            </p>

            <p>
                <strong>Email:</strong><br>
                ${escapeHTML(
                    student.email || "-"
                )}
            </p>

            <p>
                <strong>Phone:</strong><br>
                ${escapeHTML(
                    student.phone || "-"
                )}
            </p>

            <p>
                <strong>Gender:</strong><br>
                ${escapeHTML(
                    student.gender || "-"
                )}
            </p>

            <p>
                <strong>Date of Birth:</strong><br>
                ${escapeHTML(
                    student.date_of_birth || "-"
                )}
            </p>

            <p>
                <strong>Address:</strong><br>
                ${escapeHTML(
                    student.address || "-"
                )}
            </p>

        </div>

    `;

}


/* =========================================================
   DISPLAY ATTENDANCE
========================================================= */

function displayAttendance(
    student
) {

    const table =
        document.getElementById(
            "attendanceReport"
        );


    if (!table) {

        return;

    }


    const summary =
        attendanceSummary.find(
            function (record) {

                return String(
                    record.id
                ) === String(
                    student.id
                );

            }
        );


    let totalDays = 0;

    let presentDays = 0;

    let absentDays = 0;

    let percentage = "0.0";


    if (summary) {

        totalDays =
            Number(
                summary.total_days
            ) || 0;


        presentDays =
            Number(
                summary.present_days
            ) || 0;


        absentDays =
            Number(
                summary.absent_days
            ) || 0;


        if (
            summary.attendance_percentage !==
                undefined &&
            summary.attendance_percentage !==
                null
        ) {

            percentage =
                String(
                    summary.attendance_percentage
                );

        } else if (
            totalDays > 0
        ) {

            percentage =
                (
                    (
                        presentDays /
                        totalDays
                    ) * 100
                ).toFixed(1);

        }

    }


    table.innerHTML = `

        <tr>

            <td>
                ${totalDays}
            </td>

            <td class="present">
                ${presentDays}
            </td>

            <td class="absent">
                ${absentDays}
            </td>

            <td>

                <strong>
                    ${escapeHTML(
                        percentage
                    )}%
                </strong>

            </td>

        </tr>

    `;

}


/* =========================================================
   DISPLAY MARKS
========================================================= */

function displayMarks(
    student
) {

    const table =
        document.getElementById(
            "marksReport"
        );


    if (!table) {

        return;

    }


    const records =
        marksRecords.filter(
            function (record) {

                return String(
                    record.student_id
                ) === String(
                    student.id
                );

            }
        );


    table.innerHTML = "";


    if (
        records.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td colspan="4">
                    No marks found.
                </td>

            </tr>

        `;

        return;

    }


    let totalMarks = 0;


    records.forEach(
        function (record) {

            const marks =
                Number(
                    record.marks
                ) || 0;


            totalMarks +=
                marks;


            const result =
                marks >= 35
                    ? "Pass"
                    : "Fail";


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        record.exam_name ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.subject ||
                        "-"
                    )}
                </td>

                <td>
                    ${marks}
                </td>

                <td>

                    <span class="${
                        result === "Pass"
                            ? "present"
                            : "absent"
                    }">

                        ${result}

                    </span>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );


    const average =
        totalMarks /
        records.length;


    const summaryRow =
        document.createElement(
            "tr"
        );


    summaryRow.innerHTML = `

        <td colspan="2">

            <strong>
                Average Marks
            </strong>

        </td>

        <td colspan="2">

            <strong>
                ${average.toFixed(1)}
            </strong>

        </td>

    `;


    table.appendChild(
        summaryRow
    );

}


/* =========================================================
   DISPLAY FEES
========================================================= */

function displayFees(
    student
) {

    const table =
        document.getElementById(
            "feesReport"
        );


    if (!table) {

        return;

    }


    const records =
        feeRecords.filter(
            function (record) {

                return String(
                    record.student_id
                ) === String(
                    student.id
                );

            }
        );


    table.innerHTML = "";


    if (
        records.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td colspan="4">
                    No fees found.
                </td>

            </tr>

        `;

        return;

    }


    let totalPaid = 0;


    records.forEach(
        function (record) {

            const amount =
                Number(
                    record.amount
                ) || 0;


            totalPaid +=
                amount;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        record.fee_type ||
                        "-"
                    )}
                </td>

                <td>
                    ₹${amount.toLocaleString(
                        "en-IN"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.payment_date ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.payment_method ||
                        "-"
                    )}
                </td>

            `;


            table.appendChild(
                row
            );

        }
    );


    const totalRow =
        document.createElement(
            "tr"
        );


    totalRow.innerHTML = `

        <td>

            <strong>
                Total Paid
            </strong>

        </td>

        <td>

            <strong>
                ₹${totalPaid.toLocaleString(
                    "en-IN"
                )}
            </strong>

        </td>

        <td colspan="2">
            -
        </td>

    `;


    table.appendChild(
        totalRow
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
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}