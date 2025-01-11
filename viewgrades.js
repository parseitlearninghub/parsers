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
const user_parser = localStorage.getItem('user-parser');



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

function errorElement(element) {
    document.getElementById(element).style.border = "0.4px solid #f30505";
    setTimeout(() => {
        document.getElementById(element).style.border = "0.4px solid #dcdcdc";
    }, 1000);
}

async function uploadToGitHub(base64PDF, admin_id, acadref, button) {
    const token = await getApikey();
    const owner = "parseitlearninghub";
    const repo = "parseitlearninghub-storage";
    let code = Date.now().toString();
    const filePath = `PARSEIT/storage/downloads/myjourney/${admin_id}/${acadref}/myGrades-${code}.pdf`;
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
                navigator.clipboard.writeText(data.content.download_url)
                    .then(() => {
                        document.getElementById(button).innerText = 'Copied! Paste url in browser to download.';
                        setTimeout(() => {
                            document.getElementById(button).innerText = 'Copy Link';
                            window.location.reload();
                        }, 3500);
                    })
                    .catch(err => {
                        document.getElementById(button).innerText = 'Try again.';
                        setTimeout(() => {
                            document.getElementById(button).innerText = 'Copy Link';
                        }, 3500);
                    });
            } else {
                console.error('Error uploading PDF:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}

let pdfFiles = [];
async function previewMyJourney(admin_id) {
    const acadRef = ref(database, `PARSEIT/administration/parseclass/`);
    onValue(acadRef, async (acadRefSnapshot) => {
        const parentElement = document.getElementById('myjourney-result-container');
        parentElement.innerHTML = ''; // Clear previous content
        pdfFiles = [];
        if (acadRefSnapshot.exists()) {
            const updates = {};
            for (const acadref in acadRefSnapshot.val()) {
                const yearlvlSnapshot = acadRefSnapshot.val()[acadref];

                for (const yearlvl in yearlvlSnapshot) {
                    const semSnapshot = yearlvlSnapshot[yearlvl];

                    for (const sem in semSnapshot) {
                        const subjectSnapshot = semSnapshot[sem];

                        for (const subject in subjectSnapshot) {
                            const sectionSnapshot = subjectSnapshot[subject];

                            for (const key in sectionSnapshot) {
                                const value = sectionSnapshot[key];

                                if (typeof value === "object" && value !== null) {
                                    for (const subKey in value) {
                                        if (typeof value[subKey] === "object" && value[subKey] !== null) {
                                            for (const studentKey in value[subKey]) {
                                                if (studentKey === admin_id) {
                                                    let finalgrade = value[subKey][studentKey].finalgrade;
                                                    if (value[subKey][studentKey].status !== undefined) {
                                                        finalgrade = value[subKey][studentKey].status;
                                                    }

                                                    if (!updates[acadref]) updates[acadref] = {};
                                                    if (!updates[acadref][sem]) updates[acadref][sem] = {};

                                                    updates[acadref][sem][subject] = {
                                                        name: subjectSnapshot[subject].name,
                                                        finalgrade: finalgrade,
                                                        unit: subjectSnapshot[subject].unit,
                                                    };
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            await remove(ref(database, `PARSEIT/myjourney/${admin_id}`));
            await update(ref(database, `PARSEIT/myjourney/${admin_id}`), updates);

            //generate pdf
            await get(ref(database, `PARSEIT/myjourney/${admin_id}`)).then(async (snapshot) => {

                for (const acadref in snapshot.val()) {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF();
                    let yOffset = 80;

                    const columnWidths = {
                        subject: 40,
                        description: 120,
                        unit: 10,
                        grade: 30,
                    };


                    const imgSrc = "assets/myjourney-header-template-1.png";
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const imgElement = new Image();
                    imgElement.crossOrigin = "anonymous";
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


                    }

                    pdf.setFontSize(11);
                    const studentIdTitle = "Student ID:";
                    //const studentId = "7210704";
                    pdf.text(studentIdTitle, 15, 60);
                    pdf.text(admin_id, 45, 60);

                    const studentNameTitle = "Student Name:";
                    pdf.text(studentNameTitle, 15, 66);
                    pdf.text(await getFullname(admin_id), 45, 66);

                    for (const semester in snapshot.val()[acadref]) {
                        // Add the academic year title
                        let sem_lbl = "First Semester";
                        if (semester === 'second-sem') {
                            sem_lbl = "Second Semester";
                        }
                        pdf.setFontSize(11);
                        pdf.text(`School Year: ${await getAcadName(acadref)} (${sem_lbl}) `, 15, yOffset);
                        yOffset += 8;
                        // Add table headers with adjusted X-positions to prevent overlap
                        // Set font size
                        pdf.setFontSize(11);

                        // Set fill color for all rectangles
                        pdf.setFillColor(243, 5, 5);

                        // Draw and fill the rectangles with the same red color
                        pdf.rect(13, yOffset - 4.5, 40, 7, 'F');  // Subject (filled)
                        pdf.rect(53, yOffset - 4.5, 112, 7, 'F'); // Description (filled)
                        pdf.rect(165, yOffset - 4.5, 13, 7, 'F'); // Unit (filled)
                        pdf.rect(178, yOffset - 4.5, 20, 7, 'F'); // Grade (filled)

                        // Set the text color (white text)
                        pdf.setTextColor(255, 255, 255); // White text

                        // Add text to the filled rectangles
                        pdf.text('Subject', 15, yOffset);
                        pdf.text('Description', 55, yOffset);
                        pdf.text('Unit', 167, yOffset);
                        pdf.text('Grade', 180, yOffset);



                        yOffset += 8;

                        // Loop through each subject in the semester and add it to the PDF
                        pdf.setTextColor(0, 0, 0);
                        for (const subject in snapshot.val()[acadref][semester]) {
                            const subjectData = snapshot.val()[acadref][semester][subject];

                            // Split text for word wrapping (only for Description and Subject)
                            const subjectLines = pdf.splitTextToSize(subject, columnWidths.subject);
                            const descriptionLines = pdf.splitTextToSize(subjectData.name, columnWidths.description);

                            // Add subject, description, unit, and grade with word wrapping
                            pdf.text(subjectLines, 15, yOffset);
                            pdf.rect(13, yOffset - 5.5, 40, 8);
                            pdf.text(descriptionLines, 55, yOffset);
                            pdf.rect(53, yOffset - 5.5, 112, 8);
                            pdf.text(subjectData.unit.toString(), 167, yOffset);
                            pdf.rect(165, yOffset - 5.5, 13, 8);
                            let finalgrade = subjectData.finalgrade;
                            if (parseFloat(subjectData.finalgrade) <= 0) {
                                finalgrade = ''
                            }
                            pdf.text(finalgrade.toString(), 180, yOffset);
                            pdf.rect(178, yOffset - 5.5, 20, 8);



                            yOffset += Math.max(subjectLines.length, descriptionLines.length) * 8; // Adjust yOffset based on the number of lines

                            // Add a new page if content exceeds page height
                            if (yOffset > 280) {
                                pdf.addPage();
                                yOffset = 80;
                                const imgSrc = "assets/myjourney-header-template-1.png";
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");
                                const imgElement = new Image();
                                imgElement.crossOrigin = "anonymous";
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
                                }
                            }
                        }
                        yOffset += 8;
                    }
                    const pdfBlob = pdf.output('blob');
                    const reader = new FileReader();
                    reader.onloadend = async function () {
                        const base64PDF = reader.result.split(',')[1];
                        //await uploadToGitHub(base64PDF, admin_id, acadref);
                        //console.log(base64PDF);
                        pdfFiles.push(base64PDF);

                    };
                    reader.readAsDataURL(pdfBlob);
                }
            });

            //display
            await get(ref(database, `PARSEIT/myjourney/${admin_id}`)).then(async (snapshot) => {
                let counter = 0;
                for (const acadref in snapshot.val()) {
                    const section = document.createElement('section');
                    section.classList.add('myjourney-template');
                    section.id = 'myjourney-template';
                    const headerDiv = document.createElement('div');
                    headerDiv.classList.add('myjourney-template-header');
                    const headerImg = document.createElement('img');
                    headerImg.src = 'assets/myjourney-header-template-1.png';
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
                    section.appendChild(academicYearDiv);

                    for (const semester in snapshot.val()[acadref]) {
                        let sem_lbl = "First Semester";
                        if (semester === 'second-sem') {
                            sem_lbl = "Second Semester";
                        }
                        const academicYear = document.createElement('span');
                        academicYear.textContent = 'School Year: ' + await getAcadName(acadref) + " (" + sem_lbl + ")";
                        academicYear.className = 'myjourney-academic-year-top';
                        academicYearDiv.appendChild(academicYear);
                        section.appendChild(academicYearDiv);
                        const tabelDiv = document.createElement('section');
                        tabelDiv.classList.add('myjourney-table-div');

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


                        for (const subject in snapshot.val()[acadref][semester]) {
                            const row = document.createElement("tr");
                            const subjectCell = document.createElement("td");
                            subjectCell.textContent = subject;
                            const descriptionCell = document.createElement("td");
                            descriptionCell.textContent = snapshot.val()[acadref][semester][subject].name;
                            const unitsCell = document.createElement("td");
                            unitsCell.textContent = snapshot.val()[acadref][semester][subject].unit;
                            const gradeCell = document.createElement("td");
                            let finalgrade = snapshot.val()[acadref][semester][subject].finalgrade;
                            if (parseFloat(snapshot.val()[acadref][semester][subject].finalgrade) <= 0) {
                                finalgrade = '';
                            }
                            gradeCell.textContent = finalgrade;
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

                    const getLink = document.createElement('button');
                    getLink.textContent = 'Get Link';
                    getLink.id = `download-pdf-btn-${counter}`;
                    getLink.className = 'download-pdf-btn';
                    getLink.setAttribute('data-id', counter);
                    getLink.addEventListener('click', async (event) => {
                        const id = event.target.getAttribute('data-id');
                        const base64PDF = pdfFiles[id];
                        await uploadToGitHub(base64PDF, admin_id, acadref, getLink.id);

                    });
                    section.appendChild(getLink);
                    counter++
                    parentElement.appendChild(section);
                }
            });


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

document.getElementById("show-myjourney-btn").addEventListener("click", async () => {
    const acadRef = document.getElementById("myjourney-select-acad").value;
    //const yearlvl = document.getElementById("myjourney-select-yearlvl").value;
    const sem = document.getElementById("myjourney-select-sem").value;
    const parentElement = document.getElementById('myjourney-result-container');
    const userid = document.getElementById("student-search-txt").value;

    if (userid !== '') {
        console.log(userid)
        if (acadRef === '' && sem === '') {
            pdfFiles = [];
            parentElement.innerHTML = ''; // Clear previous content
            previewMyJourney(userid);
        }
        if (acadRef !== '' && sem === '') {
            pdfFiles = [];
            parentElement.innerHTML = ''; // Clear previous content
            previewMyJourneyByAcad(acadRef, userid);
        }
        if (acadRef === '' && sem !== '') {
            pdfFiles = [];
            parentElement.innerHTML = ''; // Clear previous content
            previewMyJourneyBySem(sem, userid);
        }
        if (acadRef !== '' && sem !== '') {
            pdfFiles = [];
            parentElement.innerHTML = ''; // Clear previous content
            previewMyJourneyByAll(acadRef, sem, userid);
        }
    }
    else {
        errorElement("student-search-txt");
    }

});

async function previewMyJourneyByAcad(acad_val, admin_id) {
    const acadRef = ref(database, `PARSEIT/administration/parseclass/${acad_val}`);
    onValue(acadRef, async (acadRefSnapshot) => {
        const parentElement = document.getElementById('myjourney-result-container');
        parentElement.innerHTML = ''; // Clear previous content
        if (acadRefSnapshot.exists()) {
            const updates = {};
            const yearlvlSnapshot = acadRefSnapshot.val();
            for (const yearlvl in yearlvlSnapshot) {
                const semSnapshot = yearlvlSnapshot[yearlvl];

                for (const sem in semSnapshot) {
                    const subjectSnapshot = semSnapshot[sem];

                    for (const subject in subjectSnapshot) {
                        const sectionSnapshot = subjectSnapshot[subject];

                        for (const key in sectionSnapshot) {
                            const value = sectionSnapshot[key];

                            if (typeof value === "object" && value !== null) {
                                for (const subKey in value) {
                                    if (typeof value[subKey] === "object" && value[subKey] !== null) {
                                        for (const studentKey in value[subKey]) {
                                            if (studentKey === admin_id) {
                                                let finalgrade = value[subKey][studentKey].finalgrade;
                                                if (value[subKey][studentKey].status !== undefined) {
                                                    finalgrade = value[subKey][studentKey].status;
                                                }

                                                if (!updates[acad_val]) updates[acad_val] = {};
                                                if (!updates[acad_val][sem]) updates[acad_val][sem] = {};

                                                updates[acad_val][sem][subject] = {
                                                    name: subjectSnapshot[subject].name,
                                                    finalgrade: finalgrade,
                                                    unit: subjectSnapshot[subject].unit,
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            await remove(ref(database, `PARSEIT/myjourney/${user_parser}`));
            await update(ref(database, `PARSEIT/myjourney/${user_parser}`), updates);
            //generate pdf
            await get(ref(database, `PARSEIT/myjourney/${user_parser}`)).then(async (snapshot) => {
                for (const acadref in snapshot.val()) {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF();
                    let yOffset = 80;

                    const columnWidths = {
                        subject: 40,
                        description: 120,
                        unit: 10,
                        grade: 30,
                    };


                    const imgSrc = "assets/myjourney-header-template-1.png";
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const imgElement = new Image();
                    imgElement.crossOrigin = "anonymous";
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


                    }

                    pdf.setFontSize(11);
                    const studentIdTitle = "Student ID:";
                    //const studentId = "7210704";
                    pdf.text(studentIdTitle, 15, 60);
                    pdf.text(admin_id, 45, 60);

                    const studentNameTitle = "Student Name:";
                    pdf.text(studentNameTitle, 15, 66);
                    pdf.text(await getFullname(admin_id), 45, 66);

                    for (const semester in snapshot.val()[acadref]) {
                        // Add the academic year title
                        let sem_lbl = "First Semester";
                        if (semester === 'second-sem') {
                            sem_lbl = "Second Semester";
                        }
                        pdf.setFontSize(11);
                        pdf.text(`School Year: ${await getAcadName(acadref)} (${sem_lbl}) `, 15, yOffset);
                        yOffset += 8;
                        // Add table headers with adjusted X-positions to prevent overlap
                        // Set font size
                        pdf.setFontSize(11);

                        // Set fill color for all rectangles
                        pdf.setFillColor(243, 5, 5);

                        // Draw and fill the rectangles with the same red color
                        pdf.rect(13, yOffset - 4.5, 40, 7, 'F');  // Subject (filled)
                        pdf.rect(53, yOffset - 4.5, 112, 7, 'F'); // Description (filled)
                        pdf.rect(165, yOffset - 4.5, 13, 7, 'F'); // Unit (filled)
                        pdf.rect(178, yOffset - 4.5, 20, 7, 'F'); // Grade (filled)

                        // Set the text color (white text)
                        pdf.setTextColor(255, 255, 255); // White text

                        // Add text to the filled rectangles
                        pdf.text('Subject', 15, yOffset);
                        pdf.text('Description', 55, yOffset);
                        pdf.text('Unit', 167, yOffset);
                        pdf.text('Grade', 180, yOffset);



                        yOffset += 8;

                        // Loop through each subject in the semester and add it to the PDF
                        pdf.setTextColor(0, 0, 0);
                        for (const subject in snapshot.val()[acadref][semester]) {
                            const subjectData = snapshot.val()[acadref][semester][subject];

                            // Split text for word wrapping (only for Description and Subject)
                            const subjectLines = pdf.splitTextToSize(subject, columnWidths.subject);
                            const descriptionLines = pdf.splitTextToSize(subjectData.name, columnWidths.description);

                            // Add subject, description, unit, and grade with word wrapping
                            pdf.text(subjectLines, 15, yOffset);
                            pdf.rect(13, yOffset - 5.5, 40, 8);
                            pdf.text(descriptionLines, 55, yOffset);
                            pdf.rect(53, yOffset - 5.5, 112, 8);
                            pdf.text(subjectData.unit.toString(), 167, yOffset);
                            pdf.rect(165, yOffset - 5.5, 13, 8);
                            let finalgrade = subjectData.finalgrade;
                            if (parseFloat(subjectData.finalgrade) <= 0) {
                                finalgrade = ''
                            }
                            pdf.text(finalgrade.toString(), 180, yOffset);
                            pdf.rect(178, yOffset - 5.5, 20, 8);



                            yOffset += Math.max(subjectLines.length, descriptionLines.length) * 8; // Adjust yOffset based on the number of lines

                            // Add a new page if content exceeds page height
                            if (yOffset > 280) {
                                pdf.addPage();
                                yOffset = 80;
                                const imgSrc = "assets/myjourney-header-template-1.png";
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");
                                const imgElement = new Image();
                                imgElement.crossOrigin = "anonymous";
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
                                }
                            }
                        }
                        yOffset += 8;
                    }
                    const pdfBlob = pdf.output('blob');
                    const reader = new FileReader();
                    reader.onloadend = async function () {
                        const base64PDF = reader.result.split(',')[1];
                        //await uploadToGitHub(base64PDF, admin_id, acadref);
                        //console.log(base64PDF);
                        pdfFiles.push(base64PDF);

                    };
                    reader.readAsDataURL(pdfBlob);
                }
            });
            //display
            await get(ref(database, `PARSEIT/myjourney/${user_parser}`)).then(async (snapshot) => {
                let counter = 0;
                if (snapshot.exists()) {
                    for (const acadref in snapshot.val()) {
                        const section = document.createElement('section');
                        section.classList.add('myjourney-template');
                        section.id = 'myjourney-template';
                        const headerDiv = document.createElement('div');
                        headerDiv.classList.add('myjourney-template-header');
                        const headerImg = document.createElement('img');
                        headerImg.src = 'assets/myjourney-header-template-1.png';
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
                        section.appendChild(academicYearDiv);

                        for (const semester in snapshot.val()[acadref]) {
                            let sem_lbl = "First Semester";
                            if (semester === 'second-sem') {
                                sem_lbl = "Second Semester";
                            }
                            const academicYear = document.createElement('span');
                            academicYear.textContent = 'School Year: ' + await getAcadName(acadref) + " (" + sem_lbl + ")";
                            academicYear.className = 'myjourney-academic-year-top';
                            academicYearDiv.appendChild(academicYear);
                            section.appendChild(academicYearDiv);
                            const tabelDiv = document.createElement('section');
                            tabelDiv.classList.add('myjourney-table-div');

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


                            for (const subject in snapshot.val()[acadref][semester]) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = snapshot.val()[acadref][semester][subject].name;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = snapshot.val()[acadref][semester][subject].unit;
                                const gradeCell = document.createElement("td");
                                let finalgrade = snapshot.val()[acadref][semester][subject].finalgrade;
                                if (parseFloat(snapshot.val()[acadref][semester][subject].finalgrade) <= 0) {
                                    finalgrade = '';
                                }
                                gradeCell.textContent = finalgrade;
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

                        const getLink = document.createElement('button');
                        getLink.textContent = 'Get Link';
                        getLink.id = `download-pdf-btn-${counter}`;
                        getLink.className = 'download-pdf-btn';
                        getLink.setAttribute('data-id', counter);
                        getLink.addEventListener('click', async (event) => {
                            const id = event.target.getAttribute('data-id');
                            const base64PDF = pdfFiles[id];
                            await uploadToGitHub(base64PDF, user_parser, acadref, getLink.id);

                        });
                        section.appendChild(getLink);
                        counter++
                        parentElement.appendChild(section);
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
async function previewMyJourneyBySem(sem_val, admin_id) {
    const acadRef = ref(database, `PARSEIT/administration/parseclass/`);
    onValue(acadRef, async (acadRefSnapshot) => {
        const parentElement = document.getElementById('myjourney-result-container');
        parentElement.innerHTML = ''; // Clear previous content
        pdfFiles = [];
        if (acadRefSnapshot.exists()) {
            const updates = {};

            for (const acadref in acadRefSnapshot.val()) {
                const yearlvlSnapshot = acadRefSnapshot.val()[acadref];

                for (const yearlvl in yearlvlSnapshot) {
                    const semSnapshot = yearlvlSnapshot[yearlvl];

                    for (const sem in semSnapshot) {
                        const subjectSnapshot = semSnapshot[sem];
                        if (sem === sem_val) {
                            for (const subject in subjectSnapshot) {
                                const sectionSnapshot = subjectSnapshot[subject];

                                for (const key in sectionSnapshot) {
                                    const value = sectionSnapshot[key];

                                    if (typeof value === "object" && value !== null) {
                                        for (const subKey in value) {
                                            if (typeof value[subKey] === "object" && value[subKey] !== null) {
                                                for (const studentKey in value[subKey]) {
                                                    if (studentKey === admin_id) {
                                                        let finalgrade = value[subKey][studentKey].finalgrade;
                                                        if (value[subKey][studentKey].status !== undefined) {
                                                            finalgrade = value[subKey][studentKey].status;
                                                        }
                                                        if (!updates[acadref]) updates[acadref] = {};
                                                        if (!updates[acadref][sem]) updates[acadref][sem] = {};

                                                        updates[acadref][sem][subject] = {
                                                            name: subjectSnapshot[subject].name,
                                                            finalgrade: finalgrade,
                                                            unit: subjectSnapshot[subject].unit,
                                                        };
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }
            await remove(ref(database, `PARSEIT/myjourney/${user_parser}`));
            await update(ref(database, `PARSEIT/myjourney/${user_parser}`), updates);

            //generate pdf
            await get(ref(database, `PARSEIT/myjourney/${user_parser}`)).then(async (snapshot) => {

                for (const acadref in snapshot.val()) {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF();
                    let yOffset = 80;

                    const columnWidths = {
                        subject: 40,
                        description: 120,
                        unit: 10,
                        grade: 30,
                    };


                    const imgSrc = "assets/myjourney-header-template-1.png";
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const imgElement = new Image();
                    imgElement.crossOrigin = "anonymous";
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


                    }

                    pdf.setFontSize(11);
                    const studentIdTitle = "Student ID:";
                    //const studentId = "7210704";
                    pdf.text(studentIdTitle, 15, 60);
                    pdf.text(admin_id, 45, 60);

                    const studentNameTitle = "Student Name:";
                    pdf.text(studentNameTitle, 15, 66);
                    pdf.text(await getFullname(admin_id), 45, 66);

                    for (const semester in snapshot.val()[acadref]) {
                        // Add the academic year title
                        let sem_lbl = "First Semester";
                        if (semester === 'second-sem') {
                            sem_lbl = "Second Semester";
                        }
                        pdf.setFontSize(11);
                        pdf.text(`School Year: ${await getAcadName(acadref)} (${sem_lbl}) `, 15, yOffset);
                        yOffset += 8;
                        // Add table headers with adjusted X-positions to prevent overlap
                        // Set font size
                        pdf.setFontSize(11);

                        // Set fill color for all rectangles
                        pdf.setFillColor(243, 5, 5);

                        // Draw and fill the rectangles with the same red color
                        pdf.rect(13, yOffset - 4.5, 40, 7, 'F');  // Subject (filled)
                        pdf.rect(53, yOffset - 4.5, 112, 7, 'F'); // Description (filled)
                        pdf.rect(165, yOffset - 4.5, 13, 7, 'F'); // Unit (filled)
                        pdf.rect(178, yOffset - 4.5, 20, 7, 'F'); // Grade (filled)

                        // Set the text color (white text)
                        pdf.setTextColor(255, 255, 255); // White text

                        // Add text to the filled rectangles
                        pdf.text('Subject', 15, yOffset);
                        pdf.text('Description', 55, yOffset);
                        pdf.text('Unit', 167, yOffset);
                        pdf.text('Grade', 180, yOffset);



                        yOffset += 8;

                        // Loop through each subject in the semester and add it to the PDF
                        pdf.setTextColor(0, 0, 0);
                        for (const subject in snapshot.val()[acadref][semester]) {
                            const subjectData = snapshot.val()[acadref][semester][subject];

                            // Split text for word wrapping (only for Description and Subject)
                            const subjectLines = pdf.splitTextToSize(subject, columnWidths.subject);
                            const descriptionLines = pdf.splitTextToSize(subjectData.name, columnWidths.description);

                            // Add subject, description, unit, and grade with word wrapping
                            pdf.text(subjectLines, 15, yOffset);
                            pdf.rect(13, yOffset - 5.5, 40, 8);
                            pdf.text(descriptionLines, 55, yOffset);
                            pdf.rect(53, yOffset - 5.5, 112, 8);
                            pdf.text(subjectData.unit.toString(), 167, yOffset);
                            pdf.rect(165, yOffset - 5.5, 13, 8);
                            let finalgrade = subjectData.finalgrade;
                            if (parseFloat(subjectData.finalgrade) <= 0) {
                                finalgrade = ''
                            }
                            pdf.text(finalgrade.toString(), 180, yOffset);
                            pdf.rect(178, yOffset - 5.5, 20, 8);



                            yOffset += Math.max(subjectLines.length, descriptionLines.length) * 8; // Adjust yOffset based on the number of lines

                            // Add a new page if content exceeds page height
                            if (yOffset > 280) {
                                pdf.addPage();
                                yOffset = 80;
                                const imgSrc = "assets/myjourney-header-template-1.png";
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");
                                const imgElement = new Image();
                                imgElement.crossOrigin = "anonymous";
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
                                }
                            }
                        }
                        yOffset += 8;
                    }
                    const pdfBlob = pdf.output('blob');
                    const reader = new FileReader();
                    reader.onloadend = async function () {
                        const base64PDF = reader.result.split(',')[1];
                        //await uploadToGitHub(base64PDF, admin_id, acadref);
                        //console.log(base64PDF);
                        pdfFiles.push(base64PDF);

                    };
                    reader.readAsDataURL(pdfBlob);
                }
            });

            //display
            await get(ref(database, `PARSEIT/myjourney/${user_parser}`)).then(async (snapshot) => {
                let counter = 0;
                for (const acadref in snapshot.val()) {

                    const section = document.createElement('section');
                    section.classList.add('myjourney-template');
                    section.id = 'myjourney-template';
                    const headerDiv = document.createElement('div');
                    headerDiv.classList.add('myjourney-template-header');
                    const headerImg = document.createElement('img');
                    headerImg.src = 'assets/myjourney-header-template-1.png';
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
                    section.appendChild(academicYearDiv);

                    for (const semester in snapshot.val()[acadref]) {
                        let sem_lbl = "First Semester";
                        if (semester === 'second-sem') {
                            sem_lbl = "Second Semester";
                        }
                        const academicYear = document.createElement('span');
                        academicYear.textContent = 'School Year: ' + await getAcadName(acadref) + " (" + sem_lbl + ")";
                        academicYear.className = 'myjourney-academic-year-top';
                        academicYearDiv.appendChild(academicYear);
                        section.appendChild(academicYearDiv);
                        const tabelDiv = document.createElement('section');
                        tabelDiv.classList.add('myjourney-table-div');

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


                        for (const subject in snapshot.val()[acadref][semester]) {
                            const row = document.createElement("tr");
                            const subjectCell = document.createElement("td");
                            subjectCell.textContent = subject;
                            const descriptionCell = document.createElement("td");
                            descriptionCell.textContent = snapshot.val()[acadref][semester][subject].name;
                            const unitsCell = document.createElement("td");
                            unitsCell.textContent = snapshot.val()[acadref][semester][subject].unit;
                            const gradeCell = document.createElement("td");
                            let finalgrade = snapshot.val()[acadref][semester][subject].finalgrade;
                            if (parseFloat(snapshot.val()[acadref][semester][subject].finalgrade) <= 0) {
                                finalgrade = '';
                            }
                            gradeCell.textContent = finalgrade;
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

                    const getLink = document.createElement('button');
                    getLink.textContent = 'Get Link';
                    getLink.id = `download-pdf-btn-${counter}`;
                    getLink.className = 'download-pdf-btn';
                    getLink.setAttribute('data-id', counter);
                    getLink.addEventListener('click', async (event) => {
                        const id = event.target.getAttribute('data-id');
                        const base64PDF = pdfFiles[id];
                        await uploadToGitHub(base64PDF, user_parser, acadref, getLink.id);

                    });
                    section.appendChild(getLink);
                    counter++
                    parentElement.appendChild(section);
                }
            });


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
async function previewMyJourneyByAll(acad_val, sem_val, admin_id) {
    const acadRef = ref(database, `PARSEIT/administration/parseclass/${acad_val}`);
    onValue(acadRef, async (acadRefSnapshot) => {
        const parentElement = document.getElementById('myjourney-result-container');
        parentElement.innerHTML = ''; // Clear previous content
        if (acadRefSnapshot.exists()) {
            const updates = {};
            const yearlvlSnapshot = acadRefSnapshot.val();
            for (const yearlvl in yearlvlSnapshot) {
                const semSnapshot = yearlvlSnapshot[yearlvl];

                for (const sem in semSnapshot) {
                    const subjectSnapshot = semSnapshot[sem];
                    if (sem === sem_val) {
                        for (const subject in subjectSnapshot) {
                            const sectionSnapshot = subjectSnapshot[subject];

                            for (const key in sectionSnapshot) {
                                const value = sectionSnapshot[key];

                                if (typeof value === "object" && value !== null) {
                                    for (const subKey in value) {
                                        if (typeof value[subKey] === "object" && value[subKey] !== null) {
                                            for (const studentKey in value[subKey]) {
                                                if (studentKey === admin_id) {
                                                    let finalgrade = value[subKey][studentKey].finalgrade;
                                                    if (value[subKey][studentKey].status !== undefined) {
                                                        finalgrade = value[subKey][studentKey].status;
                                                    }


                                                    if (!updates[acad_val]) updates[acad_val] = {};
                                                    if (!updates[acad_val][sem]) updates[acad_val][sem] = {};

                                                    updates[acad_val][sem][subject] = {
                                                        name: subjectSnapshot[subject].name,
                                                        finalgrade: finalgrade,
                                                        unit: subjectSnapshot[subject].unit,
                                                    };
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
            await remove(ref(database, `PARSEIT/myjourney/${user_parser}`));
            await update(ref(database, `PARSEIT/myjourney/${user_parser}`), updates);
            //generate pdf
            await get(ref(database, `PARSEIT/myjourney/${user_parser}`)).then(async (snapshot) => {
                for (const acadref in snapshot.val()) {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF();
                    let yOffset = 80;

                    const columnWidths = {
                        subject: 40,
                        description: 120,
                        unit: 10,
                        grade: 30,
                    };


                    const imgSrc = "assets/myjourney-header-template-1.png";
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    const imgElement = new Image();
                    imgElement.crossOrigin = "anonymous";
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


                    }

                    pdf.setFontSize(11);
                    const studentIdTitle = "Student ID:";
                    //const studentId = "7210704";
                    pdf.text(studentIdTitle, 15, 60);
                    pdf.text(admin_id, 45, 60);

                    const studentNameTitle = "Student Name:";
                    pdf.text(studentNameTitle, 15, 66);
                    pdf.text(await getFullname(admin_id), 45, 66);

                    for (const semester in snapshot.val()[acadref]) {
                        // Add the academic year title
                        let sem_lbl = "First Semester";
                        if (semester === 'second-sem') {
                            sem_lbl = "Second Semester";
                        }
                        pdf.setFontSize(11);
                        pdf.text(`School Year: ${await getAcadName(acadref)} (${sem_lbl}) `, 15, yOffset);
                        yOffset += 8;
                        // Add table headers with adjusted X-positions to prevent overlap
                        // Set font size
                        pdf.setFontSize(11);

                        // Set fill color for all rectangles
                        pdf.setFillColor(243, 5, 5);

                        // Draw and fill the rectangles with the same red color
                        pdf.rect(13, yOffset - 4.5, 40, 7, 'F');  // Subject (filled)
                        pdf.rect(53, yOffset - 4.5, 112, 7, 'F'); // Description (filled)
                        pdf.rect(165, yOffset - 4.5, 13, 7, 'F'); // Unit (filled)
                        pdf.rect(178, yOffset - 4.5, 20, 7, 'F'); // Grade (filled)

                        // Set the text color (white text)
                        pdf.setTextColor(255, 255, 255); // White text

                        // Add text to the filled rectangles
                        pdf.text('Subject', 15, yOffset);
                        pdf.text('Description', 55, yOffset);
                        pdf.text('Unit', 167, yOffset);
                        pdf.text('Grade', 180, yOffset);



                        yOffset += 8;

                        // Loop through each subject in the semester and add it to the PDF
                        pdf.setTextColor(0, 0, 0);
                        for (const subject in snapshot.val()[acadref][semester]) {
                            const subjectData = snapshot.val()[acadref][semester][subject];

                            // Split text for word wrapping (only for Description and Subject)
                            const subjectLines = pdf.splitTextToSize(subject, columnWidths.subject);
                            const descriptionLines = pdf.splitTextToSize(subjectData.name, columnWidths.description);

                            // Add subject, description, unit, and grade with word wrapping
                            pdf.text(subjectLines, 15, yOffset);
                            pdf.rect(13, yOffset - 5.5, 40, 8);
                            pdf.text(descriptionLines, 55, yOffset);
                            pdf.rect(53, yOffset - 5.5, 112, 8);
                            pdf.text(subjectData.unit.toString(), 167, yOffset);
                            pdf.rect(165, yOffset - 5.5, 13, 8);
                            let finalgrade = subjectData.finalgrade;
                            if (parseFloat(subjectData.finalgrade) <= 0) {
                                finalgrade = ''
                            }
                            pdf.text(finalgrade.toString(), 180, yOffset);
                            pdf.rect(178, yOffset - 5.5, 20, 8);



                            yOffset += Math.max(subjectLines.length, descriptionLines.length) * 8; // Adjust yOffset based on the number of lines

                            // Add a new page if content exceeds page height
                            if (yOffset > 280) {
                                pdf.addPage();
                                yOffset = 80;
                                const imgSrc = "assets/myjourney-header-template-1.png";
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");
                                const imgElement = new Image();
                                imgElement.crossOrigin = "anonymous";
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
                                }
                            }
                        }
                        yOffset += 8;
                    }
                    const pdfBlob = pdf.output('blob');
                    const reader = new FileReader();
                    reader.onloadend = async function () {
                        const base64PDF = reader.result.split(',')[1];
                        //await uploadToGitHub(base64PDF, admin_id, acadref);
                        //console.log(base64PDF);
                        pdfFiles.push(base64PDF);

                    };
                    reader.readAsDataURL(pdfBlob);
                }
            });
            //display
            await get(ref(database, `PARSEIT/myjourney/${user_parser}`)).then(async (snapshot) => {
                let counter = 0;
                if (snapshot.exists()) {
                    for (const acadref in snapshot.val()) {
                        const section = document.createElement('section');
                        section.classList.add('myjourney-template');
                        section.id = 'myjourney-template';
                        const headerDiv = document.createElement('div');
                        headerDiv.classList.add('myjourney-template-header');
                        const headerImg = document.createElement('img');
                        headerImg.src = 'assets/myjourney-header-template-1.png';
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
                        section.appendChild(academicYearDiv);

                        for (const semester in snapshot.val()[acadref]) {
                            let sem_lbl = "First Semester";
                            if (semester === 'second-sem') {
                                sem_lbl = "Second Semester";
                            }
                            const academicYear = document.createElement('span');
                            academicYear.textContent = 'School Year: ' + await getAcadName(acadref) + " (" + sem_lbl + ")";
                            academicYear.className = 'myjourney-academic-year-top';
                            academicYearDiv.appendChild(academicYear);
                            section.appendChild(academicYearDiv);
                            const tabelDiv = document.createElement('section');
                            tabelDiv.classList.add('myjourney-table-div');

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


                            for (const subject in snapshot.val()[acadref][semester]) {
                                const row = document.createElement("tr");
                                const subjectCell = document.createElement("td");
                                subjectCell.textContent = subject;
                                const descriptionCell = document.createElement("td");
                                descriptionCell.textContent = snapshot.val()[acadref][semester][subject].name;
                                const unitsCell = document.createElement("td");
                                unitsCell.textContent = snapshot.val()[acadref][semester][subject].unit;
                                const gradeCell = document.createElement("td");
                                let finalgrade = snapshot.val()[acadref][semester][subject].finalgrade;
                                if (parseFloat(snapshot.val()[acadref][semester][subject].finalgrade) <= 0) {
                                    finalgrade = '';
                                }
                                gradeCell.textContent = finalgrade;
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

                        const getLink = document.createElement('button');
                        getLink.textContent = 'Get Link';
                        getLink.id = `download-pdf-btn-${counter}`;
                        getLink.className = 'download-pdf-btn';
                        getLink.setAttribute('data-id', counter);
                        getLink.addEventListener('click', async (event) => {
                            const id = event.target.getAttribute('data-id');
                            const base64PDF = pdfFiles[id];
                            await uploadToGitHub(base64PDF, user_parser, acadref, getLink.id);

                        });
                        section.appendChild(getLink);
                        counter++
                        parentElement.appendChild(section);
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