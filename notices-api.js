/* =========================================================
   NOTICES API
========================================================= */

function registerNoticeRoutes(app, db) {

    /* =====================================================
       CREATE NOTICES TABLE
    ===================================================== */

    db.run(`
        CREATE TABLE IF NOT EXISTS notices (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            title TEXT NOT NULL,

            category TEXT NOT NULL,

            audience TEXT NOT NULL,

            notice_date TEXT NOT NULL,

            message TEXT NOT NULL,

            created_at
                DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);


    /* =====================================================
       GET ALL NOTICES
    ===================================================== */

    app.get(
        "/api/notices",
        (req, res) => {

            db.all(
                `
                SELECT

                    id,

                    title,

                    category,

                    audience,

                    notice_date,

                    message,

                    created_at

                FROM notices

                ORDER BY

                    notice_date DESC,

                    id DESC
                `,
                [],
                (err, rows) => {

                    if (err) {

                        console.error(
                            "Get notices error:",
                            err.message
                        );

                        return res.status(500).json({
                            error:
                                err.message
                        });

                    }

                    res.json(rows);

                }
            );

        }
    );


    /* =====================================================
       ADD NOTICE
    ===================================================== */

    app.post(
        "/api/notices",
        (req, res) => {

            const {

                title,

                category,

                audience,

                notice_date,

                message

            } = req.body;


            /* =============================================
               VALIDATION
            ============================================= */

            if (

                !title ||

                !category ||

                !audience ||

                !notice_date ||

                !message

            ) {

                return res.status(400).json({

                    error:
                        "All notice fields are required"

                });

            }


            /* =============================================
               INSERT NOTICE
            ============================================= */

            db.run(
                `
                INSERT INTO notices
                (
                    title,
                    category,
                    audience,
                    notice_date,
                    message
                )

                VALUES
                (
                    ?, ?, ?, ?, ?
                )
                `,
                [

                    title.trim(),

                    category.trim(),

                    audience.trim(),

                    notice_date.trim(),

                    message.trim()

                ],
                function (err) {

                    if (err) {

                        console.error(
                            "Add notice error:",
                            err.message
                        );

                        return res.status(500).json({

                            error:
                                err.message

                        });

                    }


                    res.status(201).json({

                        message:
                            "Notice published successfully",

                        id:
                            this.lastID

                    });

                }
            );

        }
    );


    /* =====================================================
       DELETE NOTICE
    ===================================================== */

    app.delete(
        "/api/notices/:id",
        (req, res) => {

            const noticeId =
                Number(
                    req.params.id
                );


            if (
                Number.isNaN(noticeId)
            ) {

                return res.status(400).json({

                    error:
                        "Invalid notice ID"

                });

            }


            db.run(
                `
                DELETE FROM notices
                WHERE id = ?
                `,
                [noticeId],
                function (err) {

                    if (err) {

                        console.error(
                            "Delete notice error:",
                            err.message
                        );

                        return res.status(500).json({

                            error:
                                err.message

                        });

                    }


                    if (
                        this.changes === 0
                    ) {

                        return res.status(404).json({

                            error:
                                "Notice not found"

                        });

                    }


                    res.json({

                        message:
                            "Notice deleted successfully"

                    });

                }
            );

        }
    );

}


module.exports =
    registerNoticeRoutes;