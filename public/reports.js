let students = [];
let attendanceSummary = [];
let marksRecords = [];
let feeRecords = [];

document.addEventListener("DOMContentLoaded", function () {
    startPage();
});

async function startPage() {
    await loadData();
    setupReportButton();
}

async function loadData() {
    try {
        const responses = await Promise.all([
            fetch("/api/students"),
            fetch("/api/attendance/summary"),
            fetch("/api/marks"),
            fetch("/api/fees")
        ]);

        const studentsResponse = responses[0];
        const attendanceResponse = responses[1];
        const marksResponse = responses[2];
        const feesResponse = responses[3];

        const studentsData =
            await studentsResponse.json();

        const attendanceData =
            await attendanceResponse.json();

        const marksData =
            await marksResponse.json();

        const feesData =
            await feesResponse.json();

        if (!studentsResponse.ok) {
            throw new Error(
                studentsData.error ||
                "Unable to load students"
            );
        }

        if (!attendanceResponse.ok) {
            throw new Error(
                attendanceData.error ||
                "Unable to load attendance"
            );
        }

        if (!marksResponse.ok) {
            throw new Error(
                marksData.error ||
                "Unable to load marks"
            );
        }

        if (!feesResponse.ok) {
            throw new Error(
                feesData.error ||
                "Unable to load fees"
            );
        }

        students = Array.isArray(studentsData)
            ? studentsData
            : [];

        attendanceSummary =
            Array.isArray(attendanceData)
                ? attendanceData
                : [];

        marksRecords =
            Array.isArray(marksData)
                ? marksData
                : [];

        feeRecords =
            Array.isArray(feesData)
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

function loadStudentDropdown() {
    const dropdown =
        document.getElementById("student");

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

    students.forEach(function (student) {
        const option =
            document.createElement("option");

        option.value = student.id;

        option.textContent =
            student.name +
            " - " +
            student.roll_number;

        dropdown.appendChild(option);
    });
}

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

function generateReport() {
    const dropdown =
        document.getElementById("student");

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
        students.find(function (item) {
            return String(item.id) ===
                String(studentId);
        });

    if (!student) {
        alert("Student not found.");
        return;
    }

    displayStudentInfo(student);
    displayAttendance(student);
    displayMarks(student);
    displayFees(student);
}

function displayStudentInfo(student) {
    const info =
        document.getElementById(
            "studentInfo"
        );

    if (!info) {
        return;
    }

    info.innerHTML = `
        <p>
            <strong>Name:</strong>
            ${escapeHTML(student.name)}
        </p>

        <p>
            <strong>Roll Number:</strong>
            ${escapeHTML(
                student.roll_number
            )}
        </p>

        <p>
            <strong>Course:</strong>
            ${escapeHTML(
                student.course || ""
            )}
        </p>

        <p>
            <strong>Email:</strong>
            ${escapeHTML(
                student.email || ""
            )}
        </p>

        <p>
            <strong>Phone:</strong>
            ${escapeHTML(
                student.phone || ""
            )}
        </p>
    `;
}

function displayAttendance(student) {
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
                ) === String(student.id);
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
        } else if (totalDays > 0) {
            percentage =
                (
                    (presentDays /
                        totalDays) *
                    100
                ).toFixed(1);
        }
    }

    table.innerHTML = `
        <tr>
            <td>${totalDays}</td>

            <td class="present">
                ${presentDays}
            </td>

            <td class="absent">
                ${absentDays}
            </td>

            <td>
                <strong>
                    ${percentage}%
                </strong>
            </td>
        </tr>
    `;
}

function displayMarks(student) {
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
                ) === String(student.id);
            }
        );

    table.innerHTML = "";

    if (records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No marks found.
                </td>
            </tr>
        `;

        return;
    }

    records.forEach(function (record) {
        const marks =
            Number(record.marks) || 0;

        const result =
            marks >= 35
                ? "Pass"
                : "Fail";

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHTML(
                    record.exam_name
                )}
            </td>

            <td>
                ${escapeHTML(
                    record.subject
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

        table.appendChild(row);
    });
}

function displayFees(student) {
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
                ) === String(student.id);
            }
        );

    table.innerHTML = "";

    if (records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No fees found.
                </td>
            </tr>
        `;

        return;
    }

    records.forEach(function (record) {
        const amount =
            Number(record.amount) || 0;

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHTML(
                    record.fee_type
                )}
            </td>

            <td>
                ₹${amount.toLocaleString(
                    "en-IN"
                )}
            </td>

            <td>
                ${escapeHTML(
                    record.payment_date
                )}
            </td>

            <td>
                ${escapeHTML(
                    record.payment_method
                )}
            </td>
        `;

        table.appendChild(row);
    });
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
