let students = [];

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("search");

async function loadStudents() {
    try {
        const response = await fetch("/api/students");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load students");
        }

        students = data;
        displayStudents(students);

    } catch (error) {
        console.error(error);

        studentTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load students.
                </td>
            </tr>
        `;
    }
}

function displayStudents(data) {
    studentTable.innerHTML = "";

    if (data.length === 0) {
        studentTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No students found.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(student => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                ST${String(student.id).padStart(3, "0")}
            </td>

            <td>
                <a
                    href="student-profile.html?id=${student.id}"
                    class="student-link"
                >
                    ${escapeHTML(student.name)}
                </a>
            </td>

            <td>
                ${escapeHTML(student.roll_number)}
            </td>

            <td>
                ${escapeHTML(student.course)}
            </td>

            <td>
                ${escapeHTML(student.email || "-")}
            </td>

            <td>
                ${escapeHTML(student.phone || "-")}
            </td>

            <td>
                <button
                    type="button"
                    onclick="editStudent(${student.id})"
                >
                    Edit
                </button>

                <button
                    type="button"
                    onclick="deleteStudent(${student.id})"
                >
                    Delete
                </button>
            </td>
        `;

        studentTable.appendChild(row);
    });
}

studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        roll_number: document.getElementById("roll_number").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        course: document.getElementById("course").value,
        gender: document.getElementById("gender").value,
        date_of_birth: document.getElementById("date_of_birth").value,
        address: document.getElementById("address").value.trim()
    };

    if (!student.name || !student.roll_number || !student.course) {
        alert("Please fill all required fields.");
        return;
    }

    try {
        const response = await fetch("/api/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to save student");
        }

        alert("Student added successfully!");

        studentForm.reset();

        await loadStudents();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

searchInput.addEventListener("input", function() {
    const searchTerm =
        searchInput.value.trim().toLowerCase();

    const filteredStudents =
        students.filter(student => {
            return (
                String(student.name)
                    .toLowerCase()
                    .includes(searchTerm) ||
                String(student.roll_number)
                    .toLowerCase()
                    .includes(searchTerm) ||
                String(student.course)
                    .toLowerCase()
                    .includes(searchTerm)
            );
        });

    displayStudents(filteredStudents);
});

async function editStudent(id) {
    const student =
        students.find(item =>
            String(item.id) === String(id)
        );

    if (!student) {
        alert("Student not found.");
        return;
    }

    const name = prompt(
        "Student Name:",
        student.name
    );

    if (name === null) {
        return;
    }

    const rollNumber = prompt(
        "Roll Number:",
        student.roll_number
    );

    if (rollNumber === null) {
        return;
    }

    const course = prompt(
        "Course:",
        student.course
    );

    if (course === null) {
        return;
    }

    try {
        const response = await fetch(
            `/api/students/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim(),
                    roll_number: rollNumber.trim(),
                    email: student.email || "",
                    phone: student.phone || "",
                    course: course.trim(),
                    gender: student.gender || "",
                    date_of_birth: student.date_of_birth || "",
                    address: student.address || ""
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to update student"
            );
        }

        alert("Student updated successfully!");

        await loadStudents();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function deleteStudent(id) {
    const student =
        students.find(item =>
            String(item.id) === String(id)
        );

    if (!student) {
        alert("Student not found.");
        return;
    }

    const confirmed =
        confirm(`Delete ${student.name}?`);

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/api/students/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to delete student"
            );
        }

        alert("Student deleted successfully!");

        await loadStudents();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadStudents();