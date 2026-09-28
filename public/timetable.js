/* =========================================================
   TIMETABLE MANAGEMENT
========================================================= */

const timetableForm =
    document.getElementById(
        "timetableForm"
    );

const timetableMessage =
    document.getElementById(
        "timetableMessage"
    );

const timetableTableBody =
    document.getElementById(
        "timetableTableBody"
    );


/* =========================================================
   LOAD TIMETABLE
========================================================= */

async function loadTimetable() {

    if (!timetableTableBody) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/timetable"
            );

        const records =
            await response.json();

        if (!response.ok) {

            throw new Error(
                records.error ||
                "Unable to load timetable"
            );

        }

        timetableTableBody.innerHTML = "";


        if (records.length === 0) {

            timetableTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No timetable records available.
                    </td>
                </tr>
            `;

            return;
        }


        records.forEach(
            function (record) {

                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            record.course || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.semester || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.day || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.time || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.subject || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.teacher || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.room || "-"
                        )}
                    </td>

                `;

                timetableTableBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Timetable loading error:",
            error
        );

        timetableTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load timetable.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   ADD TIMETABLE
========================================================= */

if (timetableForm) {

    timetableForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const course =
                document.getElementById(
                    "timetableCourse"
                ).value.trim();

            const semester =
                document.getElementById(
                    "timetableSemester"
                ).value.trim();

            const day =
                document.getElementById(
                    "timetableDay"
                ).value;

            const time =
                document.getElementById(
                    "timetableTime"
                ).value.trim();

            const subject =
                document.getElementById(
                    "timetableSubject"
                ).value.trim();

            const teacher =
                document.getElementById(
                    "timetableTeacher"
                ).value.trim();

            const room =
                document.getElementById(
                    "timetableRoom"
                ).value.trim();


            timetableMessage.textContent =
                "Saving timetable...";


            try {

                const response =
                    await fetch(
                        "/api/timetable",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                course,
                                semester,
                                day,
                                time,
                                subject,
                                teacher,
                                room

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to save timetable"
                    );

                }


                timetableMessage.textContent =
                    "Timetable added successfully.";


                timetableForm.reset();


                await loadTimetable();


            } catch (error) {

                console.error(
                    "Timetable save error:",
                    error
                );


                timetableMessage.textContent =
                    error.message;

            }

        }
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
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTimetable();

    }
);