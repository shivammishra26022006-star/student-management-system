/* =========================================================
   TIMETABLE API
========================================================= */

function registerTimetableRoutes(
    app,
    db
) {

    /* =====================================================
       CREATE TIMETABLE TABLE
    ====================================================== */

    db.run(`
        CREATE TABLE IF NOT EXISTS timetable (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            course TEXT NOT NULL,

            semester TEXT NOT NULL,

            day TEXT NOT NULL,

            time TEXT NOT NULL,

            subject TEXT NOT NULL,

            teacher TEXT NOT NULL,

            room TEXT NOT NULL,

            created_at
                DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);


    /* =====================================================
       GET ALL TIMETABLE RECORDS
    ====================================================== */

    app.get(
        "/api/timetable",
        (req, res) => {

            db.all(
                `
                SELECT
                    id,
                    course,
                    semester,
                    day,
                    time,
                    subject,
                    teacher,
                    room,
                    created_at

                FROM timetable

                ORDER BY

                    CASE day

                        WHEN 'Monday' THEN 1
                        WHEN 'Tuesday' THEN 2
                        WHEN 'Wednesday' THEN 3
                        WHEN 'Thursday' THEN 4
                        WHEN 'Friday' THEN 5
                        WHEN 'Saturday' THEN 6
                        ELSE 7

                    END,

                    id ASC
                `,
                [],
                (err, rows) => {

                    if (err) {

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
       ADD TIMETABLE RECORD
    ====================================================== */

    app.post(
        "/api/timetable",
        (req, res) => {

            const {

                course,
                semester,
                day,
                time,
                subject,
                teacher,
                room

            } = req.body;


            /* =========================
               VALIDATION
            ========================= */

            if (

                !course ||
                !semester ||
                !day ||
                !time ||
                !subject ||
                !teacher ||
                !room

            ) {

                return res.status(400).json({
                    error:
                        "All timetable fields are required"
                });

            }


            /* =========================
               INSERT
            ========================= */

            db.run(
                `
                INSERT INTO timetable
                (
                    course,
                    semester,
                    day,
                    time,
                    subject,
                    teacher,
                    room
                )

                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?
                )
                `,
                [

                    course.trim(),

                    semester.trim(),

                    day.trim(),

                    time.trim(),

                    subject.trim(),

                    teacher.trim(),

                    room.trim()

                ],
                function (err) {

                    if (err) {

                        return res.status(500).json({
                            error:
                                err.message
                        });

                    }


                    res.json({

                        message:
                            "Timetable added successfully",

                        id:
                            this.lastID

                    });

                }
            );

        }
    );


    /* =====================================================
       DELETE TIMETABLE RECORD
    ====================================================== */

    app.delete(
        "/api/timetable/:id",
        (req, res) => {

            db.run(
                `
                DELETE FROM timetable
                WHERE id = ?
                `,
                [req.params.id],
                function (err) {

                    if (err) {

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
                                "Timetable record not found"
                        });

                    }


                    res.json({

                        message:
                            "Timetable deleted successfully"

                    });

                }
            );

        }
    );

}


module.exports =
    registerTimetableRoutes;