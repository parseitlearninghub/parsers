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

let admin_id = localStorage.getItem("user-parser-admin");


//preloads
setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", function () {
    document.getElementById("loading_animation_div").style.display = "none";

});
function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
    document.documentElement.style.height = height + "px";
}

function renderAssignmentUI() {

    const type = localStorage.getItem("type-parser");
    const acadref = localStorage.getItem("parseroom-acadref");
    const yearlvl = localStorage.getItem("parseroom-yearlvl");
    const sem = localStorage.getItem("parseroom-sem");
    const subject = localStorage.getItem("parseroom-code");
    const section = localStorage.getItem("parseroom-section");
    const studentid = localStorage.getItem("user-parser");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const assignmentcode = urlParams.get('assignment');
    if (type === "student") {
        const assignmentRef = ref(
            database,
            `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/assignment/${assignmentcode}`
        );

        onValue(assignmentRef, async (snapshot) => {
            const assignment_cont = document.getElementById('trainchatbot-wrapper');
            assignment_cont.innerHTML = "";
            if (snapshot.exists()) {
                const assignment = snapshot.val();
                const assignment_title = assignment.header;
                const assignment_date = assignment.date;
                const assignment_duedate = assignment.duedate;
                const assignment_instruction = assignment.instructions;


                const cancelButton = document.createElement('button');
                cancelButton.id = 'canceladdchatbot-btn';
                const imgElement = document.createElement('img');
                imgElement.className = 'canceladdcluster-btn';
                imgElement.src = 'assets/icons/arrow-left-solid.svg';
                cancelButton.appendChild(imgElement);
                assignment_cont.appendChild(cancelButton);

                cancelButton.addEventListener('click', (event) => {
                    window.location.href = 'parseroom.html';
                });

                const missingLabel = document.createElement("label");
                missingLabel.className = "missing-title";
                missingLabel.textContent = "Missing";

                const usernameRef = child(dbRef, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/assignment/${assignmentcode}/completed/${studentid}`);
                const myworkSnapshot = await get(usernameRef);
                if (!myworkSnapshot.exists()) {
                    if (Due(assignment_duedate)) {
                        assignment_cont.appendChild(missingLabel);
                    }
                }
                const headerSection = document.createElement('section');
                headerSection.className = 'header-title-wrapper';

                const dueLabel = document.createElement('label');
                dueLabel.className = 'header-due';
                dueLabel.textContent = `Due ${formatDateTime(assignment_duedate)}`;

                headerSection.appendChild(dueLabel);

                const titleLabel = document.createElement('label');
                titleLabel.className = 'header-title';
                titleLabel.textContent = assignment_title;
                headerSection.appendChild(titleLabel);

                const postedDateLabel = document.createElement('label');
                postedDateLabel.className = 'header-date';
                postedDateLabel.textContent = `Posted ${formatDateTime(assignment_date)}`;
                headerSection.appendChild(postedDateLabel);

                assignment_cont.appendChild(headerSection);

                const chatbotSection = document.createElement('section');
                chatbotSection.className = 'chatbot-data-wrapper';

                for (const file in assignment.attachedfile) {

                    const assignmentFileWrapper = document.createElement('section');
                    assignmentFileWrapper.className = 'assignment-file-wrapper';
                    chatbotSection.appendChild(assignmentFileWrapper);

                    const imgType = document.createElement('img');
                    imgType.className = 'img-type';


                    if (assignment.attachedfile[file].type === 'pdf') {
                        imgType.className = 'img-type-pdf';
                        imgType.src = 'assets/icons/file-pdf-solid.svg';
                        assignmentFileWrapper.appendChild(imgType);
                    }
                    if (assignment.attachedfile[file].type === 'docs') {
                        imgType.src = 'assets/icons/file-word-solid.svg';
                        assignmentFileWrapper.appendChild(imgType);
                    }
                    if (assignment.attachedfile[file].type === 'img') {
                        imgType.src = 'assets/icons/image-solid.svg';
                        assignmentFileWrapper.appendChild(imgType);
                    }
                }

                assignment_cont.appendChild(chatbotSection);

                const instructionsLabel = document.createElement('label');
                instructionsLabel.className = 'assignment-instruction';
                instructionsLabel.textContent = 'Instructions';
                assignment_cont.appendChild(instructionsLabel);

                const instructionDetails = document.createElement('span');
                instructionDetails.className = 'assignment-instruction-details';
                instructionDetails.textContent = assignment_instruction;
                assignment_cont.appendChild(instructionDetails);

                const myWorkLabel = document.createElement('label');
                myWorkLabel.className = 'assignment-instruction';
                myWorkLabel.textContent = 'My Work';
                assignment_cont.appendChild(myWorkLabel);

                const myWorkSection = document.createElement('section');
                myWorkSection.className = 'assignment-file-wrapper';
                assignment_cont.appendChild(myWorkSection);

                const attachButton = document.createElement('button');
                attachButton.className = 'mywork-btn';
                attachButton.textContent = 'Attach Assignment';
                assignment_cont.appendChild(attachButton);
            }
        });
    }
}
renderAssignmentUI();


function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(datetime) {
    const date = new Date(datetime);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
    return `${formattedDate} (${formattedTime})`;
}

function Due(date) {
    const currentDate = new Date();
    const targetDate = new Date(date);
    if (currentDate > targetDate) {
        return true;
    } else {
        return false;
    }
}