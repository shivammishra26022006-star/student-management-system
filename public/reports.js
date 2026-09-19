let students = [];
let attendanceRecords = [];
let marksRecords = [];
let feeRecords = [];

document.addEventListener("DOMContentLoaded", function () {
    startPage();
});

async function startPage() {
    await loadStudents();
    await loadAttendance();
    await loadMarks();
    await loadFees();
    setupReportButton();
}

async function loadStudents() {
    try {
        const response = await fetch("/api/students");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to load students"
            );
        }

        students = Array.isArray(data) ? data : [];

        loadStudentDropdown();

    } catch (error) {
        console.error("Students Error:", error);

        const dropdown =
            document.getElementById("student");

        if (dropdown) {
            dropdown.innerHTML = `
                <option value="">
                    Unable to load students
                </option>
            `;
        }
    }
}

function loadStudentDropdown() {
    const dropdown =
        document.getElementById("student");

    if (!dropdown) {
        console.error("Student dropdown not found.");
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

async function loadAttendance() {
    try {
        const response =
            await fetch("/api/attendance");

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to load attendance"
            );
        }

        attendanceRecords =
            Array.isArray(data) ? data : [];

    } catch (error) {
        console.error(
            "Attendance Error:",
            error
        );

        attendanceRecords = [];
    }
}

async function loadMarks() {
    try {
        const response =
            await fetch("/api/marks");

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to load marks"
            );
        }

        marksRecords =
            Array.isArray(data) ? data : [];

    } catch (error) {
        console.error(
            "Marks Error:",
            error
        );

        marksRecords = [];
    }
}

async function loadFees() {
    try {
        const response =
            await fetch("/api/fees");

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to load fees"
            );
        }

        feeRecords =
            Array.isArray(data) ? data : [];

    } catch (error) {
        console.error(
            "Fees Error:",
            error
        );

        feeRecords = [];
    }
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
        generateReport
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

    const records =
        attendanceRecords.filter(
            function (record) {
                return (
                    String(record.student_id) ===
                    String(student.id)
                ) || (
                    String(
                        record.roll_number || ""
                    ).trim() ===
                    String(
                        student.roll_number || ""
                    ).trim()
                );
            }
        );

    let present = 0;
    let absent = 0;

    records.forEach(function (record) {
        if (record.status === "Present") {
            present++;
        }

        if (record.status === "Absent") {
            absent++;
        }
    });

    const totalDays =
        present + absent;

    const percentage =
        totalDays > 0
            ? (
                (present / totalDays) *
                100
            ).toFixed(1)
            : "0.0";

    table.innerHTML = `
        <tr>
            <td>
                ${totalDays}
            </td>

            <td class="present">
                ${present}
            </td>

            <td class="absent">
                ${absent}
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
                return (
                    String(record.student_id) ===
                    String(student.id)
                ) || (
                    String(
                        record.roll_number || ""
                    ).trim() ===
                    String(
                        student.roll_number || ""
                    ).trim()
                );
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
                return (
                    String(record.student_id) ===
                    String(student.id)
                ) || (
                    String(
                        record.roll_number || ""
                    ).trim() ===
                    String(
                        student.roll_number || ""
                    ).trim()
                );
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
