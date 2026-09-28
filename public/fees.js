let students = [];
let feeRecords = [];
let feeStructures = [];

async function loadStudents() {
    try {
        const response = await fetch("/api/students");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load students");
        }

        students = data;

        const studentDropdown = document.getElementById("student");
        const structureDropdown = document.getElementById("structureStudent");

        studentDropdown.innerHTML = `
            <option value="">Select Student</option>
        `;

        structureDropdown.innerHTML = `
            <option value="">Select Student</option>
        `;

        students.forEach(student => {
            const option1 = document.createElement("option");
            option1.value = student.id;
            option1.textContent = `${student.name} - ${student.roll_number}`;
            studentDropdown.appendChild(option1);

            const option2 = document.createElement("option");
            option2.value = student.id;
            option2.textContent = `${student.name} - ${student.roll_number}`;
            structureDropdown.appendChild(option2);
        });

    } catch (error) {
        console.error(error);
        alert("Students load nahi ho rahe: " + error.message);
    }
}

document.getElementById("feeStructureForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const student_id =
        document.getElementById("structureStudent").value;

    const total_fee =
        document.getElementById("total_fee").value;

    if (!student_id || total_fee === "") {
        alert("Please select student and enter total fee.");
        return;
    }

    try {
        const response = await fetch(
            `/api/fee-structure/${student_id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    total_fee: Number(total_fee)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to save total fee");
        }

        alert("Total fee saved successfully!");

        document
            .getElementById("feeStructureForm")
            .reset();

        await loadFeeSummary();

    } catch (error) {
        console.error(error);
        alert("Total fee save nahi hui: " + error.message);
    }
});

document.getElementById("feesForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const student_id =
        document.getElementById("student").value;

    const fee_type =
        document.getElementById("fee_type").value;

    const amount =
        document.getElementById("amount").value;

    const payment_date =
        document.getElementById("payment_date").value;

    const payment_method =
        document.getElementById("payment_method").value;

    if (
        !student_id ||
        !fee_type ||
        !amount ||
        !payment_date ||
        !payment_method
    ) {
        alert("Please fill all fields.");
        return;
    }

    if (Number(amount) <= 0) {
        alert("Amount must be greater than 0.");
        return;
    }

    try {
        const response = await fetch("/api/fees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student_id: Number(student_id),
                fee_type,
                amount: Number(amount),
                payment_date,
                payment_method
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Fee save failed");
        }

        alert("Fee saved successfully!");

        document
            .getElementById("feesForm")
            .reset();

        setTodayDate();

        await loadFees();
        await loadFeeSummary();

    } catch (error) {
        console.error(error);
        alert("Fee save nahi hui: " + error.message);
    }
});

async function loadFees() {
    try {
        const response = await fetch("/api/fees");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load fees");
        }

        feeRecords = data;

        displayFees(feeRecords);

    } catch (error) {
        console.error(error);
        alert("Fee records load nahi hue: " + error.message);
    }
}

async function loadFeeSummary() {
    try {
        const response =
            await fetch("/api/fees/summary");

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to load fee summary"
            );
        }

        displayFeeSummary(data);

    } catch (error) {
        console.error(error);
        alert("Fee summary load nahi hui: " + error.message);
    }
}

function displayFees(records) {
    const table =
        document.getElementById("feesTable");

    table.innerHTML = "";

    if (records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8">
                    No fee records found.
                </td>
            </tr>
        `;

        return;
    }

    records.forEach(record => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${record.id}</td>

            <td>
                ${escapeHTML(record.name)}
            </td>

            <td>
                ${escapeHTML(record.roll_number)}
            </td>

            <td>
                ${escapeHTML(record.fee_type)}
            </td>

            <td>
                ₹${Number(record.amount).toLocaleString("en-IN")}
            </td>

            <td>
                ${escapeHTML(record.payment_date)}
            </td>

            <td>
                ${escapeHTML(record.payment_method)}
            </td>

            <td>
                <button
                    type="button"
                    onclick="deleteFee(${record.id})"
                >
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

function displayFeeSummary(records) {
    const table =
        document.getElementById("feeSummaryTable");

    table.innerHTML = "";

    if (records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No fee summary found.
                </td>
            </tr>
        `;

        return;
    }

    records.forEach(record => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
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
                ₹${Number(record.total_fee).toLocaleString("en-IN")}
            </td>

            <td>
                ₹${Number(record.paid_fee).toLocaleString("en-IN")}
            </td>

            <td class="${
                Number(record.pending_fee) > 0
                    ? "absent"
                    : "present"
            }">
                ₹${Number(record.pending_fee).toLocaleString("en-IN")}
            </td>
        `;

        table.appendChild(row);
    });
}

async function deleteFee(id) {
    const confirmDelete =
        confirm("Are you sure you want to delete this fee record?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response =
            await fetch(`/api/fees/${id}`, {
                method: "DELETE"
            });

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to delete fee"
            );
        }

        alert("Fee deleted successfully!");

        await loadFees();
        await loadFeeSummary();

    } catch (error) {
        console.error(error);
        alert("Fee delete nahi hui: " + error.message);
    }
}

function setTodayDate() {
    const dateInput =
        document.getElementById("payment_date");

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
        `${year}-${month}-${day}`;
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
    await loadFees();
    await loadFeeSummary();
    setTodayDate();
}

startPage();