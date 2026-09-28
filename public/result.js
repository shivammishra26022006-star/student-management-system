let students = [];
let marksRecords = [];

async function loadStudents() {
    try {
        const response = await fetch("/api/students");

        if (!response.ok) {
            throw new Error("Unable to load students");
        }

        students = await response.json();

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

    } catch (error) {
        console.error(error);
        alert("Unable to load students.");
    }
}

async function loadMarks() {
    try {
        const response = await fetch("/api/marks");

        if (!response.ok) {
            throw new Error("Unable to load marks");
        }

        marksRecords = await response.json();

    } catch (error) {
        console.error(error);
        alert("Unable to load marks.");
    }
}

document.getElementById("viewResult").addEventListener("click", function() {

    const studentId =
        document.getElementById("student").value;

    if (!studentId) {
        alert("Please select a student.");
        return;
    }

    const student =
        students.find(item => String(item.id) === String(studentId));

    if (!student) {
        alert("Student not found.");
        return;
    }

    const records =
        marksRecords.filter(record => {
            return String(record.roll_number).trim() ===
                String(student.roll_number).trim();
        });

    displayStudentInfo(student);
    displayResult(records);
});

function displayStudentInfo(student) {
    const info =
        document.getElementById("studentInfo");

    info.innerHTML = `
        <div>
            <strong>Student:</strong> ${escapeHTML(student.name)}
        </div>

        <div>
            <strong>Roll Number:</strong> ${escapeHTML(student.roll_number)}
        </div>

        <div>
            <strong>Course:</strong> ${escapeHTML(student.course)}
        </div>
    `;
}

function displayResult(records) {
    const table =
        document.getElementById("resultTable");

    const summary =
        document.getElementById("resultSummary");

    table.innerHTML = "";
    summary.innerHTML = "";

    if (records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No marks found for this student.
                </td>
            </tr>
        `;

        return;
    }

    let totalMarks = 0;
    let passCount = 0;

    records.forEach(record => {

        const marks =
            Number(record.marks);

        totalMarks += marks;

        if (marks >= 35) {
            passCount++;
        }

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

    const maximumMarks =
        records.length * 100;

    const percentage =
        ((totalMarks / maximumMarks) * 100).toFixed(1);

    const overallResult =
        passCount === records.length
            ? "Pass"
            : "Fail";

    summary.innerHTML = `
        <h3>Result Summary</h3>

        <p>
            <strong>Total Marks:</strong>
            ${totalMarks} / ${maximumMarks}
        </p>

        <p>
            <strong>Percentage:</strong>
            ${percentage}%
        </p>

        <p>
            <strong>Overall Result:</strong>
            ${overallResult}
        </p>
    `;
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function startPage() {
    await loadStudents();
    await loadMarks();
}

startPage();