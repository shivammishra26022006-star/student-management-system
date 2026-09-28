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

            option.textContent =
                `${student.name} - ${student.roll_number}`;

            dropdown.appendChild(option);
        });

    } catch (error) {
        console.error(error);
        alert("Unable to load students.");
    }
}

document
    .getElementById("marksForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const student_id =
            document.getElementById("student").value;

        const exam_name =
            document.getElementById("exam_name").value.trim();

        const subject =
            document.getElementById("subject").value.trim();

        const marks =
            document.getElementById("marks").value;

        if (!student_id || !exam_name || !subject || marks === "") {
            alert("Please fill all fields.");
            return;
        }

        if (Number(marks) < 0 || Number(marks) > 100) {
            alert("Marks must be between 0 and 100.");
            return;
        }

        try {
            const response =
                await fetch("/api/marks", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        student_id,
                        exam_name,
                        subject,
                        marks: Number(marks)
                    })
                });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                return;
            }

            alert("Marks saved successfully!");

            document
                .getElementById("marksForm")
                .reset();

            await loadMarks();

        } catch (error) {
            console.error(error);
            alert("Unable to save marks.");
        }
    });

async function loadMarks() {
    try {
        const response =
            await fetch("/api/marks");

        if (!response.ok) {
            throw new Error("Unable to load marks");
        }

        marksRecords =
            await response.json();

        displayMarks(marksRecords);

    } catch (error) {
        console.error(error);
        alert("Unable to load marks records.");
    }
}

function displayMarks(records) {
    const table =
        document.getElementById("marksTable");

    table.innerHTML = "";

    if (records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No marks records found.
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
                ${escapeHTML(record.exam_name)}
            </td>

            <td>
                ${escapeHTML(record.subject)}
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

document
    .getElementById("marksSearch")
    .addEventListener("input", function() {

        const search =
            this.value.toLowerCase().trim();

        const filtered =
            marksRecords.filter(record => {

                return (
                    record.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    record.roll_number
                        .toLowerCase()
                        .includes(search)

                    ||

                    record.exam_name
                        .toLowerCase()
                        .includes(search)

                    ||

                    record.subject
                        .toLowerCase()
                        .includes(search)
                );
            });

        displayMarks(filtered);
    });

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