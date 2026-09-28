let students = [];
let attendanceRecords = [];

document.addEventListener("DOMContentLoaded", function () {
    startPage();
});

async function startPage() {
    await loadStudents();
    await loadAttendance();
    setTodayDate();
    setupAttendanceForm();
}

async function loadStudents() {
    try {
        const response = await fetch("/api/students");

        if (!response.ok) {
            throw new Error("Unable to load students");
        }

        students = await response.json();

        const studentSelect = document.getElementById("student");

        if (!studentSelect) {
            console.error("Student dropdown not found");
            return;
        }

        studentSelect.innerHTML = `
            <option value="">Select Student</option>
        `;

        students.forEach(function (student) {
            const option = document.createElement("option");

            option.value = student.id;

            option.textContent =
                student.name + " - " + student.roll_number;

            studentSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Students Error:", error);
    }
}

async function loadAttendance() {
    try {
        const response = await fetch("/api/attendance");

        if (!response.ok) {
            throw new Error("Unable to load attendance");
        }

        attendanceRecords = await response.json();

        displayAttendance();
        displaySummary();

    } catch (error) {
        console.error("Attendance Error:", error);

        const attendanceTable =
            document.getElementById("attendanceTable");

        const summaryTable =
            document.getElementById("summaryTable");

        if (attendanceTable) {
            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        Unable to load attendance records.
                    </td>
                </tr>
            `;
        }

        if (summaryTable) {
            summaryTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        Unable to load attendance report.
                    </td>
                </tr>
            `;
        }
    }
}

function setupAttendanceForm() {
    const attendanceForm =
        document.getElementById("attendanceForm");

    if (!attendanceForm) {
        console.error("Attendance form not found");
        return;
    }

    attendanceForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const studentSelect =
            document.getElementById("student");

        const dateInput =
            document.getElementById("date");

        const statusSelect =
            document.getElementById("status");

        if (
            !studentSelect ||
            !dateInput ||
            !statusSelect
        ) {
            alert("Attendance form fields are missing.");
            return;
        }

        const studentId = studentSelect.value;
        const date = dateInput.value;
        const status = statusSelect.value;

        if (!studentId || !date || !status) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: Number(studentId),
                    date: date,
                    status: status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to save attendance"
                );
            }

            alert("Attendance saved successfully!");

            attendanceForm.reset();

            setTodayDate();

            await loadAttendance();

        } catch (error) {
            console.error(
                "Save Attendance Error:",
                error
            );

            alert(error.message);
        }
    });
}

function displayAttendance() {
    const table =
        document.getElementById("attendanceTable");

    if (!table) {
        console.error("Attendance table not found");
        return;
    }

    table.innerHTML = "";

    if (attendanceRecords.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }

    attendanceRecords.forEach(function (record) {
        const row = document.createElement("tr");

        const statusClass =
            record.status === "Present"
                ? "present"
                : "absent";

        row.innerHTML = `
            <td>
                ${record.id}
            </td>

            <td>
                ${escapeHTML(record.name)}
            </td>

            <td>
                ${escapeHTML(record.roll_number)}
            </td>

            <td>
                ${escapeHTML(record.course)}
            </td>

            <td>
                ${escapeHTML(record.date)}
            </td>

            <td>
                <span class="${statusClass}">
                    ${escapeHTML(record.status)}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    onclick="deleteAttendance(${record.id})"
                >
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

async function deleteAttendance(id) {
    const record = attendanceRecords.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!record) {
        alert("Attendance record not found.");
        return;
    }

    const confirmed = confirm(
        "Delete attendance for " +
        record.name +
        " on " +
        record.date +
        "?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            "/api/attendance/" + id,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to delete attendance"
            );
        }

        alert(
            "Attendance deleted successfully!"
        );

        await loadAttendance();

    } catch (error) {
        console.error(
            "Delete Attendance Error:",
            error
        );

        alert(error.message);
    }
}

function displaySummary() {
    const table =
        document.getElementById("summaryTable");

    if (!table) {
        console.error("Summary table not found");
        return;
    }

    table.innerHTML = "";

    if (students.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }

    students.forEach(function (student) {
        let present = 0;
        let absent = 0;

        attendanceRecords.forEach(function (record) {
            if (
                String(record.student_id) !==
                String(student.id)
            ) {
                return;
            }

            if (record.status === "Present") {
                present++;
            }

            if (record.status === "Absent") {
                absent++;
            }
        });

        const totalDays = present + absent;

        let percentage = "0.0";

        if (totalDays > 0) {
            percentage =
                ((present / totalDays) * 100).toFixed(1);
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHTML(student.name)}
            </td>

            <td>
                ${escapeHTML(student.roll_number)}
            </td>

            <td>
                ${escapeHTML(student.course)}
            </td>

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
        `;

        table.appendChild(row);
    });
}

function setTodayDate() {
    const dateInput =
        document.getElementById("date");

    if (!dateInput) {
        return;
    }

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    dateInput.value =
        year +
        "-" +
        month +
        "-" +
        day;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}