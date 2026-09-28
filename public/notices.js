/* =========================================================
   NOTICES MANAGEMENT
========================================================= */

const noticeForm =
    document.getElementById(
        "noticeForm"
    );

const noticeStatus =
    document.getElementById(
        "noticeMessageStatus"
    );

const noticeList =
    document.getElementById(
        "noticeList"
    );


/* =========================================================
   SET DEFAULT DATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const dateInput =
            document.getElementById(
                "noticeDate"
            );


        if (
            dateInput &&
            !dateInput.value
        ) {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            dateInput.value =
                today;

        }


        loadNotices();

    }
);


/* =========================================================
   LOAD NOTICES
========================================================= */

async function loadNotices() {

    if (!noticeList) {
        return;
    }


    noticeList.innerHTML = `

        <div class="card">

            <div>

                <h3>
                    Loading notices...
                </h3>

                <p>
                    Please wait.
                </p>

            </div>

        </div>

    `;


    try {

        const response =
            await fetch(
                "/api/notices"
            );


        const notices =
            await response.json();


        if (!response.ok) {

            throw new Error(
                notices.error ||
                "Unable to load notices"
            );

        }


        noticeList.innerHTML = "";


        if (
            notices.length === 0
        ) {

            noticeList.innerHTML = `

                <div class="card">

                    <div>

                        <h3>
                            No notices published
                        </h3>

                        <p>
                            Create a notice using the form above.
                        </p>

                    </div>

                </div>

            `;

            return;

        }


        notices.forEach(
            function (notice) {

                const noticeCard =
                    document.createElement(
                        "div"
                    );


                noticeCard.className =
                    "card";


                noticeCard.innerHTML = `

                    <div>

                        <h3>
                            ${escapeHTML(
                                notice.title
                            )}
                        </h3>


                        <p>

                            <strong>
                                Category:
                            </strong>

                            ${escapeHTML(
                                notice.category
                            )}

                        </p>


                        <p>

                            <strong>
                                Audience:
                            </strong>

                            ${escapeHTML(
                                notice.audience
                            )}

                        </p>


                        <p>

                            <strong>
                                Date:
                            </strong>

                            ${escapeHTML(
                                notice.notice_date
                            )}

                        </p>


                        <p>

                            ${escapeHTML(
                                notice.message
                            )}

                        </p>


                    </div>


                    <div>

                        <button
                            type="button"
                            class="danger-button"
                            onclick="deleteNotice(${Number(notice.id)})"
                        >
                            Delete
                        </button>

                    </div>

                `;


                noticeList.appendChild(
                    noticeCard
                );

            }
        );


    } catch (error) {

        console.error(
            "Notice loading error:",
            error
        );


        noticeList.innerHTML = `

            <div class="card">

                <div>

                    <h3>
                        Unable to load notices
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            </div>

        `;

    }

}


/* =========================================================
   ADD NOTICE
========================================================= */

if (noticeForm) {

    noticeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document.getElementById(
                    "noticeTitle"
                ).value.trim();


            const category =
                document.getElementById(
                    "noticeCategory"
                ).value;


            const audience =
                document.getElementById(
                    "noticeAudience"
                ).value;


            const notice_date =
                document.getElementById(
                    "noticeDate"
                ).value;


            const message =
                document.getElementById(
                    "noticeMessage"
                ).value.trim();


            noticeStatus.textContent =
                "Publishing notice...";


            try {

                const response =
                    await fetch(
                        "/api/notices",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                title,
                                category,
                                audience,
                                notice_date,
                                message

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to publish notice"
                    );

                }


                noticeStatus.textContent =
                    "Notice published successfully.";


                noticeForm.reset();


                const dateInput =
                    document.getElementById(
                        "noticeDate"
                    );


                if (dateInput) {

                    dateInput.value =
                        new Date()
                            .toISOString()
                            .split("T")[0];

                }


                await loadNotices();


            } catch (error) {

                console.error(
                    "Notice publish error:",
                    error
                );


                noticeStatus.textContent =
                    error.message;

            }

        }
    );

}


/* =========================================================
   DELETE NOTICE
========================================================= */

async function deleteNotice(
    noticeId
) {

    const shouldDelete =
        window.confirm(
            "Are you sure you want to delete this notice?"
        );


    if (!shouldDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/notices/${noticeId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to delete notice"
            );

        }


        noticeStatus.textContent =
            "Notice deleted successfully.";


        await loadNotices();


    } catch (error) {

        console.error(
            "Notice delete error:",
            error
        );


        noticeStatus.textContent =
            error.message;

    }

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