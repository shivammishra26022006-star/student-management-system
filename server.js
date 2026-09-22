const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "public");

const databasePath = path.join(
    __dirname,
    "student_management.db"
);

const db = new sqlite3.Database(
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

app.use(express.json());

app.use(
    express.static(publicPath)
);


/* =========================================================
   HOME
========================================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            publicPath,
            "index.html"
        )
    );
});


/* =========================================================
   DATABASE TABLES
========================================================= */

db.serialize(() => {

    db.run(`
        PRAGMA foreign_keys = ON
    `);


    /* =========================
       STUDENTS
    ========================= */

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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /* =========================
       ATTENDANCE
    ========================= */

    db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id)
            REFERENCES students(id)
            ON DELETE CASCADE
        )
    `);


    /* =========================
       MARKS
    ========================= */

    db.run(`
        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            exam_name TEXT NOT NULL,
            subject TEXT NOT NULL,
            marks REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id)
            REFERENCES students(id)
            ON DELETE CASCADE
        )
    `);


    /* =========================
       FEES
    ========================= */

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


    /* =========================
       FEE STRUCTURE
    ========================= */

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


    /* =========================
       USERS
    ========================= */

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `);

});


/* =========================================================
   STUDENTS
========================================================= */

app.get("/api/students", (req, res) => {

    const sql = `
        SELECT *
        FROM students
        ORDER BY id DESC
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


app.get("/api/students/:id", (req, res) => {

    const sql = `
        SELECT *
        FROM students
        WHERE id = ?
    `;

    db.get(
        sql,
        [req.params.id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json(row);
        }
    );
});


app.post("/api/students", (req, res) => {

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

    const sql = `
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
    `;

    db.run(
        sql,
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
                    err.message.includes("UNIQUE")
                ) {
                    return res.status(400).json({
                        error:
                            "This Roll Number already exists"
                    });
                }

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message:
                    "Student added successfully",
                id: this.lastID
            });
        }
    );
});


app.put("/api/students/:id", (req, res) => {

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

    const sql = `
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
    `;

    db.run(
        sql,
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
                    err.message.includes("UNIQUE")
                ) {
                    return res.status(400).json({
                        error:
                            "This Roll Number already exists"
                    });
                }

                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
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
});


app.delete("/api/students/:id", (req, res) => {

    const studentId =
        req.params.id;

    db.run(
        `
        DELETE FROM students
        WHERE id = ?
        `,
        [studentId],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
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
});


/* =========================================================
   ATTENDANCE
========================================================= */

app.post("/api/attendance", (req, res) => {

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

    const sql = `
        INSERT INTO attendance
        (
            student_id,
            date,
            status
        )
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [
            Number(student_id),
            date,
            status
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message:
                    "Attendance saved successfully",
                id: this.lastID
            });
        }
    );
});


app.get("/api/attendance", (req, res) => {

    const sql = `
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
        ON attendance.student_id = students.id
        ORDER BY
            attendance.date DESC,
            attendance.id DESC
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


app.delete("/api/attendance/:id", (req, res) => {

    db.run(
        `
        DELETE FROM attendance
        WHERE id = ?
        `,
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
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
});


app.get(
    "/api/attendance/summary",
    (req, res) => {

        const sql = `
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

            GROUP BY students.id

            ORDER BY students.id DESC
        `;

        db.all(
            sql,
            [],
            (err, rows) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                const result =
                    rows.map(row => {

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
                            id: row.id,
                            name: row.name,
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
                    });

                res.json(result);
            }
        );
    }
);


/* =========================================================
   MARKS
========================================================= */

app.post("/api/marks", (req, res) => {

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
        Number.isNaN(numericMarks) ||
        numericMarks < 0 ||
        numericMarks > 100
    ) {
        return res.status(400).json({
            error:
                "Marks must be between 0 and 100"
        });
    }

    const sql = `
        INSERT INTO marks
        (
            student_id,
            exam_name,
            subject,
            marks
        )
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            Number(student_id),
            exam_name,
            subject,
            numericMarks
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message:
                    "Marks saved successfully",
                id: this.lastID
            });
        }
    );
});


app.get("/api/marks", (req, res) => {

    const sql = `
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
        ORDER BY marks.id DESC
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


/* =========================================================
   FEES
========================================================= */

app.post("/api/fees", (req, res) => {

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
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
    ) {
        return res.status(400).json({
            error:
                "Amount must be greater than 0"
        });
    }

    const sql = `
        INSERT INTO fees
        (
            student_id,
            fee_type,
            amount,
            payment_date,
            payment_method
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
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
                    error: err.message
                });
            }

            res.json({
                message:
                    "Fee saved successfully",
                id: this.lastID
            });
        }
    );
});


app.get("/api/fees", (req, res) => {

    const sql = `
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
        ORDER BY fees.id DESC
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


app.delete("/api/fees/:id", (req, res) => {

    db.run(
        `
        DELETE FROM fees
        WHERE id = ?
        `,
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
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
});


/* =========================================================
   FEE STRUCTURE
========================================================= */

app.get(
    "/api/fee-structure",
    (req, res) => {

        const sql = `
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
            ORDER BY fee_structure.id DESC
        `;

        db.all(
            sql,
            [],
            (err, rows) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json(rows);
            }
        );
    }
);


app.post(
    "/api/fee-structure/:student_id",
    (req, res) => {

        const studentId =
            req.params.student_id;

        const totalFee =
            Number(req.body.total_fee);

        if (
            Number.isNaN(totalFee) ||
            totalFee < 0
        ) {
            return res.status(400).json({
                error:
                    "Enter a valid total fee"
            });
        }

        const sql = `
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
        `;

        db.run(
            sql,
            [
                Number(studentId),
                totalFee
            ],
            function (err) {

                if (err) {
                    return res.status(500).json({
                        error: err.message
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


app.get("/api/fees/summary", (req, res) => {

    const sql = `
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

        GROUP BY students.id

        ORDER BY students.id DESC
    `;

    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const result =
                rows.map(row => {

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
                        id: row.id,
                        name: row.name,
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
                });

            res.json(result);
        }
    );
});


/* =========================================================
   USERS
========================================================= */

function hashPassword(password, salt) {

    return crypto
        .scryptSync(
            password,
            salt,
            64
        )
        .toString("hex");
}


/* =========================
   USER REGISTER
========================= */

app.post(
    "/api/users/register",
    (req, res) => {

        const {
            name,
            email,
            phone,
            username,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !username ||
            !password
        ) {
            return res.status(400).json({
                error:
                    "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error:
                    "Password must be at least 6 characters"
            });
        }

        const cleanUsername =
            username
                .trim()
                .toLowerCase();

        const salt =
            crypto
                .randomBytes(16)
                .toString("hex");

        const passwordHash =
            hashPassword(
                password,
                salt
            );

        const sql = `
            INSERT INTO users
            (
                name,
                email,
                phone,
                username,
                password_hash,
                salt
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(
            sql,
            [
                name.trim(),
                email.trim(),
                phone.trim(),
                cleanUsername,
                passwordHash,
                salt
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
                                "Username already exists"
                        });
                    }

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    message:
                        "Account created successfully",
                    userId:
                        this.lastID
                });
            }
        );
    }
);


/* =========================
   USER LOGIN
========================= */

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

                db.run(
                    `
                    UPDATE users
                    SET last_login =
                        CURRENT_TIMESTAMP
                    WHERE id = ?
                    `,
                    [user.id],
                    (updateErr) => {

                        if (updateErr) {
                            console.error(
                                "Last login update failed:",
                                updateErr.message
                            );
                        }
                    }
                );

                res.json({
                    message:
                        "Login successful",

                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        username:
                            user.username
                    }
                });
            }
        );
    }
);


/* =========================
   GET USERS FOR ADMIN
========================= */

app.get(
    "/api/users",
    (req, res) => {

        db.all(
            `
            SELECT
                id,
                name,
                email,
                phone,
                username,
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
   START SERVER
========================================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );
    }
);