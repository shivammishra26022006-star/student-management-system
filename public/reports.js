let students = [];
let attendanceRecords = [];
let marksRecords = [];
let feeRecords = [];

async function loadData() {
    try {
        const responses = await Promise.all([
            fetch("/api/students"),
            fetch("/api/attendance"),
            fetch("/api/marks"),
            fetch("/api/fees")
        ]);

        const studentsData = await responses[0].json();
        const attendanceData = await responses[1].json();
        const marksData = await responses[2].json();
        const feesData = await responses[3].json();

        if (!responses[0].ok) {
            throw new Error(studentsData.error || "Unable to load students");
        }

        if (!responses[1].ok) {
            throw new Error(attendanceData.error || "Unable to load attendance");
        }

        if (!responses[2].ok) {
            throw new Error(marksData.error || "Unable to load marks");
        }

        if (!responses[3].ok) {
            throw new Error(feesData.error || "Unable to load fees");
        }

        students = studentsData;
        attendanceRecords = attendanceData;
        marksRecords = marksData;
        feeRecords = feesData;

        loadStudentDropdown();

    } catch (error) {
        console.error(error);
        alert("Report data load nahi hua: " + error.message);
    }
}

function loadStudentDropdown() {
    const dropdown = document.getElementById("student");

    dropdown.innerHTML = `
        <option value="">Select Student</option>
    `;

    students.forEach(student => {
        const option = document.createElement("option");

        option.value = student.id;
        option.textContent = `${student.name} - ${student.roll_number}`;

        dropdown.appendChild(option);
    });
}

document
    .getElementById("generateReport")
    .addEventListener("click", function() {

        const studentId =
            document.getElementById("student").value;

        if (!studentId) {
            alert("Please select a student.");
            return;
        }

        const student =
            students.find(item =>
                String(item.id) === String(studentId)
            );

        if (!student) {
            alert("Student not found.");
            return;
        }

        displayStudentInfo(student);
        displayAttendance(student);
        displayMarks(student);
        displayFees(student);
    });

function displayStudentInfo(student) {
    const info =
        document.getElementById("studentInfo");

    info.innerHTML = `
        <p>
            <strong>Name:</strong>
            ${escapeHTML(student.name)}
        </p>

        <p>
            <strong>Roll Number:</strong>
            ${escapeHTML(student.roll_number)}
        </p>

        <p>
            <strong>Course:</strong>
            ${escapeHTML(student.course)}
        </p>

        <p>
            <strong>Email:</strong>
            ${escapeHTML(student.email || "")}
        </p>

        <p>
            <strong>Phone:</strong>
            ${escapeHTML(student.phone || "")}
        </p>
    `;
}

function displayAttendance(student) {
    const table =
        document.getElementById("attendanceReport");

    const records =
        attendanceRecords.filter(record =>
            String(record.student_id) === String(student.id) ||
            String(record.roll_number).trim() ===
            String(student.roll_number).trim()
        );

    let present = 0;
    let absent = 0;

    records.forEach(record => {
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
            ? ((present / totalDays) * 100).toFixed(1)
            : "0.0";

    table.innerHTML = `
        <tr>
            <td>${totalDays}</td>
            <td class="present">${present}</td>
            <td class="absent">${absent}</td>
            <td>
                <strong>${percentage}%</strong>
            </td>
        </tr>
    `;
}

function displayMarks(student) {
    const table =
        document.getElementById("marksReport");

    const records =
        marksRecords.filter(record =>
            String(record.student_id) === String(student.id) ||
            String(record.roll_number).trim() ===
            String(student.roll_number).trim()
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

    records.forEach(record => {
        const marks =
            Number(record.marks);

        const result =
            marks >= 35
                ? "Pass"
                : "Fail";

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(record.exam_name)}</td>
            <td>${escapeHTML(record.subject)}</td>
            <td>${marks}</td>
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
        document.getElementById("feesReport");

    const records =
        feeRecords.filter(record =>
            String(record.student_id) === String(student.id) ||
            String(record.roll_number).trim() ===
            String(student.roll_number).trim()
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

    records.forEach(record => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(record.fee_type)}</td>
            <td>₹${Number(record.amount).toLocaleString("en-IN")}</td>
            <td>${escapeHTML(record.payment_date)}</td>
            <td>${escapeHTML(record.payment_method)}</td>
        `;

        table.appendChild(row);
    });
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadData();