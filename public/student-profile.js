// Get student ID from URL

const params =
    new URLSearchParams(window.location.search);

const studentId =
    params.get("id");


// Load student

async function loadStudent() {

    if (!studentId) {

        alert("Student ID not found.");

        return;
    }


    try {

        const response =
            await fetch(`/api/students/${studentId}`);


        const student =
            await response.json();


        if (!response.ok) {

            alert(student.error);

            return;
        }


        document.getElementById(
            "studentName"
        ).textContent = student.name;


        document.getElementById(
            "studentCourse"
        ).textContent = student.course;


        document.getElementById(
            "studentId"
        ).textContent = student.id;


        document.getElementById(
            "rollNumber"
        ).textContent = student.roll_number;


        document.getElementById(
            "email"
        ).textContent =
            student.email || "Not provided";


        document.getElementById(
            "phone"
        ).textContent =
            student.phone || "Not provided";


        document.getElementById(
            "gender"
        ).textContent =
            student.gender || "Not provided";


        document.getElementById(
            "dateOfBirth"
        ).textContent =
            student.date_of_birth || "Not provided";


        document.getElementById(
            "address"
        ).textContent =
            student.address || "Not provided";


    } catch (error) {

        console.error(error);

        alert("Unable to load student.");

    }

}


// Start

loadStudent();