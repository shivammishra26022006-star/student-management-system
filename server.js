const express = require("express");
const registerNoticeRoutes = require("./notices-api");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const publicPath =
    path.join(__dirname, "public");

const databasePath =
    path.join(
        __dirname,
        "student_management.db"
    );


/* =========================================================
   DATABASE
========================================================= */

const db =
    new sqlite3.Database(
        databasePath,
        (err) => {

            if (err) {

                console.error(
                    "Database connection failed:",
                    err.message
                );

            } else {

                console.log(
                    "Database connected successfully."
                );

            }

        }
    );


app.use(
    express.json()
);

app.use(
    express.static(publicPath)
);


/* =========================================================
   HOME
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                publicPath,
                "index.html"
            )
        );

    }
);


/* =========================================================
   DATABASE TABLES
========================================================= */

db.serialize(
    () => {

        db.run(`
            PRAGMA foreign_keys = ON
        `);


        /* =================================================
           STUDENTS
        ================================================= */

        db.run(`
            CREATE TABLE IF NOT EXISTS students (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                name TEXT NOT NULL,

                roll_number TEXT NOT NULL UNIQUE,

                email TEXT,

                phone TEXT,

                course TEXT,

                gender TEXT,

                date_of_birth TEXT,

                address TEXT,

                created_at
                    DATETIME DEFAULT CURRENT_TIMESTAMP

            )
        `);


        /* =================================================
           ATTENDANCE
        ================================================= */

        db.run(`
            CREATE TABLE IF NOT EXISTS attendance (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                student_id INTEGER NOT NULL,

                date TEXT NOT NULL,

                status TEXT NOT NULL,

                created_at
                    DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE

            )
        `);


        /* =================================================
           MARKS
        ================================================= */

        db.run(`
            CREATE TABLE IF NOT EXISTS marks (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                student_id INTEGER NOT NULL,

                exam_name TEXT NOT NULL,

                subject TEXT NOT NULL,

                marks REAL NOT NULL,

                created_at
                    DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE

            )
        `);


        /* =================================================
           FEES
        ================================================= */

        db.run(`
            CREATE TABLE IF NOT EXISTS fees (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                student_id INTEGER NOT NULL,

                fee_type TEXT NOT NULL,

                amount REAL NOT NULL,

                payment_date TEXT NOT NULL,

                payment_method TEXT NOT NULL,

                FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE

            )
        `);


        /* =================================================
           FEE STRUCTURE
        ================================================= */

        db.run(`
            CREATE TABLE IF NOT EXISTS fee_structure (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                student_id INTEGER NOT NULL UNIQUE,

                total_fee REAL NOT NULL DEFAULT 0,

                FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE

            )
        `);


        /* =================================================
           TIMETABLE
        ================================================= */

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


        /* =================================================
           USERS
        ================================================= */

        db.run(`
            CREATE TABLE IF NOT EXISTS users (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                student_record_id INTEGER,

                name TEXT NOT NULL,

                date_of_birth TEXT,

                gender TEXT,

                email TEXT NOT NULL,

                phone TEXT NOT NULL,

                address TEXT,

                city TEXT,

                state TEXT,

                pincode TEXT,

                student_id TEXT,

                roll_number TEXT,

                course TEXT,

                department TEXT,

                semester TEXT,

                academic_year TEXT,

                college TEXT,

                guardian_name TEXT,

                guardian_relation TEXT,

                guardian_phone TEXT,

                emergency_contact TEXT,

                username TEXT NOT NULL UNIQUE,

                password_hash TEXT NOT NULL,

                salt TEXT NOT NULL,

                status TEXT NOT NULL
                    DEFAULT 'Active',

                created_at
                    DATETIME DEFAULT CURRENT_TIMESTAMP,

                last_login DATETIME,

                FOREIGN KEY (student_record_id)
                REFERENCES students(id)
                ON DELETE SET NULL

            )
        `);

    }
);


/* =========================================================
   USERS TABLE MIGRATION
========================================================= */

function ensureUserColumns(callback) {

    const requiredColumns = {

        student_record_id:
            "INTEGER",

        date_of_birth:
            "TEXT",

        gender:
            "TEXT",

        address:
            "TEXT",

        city:
            "TEXT",

        state:
            "TEXT",

        pincode:
            "TEXT",

        student_id:
            "TEXT",

        roll_number:
            "TEXT",

        course:
            "TEXT",

        department:
            "TEXT",

        semester:
            "TEXT",

        academic_year:
            "TEXT",

        college:
            "TEXT",

        guardian_name:
            "TEXT",

        guardian_relation:
            "TEXT",

        guardian_phone:
            "TEXT",

        emergency_contact:
            "TEXT",

        status:
            "TEXT NOT NULL DEFAULT 'Active'"

    };


    db.all(
        "PRAGMA table_info(users)",
        [],
        (err, columns) => {

            if (err) {

                console.error(
                    "Unable to inspect users table:",
                    err.message
                );

                return;

            }


            const existingColumns =
                new Set(
                    columns.map(
                        column =>
                            column.name
                    )
                );


            const missingColumns =
                Object.entries(
                    requiredColumns
                ).filter(
                    ([columnName]) =>
                        !existingColumns.has(
                            columnName
                        )
                );


            if (
                missingColumns.length === 0
            ) {

                if (callback) {
                    callback();
                }

                return;
            }


            let completed = 0;


            missingColumns.forEach(
                ([columnName, columnType]) => {

                    db.run(
                        `
                        ALTER TABLE users
                        ADD COLUMN ${columnName}
                        ${columnType}
                        `,
                        (alterErr) => {

                            if (alterErr) {

                                console.error(
                                    `Unable to add users.${columnName}:`,
                                    alterErr.message
                                );

                            } else {

                                console.log(
                                    `Added users.${columnName}`
                                );

                            }


                            completed++;


                            if (
                                completed ===
                                missingColumns.length
                            ) {

                                if (callback) {
                                    callback();
                                }

                            }

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   SYNC OLD USERS WITH STUDENTS
========================================================= */

function syncExistingUsersToStudents() {

    db.all(
        `
        SELECT *
        FROM users
        WHERE
            student_record_id IS NULL
            AND roll_number IS NOT NULL
            AND roll_number != ''
        `,
        [],
        (err, users) => {

            if (err) {

                console.error(
                    "Unable to sync existing users:",
                    err.message
                );

                return;
            }


            if (
                users.length === 0
            ) {

                return;
            }


            users.forEach(
                (user) => {

                    db.get(
                        `
                        SELECT id
                        FROM students
                        WHERE roll_number = ?
                        `,
                        [user.roll_number],
                        (findErr, student) => {

                            if (findErr) {

                                console.error(
                                    "Student search failed:",
                                    findErr.message
                                );

                                return;
                            }


                            if (student) {

                                db.run(
                                    `
                                    UPDATE users

                                    SET
                                        student_record_id = ?

                                    WHERE id = ?
                                    `,
                                    [
                                        student.id,
                                        user.id
                                    ],
                                    (updateErr) => {

                                        if (
                                            updateErr
                                        ) {

                                            console.error(
                                                "User link update failed:",
                                                updateErr.message
                                            );

                                        }

                                    }
                                );

                                return;
                            }


                            db.run(
                                `
                                INSERT INTO students
                                (
                                    name,
                                    roll_number,
                                    email,
                                    phone,
                                    course,
                                    gender,
                                    date_of_birth,
                                    address
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                `,
                                [

                                    user.name ||
                                        "Student",

                                    user.roll_number,

                                    user.email ||
                                        "",

                                    user.phone ||
                                        "",

                                    user.course ||
                                        "",

                                    user.gender ||
                                        "",

                                    user.date_of_birth ||
                                        "",

                                    user.address ||
                                        ""

                                ],
                                function (insertErr) {

                                    if (
                                        insertErr
                                    ) {

                                        console.error(
                                            "Unable to create student record:",
                                            insertErr.message
                                        );

                                        return;
                                    }


                                    const studentId =
                                        this.lastID;


                                    db.run(
                                        `
                                        UPDATE users

                                        SET
                                            student_record_id = ?

                                        WHERE id = ?
                                        `,
                                        [
                                            studentId,
                                            user.id
                                        ],
                                        (updateErr) => {

                                            if (
                                                updateErr
                                            ) {

                                                console.error(
                                                    "User link update failed:",
                                                    updateErr.message
                                                );

                                            }

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   USER MIGRATION
========================================================= */

ensureUserColumns(
    () => {

        syncExistingUsersToStudents();

    }
);


/* =========================================================
   NOTICES
========================================================= */

/* Ye line tumhare original code me missing thi */
registerNoticeRoutes(app, db);


/* =========================================================
   STUDENTS
========================================================= */


/* =========================
   GET ALL STUDENTS
========================= */

app.get(
    "/api/students",
    (req, res) => {

        db.all(
            `
            SELECT *
            FROM students
            ORDER BY id DESC
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


/* =========================
   GET SINGLE STUDENT
========================= */

app.get(
    "/api/students/:id",
    (req, res) => {

        db.get(
            `
            SELECT *
            FROM students
            WHERE id = ?
            `,
            [req.params.id],
            (err, row) => {

                if (err) {

                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                if (!row) {

                    return res.status(404).json({
                        error:
                            "Student not found"
                    });

                }


                res.json(row);

            }
        );

    }
);


/* =========================
   ADD STUDENT
========================= */

app.post(
    "/api/students",
    (req, res) => {

        const {

            name,
            roll_number,
            email,
            phone,
            course,
            gender,
            date_of_birth,
            address

        } = req.body;


        if (
            !name ||
            !roll_number
        ) {

            return res.status(400).json({
                error:
                    "Name and roll number are required"
            });

        }


        db.run(
            `
            INSERT INTO students
            (
                name,
                roll_number,
                email,
                phone,
                course,
                gender,
                date_of_birth,
                address
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [

                name.trim(),
                roll_number.trim(),
                email || "",
                phone || "",
                course || "",
                gender || "",
                date_of_birth || "",
                address || ""

            ],
            function (err) {

                if (err) {

                    if (
                        err.message.includes(
                            "UNIQUE"
                        )
                    ) {

                        return res.status(400).json({
                            error:
                                "This Roll Number already exists"
                        });

                    }


                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                res.json({

                    message:
                        "Student added successfully",

                    id:
                        this.lastID

                });

            }
        );

    }
);


/* =========================
   UPDATE STUDENT
========================= */

app.put(
    "/api/students/:id",
    (req, res) => {

        const {

            name,
            roll_number,
            email,
            phone,
            course,
            gender,
            date_of_birth,
            address

        } = req.body;


        if (
            !name ||
            !roll_number
        ) {

            return res.status(400).json({
                error:
                    "Name and roll number are required"
            });

        }


        db.run(
            `
            UPDATE students

            SET

                name = ?,

                roll_number = ?,

                email = ?,

                phone = ?,

                course = ?,

                gender = ?,

                date_of_birth = ?,

                address = ?

            WHERE id = ?
            `,
            [

                name.trim(),
                roll_number.trim(),
                email || "",
                phone || "",
                course || "",
                gender || "",
                date_of_birth || "",
                address || "",
                req.params.id

            ],
            function (err) {

                if (err) {

                    if (
                        err.message.includes(
                            "UNIQUE"
                        )
                    ) {

                        return res.status(400).json({
                            error:
                                "This Roll Number already exists"
                        });

                    }


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
                            "Student not found"
                    });

                }


                res.json({

                    message:
                        "Student updated successfully"

                });

            }
        );

    }
);


/* =========================
   DELETE STUDENT
========================= */

app.delete(
    "/api/students/:id",
    (req, res) => {

        db.run(
            `
            DELETE FROM students
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
                            "Student not found"
                    });

                }


                res.json({

                    message:
                        "Student deleted successfully"

                });

            }
        );

    }
);


/* =========================================================
   ATTENDANCE
========================================================= */


/* =========================
   ADD ATTENDANCE
========================= */

app.post(
    "/api/attendance",
    (req, res) => {

        const {

            student_id,
            date,
            status

        } = req.body;


        if (
            !student_id ||
            !date ||
            !status
        ) {

            return res.status(400).json({
                error:
                    "All fields are required"
            });

        }


        if (
            status !== "Present" &&
            status !== "Absent"
        ) {

            return res.status(400).json({
                error:
                    "Status must be Present or Absent"
            });

        }


        db.run(
            `
            INSERT INTO attendance
            (
                student_id,
                date,
                status
            )
            VALUES (?, ?, ?)
            `,
            [
                Number(student_id),
                date,
                status
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
                        "Attendance saved successfully",

                    id:
                        this.lastID

                });

            }
        );

    }
);


/* =========================
   GET ATTENDANCE
========================= */

app.get(
    "/api/attendance",
    (req, res) => {

        db.all(
            `
            SELECT

                attendance.id,

                attendance.student_id,

                students.name,

                students.roll_number,

                students.course,

                attendance.date,

                attendance.status

            FROM attendance

            INNER JOIN students

            ON attendance.student_id =
                students.id

            ORDER BY

                attendance.date DESC,

                attendance.id DESC
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


/* =========================
   DELETE ATTENDANCE
========================= */

app.delete(
    "/api/attendance/:id",
    (req, res) => {

        db.run(
            `
            DELETE FROM attendance
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
                            "Attendance record not found"
                    });

                }


                res.json({

                    message:
                        "Attendance deleted successfully"

                });

            }
        );

    }
);


/* =========================
   ATTENDANCE SUMMARY
========================= */

app.get(
    "/api/attendance/summary",
    (req, res) => {

        db.all(
            `
            SELECT

                students.id,

                students.name,

                students.roll_number,

                students.course,

                COUNT(attendance.id)
                    AS total_days,

                SUM(
                    CASE
                        WHEN attendance.status =
                            'Present'
                        THEN 1
                        ELSE 0
                    END
                ) AS present_days,

                SUM(
                    CASE
                        WHEN attendance.status =
                            'Absent'
                        THEN 1
                        ELSE 0
                    END
                ) AS absent_days

            FROM students

            LEFT JOIN attendance

            ON students.id =
                attendance.student_id

            GROUP BY
                students.id

            ORDER BY
                students.id DESC
            `,
            [],
            (err, rows) => {

                if (err) {

                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                const result =
                    rows.map(
                        row => {

                            const totalDays =
                                Number(
                                    row.total_days
                                ) || 0;


                            const presentDays =
                                Number(
                                    row.present_days
                                ) || 0;


                            const absentDays =
                                Number(
                                    row.absent_days
                                ) || 0;


                            const percentage =
                                totalDays > 0

                                    ? (
                                        (
                                            presentDays /
                                            totalDays
                                        ) * 100
                                    ).toFixed(1)

                                    : "0.0";


                            return {

                                id:
                                    row.id,

                                name:
                                    row.name,

                                roll_number:
                                    row.roll_number,

                                course:
                                    row.course,

                                total_days:
                                    totalDays,

                                present_days:
                                    presentDays,

                                absent_days:
                                    absentDays,

                                attendance_percentage:
                                    percentage

                            };

                        }
                    );


                res.json(result);

            }
        );

    }
);


/* =========================================================
   MARKS
========================================================= */


/* =========================
   ADD MARKS
========================= */

app.post(
    "/api/marks",
    (req, res) => {

        const {

            student_id,
            exam_name,
            subject,
            marks

        } = req.body;


        if (
            !student_id ||
            !exam_name ||
            !subject ||
            marks === undefined
        ) {

            return res.status(400).json({
                error:
                    "All fields are required"
            });

        }


        const numericMarks =
            Number(marks);


        if (
            Number.isNaN(
                numericMarks
            ) ||
            numericMarks < 0 ||
            numericMarks > 100
        ) {

            return res.status(400).json({
                error:
                    "Marks must be between 0 and 100"
            });

        }


        db.run(
            `
            INSERT INTO marks
            (
                student_id,
                exam_name,
                subject,
                marks
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                Number(student_id),
                exam_name,
                subject,
                numericMarks
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
                        "Marks saved successfully",

                    id:
                        this.lastID

                });

            }
        );

    }
);


/* =========================
   GET MARKS
========================= */

app.get(
    "/api/marks",
    (req, res) => {

        db.all(
            `
            SELECT

                marks.id,

                marks.student_id,

                students.name,

                students.roll_number,

                students.course,

                marks.exam_name,

                marks.subject,

                marks.marks

            FROM marks

            INNER JOIN students

            ON marks.student_id =
                students.id

            ORDER BY
                marks.id DESC
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


/* =========================================================
   FEES
========================================================= */


/* =========================
   ADD FEE
========================= */

app.post(
    "/api/fees",
    (req, res) => {

        const {

            student_id,
            fee_type,
            amount,
            payment_date,
            payment_method

        } = req.body;


        if (
            !student_id ||
            !fee_type ||
            amount === undefined ||
            !payment_date ||
            !payment_method
        ) {

            return res.status(400).json({
                error:
                    "All fields are required"
            });

        }


        const numericAmount =
            Number(amount);


        if (
            Number.isNaN(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {

            return res.status(400).json({
                error:
                    "Amount must be greater than 0"
            });

        }


        db.run(
            `
            INSERT INTO fees
            (
                student_id,
                fee_type,
                amount,
                payment_date,
                payment_method
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                Number(student_id),
                fee_type,
                numericAmount,
                payment_date,
                payment_method
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
                        "Fee saved successfully",

                    id:
                        this.lastID

                });

            }
        );

    }
);


/* =========================
   GET FEES
========================= */

app.get(
    "/api/fees",
    (req, res) => {

        db.all(
            `
            SELECT

                fees.id,

                fees.student_id,

                students.name,

                students.roll_number,

                students.course,

                fees.fee_type,

                fees.amount,

                fees.payment_date,

                fees.payment_method

            FROM fees

            INNER JOIN students

            ON fees.student_id =
                students.id

            ORDER BY
                fees.id DESC
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


/* =========================
   DELETE FEE
========================= */

app.delete(
    "/api/fees/:id",
    (req, res) => {

        db.run(
            `
            DELETE FROM fees
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
                            "Fee record not found"
                    });

                }


                res.json({

                    message:
                        "Fee deleted successfully"

                });

            }
        );

    }
);


/* =========================================================
   FEE STRUCTURE
========================================================= */


/* =========================
   GET FEE STRUCTURE
========================= */

app.get(
    "/api/fee-structure",
    (req, res) => {

        db.all(
            `
            SELECT

                fee_structure.id,

                fee_structure.student_id,

                students.name,

                students.roll_number,

                students.course,

                fee_structure.total_fee

            FROM fee_structure

            INNER JOIN students

            ON fee_structure.student_id =
                students.id

            ORDER BY
                fee_structure.id DESC
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


/* =========================
   SAVE FEE STRUCTURE
========================= */

app.post(
    "/api/fee-structure/:student_id",
    (req, res) => {

        const studentId =
            Number(
                req.params.student_id
            );


        const totalFee =
            Number(
                req.body.total_fee
            );


        if (
            Number.isNaN(
                studentId
            ) ||
            Number.isNaN(
                totalFee
            ) ||
            totalFee < 0
        ) {

            return res.status(400).json({
                error:
                    "Enter a valid total fee"
            });

        }


        db.run(
            `
            INSERT INTO fee_structure
            (
                student_id,
                total_fee
            )
            VALUES (?, ?)

            ON CONFLICT(student_id)

            DO UPDATE SET
                total_fee =
                    excluded.total_fee
            `,
            [
                studentId,
                totalFee
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
                        "Total fee saved successfully"

                });

            }
        );

    }
);


/* =========================
   FEES SUMMARY
========================= */

app.get(
    "/api/fees/summary",
    (req, res) => {

        db.all(
            `
            SELECT

                students.id,

                students.name,

                students.roll_number,

                students.course,

                COALESCE(
                    fee_structure.total_fee,
                    0
                ) AS total_fee,

                COALESCE(
                    SUM(fees.amount),
                    0
                ) AS paid_fee

            FROM students

            LEFT JOIN fee_structure

            ON students.id =
                fee_structure.student_id

            LEFT JOIN fees

            ON students.id =
                fees.student_id

            GROUP BY
                students.id

            ORDER BY
                students.id DESC
            `,
            [],
            (err, rows) => {

                if (err) {

                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                const result =
                    rows.map(
                        row => {

                            const totalFee =
                                Number(
                                    row.total_fee
                                ) || 0;


                            const paidFee =
                                Number(
                                    row.paid_fee
                                ) || 0;


                            const pendingFee =
                                Math.max(
                                    totalFee -
                                    paidFee,
                                    0
                                );


                            return {

                                id:
                                    row.id,

                                name:
                                    row.name,

                                roll_number:
                                    row.roll_number,

                                course:
                                    row.course,

                                total_fee:
                                    totalFee,

                                paid_fee:
                                    paidFee,

                                pending_fee:
                                    pendingFee

                            };

                        }
                    );


                res.json(result);

            }
        );

    }
);


/* =========================================================
   USERS
========================================================= */


/* =========================
   PASSWORD HASH
========================= */

function hashPassword(
    password,
    salt
) {

    return crypto
        .scryptSync(
            password,
            salt,
            64
        )
        .toString("hex");

}


/* =========================================================
   USER REGISTER
========================================================= */

app.post(
    "/api/users/register",
    (req, res) => {

        const {

            name,
            date_of_birth,
            gender,

            email,
            phone,

            address,
            city,
            state,
            pincode,

            student_id,
            roll_number,

            course,
            department,
            semester,
            academic_year,
            college,

            guardian_name,
            guardian_relation,
            guardian_phone,
            emergency_contact,

            username,
            password

        } = req.body;


        /* =========================
           REQUIRED FIELDS
        ========================= */

        if (

            !name ||
            !date_of_birth ||
            !gender ||

            !email ||
            !phone ||

            !address ||
            !city ||
            !state ||
            !pincode ||

            !student_id ||
            !roll_number ||

            !course ||
            !department ||
            !semester ||
            !academic_year ||
            !college ||

            !guardian_name ||
            !guardian_relation ||
            !guardian_phone ||
            !emergency_contact ||

            !username ||
            !password

        ) {

            return res.status(400).json({
                error:
                    "Please fill all student information fields"
            });

        }


        if (
            password.length < 6
        ) {

            return res.status(400).json({
                error:
                    "Password must be at least 6 characters"
            });

        }


        const cleanUsername =
            username
                .trim()
                .toLowerCase();


        const cleanStudentId =
            student_id
                .trim();


        const cleanRollNumber =
            roll_number
                .trim();


        /* =========================
           DUPLICATE USER CHECK
        ========================= */

        db.get(
            `
            SELECT

                id,

                username,

                student_id,

                roll_number

            FROM users

            WHERE

                username = ?

                OR student_id = ?

                OR roll_number = ?

            LIMIT 1
            `,
            [
                cleanUsername,
                cleanStudentId,
                cleanRollNumber
            ],
            (checkErr, existingUser) => {

                if (checkErr) {

                    return res.status(500).json({
                        error:
                            checkErr.message
                    });

                }


                if (existingUser) {

                    if (
                        existingUser.username ===
                        cleanUsername
                    ) {

                        return res.status(400).json({
                            error:
                                "Username already exists"
                        });

                    }


                    if (
                        existingUser.student_id ===
                        cleanStudentId
                    ) {

                        return res.status(400).json({
                            error:
                                "Student ID already exists"
                        });

                    }


                    if (
                        existingUser.roll_number ===
                        cleanRollNumber
                    ) {

                        return res.status(400).json({
                            error:
                                "Roll Number already exists"
                        });

                    }

                }


                /* =========================
                   CHECK STUDENT ROLL NUMBER
                ========================= */

                db.get(
                    `
                    SELECT id

                    FROM students

                    WHERE roll_number = ?
                    `,
                    [cleanRollNumber],
                    (studentErr, existingStudent) => {

                        if (studentErr) {

                            return res.status(500).json({
                                error:
                                    studentErr.message
                            });

                        }


                        if (existingStudent) {

                            return res.status(400).json({
                                error:
                                    "This Roll Number already exists in Students"
                            });

                        }


                        /* =========================
                           PASSWORD
                        ========================= */

                        const salt =
                            crypto
                                .randomBytes(16)
                                .toString("hex");


                        const passwordHash =
                            hashPassword(
                                password,
                                salt
                            );


                        /* =========================
                           TRANSACTION
                        ========================= */

                        db.run(
                            "BEGIN TRANSACTION",
                            (beginErr) => {

                                if (beginErr) {

                                    return res.status(500).json({
                                        error:
                                            beginErr.message
                                    });

                                }


                                /* =========================
                                   CREATE STUDENT
                                ========================= */

                                db.run(
                                    `
                                    INSERT INTO students
                                    (
                                        name,
                                        roll_number,
                                        email,
                                        phone,
                                        course,
                                        gender,
                                        date_of_birth,
                                        address
                                    )

                                    VALUES
                                    (
                                        ?, ?, ?, ?,
                                        ?, ?, ?, ?
                                    )
                                    `,
                                    [

                                        name.trim(),

                                        cleanRollNumber,

                                        email.trim(),

                                        phone.trim(),

                                        course,

                                        gender,

                                        date_of_birth,

                                        address.trim()

                                    ],
                                    function (studentInsertErr) {

                                        if (
                                            studentInsertErr
                                        ) {

                                            db.run(
                                                "ROLLBACK"
                                            );

                                            return res.status(500).json({
                                                error:
                                                    studentInsertErr.message
                                            });

                                        }


                                        const studentRecordId =
                                            this.lastID;


                                        /* =========================
                                           CREATE USER
                                        ========================= */

                                        db.run(
                                            `
                                            INSERT INTO users
                                            (

                                                student_record_id,

                                                name,
                                                date_of_birth,
                                                gender,

                                                email,
                                                phone,

                                                address,
                                                city,
                                                state,
                                                pincode,

                                                student_id,
                                                roll_number,

                                                course,
                                                department,
                                                semester,
                                                academic_year,
                                                college,

                                                guardian_name,
                                                guardian_relation,
                                                guardian_phone,
                                                emergency_contact,

                                                username,
                                                password_hash,
                                                salt,

                                                status

                                            )

                                            VALUES
                                            (

                                                ?,

                                                ?, ?, ?,

                                                ?, ?,

                                                ?, ?, ?, ?,

                                                ?, ?,

                                                ?, ?, ?, ?, ?,

                                                ?, ?, ?, ?,

                                                ?, ?, ?,

                                                'Active'

                                            )
                                            `,
                                            [

                                                studentRecordId,

                                                name.trim(),

                                                date_of_birth,

                                                gender,

                                                email.trim(),

                                                phone.trim(),

                                                address.trim(),

                                                city.trim(),

                                                state.trim(),

                                                pincode.trim(),

                                                cleanStudentId,

                                                cleanRollNumber,

                                                course,

                                                department.trim(),

                                                semester,

                                                academic_year,

                                                college.trim(),

                                                guardian_name.trim(),

                                                guardian_relation,

                                                guardian_phone.trim(),

                                                emergency_contact.trim(),

                                                cleanUsername,

                                                passwordHash,

                                                salt

                                            ],
                                            function (userInsertErr) {

                                                if (
                                                    userInsertErr
                                                ) {

                                                    db.run(
                                                        "ROLLBACK"
                                                    );

                                                    return res.status(500).json({
                                                        error:
                                                            userInsertErr.message
                                                    });

                                                }


                                                /* =========================
                                                   COMMIT
                                                ========================= */

                                                db.run(
                                                    "COMMIT",
                                                    (commitErr) => {

                                                        if (
                                                            commitErr
                                                        ) {

                                                            db.run(
                                                                "ROLLBACK"
                                                            );

                                                            return res.status(500).json({
                                                                error:
                                                                    commitErr.message
                                                            });

                                                        }


                                                        res.json({

                                                            message:
                                                                "Student account created successfully",

                                                            userId:
                                                                this.lastID,

                                                            studentRecordId:
                                                                studentRecordId

                                                        });

                                                    }
                                                );

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


/* =========================================================
   USER LOGIN
========================================================= */

app.post(
    "/api/users/login",
    (req, res) => {

        const {

            username,
            password

        } = req.body;


        if (
            !username ||
            !password
        ) {

            return res.status(400).json({
                error:
                    "Username and password are required"
            });

        }


        const cleanUsername =
            username
                .trim()
                .toLowerCase();


        db.get(
            `
            SELECT *
            FROM users
            WHERE username = ?
            `,
            [cleanUsername],
            (err, user) => {

                if (err) {

                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                if (!user) {

                    return res.status(401).json({
                        error:
                            "Invalid username or password"
                    });

                }


                const passwordHash =
                    hashPassword(
                        password,
                        user.salt
                    );


                if (
                    passwordHash !==
                    user.password_hash
                ) {

                    return res.status(401).json({
                        error:
                            "Invalid username or password"
                    });

                }


                /* =========================
                   UPDATE LAST LOGIN
                ========================= */

                db.run(
                    `
                    UPDATE users

                    SET
                        last_login =
                            CURRENT_TIMESTAMP

                    WHERE id = ?
                    `,
                    [user.id],
                    (updateErr) => {

                        if (
                            updateErr
                        ) {

                            console.error(
                                "Last login update failed:",
                                updateErr.message
                            );

                        }

                    }
                );


                /* =========================
                   RETURN USER DATA
                ========================= */

                res.json({

                    message:
                        "Login successful",

                    user: {

                        id:
                            user.id,

                        student_record_id:
                            user.student_record_id,

                        name:
                            user.name,

                        date_of_birth:
                            user.date_of_birth,

                        gender:
                            user.gender,

                        email:
                            user.email,

                        phone:
                            user.phone,

                        address:
                            user.address,

                        city:
                            user.city,

                        state:
                            user.state,

                        pincode:
                            user.pincode,

                        student_id:
                            user.student_id,

                        roll_number:
                            user.roll_number,

                        course:
                            user.course,

                        department:
                            user.department,

                        semester:
                            user.semester,

                        academic_year:
                            user.academic_year,

                        college:
                            user.college,

                        guardian_name:
                            user.guardian_name,

                        guardian_relation:
                            user.guardian_relation,

                        guardian_phone:
                            user.guardian_phone,

                        emergency_contact:
                            user.emergency_contact,

                        username:
                            user.username,

                        status:
                            user.status,

                        created_at:
                            user.created_at,

                        last_login:
                            user.last_login

                    }

                });

            }
        );

    }
);


/* =========================================================
   GET ALL USERS
========================================================= */

app.get(
    "/api/users",
    (req, res) => {

        db.all(
            `
            SELECT

                id,

                student_record_id,

                name,

                date_of_birth,

                gender,

                email,

                phone,

                address,

                city,

                state,

                pincode,

                student_id,

                roll_number,

                course,

                department,

                semester,

                academic_year,

                college,

                guardian_name,

                guardian_relation,

                guardian_phone,

                emergency_contact,

                username,

                status,

                created_at,

                last_login

            FROM users

            ORDER BY id DESC
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


/* =========================================================
   GET SINGLE USER
========================================================= */

app.get(
    "/api/users/:id",
    (req, res) => {

        db.get(
            `
            SELECT

                id,

                student_record_id,

                name,

                date_of_birth,

                gender,

                email,

                phone,

                address,

                city,

                state,

                pincode,

                student_id,

                roll_number,

                course,

                department,

                semester,

                academic_year,

                college,

                guardian_name,

                guardian_relation,

                guardian_phone,

                emergency_contact,

                username,

                status,

                created_at,

                last_login

            FROM users

            WHERE id = ?
            `,
            [req.params.id],
            (err, row) => {

                if (err) {

                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                if (!row) {

                    return res.status(404).json({
                        error:
                            "User not found"
                    });

                }


                res.json(row);

            }
        );

    }
);


/* =========================================================
   GET LINKED STUDENT
========================================================= */

app.get(
    "/api/users/:id/student",
    (req, res) => {

        db.get(
            `
            SELECT

                students.*

            FROM users

            INNER JOIN students

            ON users.student_record_id =
                students.id

            WHERE users.id = ?
            `,
            [req.params.id],
            (err, row) => {

                if (err) {

                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                if (!row) {

                    return res.status(404).json({
                        error:
                            "Linked student record not found"
                    });

                }


                res.json(row);

            }
        );

    }
);


/* =========================================================
   TIMETABLE
========================================================= */


/* =========================
   GET TIMETABLE
========================= */

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


/* =========================
   ADD TIMETABLE
========================= */

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


/* =========================
   DELETE TIMETABLE
========================= */

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


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            "Student Management System is ready."
        );

    }
);