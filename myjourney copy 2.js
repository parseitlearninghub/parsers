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
    const options_acadref = [];
    const options_yearlvl = [{ value: 'year-lvl-1', text: 'Freshman' }, { value: 'year-lvl-2', text: 'Sophomore' }, { value: 'year-lvl-3', text: 'Junior' }, { value: 'year-lvl-4', text: 'Senior' }];
    const options_sem = [{ value: 'first-sem', text: 'First Semester' }, { value: 'second-sem', text: 'Second Semester' }];
    const dbRef = ref(database);
    await get(child(dbRef, "PARSEIT/administration/academicyear/BSIT/")).then((snapshot) => {
        if (snapshot.exists()) {
            for (const title in snapshot.val()) {
                const academicYear = snapshot.val()[title];
                options_acadref.push({ value: title, text: academicYear.title });
            }
        }
    });
    populateDropdown("myjourney-select-acad", options_acadref, 'academic');
    populateDropdown("myjourney-select-sem", options_sem, 'sem');


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

async function previewMyJourneySelection(academic, yearlvl, sem) {
    let semester = 'First Semester'
    if (sem === 'second-sem') {
        semester = 'Second Semester';
    }
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
            academicYear.textContent = 'School Year: ' + await getAcadName(academic) + " (" + semester + ")";
            academicYearDiv.appendChild(academicYear);



            const tbody = document.createElement('tbody');
            tbody.id = 'tbody';

            const data = snapshot.val();
            let hasData = false;
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

                                hasData = true;
                            }
                        }
                    }
                }
            }

            if (!hasData) {
                const section = document.createElement('section');
                section.classList.add('myjourney-template');
                section.id = 'myjourney-template';

                const span = document.createElement('span');
                span.textContent = 'No data available';
                span.className = 'no-data-available';
                section.appendChild(span);
                parentElement.appendChild(section);
            }
            else {

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
                trHeader.className = 'myjourney-tr-header';

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
                section.appendChild(bodyDiv);

                table.appendChild(thead);
                table.appendChild(tbody);
                bodyDiv.appendChild(table);



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

                    let semester = 'First Semester'
                    if (sem === 'second-sem') {
                        semester = 'Second Semester';
                    }

                    const studentNameTitle = "Student Name:";
                    //const studentName = "John Lyndo Vero Anuada";
                    pdf.text(studentNameTitle, 15, pdfHeight + 36);
                    pdf.text(await getFullname(admin_id), 45, pdfHeight + 36);
                    const acadname = await getAcadName(academic) + " (" + semester + ")";
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


function populateDropdown(dropdownId, options, type) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';

    if (type === 'academic') {
        defaultOption.textContent = 'Academic Year';
    }
    else if (type === 'yearlvl') {
        defaultOption.textContent = 'Year Level';
    }
    else if (type === 'sem') {
        defaultOption.textContent = 'Semester';
    }

    dropdown.appendChild(defaultOption);
    options.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.textContent = option.text;
        dropdown.appendChild(newOption);
    });
}

document.getElementById("show-myjourney-btn").addEventListener("click", async () => {
    const acadRef = document.getElementById("myjourney-select-acad").value;
    //const yearlvl = document.getElementById("myjourney-select-yearlvl").value;
    const sem = document.getElementById("myjourney-select-sem").value;

    if (acadRef === '') {
        errorElement('myjourney-select-acad');
        return;
    }
    if (sem === '') {
        errorElement('myjourney-select-sem');
        return;
    }
    getAcadStatus().then(async () => {
        await previewMyJourneySelection(acadRef, sem);
    });

});

function errorElement(element) {
    document.getElementById(element).style.border = "0.4px solid #f30505";
    setTimeout(() => {
        document.getElementById(element).style.border = "0.4px solid #dcdcdc";
    }, 1000);
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

async function previewMyJourneySelection() {
    const acadRef = ref(database, `PARSEIT/administration/parseclass/`);
    onValue(acadRef, async (acadRefSnapshot) => {
        const parentElement = document.getElementById('myjourney-result-container');
        parentElement.innerHTML = ''; // Clear previous content

        let foundinSem1 = false;
        let foundinSem2 = false;
        let curryearlvl = '';
        let allyearlvl = [];
        let yr1_sem1_subjects = [];
        let yr1_sem2_subjects = [];
        let yr2_sem1_subjects = [];
        let yr2_sem2_subjects = [];
        let yr3_sem1_subjects = [];
        let yr3_sem2_subjects = [];
        let yr4_sem1_subjects = [];
        let yr4_sem2_subjects = [];

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
                                                        //console.log(memberRef[finalgrade].finalgrade);

                                                        if (foundStudentinSubject) {
                                                            //console.log(section);
                                                            if (subject === 'first-sem') {
                                                                if (sem === 'year-lvl-1') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr1_sem1_subjects.push(data);
                                                                }
                                                                if (sem === 'year-lvl-2') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr2_sem1_subjects.push(data);
                                                                }
                                                                if (sem === 'year-lvl-3') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr3_sem1_subjects.push(data);
                                                                }
                                                                if (sem === 'year-lvl-4') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr4_sem1_subjects.push(data);
                                                                }
                                                            }

                                                            if (subject === 'second-sem') {
                                                                if (sem === 'year-lvl-1') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr1_sem2_subjects.push(data);
                                                                }
                                                                if (sem === 'year-lvl-2') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr2_sem2_subjects.push(data);
                                                                }
                                                                if (sem === 'year-lvl-3') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr3_sem2_subjects.push(data);
                                                                }
                                                                if (sem === 'year-lvl-4') {
                                                                    const data = {
                                                                        subject: section,
                                                                        description: acadRefSnapshot.val()[yearlvl][sem][subject][section].name,
                                                                        unit: acadRefSnapshot.val()[yearlvl][sem][subject][section].unit,
                                                                        grade: memberRef[finalgrade].finalgrade,
                                                                    }
                                                                    yr4_sem2_subjects.push(data);
                                                                }
                                                            }
                                                            // console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section].name);
                                                            // console.log(acadRefSnapshot.val()[yearlvl][sem][subject][section].unit);

                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                        }
                        if (foundStudentinSem) {
                            if (subject === 'first-sem') {
                                foundinSem1 = true;
                            }
                            else {
                                foundinSem2 = true;
                            }
                        }
                    }
                    if (foundStudentinYearlvl) {
                        // console.log(yearlvl);
                        //console.log(sem);
                        curryearlvl = sem;
                        allyearlvl.push(sem);
                        foundStudentinYearlvl = false;

                    }
                }
                if (foundStudentinAcademicYear) {
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
                    parentElement.appendChild(section);


                    const academicYearDiv = document.createElement('div');
                    academicYearDiv.classList.add('myjourney-template-header-year');

                    const studentId = document.createElement('span');
                    studentId.textContent = 'Student ID: ' + admin_id;
                    academicYearDiv.appendChild(studentId);

                    const studentFullname = document.createElement('span');
                    studentFullname.textContent = 'Student Name: ' + await getFullname(admin_id);
                    academicYearDiv.appendChild(studentFullname);

                    if (foundinSem1) {
                        const academicYear = document.createElement('span');
                        academicYear.textContent = 'School Year: ' + await getAcadName(yearlvl) + " (" + 'First Semester' + ")";
                        academicYear.className = 'myjourney-academic-year-top';
                        academicYearDiv.appendChild(academicYear);
                        section.appendChild(academicYearDiv);
                        const tabelDiv = document.createElement('section');
                        tabelDiv.classList.add('myjourney-table-div');
                        foundinSem1 = false;
                        if (curryearlvl === 'year-lvl-1') {
                            console.log(yr1_sem1_subjects);

                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr1_sem1_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);
                            academicYearDiv.appendChild(tabelDiv);
                        }
                        if (curryearlvl === 'year-lvl-2') {
                            console.log(yr2_sem1_subjects);

                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr2_sem1_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);
                            academicYearDiv.appendChild(tabelDiv);
                        }
                        if (curryearlvl === 'year-lvl-3') {
                            console.log(yr3_sem1_subjects);

                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr3_sem1_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);

                            academicYearDiv.appendChild(tabelDiv);
                        }
                        if (curryearlvl === 'year-lvl-4') {
                            console.log(yr4_sem1_subjects);
                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr4_sem1_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);
                            academicYearDiv.appendChild(tabelDiv);
                        }


                    }
                    if (foundinSem2) {
                        const academicYear2 = document.createElement('span');
                        academicYear2.textContent = 'School Year: ' + await getAcadName(yearlvl) + " (" + 'Second Semester' + ")";
                        academicYear2.className = 'myjourney-academic-year-top';
                        academicYearDiv.appendChild(academicYear2);
                        section.appendChild(academicYearDiv);
                        parentElement.appendChild(section);
                        foundinSem2 = false;

                        const tabelDiv = document.createElement('section');
                        tabelDiv.classList.add('myjourney-table-div');

                        if (curryearlvl === 'year-lvl-1') {
                            console.log(yr1_sem2_subjects);

                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr1_sem2_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);
                            academicYearDiv.appendChild(tabelDiv);
                        }
                        if (curryearlvl === 'year-lvl-2') {
                            console.log(yr2_sem2_subjects);

                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr2_sem2_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);
                            academicYearDiv.appendChild(tabelDiv);
                        }
                        if (curryearlvl === 'year-lvl-3') {
                            console.log(yr3_sem2_subjects);


                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr3_sem2_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);
                            academicYearDiv.appendChild(tabelDiv);
                        }
                        if (curryearlvl === 'year-lvl-4') {
                            console.log(yr4_sem2_subjects);

                            const table = document.createElement('table');
                            table.classList.add('myjourney-table-template');
                            table.id = 'my-table';
                            table.setAttribute('border', '1');
                            table.style.borderCollapse = 'collapse';
                            table.style.width = '100%';

                            const thead = document.createElement('thead');
                            const trHeader = document.createElement('tr');
                            trHeader.className = 'myjourney-tr-header';

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
                            table.appendChild(thead);

                            const tbody = document.createElement('tbody');
                            tbody.id = 'tbody';

                            for (const subject of yr4_sem2_subjects) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject.subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = subject.description;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = subject.unit;
                                const gradeCell = document.createElement("td");
                                gradeCell.textContent = subject.grade;
                                row.appendChild(subjectCell);
                                row.appendChild(descriptionCell);
                                row.appendChild(unitsCell);
                                row.appendChild(gradeCell);
                                tbody.appendChild(row);
                            }
                            table.appendChild(tbody);
                            tabelDiv.appendChild(table);
                            academicYearDiv.appendChild(tabelDiv);
                        }

                    }

                }

            }

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