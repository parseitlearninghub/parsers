import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    child,
    update,
    remove,
    onValue,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFqgbA_t3EBVO21nW70umJOHX3UdRr9MY",
    authDomain: "parseit-8021e.firebaseapp.com",
    databaseURL:
        "https://parseit-8021e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "parseit-8021e",
    storageBucket: "parseit-8021e.appspot.com",
    messagingSenderId: "15166597986",
    appId: "1:15166597986:web:04b0219b1733780ae61a3b",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

const firebaseConfigAdmin = {
    apiKey: "AIzaSyCoIfQLbAq5gPil3COSauqfHNlv5P5tYXc",
    authDomain: "parseitadmin.firebaseapp.com",
    databaseURL: "https://parseitadmin-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "parseitadmin",
    storageBucket: "parseitadmin.firebasestorage.app",
    messagingSenderId: "1009498274532",
    appId: "1:1009498274532:web:69083f905357ae31b74af1"
};
const appAdmin = initializeApp(firebaseConfigAdmin, "ParseITAdmin");
const databaseAdmin = getDatabase(appAdmin);
const dbRefAdmin = ref(databaseAdmin);

let admin_id = localStorage.getItem("user-parser");

//preloads
setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", async function () {
    document.getElementById("loading_animation_div").style.display = "none";
    await getAcadStatus().then(async (acadStatus) => {
        const academic = acadStatus.academic_ref;
        let sem = acadStatus.current_sem;
        let sem_final = 'first-sem';
        if (sem === '2') {
            sem_final = 'second-sem';
        }
        previewMyJourneySelection(academic, `year-lvl-4`, sem_final);
    });

});
function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
    document.documentElement.style.height = height + "px";
}



// saveMygradesAsPDF();
function saveMygradesAsPDF(studentId, studentName, academicYear, tableId, imgId) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const imgElement = document.getElementById(imgId);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = 190;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);

    pdf.setFontSize(11);
    const studentIdTitle = "Student ID:";
    //const studentId = "7210704";
    pdf.text(studentIdTitle, 15, pdfHeight + 30);
    pdf.text(studentId, 45, pdfHeight + 30);

    const studentNameTitle = "Student Name:";
    //const studentName = "John Lyndo Vero Anuada";
    pdf.text(studentNameTitle, 15, pdfHeight + 36);
    pdf.text(studentName, 45, pdfHeight + 36);

    const academicYearTitle = "School Year:";
    //const academicYear = "2023/2024 1st Semester";
    pdf.text(academicYearTitle, 15, pdfHeight + 42);
    pdf.text(academicYear, 45, pdfHeight + 42);

    const table = document.getElementById(tableId);
    pdf.autoTable({
        html: table,
        startY: 15 + pdfHeight + 31,
        theme: "plain",
        styles: {
            overflow: "linebreak",
            fontSize: 10,
            overflowColumns: "linebreak",
            lineWidth: 0.2,   // Set border width
            lineColor: [220, 220, 220],  // Set border color (black in this case)
            cellPadding: 2,
        },
        headStyles: {
            lineWidth: 0.2,
            lineColor: [243, 5, 5],
            fillColor: [243, 5, 5],
            textColor: [255, 255, 255],
        },
    });
    //pdf.save("image-and-table.pdf");

    const pdfBlob = pdf.output('blob');
    const reader = new FileReader();
    reader.onloadend = function () {
        const base64PDF = reader.result.split(',')[1]; // Get the base64 string
        uploadToGitHub(base64PDF);
    };
    reader.readAsDataURL(pdfBlob);
}
document.getElementById("canceladdchatbot-btn").addEventListener("click", () => {
    window.location.href = `homepage.html`;
});
async function uploadToGitHub(base64PDF, section) {
    const token = await getApikey();
    const owner = "parseitlearninghub";
    const repo = "parseitlearninghub-storage";
    const filePath = `PARSEIT/storage/downloads/${admin_id}/${Date.now().toString()}/myGrades.pdf`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const data = {
        message: 'Add generated PDF',
        content: base64PDF,
        branch: 'main',
    };
    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if (data.content) {
                const getLink = document.createElement('button');
                getLink.textContent = 'Get Link';
                getLink.id = 'download-pdf-btn';
                getLink.addEventListener('click', (event) => {
                    navigator.clipboard.writeText(data.content.download_url)
                        .then(() => {
                            document.getElementById('download-pdf-btn').innerText = 'Copied! Paste url in browser to download.';
                            setTimeout(() => {
                                document.getElementById('download-pdf-btn').innerText = 'Copy Link';
                            }, 3500);
                        })
                        .catch(err => {
                            document.getElementById('download-pdf-btn').innerText = 'Try again.';
                            setTimeout(() => {
                                document.getElementById('download-pdf-btn').innerText = 'Copy Link';
                            }, 3500);
                        });
                });
                section.appendChild(getLink);

            } else {
                console.error('Error uploading PDF:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}
async function getApikey() {
    const apikeyRef = child(dbRef, "PARSEIT/administration/apikeys/");
    const snapshot = await get(apikeyRef);
    if (snapshot.exists()) {
        const currentData = snapshot.val().githubtoken;
        return currentData;
    } else {
        return null;
    }
}
// populateTable();
function populateTable() {

    const semesters = [];

    const firstSemester = [
        {
            subject: "CC 111",
            description: "INTRODUCTION TO COMPUTING",
            units: 3.0,
            grade: 1.9,
        },
        {
            subject: "CC 112",
            description: "PROGRAMMING 1 (LEC)",
            units: 2.0,
            grade: 1.4,

        },
    ];
    semesters.push(firstSemester);
    const tableBody = document.getElementById("tbody");
    tableBody.innerHTML = '';
    semesters.forEach(semester => {
        semester.forEach(course => {
            // Create a new table row
            const row = document.createElement("tr");

            // Create table cells for each piece of data
            const subjectCell = document.createElement("td");
            subjectCell.textContent = course.subject;

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = course.description;

            const unitsCell = document.createElement("td");
            unitsCell.textContent = course.units;

            const gradeCell = document.createElement("td");
            gradeCell.textContent = course.grade;
            row.appendChild(subjectCell);
            row.appendChild(descriptionCell);
            row.appendChild(unitsCell);
            row.appendChild(gradeCell);
            tableBody.appendChild(row);
        });
    });
}

function previewMyJourney() {
    const acadRef = ref(database, `PARSEIT/administration/parseclass/`);
    let academicYears = [];
    onValue(acadRef, async (acadRefSnapshot) => {
        if (acadRefSnapshot.exists()) {
            for (const yearlvl in acadRefSnapshot.val()) {
                let foundStudentinAcademicYear = false;
                //console.log(acadRefSnapshot.val()[yearlvl]);
                for (const sem in acadRefSnapshot.val()[yearlvl]) {
                    let foundStudentinYearlvl = false;
                    //console.log(acadRefSnapshot.val()[yearlvl][sem]);
                    for (const subject in acadRefSnapshot.val()[yearlvl][sem]) {
                        let foundStudentinSem = false;
                        //console.log(acadRefSnapshot.val()[yearlvl][sem][subject]);
                        for (const section in acadRefSnapshot.val()[yearlvl][sem][subject]) {
                            let foundStudentinSubject = false;
                            //console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section].name);
                            //console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section]);
                            for (const members in acadRefSnapshot.val()[yearlvl][sem][subject][section]) {
                                if (typeof acadRefSnapshot.val()[yearlvl][sem][subject][section][members] === "object") {
                                    //console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section][members]);
                                    for (const memberId in acadRefSnapshot.val()[yearlvl][sem][subject][section][members]) {

                                        //console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section][members][memberId]);
                                        const memberRef = acadRefSnapshot.val()[yearlvl][sem][subject][section][members][memberId];
                                        if (typeof memberRef === "object") {
                                            if (memberId === 'members') {
                                                for (const finalgrade in memberRef) {
                                                    if (finalgrade === admin_id) {
                                                        foundStudentinAcademicYear = true;
                                                        foundStudentinYearlvl = true;
                                                        foundStudentinSem = true;
                                                        foundStudentinSubject = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (foundStudentinSubject) {
                                //console.log(section);
                                // console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section].name);
                                // console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section].unit);
                            }
                        }
                        if (foundStudentinSem) {
                            //console.log(subject);
                            //console.log(sem);

                        }
                    }
                    if (foundStudentinYearlvl) {
                        // console.log(yearlvl);
                        // console.log(sem);

                    }
                }
                if (foundStudentinAcademicYear) {
                    academicYears.push(yearlvl);
                }
            }
        }
        else {
            //no academic ref
        }
    });

    const section = document.createElement('section');
    section.classList.add('myjourney-template');
    section.id = 'myjourney-template';

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('myjourney-template-header');

    const headerImg = document.createElement('img');
    headerImg.src = 'assets/myjourney-header-template.jpg';
    headerImg.classList.add('myjourney-template-header-img');
    headerImg.id = 'myjourney-template-header-img';
    headerImg.setAttribute('crossorigin', 'anonymous');

    headerDiv.appendChild(headerImg);
    section.appendChild(headerDiv);

    const bodyDiv = document.createElement('div');
    bodyDiv.classList.add('myjourney-template-body');

    const table = document.createElement('table');
    table.classList.add('myjourney-table-template');
    table.id = 'my-table';
    table.setAttribute('border', '1');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    const thead = document.createElement('thead');
    const trHeader = document.createElement('tr');

    const thSubject = document.createElement('th');
    thSubject.textContent = 'Subject';
    const thDescription = document.createElement('th');
    thDescription.textContent = 'Description';
    const thUnit = document.createElement('th');
    thUnit.textContent = 'Unit';
    const thGrade = document.createElement('th');
    thGrade.textContent = 'Grade';

    trHeader.appendChild(thSubject);
    trHeader.appendChild(thDescription);
    trHeader.appendChild(thUnit);
    trHeader.appendChild(thGrade);
    thead.appendChild(trHeader);

    const tbody = document.createElement('tbody');
    tbody.id = 'tbody';

    table.appendChild(thead);
    table.appendChild(tbody);
    bodyDiv.appendChild(table);

    section.appendChild(bodyDiv);

    const parentElement = document.getElementById('myjourney-result-container');
    parentElement.appendChild(section);


}

function previewMyJourneySelection(academic, yearlvl, sem) {
    const acadRef = ref(database, `PARSEIT/administration/parseclass/${academic}/${yearlvl}/${sem}/`);
    onValue(acadRef, async (snapshot) => {
        const parentElement = document.getElementById('myjourney-result-container');
        parentElement.innerHTML = ''; // Clear previous content

        if (snapshot.exists()) {
            const section = document.createElement('section');
            section.classList.add('myjourney-template');
            section.id = 'myjourney-template';

            const headerDiv = document.createElement('div');
            headerDiv.classList.add('myjourney-template-header');

            const headerImg = document.createElement('img');
            headerImg.src = 'assets/myjourney-header-template.png';
            headerImg.classList.add('myjourney-template-header-img');
            headerImg.id = 'myjourney-template-header-img';
            headerImg.setAttribute('crossorigin', 'anonymous');

            headerDiv.appendChild(headerImg);
            section.appendChild(headerDiv);

            const academicYearDiv = document.createElement('div');
            academicYearDiv.classList.add('myjourney-template-header-year');

            const studentId = document.createElement('span');
            studentId.textContent = 'Student ID: ' + admin_id;
            academicYearDiv.appendChild(studentId);

            const studentFullname = document.createElement('span');
            studentFullname.textContent = 'Student Name: ' + await getFullname(admin_id);
            academicYearDiv.appendChild(studentFullname);

            const academicYear = document.createElement('span');
            academicYear.textContent = 'School Year: ' + await getAcadName(academic);
            academicYearDiv.appendChild(academicYear);


            section.appendChild(academicYearDiv);

            parentElement.appendChild(section);

            const bodyDiv = document.createElement('div');
            bodyDiv.classList.add('myjourney-template-body');

            const table = document.createElement('table');
            table.classList.add('myjourney-table-template');
            table.id = 'my-table';
            table.setAttribute('border', '1');
            table.style.borderCollapse = 'collapse';
            table.style.width = '100%';

            const thead = document.createElement('thead');
            const trHeader = document.createElement('tr');

            const thSubject = document.createElement('th');
            thSubject.textContent = 'Subject';
            const thDescription = document.createElement('th');
            thDescription.textContent = 'Description';
            const thUnit = document.createElement('th');
            thUnit.textContent = 'Unit';
            const thGrade = document.createElement('th');
            thGrade.textContent = 'Grade';

            trHeader.appendChild(thSubject);
            trHeader.appendChild(thDescription);
            trHeader.appendChild(thUnit);
            trHeader.appendChild(thGrade);
            thead.appendChild(trHeader);

            const tbody = document.createElement('tbody');
            tbody.id = 'tbody';

            table.appendChild(thead);
            table.appendChild(tbody);
            bodyDiv.appendChild(table);

            section.appendChild(bodyDiv);

            const data = snapshot.val();
            for (const subject in data) {
                for (const section in data[subject]) {
                    if (typeof data[subject][section] === "object") {
                        for (const members in data[subject][section].members) {
                            if (members === admin_id) {
                                const row = document.createElement("tr");

                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject;

                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = data[subject].name;

                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = data[subject].unit;

                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = data[subject][section].members[members].finalgrade;

                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                        }
                    }
                }
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            const imgSrc = "assets/myjourney-header-template.png";
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const imgElement = new Image();
            imgElement.crossOrigin = "anonymous"; // Ensures cross-origin images are handled properly
            imgElement.src = imgSrc;

            imgElement.onload = async () => {
                canvas.width = imgElement.naturalWidth;
                canvas.height = imgElement.naturalHeight;
                ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

                // Convert canvas to data URL
                const imgData = canvas.toDataURL("image/png");

                // Define PDF dimensions
                const pdfWidth = 190; // Width in PDF units
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);

                pdf.setFontSize(11);
                const studentIdTitle = "Student ID:";
                //const studentId = "7210704";
                pdf.text(studentIdTitle, 15, pdfHeight + 30);
                pdf.text(admin_id, 45, pdfHeight + 30);

                const studentNameTitle = "Student Name:";
                //const studentName = "John Lyndo Vero Anuada";
                pdf.text(studentNameTitle, 15, pdfHeight + 36);
                pdf.text(await getFullname(admin_id), 45, pdfHeight + 36);
                const acadname = await getAcadName(academic);
                const academicYearTitle = "School Year:";
                //const academicYear = "2023/2024 1st Semester";
                pdf.text(academicYearTitle, 15, pdfHeight + 42);
                pdf.text(acadname, 45, pdfHeight + 42);

                pdf.autoTable({
                    html: table,
                    startY: 15 + pdfHeight + 31,
                    theme: "plain",
                    styles: {
                        overflow: "linebreak",
                        fontSize: 10,
                        overflowColumns: "linebreak",
                        lineWidth: 0.2,   // Set border width
                        lineColor: [220, 220, 220],  // Set border color (black in this case)
                        cellPadding: 2,
                    },
                    headStyles: {
                        lineWidth: 0.2,
                        lineColor: [243, 5, 5],
                        fillColor: [243, 5, 5],
                        textColor: [255, 255, 255],
                    },
                });

                const pdfBlob = pdf.output('blob');
                const reader = new FileReader();
                reader.onloadend = function () {
                    const base64PDF = reader.result.split(',')[1];
                    uploadToGitHub(base64PDF, section);
                };
                reader.readAsDataURL(pdfBlob);
            };

        }
        else {
            const section = document.createElement('section');
            section.classList.add('myjourney-template');
            section.id = 'myjourney-template';

            const span = document.createElement('span');
            span.textContent = 'No data available';
            span.className = 'no-data-available';
            section.appendChild(span);
            parentElement.appendChild(section);
        }
    });
}

async function getFullname(studentid) {
    const dbRef = ref(database);
    return await get(child(dbRef, "PARSEIT/administration/students/" + studentid)).then((snapshot) => {
        if (snapshot.exists()) {
            if (snapshot.val().suffix === "none") {
                return `${snapshot.val().lastname}, ${snapshot.val().firstname}`
            }
            else {
                return `${snapshot.val().lastname}, ${snapshot.val().firstname} ${snapshot.val().suffix}`
            }
        }
    });
}

async function getAcadName(acad) {
    const dbRef = ref(database);
    return await get(child(dbRef, "PARSEIT/administration/academicyear/BSIT/" + acad)).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val().title
        }
        else {
            return console.log('No data available');
        }
    });
}

async function getAcadStatus() {
    const dbRef = ref(database);
    return await get(child(dbRef, "PARSEIT/administration/academicyear/status/")).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        }
    });
}