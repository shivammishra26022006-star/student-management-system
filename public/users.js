async function loadUsers() {
    const tableBody =
        document.getElementById("usersTableBody");

    if (!tableBody) {
        return;
    }

    try {
        const response =
            await fetch("/api/users");

        const users =
            await response.json();

        if (!response.ok) {
            throw new Error(
                users.error || "Unable to load users"
            );
        }

        tableBody.innerHTML = "";

        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No registered users found.
                    </td>
                </tr>
            `;

            return;
        }

        users.forEach(function (user) {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(user.id)}</td>

                <td>${escapeHTML(user.name)}</td>

                <td>${escapeHTML(user.email)}</td>

                <td>${escapeHTML(user.phone)}</td>

                <td>${escapeHTML(user.username)}</td>

                <td>${formatDate(user.created_at)}</td>

                <td>
                    ${
                        user.last_login
                            ? formatDate(user.last_login)
                            : "Never"
                    }
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {

        console.error(
            "Users load error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load users.
                </td>
            </tr>
        `;
    }
}


function formatDate(value) {

    if (!value) {
        return "N/A";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(
        "en-IN"
    );
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadUsers();
    }
);